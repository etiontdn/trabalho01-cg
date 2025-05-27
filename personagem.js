import * as THREE from "three";
import { PointerLockControls } from "../build/jsm/controls/PointerLockControls.js";

export default function createPersonagem(
  camera,
  renderer,
  objetosColidiveis,
  rampas
) {

  //! Criação do personagem
  const personagemControls = new PointerLockControls(camera, renderer.domElement);
  const personagemObject   = personagemControls.getObject();
  const personagem         = new THREE.Object3D();
  personagem.add(personagemObject);
  
  //! Inicialização do personagem
  const alturaPersonagem = 10;
  const startPos  = new THREE.Vector3(0, alturaPersonagem, 0);
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
  const corpoGeo    = new THREE.CapsuleGeometry(1, alturaPersonagem, 8, 16);
  const corpoMat    = new THREE.MeshBasicMaterial({ visible: false });
  const corpo       = new THREE.Mesh(corpoGeo, corpoMat);
  corpo.position.set(0, alturaPersonagem/2, 0);
  personagem.add(corpo);
  const raycasterDown = new THREE.Raycaster();
  let velY = 0;
  const gravidade = -90;

  //???????? fez o bounding box do personagem eu acho
  const boxSize       = new THREE.Vector3(2, alturaPersonagem, 2);
  const personagemBox = new THREE.Box3();
  const posX          = new THREE.Vector3();
  const posZ          = new THREE.Vector3();

  //! Movimentação do personagem
  const move     = { forward: false, backward: false, left: false, right: false };
  const moveDir  = new THREE.Vector3();
  const forwardV = new THREE.Vector3(0, 0, -1);
  const rightV   = new THREE.Vector3(1, 0,  0);
  const clock    = new THREE.Clock();
  
  //! Controle do personagem
  // let mouseLocked = false;
  document.addEventListener("click",   () => {
    personagemControls.lock();
    // mouseLocked = true;
  });

  // document.addEventListener("mousedown", () => {
  //   if (mouseLocked){
  //       crosshair.active = true;
  //   }
  // });

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup",   onKeyUp);

  function onKeyDown(e) {
    switch (e.code) {
      case "KeyW": case "ArrowUp":    move.forward  = true; break;
      case "KeyS": case "ArrowDown":  move.backward = true; break;
      case "KeyA": case "ArrowLeft":  move.left     = true; break;
      case "KeyD": case "ArrowRight": move.right    = true; break;
      case "Space": initPersonagem(); break;
    }
  }
  function onKeyUp(e) {
    switch (e.code) {
      case "KeyW": case "ArrowUp":    move.forward  = false; break;
      case "KeyS": case "ArrowDown":  move.backward = false; break;
      case "KeyA": case "ArrowLeft":  move.left     = false; break;
      case "KeyD": case "ArrowRight": move.right    = false; break;
    }
  }

  function update() {
    const delta = clock.getDelta();
    const speed = delta * 50;

  /* //! Sincroniza a rotação do personagem com a câmera
     * Pega a rotação da câmera e transforma em euler;
     * Iguala a rotação do personagem com a rotação da câmera;
     * evita nosso problema de precisar andar nos eixos do corpo parado
     * Zera a rotação da câmera, a final o pai já esta olhando
     * para a direção que queremos;
     */
    const camQ  = new THREE.Quaternion();
    camera.getWorldQuaternion(camQ);
    //! Porque está sendo aplicado na ordem inversa??
    const euler = new THREE.Euler().setFromQuaternion(camQ, 'YXZ');
    personagem.rotation.y = euler.y;
    camera.rotation.x     = euler.x;
    camera.rotation.y     = 0;
    camera.rotation.z     = 0;

    
    const worldPos = new THREE.Vector3();
    corpo.getWorldPosition(worldPos);
    raycasterDown.ray.origin.copy(worldPos).y += alturaPersonagem/2;
    raycasterDown.ray.direction.set(0, -1, 0);

    const chaoERampas = rampas.concat(objetosColidiveis);
    const hits = raycasterDown.intersectObjects(chaoERampas);

    if (hits.length > 0) {
      const yChao = hits[0].point.y;
      const distancia = worldPos.y - alturaPersonagem/2 - yChao;
      if (distancia <= 5) {
        personagem.position.y = yChao + 5;
        velY = 0;
      }
    }
    
    //* Multiplica pelo delta para cair levemente (não entendi exatamente o porque do delta 2x)
    velY += gravidade * delta;
    personagem.position.y += velY * delta;
    
    // altura dos pés (para o filtro)
    const bottomY = personagem.position.y - alturaPersonagem/2 + 0.01;

    //! Movimentação do personagem 
    /*
      * se for para a direita, soma 1 em x
      * se for para a esquerda, subtrai 1 em x
      * se for para frente, subtrai 1 em z
      * se for para trás, some 1 em z
      * pq nossos controles estão invertidos em z
    **/
    moveDir.set(0,0,0);
    if (move.forward ) moveDir.add(forwardV);
    if (move.backward) moveDir.sub(forwardV);
    if (move.left    ) moveDir.sub(rightV);
    if (move.right   ) moveDir.add(rightV);

    /* //! refiltra obstáculos laterais:
      * - exclui o chão (PlaneGeometry)
      * - **exclui** qualquer obstáculo cuja face superior
      *   esteja praticamente na mesma altura dos pés
    */
    const lateralObjs = objetosColidiveis.filter(obj => {
      const bb = new THREE.Box3().setFromObject(obj);
      //* se topo do box ≃ altura dos pés, ignoramos
      if (Math.abs(bb.max.y - bottomY) < 1.5) return false;
      return true;
    });
    const obstacleBoxes = lateralObjs.map(obj =>
      new THREE.Box3().setFromObject(obj)
    );

    //* se está se movendo
   if (moveDir.x || moveDir.z) {
     /* 
      * Normaliza a direção que eles está indo para não ir
      * mais rápido quando mais de uma tecla é pressionada
     */
      moveDir.normalize();
      const dirWorld = moveDir.clone()
        .applyEuler(personagem.rotation)
        .multiplyScalar(speed);

      //! X
      posX.copy(personagem.position).add(new THREE.Vector3(dirWorld.x, 0, 0));
      personagemBox.setFromCenterAndSize(posX, boxSize);
      if (!obstacleBoxes.some(b => personagemBox.intersectsBox(b))) {
        personagem.position.x = posX.x;
      }

      //! Z
      posZ.copy(personagem.position).add(new THREE.Vector3(0, 0, dirWorld.z));
      personagemBox.setFromCenterAndSize(posZ, boxSize);
      if (!obstacleBoxes.some(b => personagemBox.intersectsBox(b))) {
        personagem.position.z = posZ.z;
      }
    }
  }

  initPersonagem();
  return { personagem, personagemControls, updateControl: update };
}


// import * as THREE from "three";
// import { PointerLockControls } from "../build/jsm/controls/PointerLockControls.js";
// import { setDefaultMaterial } from "../../libs/util/util.js";

// export default function createPersonagem(camera, renderer, objetosColidiveis) {
//     const personagemControls = new PointerLockControls(
//         camera,
//         renderer.domElement
//     );
//     const inicialPosition = new THREE.Vector3(0, 5, 0);
//     const inicialQuaternion = personagemControls.getObject().quaternion.clone();

//     let personagemMaterial = setDefaultMaterial("red");
//     let personagemGeometry = new THREE.CylinderGeometry(2, 2, 10);
//     let personagemBody = new THREE.Mesh(personagemGeometry, personagemMaterial);
//     personagemBody.position.set(0, 0, 0);
//     personagemBody.visible = false;

//     let personagem = new THREE.Object3D();
//     personagem.add(personagemBody);
//     personagemControls.getObject().position.set(0, 5, 0);
//     personagem.add(personagemControls.getObject());

//     function initPersonagem() {
//         personagem.position.copy(inicialPosition);
//         personagem.quaternion.copy(inicialQuaternion);
//         personagem.updateMatrixWorld();
//     }

//     document.addEventListener("click", () => {
//         personagemControls.lock();
//     });

//     const move = { forward: false, backward: false, left: false, right: false };

//     document.addEventListener("keydown", (e) => {
//         switch (e.code) {
//             case "KeyW":
//             case "ArrowUp":
//                 move.forward = true;
//                 break;
//             case "KeyS":
//             case "ArrowDown":
//                 move.backward = true;
//                 break;
//             case "KeyA":
//             case "ArrowLeft":
//                 move.left = true;
//                 break;
//             case "KeyD":
//             case "ArrowRight":
//                 move.right = true;
//                 break;
//             case "Space":
//                 initPersonagem();
//                 break;
//         }
//     });

//     document.addEventListener("keyup", (e) => {
//         switch (e.code) {
//             case "KeyW":
//             case "ArrowUp":
//                 move.forward = false;
//                 break;
//             case "KeyS":
//             case "ArrowDown":
//                 move.backward = false;
//                 break;
//             case "KeyA":
//             case "ArrowLeft":
//                 move.left = false;
//                 break;
//             case "KeyD":
//             case "ArrowRight":
//                 move.right = false;
//                 break;
//         }
//     });

//     const clock = new THREE.Clock();

//     function checarColisoes() {
//         const checkDistance = 0.5;
//         personagem.updateMatrixWorld();
//         const colisaoPersonagem = new THREE.Box3();
//         colisaoPersonagem.setFromObject(personagemBody);
//         const permitidas = {
//             frente: true,
//             tras: true,
//             esquerda: true,
//             direita: true,
//             frenteEsquerda: true,
//             frenteDireita: true,
//             trasEsquerda: true,
//             trasDireita: true,
//             cima: true,
//             baixo: true,
//         };

//         // As direções devem ser baseadas na orientação ATUAL da mesh 'personagem',
//         // que já foi sincronizada com a câmera (personagemObject).
//         const direcoes = {
//             frente: new THREE.Vector3(0, 0, -1).applyQuaternion(
//                 personagem.quaternion
//             ),
//             tras: new THREE.Vector3(0, 0, 1).applyQuaternion(
//                 personagem.quaternion
//             ),
//             esquerda: new THREE.Vector3(-1, 0, 0).applyQuaternion(
//                 personagem.quaternion
//             ),
//             direita: new THREE.Vector3(1, 0, 0).applyQuaternion(
//                 personagem.quaternion
//             ),
//             frenteEsquerda: new THREE.Vector3(-1, 0, -1).applyQuaternion(
//                 personagem.quaternion
//             ),
//             frenteDireita: new THREE.Vector3(1, 0, -1).applyQuaternion(
//                 personagem.quaternion
//             ),
//             trasEsquerda: new THREE.Vector3(-1, 0, 1).applyQuaternion(
//                 personagem.quaternion
//             ),
//             trasDireita: new THREE.Vector3(1, 0, 1).applyQuaternion(
//                 personagem.quaternion
//             ),
//             cima: new THREE.Vector3(0, 1, 0).applyQuaternion(
//                 personagem.quaternion
//             ),
//             baixo: new THREE.Vector3(0, -1, 0).applyQuaternion(
//                 personagem.quaternion
//             ),
//         };

//         for (let dirKey in direcoes) {
//             const boundingBoxFantasma = new THREE.Box3();
//             boundingBoxFantasma.copy(colisaoPersonagem);
//             const tempVector = new THREE.Vector3();
//             tempVector.copy(direcoes[dirKey]).multiplyScalar(checkDistance);
//             boundingBoxFantasma.translate(tempVector);

//             for (let i = 0; i < objetosColidiveis.length; i++) {
//                 const obj = objetosColidiveis[i];
//                 const objbb = new THREE.Box3();
//                 objbb.setFromObject(obj);
//                 if (boundingBoxFantasma.intersectsBox(objbb)) {
//                     permitidas[dirKey] = false;
//                     console.log(
//                         `Colisão bloqueada na direção: ${dirKey} com ${obj.name}`
//                     ); // Para debug
//                     break;
//                 }
//             }
//         }
//         return permitidas;
//     }

//     function update() {
//         const delta = clock.getDelta();
//         const speed = delta * 50;

//         let currentCameraWorldQuaternion = new THREE.Quaternion();
//         camera.getWorldQuaternion(currentCameraWorldQuaternion);

//         let euler = new THREE.Euler(0, 0, 0, "YXZ");
//         euler.setFromQuaternion(currentCameraWorldQuaternion, "YXZ");

//         personagem.rotation.y = euler.y;
//         camera.rotation.x = euler.x;
//         camera.rotation.y = 0;
//         camera.rotation.z = 0;

//         const direcoesPermitidas = checarColisoes();

//         if (direcoesPermitidas.frenteEsquerda && move.forward && move.left) {
//             personagem.translateZ(-speed / 2);
//             personagem.translateX(-speed / 2);
//         } else if (
//             direcoesPermitidas.frenteDireita &&
//             move.forward &&
//             move.right
//         ) {
//             personagem.translateZ(-speed / 2);
//             personagem.translateX(speed / 2);
//         } else if (
//             direcoesPermitidas.trasEsquerda &&
//             move.backward &&
//             move.left
//         ) {
//             personagem.translateZ(speed / 2);
//             personagem.translateX(-speed / 2);
//         } else if (
//             direcoesPermitidas.trasDireita &&
//             move.backward &&
//             move.right
//         ) {
//             personagem.translateZ(speed / 2);
//             personagem.translateX(speed / 2);
//         } else if (direcoesPermitidas.frente && move.forward) {
//             personagem.translateZ(-speed);
//         } else if (direcoesPermitidas.tras && move.backward) {
//             personagem.translateZ(speed);
//         } else if (direcoesPermitidas.esquerda && move.left) {
//             personagem.translateX(-speed);
//         } else if (direcoesPermitidas.direita && move.right) {
//             personagem.translateX(speed);
//         } else if (move.forward && direcoesPermitidas.frenteDireita) {
//             personagem.translateZ(-speed / 2);
//             personagem.translateX(speed / 2);
//         } else if (move.forward && direcoesPermitidas.frenteEsquerda) {
//             personagem.translateZ(-speed / 2);
//             personagem.translateX(-speed / 2);
//         } else if (move.backward && direcoesPermitidas.trasDireita) {
//             personagem.translateZ(speed / 2);
//             personagem.translateX(speed / 2);
//         } else if (move.backward && direcoesPermitidas.trasEsquerda) {
//             personagem.translateZ(speed / 2);
//             personagem.translateX(-speed / 2);
//         } else if (move.left && direcoesPermitidas.frenteEsquerda) {
//             personagem.translateZ(-speed / 2);
//             personagem.translateX(-speed / 2);
//         } else if (move.right && direcoesPermitidas.frenteDireita) {
//             personagem.translateZ(-speed / 2);
//             personagem.translateX(speed / 2);
//         } else if (move.left && direcoesPermitidas.trasEsquerda) {
//             personagem.translateZ(speed / 2);
//             personagem.translateX(-speed / 2);
//         } else if (move.right && direcoesPermitidas.trasDireita) {
//             personagem.translateZ(speed / 2);
//             personagem.translateX(speed / 2);
//         }
//     }

//     initPersonagem();

//     return {
//         personagemControls: personagemControls,
//         update: update,
//         personagem: personagem,
//     };
// }
