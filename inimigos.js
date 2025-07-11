import * as THREE from "three";
import { OBJLoader } from "../build/jsm/loaders/OBJLoader.js";
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";
import Entidade from "./entidade.js";

const inimigos = [];

const raioDeVisao = 60;

export class LostSoul extends Entidade {
    constructor(scene, spawn) {
        super(scene, spawn);
        this.scale = new THREE.Vector3(5, 4, 0.5);
        this.hp = 20;
        this.speed = 10;
        this.altMinima = 3;
        this.distRecuo = 0;
        this.tamanho = new THREE.Vector3(3, 3, 3);

        this.url = "./assets/skull.obj";
        this.createEnemy();
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
                }
            });

            this.entidade.add(enemyMesh);
            this.enemyObj = this.entidade;
        });
    }

    animateEnemy(frameAtual, alvo) {
        if (!this.enemyObj) return;

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
        const movimentoPorFrame = direcao.multiplyScalar(velocidadeAtaque/100); // <-- Use deltaTime aqui!
        this.entidade.position.add(movimentoPorFrame);
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
        this.hp = 50;
        this.speed = 5;
        this.distRecuo = 0;
        this.altMinima = 4;
        this.url = "./assets/cacodemon.glb";
        this.createEnemy();
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
                this.atacar(alvo);
                break;
            case "recuo":
                this.recua(alvo);
                break;
            case "morre":
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

    atacar(alvo) {
        //atacar
    }

    recua(alvo) {
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

export function createEnemies(scene, objetosColidiveis, rampas, personagem) {
    new LostSoul(scene, new THREE.Vector3(30, 10, -20));
    //new Cacodemon(scene, new THREE.Vector3(30, 10, 0));

    function updateEnemies(frameAtual) {
        inimigos.forEach((inimigo) => {
            inimigo.animateEnemy(frameAtual, personagem.position);
            inimigo.loopDeComportamento(frameAtual);
        });
    }

    return updateEnemies;
}
