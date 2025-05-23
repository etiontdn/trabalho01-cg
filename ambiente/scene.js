import * as THREE from "three";
import {
    initDefaultBasicLight,
    setDefaultMaterial,
    createGroundPlaneXZ,
} from "../../libs/util/util.js";

export default function () {
    let scene;
    scene = new THREE.Scene();
    const light = initDefaultBasicLight(scene);
    scene.add(light);

    let plane = createGroundPlaneXZ(500, 500);
    scene.add(plane);

    // Parede do ambiente

    function criarParedes() {
        let paredeMaterial = setDefaultMaterial("grey");
        let paredeEsquerdaGeometry = new THREE.BoxGeometry(10, 500, 500);
        let paredeEsquerda = new THREE.Mesh(
            paredeEsquerdaGeometry,
            paredeMaterial
        );
        paredeEsquerda.position.set(-255, 240, 0);
        scene.add(paredeEsquerda);

        let paredeDireitaGeometry = new THREE.BoxGeometry(10, 500, 500);
        let paredeDireita = new THREE.Mesh(
            paredeDireitaGeometry,
            paredeMaterial
        );
        paredeDireita.position.set(255, 240, 0);
        scene.add(paredeDireita);

        let paredeNorteGeometry = new THREE.BoxGeometry(500, 500, 10);
        let paredeNorte = new THREE.Mesh(paredeNorteGeometry, paredeMaterial);
        paredeNorte.position.set(0, 240, -255);
        scene.add(paredeNorte);

        let paredeSulGeometry = new THREE.BoxGeometry(500, 500, 10);
        let paredeSul = new THREE.Mesh(paredeSulGeometry, paredeMaterial);
        paredeSul.position.set(0, 240, 255);
        scene.add(paredeSul);
    }

    criarParedes();

    function criarEscada(posX, posY, posZ, cor) {
        //Receber total de degraus também?
        let degrauMaterial = setDefaultMaterial(cor || "grey");
        let degrauGeo = new THREE.BoxGeometry(30, 2, 2);
        let degraus = 10; // Total de degraus

        let escada = new THREE.Object3D();
        escada.position.set(posX, posY, posZ);

        // Para escada 30x20x20
        for (let i = 0; i < degraus; i++) {
            let degrau = new THREE.Mesh(degrauGeo, degrauMaterial);
            degrau.position.set(0, i * -2 + 8, i * 2 - 9);
            escada.add(degrau);
        }

        return escada;
    }

    function criarAreas() {
        const altura = 20;
        const pos1 = new THREE.Vector3(-150, altura / 2, -150);
        const pos2 = new THREE.Vector3(0, altura / 2, -150);
        const pos3 = new THREE.Vector3(150, altura / 2, -150);
        const pos4 = new THREE.Vector3(0, altura / 2, 150);

        let area1Material = setDefaultMaterial("teal");
        let area1EsquerdaGeo = new THREE.BoxGeometry(10, altura, 100);
        let area1DireitaGeo = new THREE.BoxGeometry(60, altura, 100);
        let area1CentroGeo = new THREE.BoxGeometry(30, altura, 80);

        let area1 = new THREE.Object3D();
        area1.position.set(pos1.x, pos1.y, pos1.z);

        let area1Esquerda = new THREE.Mesh(area1EsquerdaGeo, area1Material);
        area1.add(area1Esquerda);
        area1Esquerda.position.set(-45, 0, 0);

        let area1Centro = new THREE.Mesh(area1CentroGeo, area1Material);
        area1.add(area1Centro);
        area1Centro.position.set(-25, 0, -10);

        let area1Direita = new THREE.Mesh(area1DireitaGeo, area1Material);
        area1.add(area1Direita);
        area1Direita.position.set(20, 0, 0);

        area1.add(criarEscada(-25, 1, 40, "teal"));

        scene.add(area1);

        let area2Material = setDefaultMaterial("salmon");
        let area2DireitaGeo = new THREE.BoxGeometry(10, altura, 100);
        let area2EsquerdaGeo = new THREE.BoxGeometry(60, altura, 100);
        let area2CentroGeo = new THREE.BoxGeometry(30, altura, 80);

        const area2 = new THREE.Object3D();
        area2.position.set(pos2.x, pos2.y, pos2.z);
        scene.add(area2);

        let area2Esquerda = new THREE.Mesh(area2EsquerdaGeo, area2Material);
        area2.add(area2Esquerda);
        area2Esquerda.position.set(-20, 0, 0);

        let area2Centro = new THREE.Mesh(area2CentroGeo, area2Material);
        area2.add(area2Centro);
        area2Centro.position.set(25, 0, -10);

        let area2Direita = new THREE.Mesh(area2DireitaGeo, area2Material);
        area2.add(area2Direita);
        area2Direita.position.set(45, 0, 0);

        area2.add(criarEscada(25, 1, 40, "salmon"));

        let area3Material = setDefaultMaterial("violet");
        let area3DireitaGeo = new THREE.BoxGeometry(30, altura, 100);
        let area3EsquerdaGeo = new THREE.BoxGeometry(40, altura, 100);
        let area3CentroGeo = new THREE.BoxGeometry(30, altura, 80);

        const area3 = new THREE.Object3D();
        area3.position.set(pos3.x, pos3.y, pos3.z);
        scene.add(area3);

        let area3Esquerda = new THREE.Mesh(area3EsquerdaGeo, area3Material);
        area3.add(area3Esquerda);
        area3Esquerda.position.set(-30, 0, 0);

        let area3Centro = new THREE.Mesh(area3CentroGeo, area3Material);
        area3.add(area3Centro);
        area3Centro.position.set(5, 0, -10);

        let area3Direita = new THREE.Mesh(area3DireitaGeo, area3Material);
        area3.add(area3Direita);
        area3Direita.position.set(35, 0, 0);

        area3.add(criarEscada(5, 1, 40, "violet"));

        let area4Material = setDefaultMaterial("green");
        let area4LateralGeo = new THREE.BoxGeometry(135, altura, 100);
        let area4CentroGeo = new THREE.BoxGeometry(30, altura, 80);

        const area4 = new THREE.Object3D();
        area4.position.set(pos4.x, pos4.y, pos4.z);
        scene.add(area4);

        let area4Esquerda = new THREE.Mesh(area4LateralGeo, area4Material);
        area4.add(area4Esquerda);
        area4Esquerda.position.set(-82.5, 0, 0);

        let area4Centro = new THREE.Mesh(area4CentroGeo, area4Material);
        area4.add(area4Centro);
        area4Centro.position.set(0, 0, 10);

        let area4Direita = new THREE.Mesh(area4LateralGeo, area4Material);
        area4.add(area4Direita);
        area4Direita.position.set(82.5, 0, 0);

        let area4Escada = criarEscada(0, 1, -40, "green");
        area4Escada.rotation.y = Math.PI;
        area4.add(area4Escada);
    }

    criarAreas();

    return scene;
}
