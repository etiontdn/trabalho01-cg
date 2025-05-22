import * as THREE from "three";
import { PointerLockControls } from "../build/jsm/controls/PointerLockControls.js";

export default function createPersonagem(camera, renderer) {

    const personagemControls = new PointerLockControls(camera, renderer.domElement);
    const personagemObject   = personagemControls.getObject();
    const inicialPosition    = new THREE.Vector3(0, 10, 0);
    const inicialQuaternion = personagemObject.quaternion.clone();
    //* const inicialLookAt      = new THREE.Vector3(0, 10, -10);
    // personagemControls.addEventListener('change', () => console.log("Controls Change"))
    // personagemControls.addEventListener('lock', () => menu.style.display = 'none')
    // personagemControls.addEventListener('unlock', () => menu.style.display = 'block')
    function initPersonagem() {
        personagemObject.position.copy(inicialPosition);
        personagemObject.quaternion.copy(inicialQuaternion);
        //* camera.lookAt(inicialLookAt);
    }

    document.addEventListener("click", () => {
        personagemControls.lock();
    });
    
    const move = { forward: false, backward: false, left: false, right: false };
    
    document.addEventListener("keydown", (e) => {
        switch (e.code) {
            case "KeyW": case "ArrowUp":    move.forward  = true; break;
            case "KeyS": case "ArrowDown":  move.backward = true; break;
            case "KeyA": case "ArrowLeft":  move.left     = true; break;
            case "KeyD": case "ArrowRight": move.right    = true; break;
            case "Space": initPersonagem(); break;
        }
    });

    document.addEventListener("keyup", (e) => {
        switch (e.code) {
            case "KeyW": case "ArrowUp":    move.forward = false; break;
            case "KeyS": case "ArrowDown":  move.backward  = false; break;
            case "KeyA": case "ArrowLeft":  move.left     = false; break;
            case "KeyD": case "ArrowRight": move.right    = false; break;
        }
    });

    const clock = new THREE.Clock();

    function update() {
        const delta = clock.getDelta();
        const speed = delta * 50;

        const z = (move.forward ? 1 : 0) - (move.backward ? 1 : 0);
        const x = (move.right ? 1 : 0) - (move.left ? 1 : 0);

        if (z !== 0) personagemControls.moveForward(z * speed);
        if (x !== 0) personagemControls.moveRight(x * speed);
    }   

    initPersonagem();

    return {
        personagemControls: personagemControls,
        update: update
    };
}
