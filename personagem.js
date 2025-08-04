// === createPersonagem.js (corrigido) ===
import * as THREE from "three";
import { PointerLockControls } from "../build/jsm/controls/PointerLockControls.js";

export default function createPersonagem(
    camera,
    renderer,
    objetosColidiveis,
    rampas
) {
    //! Criação do personagem
    const personagemControls = new PointerLockControls(camera, document.body);
    const personagemObject = personagemControls.getObject();
    const personagem = new THREE.Object3D();
    personagem.add(personagemObject);

    const alturaPersonagem = 2;
    const startPos = new THREE.Vector3(0, 12, 0);
    const startQuat = personagemObject.quaternion.clone();
    personagem.position.copy(startPos);
    personagem.quaternion.copy(startQuat);

    function initPersonagem() {
        personagem.position.copy(startPos);
        personagem.quaternion.copy(startQuat);
        camera.rotation.x = 0;
    }

    personagemObject.position.set(0, alturaPersonagem, 0);
    const corpoGeo = new THREE.CylinderGeometry(1, 1, alturaPersonagem, 8);
    const corpoMat = new THREE.MeshBasicMaterial({ visible: false });
    const corpo = new THREE.Mesh(corpoGeo, corpoMat);
    corpo.position.set(0, alturaPersonagem / 2, 0);
    personagem.add(corpo);

    personagem.colisao = corpo;

    let velY = 0;
    const gravidade = -150;

    const boxSize = new THREE.Vector3(2, alturaPersonagem, 2);
    const personagemBox = new THREE.Box3();
    const posX = new THREE.Vector3();
    const posZ = new THREE.Vector3();

    const move = { forward: false, backward: false, left: false, right: false };
    const moveDir = new THREE.Vector3();
    const forwardV = new THREE.Vector3(0, 0, -1);
    const rightV = new THREE.Vector3(1, 0, 0);
    const clock = new THREE.Clock();

    document.addEventListener("click", () => personagemControls.lock());
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    let run = 1;

    function onKeyDown(e) {
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
            case "ShiftLeft":
            case "ShiftRight":
                run = 2;
                break;
            case "Space":
                initPersonagem();
                break;
        }
    }

    function onKeyUp(e) {
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
            case "ShiftLeft":
            case "ShiftRight":
                run = 1;
                break;
        }
    }

    function update() {
        const delta = clock.getDelta();
        const speed = delta * 50 * run;


        /* simplesmente para evitar a queda infinita: */
        if (personagem.position.y < 0) {
            personagem.position.copy(startPos);
        }

        const camQ = new THREE.Quaternion();
        camera.getWorldQuaternion(camQ);
        const euler = new THREE.Euler().setFromQuaternion(camQ, "YXZ");
        personagem.rotation.y = euler.y;
        camera.rotation.x = euler.x;
        camera.rotation.y = 0;
        camera.rotation.z = 0;

        const worldPos = new THREE.Vector3();
        corpo.getWorldPosition(worldPos);

        function testarRaycasts() {
            function criarRaycastLimite(x = 0, z = 0) {
                const bottom = new THREE.Vector3();
                bottom.copy(worldPos).y -= alturaPersonagem / 2 + 0.01;
                const ray = new THREE.Raycaster();
                ray.ray.origin.copy(bottom);
                ray.ray.origin.z += z;
                ray.ray.origin.x += x;
                ray.ray.direction.set(0, -1, 0);
                return ray;
            }
            function onHitGoUp(allHits) {
                let maiorYChao = 0;
                for (let hits of allHits) {
                    if (hits.length > 0) {
                        const yChao = hits[0].point.y;
                        if (yChao > maiorYChao) {
                            maiorYChao = yChao;
                        }
                    }
                }
                const distancia =
                    worldPos.y - alturaPersonagem / 2 - maiorYChao;
                if (distancia <= alturaPersonagem / 2 && distancia > 0) {
                    personagem.position.y = maiorYChao + alturaPersonagem / 2;
                    velY = 0;
                } else {
                    velY += gravidade * delta;
                    personagem.position.y += velY * delta;
                }
            }
            const rays = [
                [0, 0],
                [0, 1],
                [1, 0],
                [1, 1],
                [-1, -1],
                [-1, 0],
                [0, -1],
            ];
            const allHits = [];
            for (const ray of rays) {
                const rayObj = criarRaycastLimite(...ray);
                const hits = rayObj.intersectObjects(
                    rampas.concat(objetosColidiveis)
                );
                allHits.push(hits);
            }
            onHitGoUp(allHits);
        }

        testarRaycasts();
        // altura dos pés (para o filtro)
        const bottomY = personagem.position.y - alturaPersonagem / 2;
        //! Movimentação do personagem
        /*
         * se for para a direita, soma 1 em x
         * se for para a esquerda, subtrai 1 em x
         * se for para frente, subtrai 1 em z
         * se for para trás, some 1 em z
         * pq nossos controles estão invertidos em z
         **/
        moveDir.set(0, 0, 0);
        if (move.forward) moveDir.add(forwardV);
        if (move.backward) moveDir.sub(forwardV);
        if (move.left) moveDir.sub(rightV);
        if (move.right) moveDir.add(rightV);

        const lateralObjs = objetosColidiveis.filter((obj) => {
            const bb = new THREE.Box3().setFromObject(obj);
            //* se topo do box ≃ altura dos pés, ignoramos
            if (Math.abs(bb.max.y - bottomY) < 0.3) return false;
            return true;
        });
        const obstacleBoxes = lateralObjs.map((obj) =>
            new THREE.Box3().setFromObject(obj)
        );

        if (moveDir.x || moveDir.z) {
            moveDir.normalize();
            const dirWorld = moveDir
                .clone()
                .applyEuler(personagem.rotation)
                .multiplyScalar(speed);

            posX.copy(personagem.position).add(
                new THREE.Vector3(dirWorld.x, 0, 0)
            );
            personagemBox.setFromCenterAndSize(posX, boxSize);
            if (
                !obstacleBoxes.some((b) => {
                    if (personagemBox.intersectsBox(b)) {
                        return true;
                    }
                })
            ) {
                personagem.position.x = posX.x;
            }

            posZ.copy(personagem.position).add(
                new THREE.Vector3(0, 0, dirWorld.z)
            );
            personagemBox.setFromCenterAndSize(posZ, boxSize);
            if (
                !obstacleBoxes.some((b) => {
                    if (personagemBox.intersectsBox(b)) {
                        return true;
                    }
                })
            ) {
                personagem.position.z = posZ.z;
            }
        }
    }

    initPersonagem();
    return {
        personagem, // Object3D
        corpo, // A MESH do personagem com bounding box real
        personagemControls,
        updateControl: update,
    };
}
