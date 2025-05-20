import * as THREE from "three";
import { setDefaultMaterial } from "../libs/util/util.js";
export default function () {
    let personagemGeometry = new THREE.BoxGeometry(4, 4, 4);
    let material = setDefaultMaterial("red");
    let personagem = new THREE.Mesh(personagemGeometry, material);
    personagem.position.set(0.0, 2.0, 0.0);
    return personagem;
}
