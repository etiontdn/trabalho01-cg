import * as THREE from 'three';
import { setDefaultMaterial } from "../../libs/util/util.js";
import crosshair from './crosshair.js';

const armas    = [];
const disparos = [];

export default function criarArmas(scene, personagemControls, objetosColidiveis, rampas) {
  const armaMat  = setDefaultMaterial("grey");
  const armaGeo  = new THREE.CylinderGeometry(0.8, 0.8, 7);
  const arma1 = new THREE.Mesh(armaGeo, armaMat);
  arma1.material.side = THREE.DoubleSide;
  arma1.rotation.x   = -Math.PI / 0.7;
  arma1.position.set(0, -5, -7);
  personagemControls.getObject().add(arma1);
  armas.push(arma1);

  let calcDelta = 0;

  let disparar = false;
  document.addEventListener("mousedown", () => disparar = true);
  document.addEventListener("mouseup",   () => disparar = false);

  const clock = new THREE.Clock();

  function criarDisparo() {
    const disparoGeo = new THREE.SphereGeometry(0.2, 10, 10);
    const disparoMat = setDefaultMaterial("black");
    const tiro = new THREE.Mesh(disparoGeo, disparoMat);

    crosshair.active = true;

    arma1.getWorldPosition(tiro.position);
    tiro.position.y += 3;
    tiro.userData.dir = personagemControls.getObject().getWorldDirection(new THREE.Vector3()).clone();

    scene.add(tiro);
    disparos.push(tiro);
  }

  function updateDisparos() {
    const delta = clock.getDelta();
    const speed = 200;
    calcDelta += delta;

    if (disparar && calcDelta > 0.5){
        criarDisparo();
        calcDelta = 0;
    }

    for (let i = 0; i < disparos.length; i++) {
      const tiro = disparos[i];
      const dir = tiro.userData.dir.clone().normalize();
      tiro.position.addScaledVector(dir, speed * delta);

      const tiroBB = new THREE.Box3().setFromObject(tiro);
      let colidiu = false;
      const alvos  = objetosColidiveis.concat(rampas);
      for (let alvo of alvos) {
        const alvoBB = new THREE.Box3().setFromObject(alvo);
        if (tiroBB.intersectsBox(alvoBB)) {
          colidiu = true;
          break;
        }
      }

      if (colidiu) {
        scene.remove(tiro);
        disparos.splice(i, 1);
        i--;
      }
    }
  }

  return { armas, updateDisparos };
}
