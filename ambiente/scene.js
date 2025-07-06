import * as THREE from "three";
import {
    initDefaultBasicLight,
    setDefaultMaterial,
    createGroundPlaneXZ,
} from "../../libs/util/util.js";
import { criarChave } from "./chave.js";
import Area from "./area.js";

// Variáveis globais
let personagem = null;
let chave1Coletada = false;

export default function () {
    // Listas de objetos interativos
    const objetosColidiveis = [];
    const rampas = [];

    // Cena principal
    const scene = new THREE.Scene();

    // Luz e plano base
    const light = initDefaultBasicLight(scene);
    scene.add(light);
    const plane = createGroundPlaneXZ(500, 500);
    scene.add(plane);
    objetosColidiveis.push(plane);

    // Estado das chaves
    let possechave1 = false;
    let grupoChave1, chave1;
    let grupoChave2, chave2;
    let subirGrupoChave1 = false;
    let subirGrupoChave2 = false;
    const alturaFinal1 = 11;
    const alturaFinal2 = 11;

    // Elementos interativos
    let plataforma, porta, altar;
    let portaaberta = false;
    let altar_ativo = false;
    let noChao = true;

    // Função para injetar personagem
    function setPersonagem(p) {
        personagem = p;
    }

    // ------------------- CRIAÇÃO DO AMBIENTE ------------------- //

    // Cria as paredes externas do ambiente
    function criarParedes() {
        let mat = setDefaultMaterial("grey");

        const paredes = [
            { nome: "esquerda", pos: [-255, 24, 0], tam: [10, 50, 500] },
            { nome: "direita", pos: [255, 24, 0], tam: [10, 50, 500] },
            { nome: "norte", pos: [0, 24, -255], tam: [500, 50, 10] },
            { nome: "sul", pos: [0, 24, 255], tam: [500, 50, 10] }
        ];

        for (let { nome, pos, tam } of paredes) {
            const geo = new THREE.BoxGeometry(...tam);
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(...pos);
            mesh.name = `parede ${nome}`;
            objetosColidiveis.push(mesh);
            scene.add(mesh);
        }
    }

    // Cria as áreas do jogo e elementos interativos
    function criarAreas() {
        const altura = 4;
        const pos1 = new THREE.Vector3(-160, altura / 2, -150);
        const pos2 = new THREE.Vector3(15, altura / 2, -150);
        const pos3 = new THREE.Vector3(155, altura / 2, -150);
        const pos4 = new THREE.Vector3(0, altura / 2, 150);

        // Área 1: contém a primeira chave
        const area1 = new Area(pos1, altura, "teal", scene);
        area1.makePart({ x: -15, z: 0 }, { x: 10, z: 100 }, "direita");
        area1.makePart({ x: 15, z: 0 }, { x: 60, z: 100 }, "esquerda");
        area1.makePart({ x: 0, z: 30 }, { x: 30, z: 80 }, "frente");
        area1.criarEscada({ x: 0, z: 50 }, { x: 30, z: 20 }, "frente");
        objetosColidiveis.push(...area1.getParts());
        rampas.push(...area1.ramps);

        function criarFileiraColunas({
        eixoFixo,         // "x" ou "z"
        valorFixo,        // posição fixa no eixo escolhido
        eixoVariavel,     // "x" ou "z" (oposto ao eixo fixo)
        inicio,           // início da distribuição
        fim,              // fim da distribuição
        quantidade,       // número de colunas
        alturaColuna = 20,
        raio = 2,
        cor = "white"
    }) {
        const fileira = new THREE.Object3D();
        const colunaGeo = new THREE.CylinderGeometry(raio, raio, alturaColuna, 16);
        const colunaMat = setDefaultMaterial(cor);

        for (let i = 0; i < quantidade; i++) {
            const t = quantidade === 1 ? 0.5 : i / (quantidade - 1); // evita divisão por zero
            const variavel = inicio + t * (fim - inicio);

            const coluna = new THREE.Mesh(colunaGeo, colunaMat);
            const pos = { x: 0, y: alturaColuna / 2, z: 0 };
            pos[eixoFixo] = valorFixo;
            pos[eixoVariavel] = variavel;

            coluna.position.set(pos.x, pos.y, pos.z);
            coluna.castShadow = coluna.receiveShadow = true;
            objetosColidiveis.push(coluna);
            fileira.add(coluna);
        }

        return fileira;
    }

    // Agrupador das colunas da área 1
    const colunasArea1 = new THREE.Object3D();

    // Fileira esquerda
    const fileiraEsquerda = criarFileiraColunas({
        eixoFixo: "x",
        valorFixo: -22,
        eixoVariavel: "z",
        inicio: -32,
        fim: 42,
        quantidade: 6,
        cor: "white"
    });
    colunasArea1.add(fileiraEsquerda);

    // Fileira direita
    const fileiraDireita = criarFileiraColunas({
        eixoFixo: "x",
        valorFixo: 72,
        eixoVariavel: "z",
        inicio: -30,
        fim: 30,
        quantidade: 5,
        cor: "white"
    });
    colunasArea1.add(fileiraDireita);

    // Fileira da fund0
    const fileiraFrente = criarFileiraColunas({
        eixoFixo: "z",
        valorFixo: -46,
        eixoVariavel: "x",
        inicio: 72,
        fim: -22,
        quantidade: 7,
        cor: "white"
    });
    colunasArea1.add(fileiraFrente);

    // Fileira do frente
    const fileiraFundo = criarFileiraColunas({
        eixoFixo: "z",
        valorFixo: 47,
        eixoVariavel: "x",
        inicio: 72,
        fim: 20,
        quantidade: 4,
        cor: "white"
    });
    colunasArea1.add(fileiraFundo);

    // Adiciona todas as colunas à área 1
    area1.obj3D.add(colunasArea1);
    

        // Suporte e chave 1
        const suporte1 = new THREE.Mesh(
            new THREE.CylinderGeometry(2, 2, 10, 32),
            setDefaultMaterial("darkred")
        );
        suporte1.position.set(25, -10, 0);
        suporte1.castShadow = suporte1.receiveShadow = true;

        chave1 = criarChave(0xcccccc, 0.4);
        chave1.position.set(25, -3, 0);
        chave1.rotation.x = Math.PI / 2;
        chave1.castShadow = true;

        grupoChave1 = new THREE.Object3D();
        grupoChave1.add(suporte1);
        grupoChave1.add(chave1);
        grupoChave1.position.copy(area1.obj3D.position);
        objetosColidiveis.push(grupoChave1);
        scene.add(grupoChave1);

        // Área 2: plataforma, porta, altar e chave 2
        const area2 = new Area(pos2, altura, "salmon", scene);
        area2.makePart({ x: -15, z: 0 }, { x: 60, z: 100 }, "direita");
        area2.makePart({ x: 15, z: 0 }, { x: 10, z: 100 }, "esquerda");
        area2.makePart({ x: 0, z: 30 }, { x: 30, z: 80 }, "frente");
        objetosColidiveis.push(...area2.getParts());

        plataforma = new THREE.Mesh(new THREE.BoxGeometry(30, 8, 20),setDefaultMaterial("blue"));
        plataforma.position.set(15, 0, -111);
        plataforma.castShadow = plataforma.receiveShadow = true;
        objetosColidiveis.push(plataforma);
        scene.add(plataforma);

        porta = new THREE.Mesh(new THREE.BoxGeometry(30, 8, 0.1),setDefaultMaterial("yellow"));
        porta.position.set(15, 0, -100.09);
        porta.castShadow = porta.receiveShadow = true;
        scene.add(porta);

        altar = new THREE.Mesh(new THREE.BoxGeometry(2, 3.5, 2),setDefaultMaterial("green"));
        altar.position.set(-2, 0, -99);
        objetosColidiveis.push(altar);
        scene.add(altar);

        const suporte2 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 10, 32),setDefaultMaterial("darkred"));
        suporte2.position.set(-25, -10, 0);
        suporte2.castShadow = suporte2.receiveShadow = true;

        chave2 = criarChave(0x800080, 0.4);
        chave2.position.set(-25, -3, 0);
        chave2.rotation.x = Math.PI / 2;
        chave2.castShadow = true;

        grupoChave2 = new THREE.Object3D();
        grupoChave2.add(suporte2);
        grupoChave2.add(chave2);
        grupoChave2.position.copy(area2.obj3D.position);
        objetosColidiveis.push(grupoChave2);
        scene.add(grupoChave2);

        const objeto1Geo = new THREE.BoxGeometry(10, 50, 10);
        const objeto1Mat = setDefaultMaterial("purple");
        let objeto1 = new THREE.Mesh(objeto1Geo , objeto1Mat);
        objeto1.position.set(0,20, -190); // ajuste conforme necessário
        objeto1.receiveShadow = true;
        objeto1 .castShadow = true;
        

        const objeto2Geo = new THREE.BoxGeometry(10, 30, 10);
        const objeto2Mat = setDefaultMaterial("purple");
        let objeto2= new THREE.Mesh(objeto2Geo, objeto2Mat);
        objeto2.position.set(-30, 15, -180); // ajuste conforme necessário
        objeto2.receiveShadow = true;
        objeto2.castShadow = true;
       

        const objeto3Geo= new THREE.BoxGeometry(10, 20, 10);
        const objeto3Mat  = setDefaultMaterial("purple");
        let objeto3 = new THREE.Mesh(objeto3Geo, objeto3Mat);
        objeto3.position.set(30, 10, -180); // ajuste conforme necessário
        objeto3.receiveShadow = true;
        objeto3.castShadow = true;
        

        const objeto4Geo= new THREE.BoxGeometry(5, 5, 5);
        const objeto4Mat  = setDefaultMaterial("purple");
        let objeto4 = new THREE.Mesh(objeto4Geo, objeto4Mat);
        objeto4.position.set(30,8, -150); // ajuste conforme necessário
        objeto4.receiveShadow = true;
        objeto4.castShadow = true;
        

        let objeto5 = new THREE.Mesh(objeto4Geo, objeto4Mat);
        objeto5.position.set(-25,8, -150); // ajuste conforme necessário
        objeto5.receiveShadow = true;
        objeto5.castShadow = true;
        

        let objeto6 = new THREE.Mesh(objeto4Geo, objeto4Mat);
        objeto6.position.set(-15,8, -130); // ajuste conforme necessário
        objeto6.receiveShadow = true;
        objeto6.castShadow = true;
       

        let objeto7 = new THREE.Mesh(objeto4Geo, objeto4Mat);
        objeto7.position.set(20,8, -130); // ajuste conforme necessário
        objeto7.receiveShadow = true;
        objeto7.castShadow = true;
        

        let objeto8 = new THREE.Mesh(objeto4Geo, objeto4Mat);
        objeto8.position.set(-40,7, -120); // ajuste conforme necessário
        objeto8.receiveShadow = true;
        objeto8.castShadow = true;
        

        let objeto9 = new THREE.Mesh(objeto4Geo, objeto4Mat);
        objeto9.position.set(10,7, -160); // ajuste conforme necessário
        objeto9.receiveShadow = true;
        objeto9.castShadow = true;
        

        let objeto10 = new THREE.Mesh(objeto4Geo, objeto4Mat);
        objeto10.position.set(-50,7, -150); // ajuste conforme necessário
        objeto10.receiveShadow = true;
        objeto10.castShadow = true;
        
        scene.add(objeto1, objeto2, objeto3,objeto4, objeto5, objeto6,objeto7, objeto8, objeto9,objeto10);
        objetosColidiveis.push(objeto1, objeto2, objeto3,objeto4, objeto5, objeto6,objeto7, objeto8, objeto9,objeto10);
        
        

        // Áreas 3 e 4 (apenas cenário)
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

    // Cria limites invisíveis para evitar que o personagem caia fora do mapa
    function criarLimitesInvisíveis() {
        const mat = setDefaultMaterial("red");
        const ceuGeo = new THREE.BoxGeometry(600, 5, 600);

        const limites = [
            { pos: [0, 300, 0], geo: ceuGeo },
            { pos: [0, -2.5, 0], geo: ceuGeo },
            { pos: [300, 0, 0], geo: new THREE.BoxGeometry(5, 600, 600) },
            { pos: [-300, 0, 0], geo: new THREE.BoxGeometry(5, 600, 600) },
            { pos: [0, 0, 300], geo: new THREE.BoxGeometry(600, 600, 5) },
            { pos: [0, 0, -300], geo: new THREE.BoxGeometry(600, 600, 5) }
        ];

        for (let { pos, geo } of limites) {
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(...pos);
            mesh.visible = false;
            scene.add(mesh);
            objetosColidiveis.push(mesh);
        }
    }

    // ------------------- EVENTOS E LÓGICA ------------------- //

    // Evento: subir as chaves com tecla "K"
    window.addEventListener("keydown", (event) => {
        if (event.key.toLowerCase() === "k") {
            subirGrupoChave1 = true;
            subirGrupoChave2 = true;
        }
    });

    // Atualização contínua da cena
    function updateScene() {
        chave1.rotation.y += 0.02;
        chave1.rotation.x += 0.02;
        chave2.rotation.y += 0.02;
        chave2.rotation.x += 0.02;

        // Elevação dos grupos com chaves
        if (subirGrupoChave1 && grupoChave1.position.y < alturaFinal1) {
            grupoChave1.position.y = Math.min(grupoChave1.position.y + 0.5, alturaFinal1);
        }
        if (subirGrupoChave2 && grupoChave2.position.y < alturaFinal2) {
            grupoChave2.position.y = Math.min(grupoChave2.position.y + 0.5, alturaFinal2);
        }

        // Coleta da chave 1
        if (!chave1Coletada && personagem && grupoChave1.position.y >= alturaFinal1) {
            const distancia = personagem.position.distanceTo(chave1.getWorldPosition(new THREE.Vector3()));
            if (distancia < 7) {
                chave1.visible = false;
                chave1Coletada = true;
                console.log("Chave 1 coletada!");
            }
        }

        // Entrega da chave no altar e abertura da porta
        if (chave1Coletada) {
            const distanciaAltar = personagem.position.distanceTo(altar.getWorldPosition(new THREE.Vector3()));
            if (distanciaAltar < 10) {
                altar.add(chave1);
                chave1.visible = true;
                chave1.position.set(0, 3, 0);
                altar_ativo = true;
                portaaberta = true;
            }
        }

        if (portaaberta && porta.position.x > -16 && altar_ativo) {
            porta.position.x = Math.max(porta.position.x - 0.5, -16);
        }

        // Lógica da plataforma móvel
        const posPlataforma = plataforma.getWorldPosition(new THREE.Vector3());
        const dx = personagem.position.x - posPlataforma.x;
        const dz = personagem.position.z - posPlataforma.z;
        const distanciaPlataforma = Math.hypot(dx, dz);

        const emCima = personagem.position.x > 0 && personagem.position.x < 30 &&
                       personagem.position.z > -120 && personagem.position.z < -105;

        if (portaaberta && porta.position.x === -16) {
            if (personagem.position.y === 1 && !emCima) noChao = true;
            else if ((personagem.position.y === 5 || personagem.position.y === 5.01) && !emCima) noChao = false;

            if (noChao) {
                if (distanciaPlataforma <= 14 && plataforma.position.y > -4 && !emCima) {
                    plataforma.position.y = Math.max(plataforma.position.y - 0.3, -4);
                }
                if (emCima && personagem.position.y < 5) {
                    plataforma.position.y = Math.min(plataforma.position.y + 0.3, 0.01);
                }
            } else {
                if (emCima && plataforma.position.y > -4) {
                    plataforma.position.y = Math.max(plataforma.position.y - 0.3, -4);
                }
            }
        }
    }

    // Execução das funções de setup
    criarParedes();
    criarAreas();
    criarLimitesInvisíveis();

    // Retorno da cena e controladores
    return {
        scene,
        objetosColidiveis,
        rampas,
        updateScene,
        setPersonagem
    };
}
