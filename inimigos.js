import * as THREE from "three";
import { OBJLoader } from "../build/jsm/loaders/OBJLoader.js";
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";
import Entidade from "./entidade.js";

const inimigos = [];

const raioDeVisao = 60;

export class LostSoul extends Entidade {
    constructor(scene, spawn) {
        super(scene, spawn);
        this.scale = new THREE.Vector3(10, 8, 1);
        this.maxHp = 20;
        this.hp = this.maxHp;
        this.speed = 0.8;
        this.altMinima = 3;
        this.distRecuo = 0;

        this.url = "./assets/skull.obj";
        this.createEnemy();
        inimigos.push(this);
    }

    createEnemy() {
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
                this.perseguicao(this.entidade, alvo, this.speed);
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

        // if (this.enemyObj.position.y <= this.altMinima)
        //     this.enemyObj.position.y = this.altMinima;

        // if (this.distRecuo > 0) {
        //     this.recua(alvo);
        //     return;
        // }

        // const distancia = this.enemyObj.position.distanceTo(alvo);

        // if (distancia < raioDeVisao) {
        //     if (distancia > 5) {
        //         this.perseguicao(this.enemyObj, alvo, this.speed);
        //     } else {
        //         this.distRecuo = 5;
        //         this.recua(alvo);
        //     }
        // } else {
        //     this.patrulha(this.enemyObj, alvo, this.speed);
        // }
    }

    perseguicao(enemy, alvo, speed) {
        const dummy = new THREE.Object3D();
        dummy.position.copy(enemy.position);
        dummy.lookAt(alvo);

        enemy.quaternion.slerp(dummy.quaternion, 0.04);

        const direction = new THREE.Vector3()
            .subVectors(alvo, enemy.position)
            .normalize();
        enemy.position.add(direction.multiplyScalar(speed * 0.1));
    }

    patrulha(enemy, speed) {
        // this.estadoAtual = "perseguicao"
    }

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
    new LostSoul(scene, new THREE.Vector3(30, 10, -20));
    // new Cacodemon(
    //     scene,
    //     new THREE.Vector3(30, 10, 0),
    //     new THREE.Vector3(0.02, 0.02, 0.02)
    // );

    function updateEnemies(frameAtual) {
        inimigos.forEach((inimigo) => {
            inimigo.animateEnemy(frameAtual, personagem.position);
            inimigo.loopDeComportamento(frameAtual);
        });
    }

    return updateEnemies;
}
