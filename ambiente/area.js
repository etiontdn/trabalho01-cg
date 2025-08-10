import * as THREE from "three";

const materialArea = THREE.MeshLambertMaterial;
const castShadow = true;
const rampaVisivel = false;
const escadaVisivel = true;

//tamanho: {x:num, z:num}, ancora: "esquerda"|"direita"|"frente"|"fundo"
const posAncora = (tamanho, ancora) => {
    let pos = { x: 0, z: 0 };
    switch (ancora) {
        case "esquerda":
            pos.x = tamanho.x / 2;
            break;
        case "direita":
            pos.x = -tamanho.x / 2;
            break;
        case "frente":
            pos.z = -tamanho.z / 2;
            break;
        case "fundo":
            pos.z = tamanho.z / 2;
            break;
    }
    return pos;
};

// Assume todas as partes com mesmo material e cor
class Area {
    constructor(pos, altura, cor, scene) {
        console.log(altura);
        this.obj3D = new THREE.Object3D();
        this.obj3D.castShadow = castShadow;
        this.obj3D.receiveShadow = castShadow;
        this.obj3D.position.set(pos.x, altura / 2, pos.z);
        this.altura = altura;
        this.material = new THREE.MeshLambertMaterial({ color: cor})
        this.scene = scene;
        this.parts = [];
        this.ramps = [];

        // console.log(this.obj3D);
        scene.add(this.obj3D);
    }

    makePart(pos, tamanho, ancora) {
        let ancoraPosition = posAncora(tamanho, ancora);
        let partGeometry = new THREE.BoxGeometry(
            tamanho.x,
            this.altura,
            tamanho.z
        );
        let partMesh = new THREE.Mesh(partGeometry, this.material);
        partMesh.position.set(
            pos.x + ancoraPosition.x,
            0,
            pos.z + ancoraPosition.z
        );
        partMesh.castShadow = castShadow;
        partMesh.receiveShadow = castShadow;
        this.obj3D.add(partMesh);
        this.parts.push(partMesh);
        return partMesh;
    }

    criarRampa(tamanho) {
        const rampGeo = new THREE.BoxGeometry(tamanho.x, 0, tamanho.z);
        const rampMat = new THREE.MeshLambertMaterial({
            visible: rampaVisivel,
        });
        const ramp = new THREE.Mesh(rampGeo, rampMat);

        const angulo = Math.atan2(this.altura, tamanho.z);
        ramp.rotation.x = angulo;

        ramp.position.set(0, 0, 0);
        ramp.eRampa = true;
        this.ramps.push(ramp);
        return ramp;
    }

    criarEscada(pos, tamanho, ancora) {
        let degrauMaterial = this.material;
        let degraus = 8;
        let degrauGeo = new THREE.BoxGeometry(
            tamanho.x,
            this.altura / degraus,
            tamanho.z / degraus
        );
        let escada = new THREE.Object3D();
        let ancoraPosition = posAncora(tamanho, ancora);
        escada.position.set(
            pos.x + ancoraPosition.x,
            0,
            pos.z + ancoraPosition.z
        );

        for (let i = 0; i < degraus; i++) {
            let degrau = new THREE.Mesh(degrauGeo, degrauMaterial);
            this.parts.push(degrau);
            degrau.position.set(
                0,
                -this.altura / 2 +
                    i * (this.altura / degraus) +
                    this.altura / degraus / 2,
                -(
                    -tamanho.z / 2 +
                    (i * tamanho.z) / degraus +
                    tamanho.z / degraus / 2
                )
            );
            degrau.castShadow = castShadow;
            degrau.receiveShadow = castShadow;
            escada.add(degrau);
        }

        escada.add(this.criarRampa(tamanho));
        escada.visible = escadaVisivel;
        this.obj3D.add(escada);
        return escada;
    }

    getParts() {
        return this.parts;
    }
}

export default Area;
