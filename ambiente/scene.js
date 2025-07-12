import * as THREE from "three";
import { criarChave } from "./chave.js";
import Area from "./area.js";
import ParedeLimitante from "./parede.js";
import Iluminacao from "./iluminacao.js";

// Variáveis globais
let personagem = null;
let LostSouls = [];
let lostSoulsAtivados = false;
let Cacodemons = [];
let CacodemonsAtivados = false;

export default function (scene) {
    // Listas de objetos interativos
    const objetosColidiveis = [];
    const rampas = [];

    // Cena principal
    scene.objetosColidiveis = objetosColidiveis;
    scene.rampas = rampas;

    const iluminacao = new Iluminacao(scene);
    iluminacao.adicionarIluminacaoAmbiente();
    iluminacao.adicionarIluminacaoDirecional();

    const chao = new ParedeLimitante(
        { x: 0, y: -0.5, z: 0 },
        { x: 500, y: 1, z: 500 },
        "lightgrey",
        scene,
        "chão"
    );
    rampas.push(chao);

    // Estado das chaves
    let chave1Coletada = false;
    let grupoChave1, chave1;
    let grupoChave2, chave2;
    let subirGrupoChave1 = false;
    let subirGrupoChave2 = false;
    const alturaFinal1 = 11;
    const alturaFinal2 = 11;

    // Elementos interativos
    let plataforma, porta, altar;
    let subida = false;
    let subida2 = false;
    let descida = false;
    let descida2 = false;
    let portaaberta = false;
    let altar_ativo = false;
    let noChao = true;

    // Função para injetar personagem
    function setPersonagem(p) {
        personagem = p;
    }

    function setInimigos(LostSoul, Cacodemon) {
        LostSouls = LostSoul;
        Cacodemons = Cacodemon;
    }
    // ------------------- CRIAÇÃO DO AMBIENTE ------------------- //

    // Cria as paredes externas do ambiente
    function criarParedes() {
        let mat = new THREE.MeshLambertMaterial({ color: 0x333333});

        const paredes = [
            { nome: "esquerda", pos: [-255, 24, 0], tam: [10, 50, 500] },
            { nome: "direita", pos: [255, 24, 0], tam: [10, 50, 500] },
            { nome: "norte", pos: [0, 24, -255], tam: [500, 50, 10] },
            { nome: "sul", pos: [0, 24, 255], tam: [500, 50, 10] },
        ];

        for (let { nome, pos, tam } of paredes) {
            const parede = new ParedeLimitante(
                new THREE.Vector3(...pos),
                new THREE.Vector3(...tam),
                "grey",
                scene,
                `parede ${nome}`
            );
            objetosColidiveis.push(parede);
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
        const area1 = new Area(pos1, altura, 0x008080, scene);
        area1.makePart({ x: -15, z: 0 }, { x: 10, z: 100 }, "direita");
        area1.makePart({ x: 15, z: 0 }, { x: 60, z: 100 }, "esquerda");
        area1.makePart({ x: 0, z: 30 }, { x: 30, z: 80 }, "frente");
        area1.criarEscada({ x: 0, z: 50 }, { x: 30, z: 20 }, "frente");
        objetosColidiveis.push(...area1.getParts());
        rampas.push(...area1.ramps);

        function criarFileiraColunas({
            eixoFixo, // "x" ou "z"
            valorFixo, // posição fixa no eixo escolhido
            eixoVariavel, // "x" ou "z" (oposto ao eixo fixo)
            inicio, // início da distribuição
            fim, // fim da distribuição
            quantidade, // número de colunas
            alturaColuna = 20,
            raio = 2,
            cor = 0xffffff,
        }) {
            const fileira = new THREE.Object3D();
            const colunaGeo = new THREE.CylinderGeometry(
                raio,
                raio,
                alturaColuna,
                16
            );
            const colunaMat = new THREE.MeshLambertMaterial({ color: cor });
            

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
            cor: "white",
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
            cor: "white",
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
            cor: "white",
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
            cor: "white",
        });
        colunasArea1.add(fileiraFundo);

        // Adiciona todas as colunas à área 1
        area1.obj3D.add(colunasArea1);

        // Suporte e chave 1
        const suporte1 = new THREE.Mesh(
            new THREE.CylinderGeometry(2, 2, 10, 32),
            new THREE.MeshLambertMaterial({ color: 0x8b0000 })
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
        rampas.push(grupoChave1);
        objetosColidiveis.push(grupoChave1);
        scene.add(grupoChave1);

        // Área 2: plataforma, porta, altar e chave 2
        const area2 = new Area(pos2, altura, 0xfa8072, scene);
        area2.makePart({ x: -15, z: 0 }, { x: 60, z: 100 }, "direita");
        area2.makePart({ x: 15, z: 0 }, { x: 10, z: 100 }, "esquerda");
        area2.makePart({ x: 0, z: 30 }, { x: 30, z: 80 }, "frente");
        // TODO: Adicionar o elevador aqui, provavelmente!
        objetosColidiveis.push(...area2.getParts());

        plataforma = new THREE.Mesh(
            new THREE.BoxGeometry(30, 8.1, 18),
            new THREE.MeshLambertMaterial({ color: 0x0000ff })
        );
        plataforma.position.set(15, 0, -111);
        plataforma.castShadow = plataforma.receiveShadow = true;
        objetosColidiveis.push(plataforma);
        scene.add(plataforma);

        porta = new THREE.Mesh(
            new THREE.BoxGeometry(30, 8, 0.2),
            new THREE.MeshLambertMaterial({ color: 0xffff00 })
        );
        porta.position.set(15, -0.001, -100.2);
        porta.castShadow = porta.receiveShadow = true;
        objetosColidiveis.push(porta);
        scene.add(porta);

        altar = new THREE.Mesh(
            new THREE.BoxGeometry(2, 3.5, 2),
            new THREE.MeshLambertMaterial({ color: 0x00ff00 })
        );
        altar.position.set(-2, 0, -99);
        objetosColidiveis.push(altar);
        scene.add(altar);

        const suporte2 = new THREE.Mesh(
            new THREE.BoxGeometry(3, 10, 2),
            new THREE.MeshLambertMaterial({ color: 0x800080 })
        );
        suporte2.position.set(-25, -10, 0);
        suporte2.castShadow = suporte2.receiveShadow = true;

        chave2 = criarChave(0xffff00, 0.4);
        chave2.position.set(-25, -3, 0);
        chave2.rotation.x = Math.PI / 2;
        chave2.castShadow = true;

        grupoChave2 = new THREE.Object3D();
        grupoChave2.add(suporte2);
        grupoChave2.add(chave2);
        grupoChave2.position.copy(area2.obj3D.position);
        objetosColidiveis.push(grupoChave2);
        scene.add(grupoChave2);

        // Função auxiliar para criar objetos 3D simples
        function criarObjeto({ geoArgs, color, pos }, scene, listaColisao) {
            const geometry = new THREE.BoxGeometry(...geoArgs);
            const material = new THREE.MeshLambertMaterial({ color });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(...pos);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            scene.add(mesh);
            listaColisao.push(mesh);
            return mesh;
        }

        // Objetos decorativos
        const objetos_Area2 = [
            { geoArgs: [10, 70, 10], color: 0x800080, pos: [0, 20, -190] },
            { geoArgs: [10, 50, 10], color: 0x800080, pos: [-30, 15, -180] },
            { geoArgs: [10, 30, 10], color: 0x800080, pos: [30, 10, -180] },
            { geoArgs: [5, 10, 5],   color: 0x800080, pos: [30, 8, -150] },
            { geoArgs: [5, 15, 5],   color: 0x800080, pos: [-25, 8, -150] },
            { geoArgs: [5, 13, 5],   color: 0x800080, pos: [-15, 8, -130] },
            { geoArgs: [5, 20, 5],   color: 0x800080, pos: [20, 8, -130] },
            { geoArgs: [5, 12, 5],   color: 0x800080, pos: [-40, 7, -120] },
            { geoArgs: [5, 14, 5],   color: 0x800080, pos: [10, 7, -160] },
            { geoArgs: [5, 8, 5],    color: 0x800080, pos: [-50, 7, -150] },
            { geoArgs: [5, 8, 5],    color: 0x800080, pos: [-18, 7, -110] },
            { geoArgs: [5, 17, 5],   color: 0x800080, pos: [2, 7, -140] },
            { geoArgs: [5, 25, 5],   color: 0x800080, pos: [-40, 7, -135] },
        ];

        // Cria todos os objetos
         objetos_Area2.forEach(obj => criarObjeto(obj, scene, objetosColidiveis));

        // Áreas 3 e 4 (apenas cenário)
        const area3 = new Area(pos3, altura, 0xee82ee, scene);
        area3.makePart({ x: -15, z: 0 }, { x: 40, z: 100 }, "direita");
        area3.makePart({ x: 15, z: 0 }, { x: 30, z: 100 }, "esquerda");
        area3.makePart({ x: 0, z: 30 }, { x: 30, z: 80 }, "frente");
        area3.criarEscada({ x: 0, z: 50 }, { x: 30, z: 20 }, "frente");
        objetosColidiveis.push(...area3.getParts());
        rampas.push(...area3.ramps);

        const area4 = new Area(pos4, altura, 0x00ff00, scene);
        area4.makePart({ x: -15, z: 0 }, { x: 135, z: 100 }, "direita");
        area4.makePart({ x: 15, z: 0 }, { x: 135, z: 100 }, "esquerda");
        area4.makePart({ x: 0, z: -30 }, { x: 30, z: 80 }, "fundo");
        const escada = area4.criarEscada(
            { x: 0, z: -50 },
            { x: 30, z: 20 },
            "fundo"
        );
        // inverte rotação da escada para ficar corretamente na frente do jogador

        escada.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);
        objetosColidiveis.push(...area4.getParts());
        rampas.push(...area4.ramps);
    }

    // Cria limites invisíveis para evitar que o personagem caia fora do mapa
    function criarLimitesInvisíveis() {
        const mat = new THREE.MeshLambertMaterial({ color: 0xff0000});
        const ceuGeo = new THREE.BoxGeometry(600, 5, 600);

        const limites = [
            { pos: [0, 300, 0], geo: ceuGeo },
            { pos: [0, -2.5, 0], geo: ceuGeo },
            { pos: [300, 0, 0], geo: new THREE.BoxGeometry(5, 600, 600) },
            { pos: [-300, 0, 0], geo: new THREE.BoxGeometry(5, 600, 600) },
            { pos: [0, 0, 300], geo: new THREE.BoxGeometry(600, 600, 5) },
            { pos: [0, 0, -300], geo: new THREE.BoxGeometry(600, 600, 5) },
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

        if(LostSouls.length==0){
            subirGrupoChave1=true;
        }

        if(Cacodemons.length ==0){
            subirGrupoChave2=true;
        }

        // Elevação dos grupos com chaves
        if (subirGrupoChave1 && grupoChave1.position.y < alturaFinal1) {
            grupoChave1.position.y = Math.min(grupoChave1.position.y + 0.1, alturaFinal1);
            if(grupoChave1.position.y == alturaFinal1)
                subirGrupoChave1=false;
        }
        if (subirGrupoChave2 && grupoChave2.position.y < alturaFinal2) {
            grupoChave2.position.y = Math.min(grupoChave2.position.y + 0.1,alturaFinal2);
            if(grupoChave2.position.y == alturaFinal1)
                subirGrupoChave2=false;
        }

        // Coleta da chave 1
        if (!chave1Coletada &&personagem &&grupoChave1.position.y >= alturaFinal1) {
            const distancia = personagem.position.distanceTo(
                chave1.getWorldPosition(new THREE.Vector3())
            );
            if (distancia < 7) {
                chave1.visible = false;
                chave1Coletada = true;
                console.log("Chave 1 coletada!");
            }
        }

        // Entrega da chave no altar e abertura da porta
        if (chave1Coletada) {
            const distanciaAltar = personagem.position.distanceTo(
                altar.getWorldPosition(new THREE.Vector3())
            );
            if (distanciaAltar < 10) {
                altar.add(chave1);
                chave1.visible = true;
                chave1.position.set(0, 3, 0);
                altar_ativo = true;
                portaaberta = true;
                
            }
        }

        if (portaaberta && porta.position.x > -16 && altar_ativo) {
                   porta.position.x = Math.max(porta.position.x - 0.3, -16);
               }
               
               // Lógica da plataforma móvel
        const posPlataforma = plataforma.getWorldPosition(new THREE.Vector3());
        const PosicaoSubida = -0.01;
        const PosicaoDescida= -4;
        const distanciaX_da_Plataforma = 15;
        const distanciaZ_da_Plataforma = 14;
        const velocidade_plataforma = 0.05;
        const posicaoChao = 1;
        const posicaoTopo = 5;
        const dx = personagem.position.x - posPlataforma.x;
        const dz = personagem.position.z - posPlataforma.z;
        const distanciaPlataformaZ_Atual = Math.abs( dz);
        const distanciaPlataformaX_Atual = Math.abs( dx);
        const emCima = personagem.position.x > 0 && personagem.position.x < 30 && personagem.position.z > -119&& personagem.position.z < -105;
            
        function ajustarPlataforma(subindo, alvo) {
           if (subindo) {
               plataforma.position.y = Math.min(plataforma.position.y + velocidade_plataforma , alvo);
               if (plataforma.position.y === alvo) return false;
           } else {
               plataforma.position.y = Math.max(plataforma.position.y - velocidade_plataforma , alvo);
               if (plataforma.position.y === alvo) return false;
           }
           return true;
       }
       
       if (portaaberta && porta.position.x === -16) {
        
           // Atualiza estado noChao
           if (personagem.position.y === posicaoChao && !emCima) noChao = true;
           else if ((personagem.position.y === posicaoTopo ) && !emCima) noChao = false;
           
           if (noChao) {
               // Descida quando no chão
               if (((distanciaPlataformaZ_Atual <= distanciaZ_da_Plataforma && distanciaPlataformaZ_Atual >= distanciaZ_da_Plataforma -5 )&& distanciaPlataformaX_Atual <= distanciaX_da_Plataforma ) && plataforma.position.y > PosicaoDescida&& !emCima && !descida && !subida&& personagem.position.y == posicaoChao ) {
                   descida2 = true;
                   descida2 = ajustarPlataforma(false, PosicaoDescida);
               } else if (distanciaPlataformaZ_Atual> distanciaZ_da_Plataforma && plataforma.position.y > PosicaoDescida && !emCima && descida2 && !descida && !subida) {
                   descida2 = ajustarPlataforma(false, PosicaoDescida);
               }
       
               // Subida com personagem em cima
               if (emCima && plataforma.position.y <  PosicaoSubida ) {
                
                   subida = true;
                   subida = ajustarPlataforma(true,  PosicaoSubida );
               }
       
               // Subida e descida enquanto não em cima
               if (!emCima && subida) {
                subida = ajustarPlataforma(true,  PosicaoSubida );
               }
               if (!emCima && descida) {
                descida = ajustarPlataforma(false, PosicaoDescida);
               }
           } else {
               // Subida quando no ar
               if ((distanciaPlataformaZ_Atual<= distanciaZ_da_Plataforma && distanciaPlataformaX_Atual <= distanciaX_da_Plataforma ) && plataforma.position.y <  PosicaoSubida  && !emCima && !descida && !subida && personagem.position.y == posicaoTopo) {
                   subida2 = true;
                   subida2 = ajustarPlataforma(true,  PosicaoSubida );
               } else if (distanciaPlataformaZ_Atual > distanciaZ_da_Plataforma && plataforma.position.y <  PosicaoSubida  && !emCima && subida2 && !descida && !subida) {
                   subida2 = ajustarPlataforma(true,  PosicaoSubida );
               }
       
               // Descida com personagem em cima
               if (emCima && plataforma.position.y > PosicaoDescida) {
                   personagem.position.y -= velocidade_plataforma + 0.01;
                   descida = true;
                   descida = ajustarPlataforma(false, PosicaoDescida);
               }
       
               // Subida e descida enquanto não em cima
               if (!emCima && subida) {
                   subida = ajustarPlataforma(true,  PosicaoSubida );
               }
               if (!emCima && descida) {
                   descida = ajustarPlataforma(false, PosicaoDescida);
               }
           }
       
           // Correção final de subida/descida em caso de valores intermediários
           if (personagem.position.y !== posicaoChao&& personagem.position.y !== posicaoTopo ) {
               if (subida && !emCima) {
                   subida = ajustarPlataforma(true,  PosicaoSubida );
               } else if (descida && !emCima) {
                   descida = ajustarPlataforma(false, PosicaoDescida);
               }
           }
       }

        const x = personagem.position.x;
        const z = personagem.position.z;
        

        if (!lostSoulsAtivados &&  (x >= -180 && x <= -100 && z >= -200 && z <= -120)) {
            lostSoulsAtivados =true;
            for (const inimigo of LostSouls) {
                inimigo.alerta = true;
            }
        }

        if (!CacodemonsAtivados && (x >= -20 && x <= 41 && z >= -200 && z <= -120))
        {   
            CacodemonsAtivados =true;
            for (const inimigo of Cacodemons ) {
                inimigo.alerta = true;
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
        setPersonagem,
        setInimigos,
    };
}
