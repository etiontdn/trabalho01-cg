import * as THREE from "three";
import {
    initDefaultBasicLight,
    setDefaultMaterial,
    createGroundPlaneXZ,
} from "../../libs/util/util.js";
import { criarChave } from "./chave.js";

import Area from "./area.js";

let personagem = null;
let chave1Coletada = false;

export default function () {
    const objetosColidiveis = [];
        const rampas = [];
    
        let scene = new THREE.Scene();
        const light = initDefaultBasicLight(scene);
        scene.add(light);
    
        let plane = createGroundPlaneXZ(500, 500);
        scene.add(plane);
        objetosColidiveis.push(plane);
    
        let possechave1 = false;
    
        // Variáveis globais de chave e grupo
        let grupoChave1;
        let chave1;
    
        let subirGrupoChave1 = false;
        const alturaFinal1 = 11;
    
    
    
        // Variáveis globais de chave e grupo
        let grupoChave2;
        let chave2;
    
        let subirGrupoChave2 = false;
        const alturaFinal2 = 11;
        let noChao = true;
        let plataforma;
        let descerplataforma = false;
        let subirplataforma = false;
        let porta;
        let portaaberta = false;
        
        let altar 
        let altar_ativo = false;
        
    
        function setPersonagem(p) {
            personagem = p;
        }

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

        const suporte1Geo = new THREE.CylinderGeometry(2, 2, 10, 32);
        const suporte1Mat = setDefaultMaterial("darkred");
        const suporte1 = new THREE.Mesh(suporte1Geo, suporte1Mat);
        suporte1.position.set(25, -10, 0); // subir ate 35
        suporte1.receiveShadow = true;
        suporte1.castShadow = true;

        // Chave
        chave1 = criarChave(0xcccccc, 0.4);
        chave1.position.set(25, -3, 0); // ir pra posicao 20
        chave1.rotation.x = Math.PI / 2;
        chave1.castShadow = true;

        // Agrupar chave e plataforma
        grupoChave1 = new THREE.Object3D();
        grupoChave1.add(suporte1);
        grupoChave1.add(chave1);
        grupoChave1.position.copy(area1.obj3D.position);
        
        scene.add(grupoChave1);
        objetosColidiveis.push(grupoChave1);


        //area2
        const area2 = new Area(pos2, altura, "salmon", scene);
        area2.makePart({ x: -15, z: 0 }, { x: 60, z: 100 }, "direita");
        area2.makePart({ x: 15, z: 0 }, { x: 10, z: 100 }, "esquerda");
        area2.makePart({ x: 0, z: 30 }, { x: 30, z: 80 }, "frente");
        objetosColidiveis.push(...area2.getParts());

        //plataforma
        const plataformaGeo = new THREE.BoxGeometry(30, 8, 20);
        const plataformaMat = setDefaultMaterial("blue");
        plataforma = new THREE.Mesh(plataformaGeo, plataformaMat);
        plataforma.position.set(15, 0, -111); // ajuste conforme necessário
        //plataforma2.position.set(25, -18, -110); // ajuste conforme necessário
        plataforma.receiveShadow = true;
        plataforma.castShadow = true;
        plataforma.visible = true;
        objetosColidiveis.push(plataforma);
        scene.add(plataforma);

        const portaGeo = new THREE.BoxGeometry(30, 8, 0.1);
        const portaMat = setDefaultMaterial("yellow");
        porta = new THREE.Mesh(portaGeo, portaMat);
        porta.position.set(15, 0, -100.09); // ajuste conforme necessário
        //plataforma2.position.set(25, -18, -110); // ajuste conforme necessário
        porta.receiveShadow = true;
        porta.castShadow = true;

        //altar onde coloca a chave
        const retanguloGeo = new THREE.BoxGeometry(2, 3.5, 2);
        const retanguloGeoMat = setDefaultMaterial("green");
        altar = new THREE.Mesh(retanguloGeo, retanguloGeoMat);
        altar.position.set(-2, 0,-99);
        scene.add(altar);
         //altar
        objetosColidiveis.push(altar);
        
        scene.add(porta)

        const suporte2Geo = new THREE.CylinderGeometry(2, 2, 10, 32);
        const suporte2Mat = setDefaultMaterial("darkred");
        const suporte2 = new THREE.Mesh(suporte2Geo, suporte2Mat);
        suporte2.position.set(-25, -10, 0); // subir ate 35
        suporte2.receiveShadow = true;
        suporte2.castShadow = true;

        // Chave
        
        chave2 = criarChave(0x800080, 0.4);
        chave2.position.set(-25, -3, 0); // ir pra posicao 20
        chave2.rotation.x = Math.PI / 2;
        chave2.castShadow = true;

        // Agrupar chave e plataforma
        grupoChave2 = new THREE.Object3D();
        grupoChave2.add(suporte2);
        grupoChave2.add(chave2);
        grupoChave2.position.copy(area2.obj3D.position);
        
        scene.add(grupoChave2);
        objetosColidiveis.push(grupoChave2);

        //area2

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

    window.addEventListener('keydown', function (event) {
        if (event.key === 'k' || event.key === 'K') {
            subirGrupoChave1 = true;
            subirGrupoChave2 = true;
        }
    });

   function updateScene() {
       
      chave1.rotation.y += 0.02;
    chave1.rotation.x += 0.02;
    
    
    chave2.rotation.y += 0.02;
    chave2.rotation.x += 0.02;
     // Eventos área 1
        if (subirGrupoChave1 && grupoChave1.position.y < alturaFinal1) {
            grupoChave1.position.y += 0.5;
            if (grupoChave1.position.y > alturaFinal1) {
                grupoChave1.position.y = alturaFinal1;
            }
        }

         if (subirGrupoChave2 && grupoChave2.position.y < alturaFinal1) {
            grupoChave2.position.y += 0.5;
            if (grupoChave2.position.y > alturaFinal1) {
                grupoChave2.position.y = alturaFinal1;
            }
        }
    
        
    
        if (!chave1Coletada && personagem && grupoChave1.position.y >= alturaFinal1) {
            const posChave = chave1.getWorldPosition(new THREE.Vector3());
            const distancia = personagem.position.distanceTo(posChave);
            if (distancia < 7) {
                chave1.visible = false;
                chave1Coletada = true;
                console.log("Chave 1 coletada!");
            }
        }
    
        // Eventos área 2
        if (chave1Coletada) {
            const posAltar = altar.getWorldPosition(new THREE.Vector3());
            const distancia2 = personagem.position.distanceTo(posAltar);
            if (distancia2 < 10) {
                chave1.visible = true;
                altar.add(chave1);
                chave1.position.set(0, 3, 0);
                altar_ativo = true;
                portaaberta = true;
                plataforma.visible = true;
            }
        }
    
        if (portaaberta && porta.position.x > -16 && altar_ativo) {
            porta.position.x -= 0.5;
            if (porta.position.x < -16) {
                porta.position.x = -16;
            }
            descerplataforma = true;
        }
    
        const posPlataforma = plataforma.getWorldPosition(new THREE.Vector3());
        const dx = personagem.position.x - posPlataforma.x;
        const dz = personagem.position.z - posPlataforma.z;
        const distanciaPlataforma = Math.hypot(dx, dz);
        
        ///console.log("Posição X do personagem: " + personagem.position.x);
        ///console.log("Posição Y do personagem: " + personagem.position.y);
        //console.log("Posição Z do personagem: " + personagem.position.z);
        // Descer plataforma quando personagem está perto e porta aberta
   
   if (portaaberta && porta.position.x === -16) {

    const personagemProximo = distanciaPlataforma <= 14;
    const emCimaDaPlataforma = (personagem.position.x > 0 && personagem.position.x < 30 && personagem.position.z > -120 && personagem.position.z < -105);
    const foraDaPlataforma = !emCimaDaPlataforma;
    
    console.log(personagem.position.z);
   
   
    
    if(personagem.position.y == 1 && !emCimaDaPlataforma){
        noChao = true;}
    else if ((personagem.position.y == 5 || personagem.position.y == 5.01) && !emCimaDaPlataforma){
        noChao = false;}
    
    
    if(noChao){
        // no chao
        if (personagemProximo && plataforma.position.y > -4 && foraDaPlataforma ) {
            plataforma.position.y -= 0.3;
            console.log("d", distanciaPlataforma);
            if (plataforma.position.y <= -4) {
                plataforma.position.y = -4;
            }
        }

        // Subir a plataforma se o personagem estiver em cima
        if (emCimaDaPlataforma && personagem.position.y < 5) {
            if (plataforma.position.y < 0.01) {
                plataforma.position.y += 0.3;
                if (plataforma.position.y >= 0.01) {
                    plataforma.position.y = 0.01;
                }
            }
        }
    }
    else{
        if (emCimaDaPlataforma  && plataforma.position.y > -4){
            plataforma.position.y -= 0.3;
            if (plataforma.position.y <= -4) {
                plataforma.position.y = -4;
            }
        }
    }
}


        

        
}

      return {
        scene,
        objetosColidiveis,
        rampas,
        updateScene,
        setPersonagem
    }
}
