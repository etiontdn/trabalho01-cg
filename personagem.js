import * as THREE from "three";
import { PointerLockControls } from "../build/jsm/controls/PointerLockControls.js";
import { setDefaultMaterial } from "../../libs/util/util.js";

export default function createPersonagem(camera, renderer, objetosColidiveis) {
    const personagemControls = new PointerLockControls(
        camera,
        renderer.domElement
    );
    const personagemObject = personagemControls.getObject();
    const inicialPosition = new THREE.Vector3(0, 10, 0);
    const inicialQuaternion = personagemObject.quaternion.clone();
    //* const inicialLookAt      = new THREE.Vector3(0, 10, -10);
    // personagemControls.addEventListener('change', () => console.log("Controls Change"))
    // personagemControls.addEventListener('lock', () => menu.style.display = 'none')
    // personagemControls.addEventListener('unlock', () => menu.style.display = 'block')

    let personagemMaterial = setDefaultMaterial("red");
    let personagemGeometry = new THREE.CylinderGeometry(5, 5, 10);
    //let personagemGeometry = new THREE.BoxGeometry(5, 10, 5);
    let personagem = new THREE.Mesh(personagemGeometry, personagemMaterial);
    personagem.position.set(0, -5, 0);
    //personagem.visible = false;
    let colisaoPersonagem = new THREE.Box3();
    personagem.updateMatrixWorld();
    colisaoPersonagem.setFromObject(personagem);

    function initPersonagem() {
        personagemObject.position.copy(inicialPosition);
        personagemObject.quaternion.copy(inicialQuaternion);

        personagem.position.copy(inicialPosition);
        personagem.quaternion.copy(inicialQuaternion);
        //* camera.lookAt(inicialLookAt);
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
        personagem.updateMatrixWorld();
        colisaoPersonagem.setFromObject(personagem);
        const variacao = 0.5;
        const permitidas = {
            frente: true,
            tras: true,
            esquerda: true,
            direita: true,
        };
        const direcoes = {
            frente: new THREE.Vector3(0, 0, -1),
            tras: new THREE.Vector3(0, 0, 1),
            esquerda: new THREE.Vector3(-1, 0, 0),
            direita: new THREE.Vector3(1, 0, 0),
        };

        for (let dir in direcoes) {
            const boundingBox = new THREE.Box3();
            boundingBox.copy(colisaoPersonagem);
            boundingBox.translate(direcoes[dir].multiplyScalar(variacao));
            for (let { nome, box } of objetosColidiveis) {
                if (boundingBox.intersectsBox(box)) {
                    permitidas[dir] = false;
                    console.log(permitidas);
                    break;
                }
            }
        }

        return permitidas;
    }

    function update() {
        const delta = clock.getDelta();
        const speed = delta * 50;

        let position = personagemObject.position.clone();
        personagem.position.copy(position);
        personagem.rotation.y = personagemObject.rotation.y;
        personagem.updateMatrixWorld();

        const permitidas = checarColisoes();

        // const z = (move.forward ? 1 : 0) - (move.backward ? 1 : 0);
        // const x = (move.right ? 1 : 0) - (move.left ? 1 : 0);

        if (permitidas.frente && move.forward) {
            personagemControls.moveForward(speed);
        }
        if (permitidas.tras && move.backward) {
            personagemControls.moveForward(-speed);
        }
        if (permitidas.esquerda && move.left) {
            personagemControls.moveRight(-speed);
        }
        if (permitidas.direita && move.right) {
            personagemControls.moveRight(speed);
        }

        // if (z !== 0) personagemControls.moveForward(z * speed);
        // if (x !== 0) personagemControls.moveRight(x * speed);
    }

    initPersonagem();

    return {
        personagemControls: personagemControls,
        update: update,
        personagem: personagem,
    };
}
