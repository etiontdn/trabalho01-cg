import * as THREE from "three";
import { PointerLockControls } from "../build/jsm/controls/PointerLockControls.js";
import { setDefaultMaterial } from "../../libs/util/util.js";

export default function createPersonagem(camera, renderer, objetosColidiveis) {
    const personagemControls = new PointerLockControls(
        camera,
        renderer.domElement
    );
    const inicialPosition = new THREE.Vector3(0, 5, 0);
    const inicialQuaternion = personagemControls.getObject().quaternion.clone();

    let personagemMaterial = setDefaultMaterial("red");
    let personagemGeometry = new THREE.CylinderGeometry(2, 2, 10);
    let personagemBody = new THREE.Mesh(personagemGeometry, personagemMaterial);
    personagemBody.position.set(0, 0, 0);
    personagemBody.visible = false;

    let personagem = new THREE.Object3D();
    personagem.add(personagemBody);
    personagemControls.getObject().position.set(0, 5, 0);
    personagem.add(personagemControls.getObject());

    function initPersonagem() {
        personagem.position.copy(inicialPosition);
        personagem.quaternion.copy(inicialQuaternion);
        personagem.updateMatrixWorld();
    }

    document.addEventListener("click", () => {
        personagemControls.lock();
    });

    const move = { forward: false, backward: false, left: false, right: false };

    document.addEventListener("keydown", (e) => {
        switch (e.code) {
            case "KeyW":
            case "ArrowUp":
                move.forward = true;
                break;
            case "KeyS":
            case "ArrowDown":
                move.backward = true;
                break;
            case "KeyA":
            case "ArrowLeft":
                move.left = true;
                break;
            case "KeyD":
            case "ArrowRight":
                move.right = true;
                break;
            case "Space":
                initPersonagem();
                break;
        }
    });

    document.addEventListener("keyup", (e) => {
        switch (e.code) {
            case "KeyW":
            case "ArrowUp":
                move.forward = false;
                break;
            case "KeyS":
            case "ArrowDown":
                move.backward = false;
                break;
            case "KeyA":
            case "ArrowLeft":
                move.left = false;
                break;
            case "KeyD":
            case "ArrowRight":
                move.right = false;
                break;
        }
    });

    const clock = new THREE.Clock();

    function checarColisoes() {
        const checkDistance = 0.5;
        personagem.updateMatrixWorld();
        const colisaoPersonagem = new THREE.Box3();
        colisaoPersonagem.setFromObject(personagemBody);
        const permitidas = {
            frente: true,
            tras: true,
            esquerda: true,
            direita: true,
            frenteEsquerda: true,
            frenteDireita: true,
            trasEsquerda: true,
            trasDireita: true,
            cima: true,
            baixo: true,
        };

        // As direções devem ser baseadas na orientação ATUAL da mesh 'personagem',
        // que já foi sincronizada com a câmera (personagemObject).
        const direcoes = {
            frente: new THREE.Vector3(0, 0, -1).applyQuaternion(
                personagem.quaternion
            ),
            tras: new THREE.Vector3(0, 0, 1).applyQuaternion(
                personagem.quaternion
            ),
            esquerda: new THREE.Vector3(-1, 0, 0).applyQuaternion(
                personagem.quaternion
            ),
            direita: new THREE.Vector3(1, 0, 0).applyQuaternion(
                personagem.quaternion
            ),
            frenteEsquerda: new THREE.Vector3(-1, 0, -1).applyQuaternion(
                personagem.quaternion
            ),
            frenteDireita: new THREE.Vector3(1, 0, -1).applyQuaternion(
                personagem.quaternion
            ),
            trasEsquerda: new THREE.Vector3(-1, 0, 1).applyQuaternion(
                personagem.quaternion
            ),
            trasDireita: new THREE.Vector3(1, 0, 1).applyQuaternion(
                personagem.quaternion
            ),
            cima: new THREE.Vector3(0, 1, 0).applyQuaternion(
                personagem.quaternion
            ),
            baixo: new THREE.Vector3(0, -1, 0).applyQuaternion(
                personagem.quaternion
            ),
        };

        for (let dirKey in direcoes) {
            const boundingBoxFantasma = new THREE.Box3();
            boundingBoxFantasma.copy(colisaoPersonagem);
            const tempVector = new THREE.Vector3();
            tempVector.copy(direcoes[dirKey]).multiplyScalar(checkDistance);
            boundingBoxFantasma.translate(tempVector);

            for (let i = 0; i < objetosColidiveis.length; i++) {
                const obj = objetosColidiveis[i];
                const objbb = new THREE.Box3();
                objbb.setFromObject(obj);
                if (boundingBoxFantasma.intersectsBox(objbb)) {
                    permitidas[dirKey] = false;
                    console.log(
                        `Colisão bloqueada na direção: ${dirKey} com ${obj.name}`
                    ); // Para debug
                    break;
                }
            }
        }
        return permitidas;
    }

    function update() {
        const delta = clock.getDelta();
        const speed = delta * 50;

        let currentCameraWorldQuaternion = new THREE.Quaternion();
        camera.getWorldQuaternion(currentCameraWorldQuaternion);

        let euler = new THREE.Euler(0, 0, 0, "YXZ");
        euler.setFromQuaternion(currentCameraWorldQuaternion, "YXZ");

        personagem.rotation.y = euler.y;
        camera.rotation.x = euler.x;
        camera.rotation.y = 0;
        camera.rotation.z = 0;

        const direcoesPermitidas = checarColisoes();

        if (direcoesPermitidas.frenteEsquerda && move.forward && move.left) {
            personagem.translateZ(-speed / 2);
            personagem.translateX(-speed / 2);
        } else if (
            direcoesPermitidas.frenteDireita &&
            move.forward &&
            move.right
        ) {
            personagem.translateZ(-speed / 2);
            personagem.translateX(speed / 2);
        } else if (
            direcoesPermitidas.trasEsquerda &&
            move.backward &&
            move.left
        ) {
            personagem.translateZ(speed / 2);
            personagem.translateX(-speed / 2);
        } else if (
            direcoesPermitidas.trasDireita &&
            move.backward &&
            move.right
        ) {
            personagem.translateZ(speed / 2);
            personagem.translateX(speed / 2);
        } else if (direcoesPermitidas.frente && move.forward) {
            personagem.translateZ(-speed);
        } else if (direcoesPermitidas.tras && move.backward) {
            personagem.translateZ(speed);
        } else if (direcoesPermitidas.esquerda && move.left) {
            personagem.translateX(-speed);
        } else if (direcoesPermitidas.direita && move.right) {
            personagem.translateX(speed);
        } else if (move.forward && direcoesPermitidas.frenteDireita) {
            personagem.translateZ(-speed / 2);
            personagem.translateX(speed / 2);
        } else if (move.forward && direcoesPermitidas.frenteEsquerda) {
            personagem.translateZ(-speed / 2);
            personagem.translateX(-speed / 2);
        } else if (move.backward && direcoesPermitidas.trasDireita) {
            personagem.translateZ(speed / 2);
            personagem.translateX(speed / 2);
        } else if (move.backward && direcoesPermitidas.trasEsquerda) {
            personagem.translateZ(speed / 2);
            personagem.translateX(-speed / 2);
        } else if (move.left && direcoesPermitidas.frenteEsquerda) {
            personagem.translateZ(-speed / 2);
            personagem.translateX(-speed / 2);
        } else if (move.right && direcoesPermitidas.frenteDireita) {
            personagem.translateZ(-speed / 2);
            personagem.translateX(speed / 2);
        } else if (move.left && direcoesPermitidas.trasEsquerda) {
            personagem.translateZ(speed / 2);
            personagem.translateX(-speed / 2);
        } else if (move.right && direcoesPermitidas.trasDireita) {
            personagem.translateZ(speed / 2);
            personagem.translateX(speed / 2);
        }
    }

    initPersonagem();

    return {
        personagemControls: personagemControls,
        update: update,
        personagem: personagem,
    };
}
