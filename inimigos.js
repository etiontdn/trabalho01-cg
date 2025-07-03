import * as THREE from "three";
import { OBJLoader } from '../build/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js';

const inimigos = [];

export class LostSoul {
    constructor(scene, position, scale, cols = 0, rows = 0) {
        this.scene = scene;
        this.position = position;
        this.scale = scale;
        this.cols = cols;
        this.rows = rows;

        this.url = './assets/skull.obj';
        this.createEnemy();
        inimigos.push(this);
    }

    createEnemy() {
        const loader = new OBJLoader();
        loader.load(this.url, (enemyMesh) => {
            const enemy = new THREE.Object3D();
            enemy.position.copy(this.position);

            enemyMesh.traverse((c) => {
            if (c.isMesh) {
                c.geometry.computeBoundingBox();
                c.geometry.center();
            }
            })
            ;

            enemy.add(enemyMesh);
            this.scene.add(enemy);

            this.enemyObj = enemy;
        });
    }

    animateEnemy(frameAtual, alvo) {
        if (!this.enemyObj) return;

        const dir = new THREE.Vector3().subVectors(alvo, this.enemyObj.position);
        const yaw   = Math.atan2(dir.x, dir.z);
        const pitch = Math.atan2(dir.y, Math.hypot(dir.x, dir.z));
        this.enemyObj.rotation.order = 'YXZ';
        this.enemyObj.rotation.y = yaw;
        this.enemyObj.rotation.x = -pitch;
    }
}

export class Cacodemon {
    constructor(scene, position, scale) {
        this.scene = scene;
        this.position = position;
        this.scale = scale;
        this.url = './assets/cacodemon.glb';
        this.createEnemy();
        inimigos.push(this);
    }

    createEnemy() {
        const loader = new GLTFLoader();
        loader.load(
            this.url,
            (gltf) => {
                const enemy = gltf.scene;
                enemy.position.copy(this.position);
                enemy.scale.copy(this.scale);
                enemy.lookAt(new THREE.Vector3(0, 0, 0));
                this.enemyObj = enemy;
                this.scene.add(enemy);
            }
        );
    }

    animateEnemy(frameAtual, alvo) {
        if (this.enemyObj) {
            this.enemyObj.lookAt(alvo);
        }
    }
}

export function createEnemies(
    scene, 
    objetosColidiveis, 
    rampas, 
    personagem
) {

    new LostSoul(scene, new THREE.Vector3(30, 10, -20), new THREE.Vector3(12, 10, 1));
    new Cacodemon(scene, new THREE.Vector3(30, 13, 0), new THREE.Vector3(0.03, 0.03, 0.03));

    function updateEnemies(frameAtual) {
        inimigos.forEach((inimigo) => {
            inimigo.animateEnemy(frameAtual, personagem.position);
        });
    }

    return updateEnemies;
}