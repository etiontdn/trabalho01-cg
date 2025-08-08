import * as THREE from "three";

class ParedeLimitante {
    constructor(pos, tamanho, materialOuCor, scene, name = "") {
        // Se 'materialOuCor' já for um THREE.Material, usa direto, senão cria um MeshLambertMaterial com a cor
        if (materialOuCor instanceof THREE.Material) {
            this.material = materialOuCor;
        } else {
            this.material = new THREE.MeshLambertMaterial({ color: materialOuCor });
        }

        this.geometria = new THREE.BoxGeometry(tamanho.x, tamanho.y, tamanho.z);
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
