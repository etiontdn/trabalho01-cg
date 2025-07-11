import * as THREE from "three";
import { OBJLoader } from "../build/jsm/loaders/OBJLoader.js";
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";
import { caminhoEValido } from "./pathfinding.js";
import Entidade from "./entidade.js";

const inimigos = [];

const raioDeVisao = 60;

export class LostSoul extends Entidade {
    constructor(scene, spawn) {
        super(scene, spawn);
        this.scale = new THREE.Vector3(5, 4, 0.5);

        this.speed = 10;
        this.altMinima = 3;
        this.distRecuo = 0;
        this.tamanho = new THREE.Vector3(3, 3, 3);

        this.maxHp = 20;
        this.hp = this.maxHp;
        this.fadeOut = 1.0; // opacidade usada na transição

        this.url = "./assets/skull.obj";
        this.createEnemy();
        this.bb.setFromObject(this.entidade);
        inimigos.push(this);
    }

    createEnemy() {
        // Cria uma esfera para representar o inimigo no local da entidade
        // const geometry = new THREE.SphereGeometry(this.tamanho.x/2, 16, 16);
        // const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        // const sphere = new THREE.Mesh(geometry, material);
        // sphere.position.set(0, 0, 0);
        // this.entidade.add(sphere);

        const loader = new OBJLoader();

        loader.load(this.url, (enemyMesh) => {
            enemyMesh.traverse((c) => {
                if (c.isMesh) {
                    c.geometry.computeBoundingBox();
                    c.geometry.center();
                    if (c.material) {
                        c.material.transparent = true;
                        c.material.opacity = 1.0;
                    }
                }
            });

            this.entidade.add(enemyMesh);
            this.enemyObj = this.entidade;
        });
    }

    animateEnemy(frameAtual, alvo) {
        if (!this.enemyObj) return;

        if (this.bb && this.enemyObj) this.bb.setFromObject(this.entidade);

        // Verifica morte e inicia fade-out
        if (this.hp <= 0 && this.estadoAtual !== "morre") {
            this.estadoAtual = "morre";
            this.fadeOut = 1.0;
        }

        switch (this.estadoAtual) {
            case "patrulha":
                this.patrulha(this.entidade, this.speed);
                break;
            case "perseguicao":
                this.perseguicao();
                break;
            case "ataque a distancia":
                break;
            case "ataque":
                this.atacar(frameAtual);
                break;
            case "recuo":
                this.recua(alvo);
                break;
            case "morre":
                if (this.fadeOut > 0) {
                    this.fadeOut -= 0.01;

                    this.entidade.traverse((child) => {
                        if (child.isMesh && child.material) {
                            child.material.transparent = true;
                            child.material.opacity = this.fadeOut;
                        }
                    });

                    if (this.fadeOut <= 0) {
                        this.scene.remove(this.entidade);
                        const index = inimigos.indexOf(this);
                        if (index !== -1) inimigos.splice(index, 1);
                    }
                }
                break;
            case "espera":
                this.espera();
                break;
        }
    }

    perseguicao() {
        const vetorPos = this.pathFinding.vetorPos;
        const posAtual = this.entidade.position;

        // Calcula o vetor direção do ponto atual até o destino
        const direcao = new THREE.Vector3().subVectors(vetorPos, posAtual);
        const distancia = direcao.length();

        if (distancia > 0.01) {
            // Evita jitter quando já está no destino
            direcao.normalize();
            const deslocamento = Math.min(
                this.speed / this.duracaoEstados["perseguicao"],
                distancia
            );
            this.entidade.position.add(direcao.multiplyScalar(deslocamento));
        }
        const dummy = new THREE.Object3D();
        dummy.position.copy(this.entidade.position);
        dummy.lookAt(vetorPos);

        this.entidade.quaternion.slerp(dummy.quaternion, 0.04);
    }

    checarPodeAtacar() {
        if (!this.entidade || !this.scene || !this.scene.personagem) {
            // Garante que todos os objetos necessários existem
            return false;
        }

        const inimigoPos = this.entidade.position.clone();
        const personagemPos = this.ultimaPosicaoInimigo;

        if (inimigoPos.distanceTo(personagemPos) >= 20) {
            return false;
        }

        // Calcula a direção do inimigo para o personagem
        const direcao = new THREE.Vector3()
            .subVectors(personagemPos, inimigoPos)
            .normalize();

        const raycaster = new THREE.Raycaster();
        raycaster.set(inimigoPos, direcao);

        // Crie uma lista de objetos para o raycast: todos os objetos colidíveis do cenário + a malha do personagem
        const objetosParaChecar = [
            ...this.scene.objetosColidiveis,
            this.scene.personagem.colisao,
        ];

        // Certifique-se de que todos os objetos colidíveis e o personagem estão com a matriz de mundo atualizada
        // Isso é crucial para que o raycaster funcione corretamente.
        objetosParaChecar.forEach((obj) => obj.updateMatrixWorld(true));

        // Intersecta o raio com os objetos
        const intersects = raycaster.intersectObjects(objetosParaChecar, true);

        if (intersects.length > 0) {
            // O primeiro objeto atingido é o mais próximo na linha de visão
            const primeiroObjetoAtingido = intersects[0].object;

            // Verifica se o primeiro objeto atingido é a malha do personagem
            // Pode ser necessário um loop se o personagem tiver sub-meshes
            let atingiuPersonagem = false;
            if (primeiroObjetoAtingido === this.scene.personagem.colisao) {
                atingiuPersonagem = true;
            } else {
                // Se o personagem tiver vários objetos aninhados, você pode precisar verificar a hierarquia
                let currentObj = primeiroObjetoAtingido;
                while (currentObj) {
                    if (currentObj === this.scene.personagem.colisao) {
                        atingiuPersonagem = true;
                        break;
                    }
                    currentObj = currentObj.parent;
                }
            }

            return atingiuPersonagem;
        }
        return false; // Nada foi atingido ou o personagem não foi o primeiro
    }

    patrulha(enemy, speed) {}

    atacar(frameAtual) {
        this.ultimoAtaque = frameAtual;
        const velocidadeAtaque = 100; // Ajuste este valor para controlar a velocidade da investida.
        // O valor 40 original era muito alto para ser um deslocamento direto.
        const vetorPos = this.ultimaPosicaoInimigo; // Posição do alvo
        const posInicial = this.ultimaPosicaoEntidade;

        // Calcula o vetor direção do ponto atual até o alvo
        const direcao = new THREE.Vector3().subVectors(vetorPos, posInicial);
        direcao.y = 0; // Mantém o movimento no plano XZ

        // Rotação para olhar o alvo
        const dummy = new THREE.Object3D();
        dummy.position.copy(posInicial);
        dummy.lookAt(vetorPos);
        this.entidade.quaternion.slerp(dummy.quaternion, 0.04); // Slerp para uma rotação suave

        // Lógica de atraso do ataque (opcional, dependendo do que você quer que 100 frames representem)
        // Se 100 frames é para uma animação de "preparar ataque" antes de mover, mantenha.
        // Se a ideia é que ele comece a se mover imediatamente, remova esta condição.
        if (this.framesDesdeOUltimoEstado(frameAtual) <= 150) {
            // Durante esses 100 frames, o monstro pode estar apenas animando
            // ou se preparando, sem se mover. Se quiser que ele se mova DESDE o início,
            // remova este 'if' e o 'return'.
            return;
        }

        // Normaliza a direção para obter um vetor unitário
        direcao.normalize();

        // Adiciona o movimento na direção normalizada, multiplicando pela velocidade
        // Use `this.speed` ou `velocidadeAtaque` como preferir para controlar o avanço.
        // Importante: use `delta` (tempo entre frames) para um movimento consistente.
        // Assumindo que `delta` é passado ou acessível de algum lugar (e.g., this.scene.deltaTime)
        const movimentoPorFrame = direcao.multiplyScalar(
            velocidadeAtaque / 100
        );

        const dumPos = new THREE.Vector3().copy(this.entidade.position);
        dumPos.add(movimentoPorFrame);

        if (
            caminhoEValido(
                this,
                movimentoPorFrame.length(),
                movimentoPorFrame,
                dumPos
            )
        ) {
            this.entidade.position.add(movimentoPorFrame);
        }
    }

    espera() {
        const vetorPos = this.ultimaPosicaoInimigo;
        const posInicial = this.ultimaPosicaoEntidade;

        const dummy = new THREE.Object3D();
        dummy.position.copy(posInicial);
        dummy.lookAt(vetorPos);
        this.entidade.quaternion.slerp(dummy.quaternion, 0.04);
    }

    recua(alvo) {
        console.log("recua");
        const dir = new THREE.Vector3()
            .subVectors(this.enemyObj.position, alvo)
            .normalize();

        dir.y = 0;

        const step = this.speed * 0.4;
        const move = Math.min(step, this.distRecuo);

        this.enemyObj.position.add(dir.multiplyScalar(move));
        this.distRecuo -= move;
    }
}

export class Cacodemon extends Entidade {
    constructor(scene, spawn, scale) {
        super(scene, spawn);
        this.scale = new THREE.Vector3(0.01, 0.01, 0.01);
        this.tamanho = new THREE.Vector3(7, 7, 7);
        this.maxHp = 50;
        this.hp = this.maxHp;
        this.speed = 5;
        this.distRecuo = 0;
        this.altMinima = 4;
        this.fadeOut = 1.0; // opacidade usada na transição
        this.url = "./assets/cacodemon.glb";
        this.createEnemy();

        this.duracaoEstados.espera = 20;
        this.duracaoEstados.perseguicao = 180;

        inimigos.push(this);
    }

    createEnemy() {
        const loader = new GLTFLoader();
        loader.load(this.url, (gltf) => {
            const enemy = gltf.scene;
            enemy.lookAt(new THREE.Vector3(0, 0, 0));
            enemy.scale.copy(this.scale);
            this.entidade.add(enemy);
            this.enemyObj = this.entidade;
        });
    }

    animateEnemy(frameAtual, alvo) {
        if (!this.enemyObj) return;

        console.log("CACODEMON: estado atual: " + this.estadoAtual)

        if (this.bb && this.enemyObj) this.bb.setFromObject(this.entidade);

        // Verifica morte e inicia fade-out
        if (this.hp <= 0 && this.estadoAtual !== "morre") {
            this.estadoAtual = "morre";
            this.fadeOut = 1.0;
        }

        switch (this.estadoAtual) {
            case "patrulha":
                this.patrulha(this.entidade, this.speed);
                break;
            case "perseguicao":
                this.perseguicao();
                break;
            case "ataque":
                //this.atacar(alvo);
                break;
            case "ataque a distancia":
                this.atacar(alvo);
                break;
            case "recuo":
                this.recua(alvo);
                break;
            case "morre":
                if (this.fadeOut > 0) {
                    this.fadeOut -= 0.01;

                    this.entidade.traverse((child) => {
                        if (child.isMesh && child.material) {
                            child.material.transparent = true;
                            child.material.opacity = this.fadeOut;
                        }
                    });

                    if (this.fadeOut <= 0) {
                        this.scene.remove(this.entidade);
                        const index = inimigos.indexOf(this);
                        if (index !== -1) inimigos.splice(index, 1);
                    }
                }
                break;
        }
    }

    perseguicao() {
        const vetorPos = this.pathFinding.vetorPos;
        const posAtual = this.entidade.position;

        // Calcula o vetor direção do ponto atual até o destino
        const direcao = new THREE.Vector3().subVectors(vetorPos, posAtual);
        const distancia = direcao.length();

        if (distancia > 0.01) {
            // Evita jitter quando já está no destino
            direcao.normalize();
            const deslocamento = Math.min(
                this.speed / this.duracaoEstados["perseguicao"],
                distancia
            );
            this.entidade.position.add(direcao.multiplyScalar(deslocamento));
        }
        const dummy = new THREE.Object3D();
        dummy.position.copy(this.entidade.position);
        dummy.lookAt(vetorPos);

        this.entidade.quaternion.slerp(dummy.quaternion, 0.04);
    }

    patrulha(enemy, speed) {}

    atacar() {
        const vetorPos = this.pathFinding.vetorPos;
        const dummy = new THREE.Object3D();
        dummy.position.copy(this.entidade.position);
        dummy.lookAt(vetorPos);

        this.entidade.quaternion.slerp(dummy.quaternion, 0.04);
    }

    checarPodeAtacarADistancia() {
        console.log(
            this.entidade.position,
            this.scene.personagem.position,
            this.entidade.position.distanceTo(this.scene.personagem.position)
        );
        if (
            this.entidade.position.distanceTo(this.scene.personagem.position) <=
            40
        ) {
            console.log("cacodemon pode atacar!");
            return true;
        }
        return false;
    }

    recua(alvo) {
        const dir = new THREE.Vector3()
            .subVectors(this.enemyObj.position, alvo)
            .normalize();

        dir.y = 0;

        const step = this.speed*0.05;

        this.entidade.position.add(dir.multiplyScalar(step));
    }
}
/*
export class Cacodemon extends Entidade {
    constructor(scene, spawn, scale) {
        this.scene = scene;
        this.spawn = spawn;
        this.scale = scale;
        this.maxHp = 50;
        this.hp = this.maxHp;
        this.speed = 0.6;
        this.distRecuo = 0;
        this.altMinima = 9.5;
        this.url = "./assets/cacodemon.glb";
        this.createEnemy();
        inimigos.push(this);
    }

    createEnemy() {
        const loader = new GLTFLoader();
        loader.load(this.url, (gltf) => {
            const enemy = gltf.scene;
            enemy.position.copy(this.spawn);
            enemy.scale.copy(this.scale);
            enemy.lookAt(new THREE.Vector3(0, 0, 0));
            this.enemyObj = enemy;
            this.scene.add(enemy);
        });
    }

    animateEnemy(frameAtual, alvo) {
        if (!this.enemyObj) return;

        if (this.enemyObj.position.y <= this.altMinima)
            this.enemyObj.position.y = this.altMinima;

        const distance = this.enemyObj.position.distanceTo(alvo);

        if (distance < raioDeVisao) {
            const dummy = new THREE.Object3D();
            dummy.position.copy(this.enemyObj.position);
            dummy.lookAt(alvo);
            this.enemyObj.quaternion.slerp(dummy.quaternion, 0.04);

            if (this.distRecuo > 0) {
                this.recua(alvo);
                return;
            }

            if (distance > 25) {
                //! alternar entre atacar e perseguir
                this.perseguicao(this.enemyObj, alvo, this.speed);
                //this.atacar(alvo);
            }

            if (distance <= 25 && distance > 15) {
                // this.ataca(alvo);
            }

            if (distance <= 15) {
                this.distRecuo = 15;
                this.recua(alvo);
            }
        } else {
            this.patrulha(this.enemyObj, alvo, this.speed);
        }
    }

    perseguicao(enemy, alvo, speed) {
        const dir = new THREE.Vector3()
            .subVectors(alvo, enemy.position)
            .normalize();
        enemy.position.add(dir.multiplyScalar(speed * 0.1));
    }

    patrulha(enemy, alvo, speed) {
        const dir = new THREE.Vector3().add();
    }

    atacar(alvo) {}

    recua(alvo) {
        const dir = new THREE.Vector3()
            .subVectors(this.enemyObj.position, alvo)
            .normalize();

        dir.y = 0;

        const step = this.speed * 0.2;
        const move = Math.min(step, this.distRecuo);

        this.enemyObj.position.add(dir.multiplyScalar(move));
        this.distRecuo -= move;
    }
} */

export function createEnemies(scene, objetosColidiveis, rampas, personagem) {
    //new LostSoul(scene, new THREE.Vector3(30, 10, -20));
    new Cacodemon(scene, new THREE.Vector3(30, 10, 0));

    function updateEnemies(frameAtual) {
        inimigos.forEach((inimigo) => {
            inimigo.alerta = true;
            inimigo.animateEnemy(frameAtual, personagem.position);
            inimigo.loopDeComportamento(frameAtual, personagem.position);
        });
    }

    return { updateEnemies, inimigos };
}
