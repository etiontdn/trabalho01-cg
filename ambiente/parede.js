import * as THREE from "three";

const materialParede = THREE.MeshLambertMaterial;
const geoParede = THREE.BoxGeometry;

class ParedeLimitante {
    constructor(pos, tamanho, cor, scene, name = "") {
        this.material = new materialParede({ color: cor });
        this.geometria = new geoParede(tamanho.x, tamanho.y, tamanho.z);
        this.mesh = new THREE.Mesh(this.geometria, this.material);
        this.mesh.position.set(pos.x, pos.y, pos.z);
        scene.add(this.mesh);
        this.mesh.name = name;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        return this.mesh;
    }
}

export default ParedeLimitante;
