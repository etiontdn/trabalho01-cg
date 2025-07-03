import * as THREE from "three";
import { PointerLockControls } from "../build/jsm/controls/PointerLockControls.js";

export default function createPersonagem(
    camera,
    renderer,
    objetosColidiveis,
    rampas
) {
    //! Criação do personagem
    const personagemControls = new PointerLockControls(
        camera,
        renderer.domElement
    );
    const personagemObject = personagemControls.getObject();
    const personagem = new THREE.Object3D();
    personagem.add(personagemObject);

    //! Inicialização do personagem
    const alturaPersonagem = 2;
    const startPos = new THREE.Vector3(0, 2, 0);
    const startQuat = personagemObject.quaternion.clone();
    personagem.position.copy(startPos);
    personagem.quaternion.copy(startQuat);

    function initPersonagem() {
        personagem.position.copy(startPos);
        personagem.quaternion.copy(startQuat);
        camera.rotation.x = 0;
    }

    //! Corpo do personagem para as colisões
    personagemObject.position.set(0, alturaPersonagem, 0);
    const corpoGeo = new THREE.CylinderGeometry(1, 1, alturaPersonagem, 8);
    const corpoMat = new THREE.MeshBasicMaterial({ visible: false });
    const corpo = new THREE.Mesh(corpoGeo, corpoMat);
    corpo.position.set(0, alturaPersonagem / 2, 0);
    personagem.add(corpo);
    const raycasterDown = new THREE.Raycaster();
    let velY = 0;
    const gravidade = -150;

    //???????? fez o bounding box do personagem eu acho
    const boxSize = new THREE.Vector3(2, alturaPersonagem, 2);
    const personagemBox = new THREE.Box3();
    const posX = new THREE.Vector3();
    const posZ = new THREE.Vector3();

    //! Movimentação do personagem
    const move = { forward: false, backward: false, left: false, right: false };
    const moveDir = new THREE.Vector3();
    const forwardV = new THREE.Vector3(0, 0, -1);
    const rightV = new THREE.Vector3(1, 0, 0);
    const clock = new THREE.Clock();

    //! Controle do personagem
    // let mouseLocked = false;
    document.addEventListener("click", () => {
        personagemControls.lock();
        // mouseLocked = true;
    });

    // document.addEventListener("mousedown", () => {
    //   if (mouseLocked){
    //       crosshair.active = true;
    //   }
    // });

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

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
        }
    }

    let lastY = 0;

    function update() {
        const delta = clock.getDelta();
        const speed = delta * 50;
        if (personagem.position.y != lastY) {
            lastY = personagem.position.y;
            //console.log(lastY);
        }

        /* //! Sincroniza a rotação do personagem com a câmera
         * Pega a rotação da câmera e transforma em euler;
         * Iguala a rotação do personagem com a rotação da câmera;
         * evita nosso problema de precisar andar nos eixos do corpo parado
         * Zera a rotação da câmera, a final o pai já esta olhando
         * para a direção que queremos;
         */
        const camQ = new THREE.Quaternion();
        camera.getWorldQuaternion(camQ);
        //! Porque está sendo aplicado na ordem inversa??
        const euler = new THREE.Euler().setFromQuaternion(camQ, "YXZ");
        personagem.rotation.y = euler.y;
        camera.rotation.x = euler.x;
        camera.rotation.y = 0;
        camera.rotation.z = 0;

        //TODO: Talvez transformar numa função e loop 👍
        const worldPos = new THREE.Vector3();
        corpo.getWorldPosition(worldPos);
        const ray1 = new THREE.Raycaster();
        ray1.ray.origin.copy(worldPos).y -= alturaPersonagem / 2;
        ray1.ray.origin.x -= 2;
        ray1.ray.direction.set(0, -1, 0);
        const ray2 = new THREE.Raycaster();
        ray2.ray.origin.copy(worldPos).y -= alturaPersonagem / 2;
        ray2.ray.origin.x += 2;
        ray2.ray.direction.set(0, -1, 0);
        const ray3 = new THREE.Raycaster();
        ray3.ray.origin.copy(worldPos).y -= alturaPersonagem / 2;
        ray3.ray.origin.z -= 2;
        ray3.ray.direction.set(0, -1, 0);
        const ray4 = new THREE.Raycaster();
        ray4.ray.origin.copy(worldPos).y -= alturaPersonagem / 2;
        ray4.ray.origin.z += 2;
        ray4.ray.direction.set(0, -1, 0);

        raycasterDown.ray.origin.copy(worldPos).y -= alturaPersonagem / 2;
        raycasterDown.ray.direction.set(0, -1, 0);

        const chaoERampas = rampas.concat(objetosColidiveis);
        const hits = raycasterDown.intersectObjects(chaoERampas);
        const hitsRay1 = ray1.intersectObjects(chaoERampas);
        const hitsRay2 = ray2.intersectObjects(chaoERampas);
        const hitsRay3 = ray3.intersectObjects(chaoERampas);
        const hitsRay4 = ray4.intersectObjects(chaoERampas);

        //* Multiplica pelo delta para cair levemente (não entendi exatamente o porque do delta 2x)
        if (hits.length > 0) {
            if (
                (hits[0].point.y === hitsRay1[0].point.y &&
                    hitsRay1[0].point.y === hitsRay2[0].point.y &&
                    hitsRay2[0].point.y === hitsRay3[0].point.y &&
                    hitsRay3[0].point.y === hitsRay4[0].point.y) ||
                (hits[0].object.eRampa &&
                    hitsRay1[0].object.eRampa &&
                    hitsRay2[0].object.eRampa &&
                    hitsRay3[0].object.eRampa &&
                    hitsRay4[0].object.eRampa)
            ) {
                velY += gravidade * delta;
                personagem.position.y += velY * delta;
            }
        }

        if (hits.length > 0) {
            const yChao = hits[0].point.y;
            const distancia = worldPos.y - alturaPersonagem / 2 - yChao;
            // console.log(distancia);
            if (distancia <= alturaPersonagem / 2 && distancia > 0) {
                personagem.position.y = yChao + alturaPersonagem / 2;
                velY = 0;
            }
        }

        // altura dos pés (para o filtro)
        const bottomY = personagem.position.y - alturaPersonagem / 2 + 0.01;

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

        /* //! refiltra obstáculos laterais:
         * - exclui o chão (PlaneGeometry)
         * - **exclui** qualquer obstáculo cuja face superior
         *   esteja praticamente na mesma altura dos pés
         */
        const lateralObjs = objetosColidiveis.filter((obj) => {
            const bb = new THREE.Box3().setFromObject(obj);
            //* se topo do box ≃ altura dos pés, ignoramos
            if (Math.abs(bb.max.y - bottomY) < 1.5) return false;
            return true;
        });
        const obstacleBoxes = lateralObjs.map((obj) =>
            new THREE.Box3().setFromObject(obj)
        );

        //* se está se movendo
        if (moveDir.x || moveDir.z) {
            /*
             * Normaliza a direção que eles está indo para não ir
             * mais rápido quando mais de uma tecla é pressionada
             */
            moveDir.normalize();
            const dirWorld = moveDir
                .clone()
                .applyEuler(personagem.rotation)
                .multiplyScalar(speed);

            //! X
            posX.copy(personagem.position).add(
                new THREE.Vector3(dirWorld.x, 0, 0)
            );
            personagemBox.setFromCenterAndSize(posX, boxSize);
            if (!obstacleBoxes.some((b) => personagemBox.intersectsBox(b))) {
                personagem.position.x = posX.x;
            }

            //! Z
            posZ.copy(personagem.position).add(
                new THREE.Vector3(0, 0, dirWorld.z)
            );
            personagemBox.setFromCenterAndSize(posZ, boxSize);
            if (!obstacleBoxes.some((b) => personagemBox.intersectsBox(b))) {
                personagem.position.z = posZ.z;
            }
        }
    }

    initPersonagem();
    return { personagem, personagemControls, updateControl: update };
}
