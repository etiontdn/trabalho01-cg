import * as THREE from "three";
import { MTLLoader } from "../build/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "../build/jsm/loaders/OBJLoader.js";
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";
import { caminhoEValido } from "./pathfinding.js";
import { SpriteMixer } from "../libs/sprites/SpriteMixer.js";
import { takeDamage } from "./damage.js";
import Entidade from "./entidade.js";

const list_LostSouls = [];
const list_Cacodemons = [];
const list_Soldados = [];

export class LostSoul extends Entidade {
    constructor(scene, spawn) {
        super(scene, spawn);
        this.scale = new THREE.Vector3(5, 4, 0.5);

        this.speed = 10;
        this.altMinima = 3;
        this.distRecuo = 0;
        this.minDistRecuar = 8;
        this.tamanho = new THREE.Vector3(3, 3, 3);

        this.maxHp = 20;
        this.hp = this.maxHp;
        this.ultimoDano = 0;
        this.fadeOut = 1.0; // opacidade usada na transição

        this.url = "./assets/skull/skull.mtl";
        this.createEnemy();
        this.bb.setFromObject(this.entidade);
        list_LostSouls.push(this);
    }

    createEnemy() {
        const mtlLoader = new MTLLoader();
        mtlLoader.load("./assets/skull/skull.mtl", (materials) => {
            materials.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load("./assets/skull.obj", (enemyMesh) => {
                // agora o enemyMesh já vem com texturas aplicadas
                this.entidade.add(enemyMesh);
                this.enemyObj = this.entidade;
            });
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
                if (this.distRecuo > 0) {
                    this.recua(alvo);
                } else {
                    this.estadoAtual = "perseguicao";
                }
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
                        const index = list_LostSouls.indexOf(this);
                        if (index !== -1) list_LostSouls.splice(index, 1);
                    }
                }
                break;
            case "espera":
                this.espera();
                break;
        }
        if (this.entidade.position.distanceTo(alvo) <= 5) {
            if (frameAtual - this.ultimoDano >= 60) {
                takeDamage();
                this.ultimoDano = frameAtual;
            }
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

        if (inimigoPos.distanceTo(personagemPos) >= 40) {
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
        this.minDistRecuar = 10;
        this.altMinima = 4;
        this.fadeOut = 1.0; // opacidade usada na transição
        this.url = "./assets/cacodemon.glb";
        this.createEnemy();

        this.duracaoEstados.espera = 20;

        list_Cacodemons.push(this);
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
                        const index = list_Cacodemons.indexOf(this);
                        if (index !== -1) list_Cacodemons.splice(index, 1);
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
        // console.log(
        //     this.entidade.position,
        //     this.scene.personagem.position,
        //     this.entidade.position.distanceTo(this.scene.personagem.position)
        // );
        if (
            this.entidade.position.distanceTo(this.scene.personagem.position) <=
            40
        ) {
            // console.log("cacodemon pode atacar!");
            return true;
        }
        return false;
    }

    recua(alvo) {
        const dummy = new THREE.Object3D();
        dummy.position.copy(this.entidade.position);
        dummy.lookAt(alvo);

        this.entidade.quaternion.slerp(dummy.quaternion, 0.04);
        const dir = new THREE.Vector3()
            .subVectors(this.enemyObj.position, alvo)
            .normalize();

        dir.y = 0;

        const step = this.speed * 0.01;
        const move = Math.min(step, this.distRecuo);

        this.enemyObj.position.add(dir.multiplyScalar(move));
        this.distRecuo -= move;
    }
}

export class Soldado extends Entidade {
    constructor(scene, spawn) {
        super(scene, spawn);
        this.scale = new THREE.Vector3(1, 1, 1);

        this.speed = 10;
        this.altMinima = 2;
        this.distRecuo = 0;
        this.minDistRecuar = 8;
        this.tamanho = new THREE.Vector3(1.5, 3, 1.5);

        this.maxHp = 20;
        this.hp = this.maxHp;
        this.ultimoDano = 0;
        this.fadeOut = 1.0; // opacidade usada na transição
        this.morreu = false;

        this.actions = {};
        this.spriteMixer = null;
        this.clock = new THREE.Clock();
        this.animando = false;
        this.colisao;

        this.url = "./assets/zombieman.png";
        this.createEnemy();
        this.bb.setFromObject(this.entidade);
        list_Soldados.push(this);
    }

    createEnemy() {
        this.spriteMixer = SpriteMixer();
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(this.url, (texture) => {
            let actionSprite = this.spriteMixer.ActionSprite(texture, 8, 8);
            actionSprite.setFrame(0, 0);
            this.actions.runDown = this.spriteMixer.Action(
                actionSprite,
                100,
                0,
                0,
                3,
                0
            );
            this.actions.runLD = this.spriteMixer.Action(
                actionSprite,
                100,
                0,
                1,
                3,
                1
            ); // Left Down
            this.actions.runLeft = this.spriteMixer.Action(
                actionSprite,
                100,
                0,
                2,
                3,
                2
            );
            this.actions.runLU = this.spriteMixer.Action(
                actionSprite,
                100,
                0,
                3,
                3,
                3
            ); // Left Up
            this.actions.runUp = this.spriteMixer.Action(
                actionSprite,
                100,
                0,
                4,
                3,
                4
            );
            this.actions.runRU = this.spriteMixer.Action(
                actionSprite,
                100,
                0,
                5,
                3,
                5
            ); // Right Up
            this.actions.runRight = this.spriteMixer.Action(
                actionSprite,
                100,
                0,
                6,
                3,
                6
            );
            this.actions.runRD = this.spriteMixer.Action(
                actionSprite,
                100,
                0,
                7,
                3,
                7
            ); // Right Down

            this.actions.Die = this.spriteMixer.Action(
                actionSprite,
                150,
                7,
                0,
                7,
                3
            ); // Die action

            this.actions.ShootingDown = this.spriteMixer.Action(
                actionSprite,
                100,
                4,
                0,
                5,
                0
            );
            this.actions.ShootingLD = this.spriteMixer.Action(
                actionSprite,
                100,
                4,
                1,
                5,
                1
            );
            this.actions.ShootingLeft = this.spriteMixer.Action(
                actionSprite,
                100,
                4,
                2,
                5,
                2
            );
            this.actions.ShootingLU = this.spriteMixer.Action(
                actionSprite,
                100,
                4,
                3,
                5,
                3
            );
            this.actions.ShootingUp = this.spriteMixer.Action(
                actionSprite,
                100,
                4,
                4,
                5,
                4
            );
            this.actions.ShootingRU = this.spriteMixer.Action(
                actionSprite,
                100,
                4,
                5,
                5,
                5
            );
            this.actions.ShootingRight = this.spriteMixer.Action(
                actionSprite,
                100,
                4,
                6,
                5,
                6
            );
            this.actions.ShootingRD = this.spriteMixer.Action(
                actionSprite,
                100,
                4,
                7,
                5,
                7
            );
            texture.colorSpace = THREE.SRGBColorSpace;

            actionSprite.scale.set(3, 3, 3);
            actionSprite.renderOrder = -10;
            this.spriteMixer.addEventListener("finished", (e) => {
                this.animando = false;
            });
            this.enemyObj = this.entidade;
            this.entidade.add(actionSprite);
        });

        // collision box
        const boxGeometry = new THREE.BoxGeometry(1.5, 3, 1.5);
        const boxMaterial = new THREE.MeshBasicMaterial({ visible: false });
        const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
        boxMesh.position.set(0, 0, 0);
        this.entidade.add(boxMesh);
        this.colisao = boxMesh;
    }

    animateEnemy(frameAtual, alvo) {
        const delta = this.clock.getDelta();
        if (!this.enemyObj) return;

        if (this.bb && this.enemyObj) this.bb.setFromObject(this.entidade);

        // Verifica morte e inicia fade-out
        if (this.hp <= 0 && this.estadoAtual !== "morre") {
            this.estadoAtual = "morre";
            this.animando = false;
            this.entidade.remove(this.colisao);
            this.bb = null;
        }

        if (this.spriteMixer) {
            this.spriteMixer.update(delta);
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
                if (this.distRecuo > 0) {
                    this.recua(alvo);
                } else {
                    this.estadoAtual = "perseguicao";
                }
                break;
            case "morre":
                if (!this.morreu) {
                    this.actions.Die.playOnce(true);
                    this.morreu = true;
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

        const direcaoPersonagem = new THREE.Vector3();
        this.scene.personagem.getWorldDirection(direcaoPersonagem);

        // Calculate the dot product
        const dot = direcao.dot(direcaoPersonagem);

        // Calculate the cross product
        const cross = new THREE.Vector3().crossVectors(direcao, direcaoPersonagem);

        // Get the angle from the dot product
        let angle = Math.acos(dot / (direcao.length() * direcaoPersonagem.length()));

        // Adjust the sign based on the cross product
        if (cross.y < 0) {
            angle = -angle;
        }

        const degAngle = THREE.MathUtils.radToDeg(angle);

        if (!this.animando) {
            if (this.estadoAtual === "morre") {
            }
            else if (degAngle >= 22.5 && degAngle < 67.5) {
                this.actions.runLD.playOnce();
            }
            else if (degAngle >= 67.5 && degAngle < 112.5) {
                this.actions.runLeft.playOnce();
            }
            else if (degAngle >= 112.5 && degAngle < 157.5) {
                this.actions.runLU.playOnce();
            }
            else if (Math.abs(degAngle) >= 157.5) {
                this.actions.runUp.playOnce();
            }
            else if (degAngle <= -22.5 && degAngle > -67.5) {
                this.actions.runRD.playOnce();
            }
            else if (degAngle <= -67.5 && degAngle > -112.5) {
                this.actions.runRight.playOnce();
            }
            else if (degAngle <= -112.5 && degAngle > -157.5) {
                this.actions.runRU.playOnce();
            } else {
                this.actions.runDown.playOnce();
            }
            this.animando = true;
        }
    }

    checarPodeAtacar() {
        return false;
    }

    patrulha(enemy, speed) {}

    atacar(frameAtual) {}

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

export function createEnemies(scene, objetosColidiveis, rampas, personagem) {
    new LostSoul(scene, new THREE.Vector3(-170, -10, -180));
    new LostSoul(scene, new THREE.Vector3(-160, -10, -170));
    new LostSoul(scene, new THREE.Vector3(-140, -10, -160));
    new LostSoul(scene, new THREE.Vector3(-120, -10, -170));
    new LostSoul(scene, new THREE.Vector3(-100, -10, -180));

    new Cacodemon(scene, new THREE.Vector3(0, 60, -190));
    new Cacodemon(scene, new THREE.Vector3(30, 30, -180));
    new Cacodemon(scene, new THREE.Vector3(-30, 45, -180));

    new Soldado(scene, new THREE.Vector3(5, 2, 5));

    function updateEnemies(frameAtual) {
        list_LostSouls.forEach((inimigo) => {
            // inimigo.alerta = true;
            inimigo.animateEnemy(frameAtual, personagem.position);
            inimigo.loopDeComportamento(frameAtual, personagem.position);
        });

        list_Cacodemons.forEach((inimigo) => {
            // inimigo.alerta = true;
            inimigo.animateEnemy(frameAtual, personagem.position);
            inimigo.loopDeComportamento(frameAtual, personagem.position);
        });

        list_Soldados.forEach((inimigo) => {
            inimigo.alerta = true;
            inimigo.animateEnemy(frameAtual, personagem.position);
            inimigo.loopDeComportamento(frameAtual, personagem.position);
        });
    }

    return {
        updateEnemies,
        inimigos: {
            lostSouls: list_LostSouls,
            cacodemons: list_Cacodemons,
            soldados: list_Soldados,
        },
    };
}
