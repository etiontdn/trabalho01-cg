import * as THREE from "three";
import {
    initDefaultBasicLight,
    setDefaultMaterial,
    createGroundPlaneXZ,
} from "../../libs/util/util.js";

import Area from "./area.js";

export default function () {
    const objetosColidiveis = [];
    const rampas = [];

    let scene;
    scene = new THREE.Scene();
    const light = initDefaultBasicLight(scene);
    scene.add(light);

    let plane = createGroundPlaneXZ(500, 500);
    scene.add(plane);

    objetosColidiveis.push(plane);

    // Parede do ambiente
    function criarParedes() {
        let paredeMaterial = setDefaultMaterial("grey");
        let paredeEsquerdaGeometry = new THREE.BoxGeometry(10, 50, 500);
        let paredeEsquerda = new THREE.Mesh(
            paredeEsquerdaGeometry,
            paredeMaterial
        );
        paredeEsquerda.position.set(-255, 24, 0);
        paredeEsquerda.name = "parede esquerda";
        objetosColidiveis.push(paredeEsquerda);
        scene.add(paredeEsquerda);

        let paredeDireitaGeometry = new THREE.BoxGeometry(10, 50, 500);
        let paredeDireita = new THREE.Mesh(
            paredeDireitaGeometry,
            paredeMaterial
        );
        paredeDireita.position.set(255, 24, 0);
        paredeDireita.name = "parede direita";
        objetosColidiveis.push(paredeDireita);
        scene.add(paredeDireita);

        let paredeNorteGeometry = new THREE.BoxGeometry(500, 50, 10);
        let paredeNorte = new THREE.Mesh(paredeNorteGeometry, paredeMaterial);
        paredeNorte.position.set(0, 24, -255);
        paredeNorte.name = "parede norte";
        objetosColidiveis.push(paredeNorte);
        scene.add(paredeNorte);

        let paredeSulGeometry = new THREE.BoxGeometry(500, 50, 10);
        let paredeSul = new THREE.Mesh(paredeSulGeometry, paredeMaterial);

        paredeSul.position.set(0, 24, 255);
        paredeSul.name = "parede sul";
        objetosColidiveis.push(paredeSul);
        scene.add(paredeSul);
    }

    criarParedes();

    function criarAreas() {
        const altura = 4;
        const pos1 = new THREE.Vector3(-160, altura / 2, -150);
        const pos2 = new THREE.Vector3(15, altura / 2, -150);
        const pos3 = new THREE.Vector3(155, altura / 2, -150);
        const pos4 = new THREE.Vector3(0, altura / 2, 150);

        const area1 = new Area(pos1, altura, "teal", scene);
        area1.makePart({ x: -15, z: 0 }, { x: 10, z: 100 }, "direita");
        area1.makePart({ x: 15, z: 0 }, { x: 60, z: 100 }, "esquerda");
        area1.makePart({ x: 0, z: 30 }, { x: 30, z: 80 }, "frente");
        area1.criarEscada({ x: 0, z: 50 }, { x: 30, z: 20 }, "frente");
        objetosColidiveis.push(...area1.getParts());
        rampas.push(...area1.ramps);

        const area2 = new Area(pos2, altura, "salmon", scene);
        area2.makePart({ x: -15, z: 0 }, { x: 60, z: 100 }, "direita");
        area2.makePart({ x: 15, z: 0 }, { x: 10, z: 100 }, "esquerda");
        area2.makePart({ x: 0, z: 30 }, { x: 30, z: 80 }, "frente");
        objetosColidiveis.push(...area2.getParts());

        const area3 = new Area(pos3, altura, "violet", scene);
        area3.makePart({ x: -15, z: 0 }, { x: 40, z: 100 }, "direita");
        area3.makePart({ x: 15, z: 0 }, { x: 30, z: 100 }, "esquerda");
        area3.makePart({ x: 0, z: 30 }, { x: 30, z: 80 }, "frente");
        objetosColidiveis.push(...area3.getParts());

        const area4 = new Area(pos4, altura, "green", scene);
        area4.makePart({ x: -15, z: 0 }, { x: 135, z: 100 }, "direita");
        area4.makePart({ x: 15, z: 0 }, { x: 135, z: 100 }, "esquerda");
        area4.makePart({ x: 0, z: -30 }, { x: 30, z: 80 }, "fundo");
        objetosColidiveis.push(...area4.getParts());
    }

    criarAreas();

    function criarLimitesInvisíveis() {
        // céu: a 300u
        let materialBasico = setDefaultMaterial("red");
        const ceuGeometry = new THREE.BoxGeometry(600, 5, 600);
        const ceu = new THREE.Mesh(ceuGeometry, materialBasico);
        ceu.position.set(0, 300, 0);
        scene.add(ceu);

        // chão a -300u:
        const chao = new THREE.Mesh(ceuGeometry, materialBasico);
        chao.position.set(0, -2.5, 0);
        scene.add(chao);

        // paredes laterais: a 300u e -300u
        const paredeGeometry = new THREE.BoxGeometry(5, 600, 600);
        const parede1 = new THREE.Mesh(paredeGeometry, materialBasico);
        parede1.position.set(300, 0, 0);
        const parede2 = new THREE.Mesh(paredeGeometry, materialBasico);
        parede2.position.set(-300, 0, 0);

        scene.add(parede1);
        scene.add(parede2);

        // paredes frente e trás: a 300u e -300u
        const paredeGeometry2 = new THREE.BoxGeometry(600, 600, 5);
        const parede3 = new THREE.Mesh(paredeGeometry2, materialBasico);
        parede3.position.set(0, 0, 300);
        const parede4 = new THREE.Mesh(paredeGeometry2, materialBasico);
        parede4.position.set(0, 0, -300);

        scene.add(parede3);
        scene.add(parede4);

        objetosColidiveis.push(ceu);
        objetosColidiveis.push(chao);
        objetosColidiveis.push(parede1);
        objetosColidiveis.push(parede2);
        objetosColidiveis.push(parede3);
        objetosColidiveis.push(parede4);

        // deixar invisível
        ceu.visible = false;
        chao.visible = false;
        parede1.visible = false;
        parede2.visible = false;
        parede3.visible = false;
        parede4.visible = false;
    }

    criarLimitesInvisíveis();

    return { scene, objetosColidiveis, rampas };
}
