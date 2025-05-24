import * as THREE from 'three';
import {
    initDefaultBasicLight,
    setDefaultMaterial,
    createGroundPlaneXZ,
} from "../../libs/util/util.js";

const armas = [];

export default function criarArmas(personagemControls){
    let armaMat = setDefaultMaterial("grey");
    let armaGeo = new THREE.CylinderGeometry(0.8, 0.8, 7);
    let armaRotation = new THREE.Vector3(0, 0, 0);
    armaRotation.x = - Math.PI / 0.7;
    let arma1 = new THREE.Mesh( armaGeo, armaMat );
    arma1.material.side = THREE.DoubleSide;
    arma1.rotation.x = armaRotation.x;
    personagemControls.getObject().add(arma1);
    armas.push(arma1);
    arma1.position.set(0, -5, -7);
    
    // let arma2 = new THREE.Object3D();
    // let arma2_1 = new THREE.Mesh( armaGeo, armaMat );
    // let arma2_2 = new THREE.Mesh( armaGeo, armaMat );
    // arma2_1.material.side = THREE.DoubleSide;
    // arma2_2.material.side = THREE.DoubleSide;
    // arma2.add(arma2_1);
    // arma2.add(arma2_2);
    // arma2_1.position.set(0.6, 0, 0);
    // arma2_2.position.set(-0.6, 0, 0);
    // arma2.rotation.x = - Math.PI / 0.70;
    // personagemControls.getObject().add(arma2);
    // arma2.position.set(0, -5, -7);
    // armas.push(arma2);
    

    function disparar(ativo = false){
            // const disparos = [];
            // let disparoGeo = new THREE.SphereGeometry(0.2, 10, 10);
            // let disparoMat = setDefaultMaterial("black");
            // let disparo = new THREE.Mesh( disparoGeo, disparoMat );
    }
    
    // document.addEventListener("mousedown", () => {
    //     if (mouseLocked){
    //         crosshair.active = true;
    //         diaparar(true);
    //     }
    // });
    document.addEventListener("mouseUp", () => {
        disparar(false);
    });

    //return { armas, disparar };
}