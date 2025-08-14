// scene.js
import * as THREE from "three";
import {
  criarChave
} from "./chave.js";
import Area from "./area.js";
import ParedeLimitante from "./parede.js";
import Iluminacao from "./iluminacao.js";
import createArea4, { updateAnimatedColumns } from "./area4.js"; // Importe a função aqui
import createArea3 from "./area3.js";


async function carregarTexturas() {
  const loader = new THREE.TextureLoader();

  function carregar(path, repeatX = 1, repeatY = 1) {
    return new Promise((resolve, reject) => {
      loader.load(
        path,
        (texture) => {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(repeatX, repeatY);
          resolve(texture);
        },
        undefined,
        reject
      );
    });
  }

  return {
    chao: await carregar("../assets/textures/intertravado.jpg", 50, 50),
    sky: await carregar("assets/qwantani_mid_morning_puresky.jpg"),

    area1: {
      topo: {
        map: await carregar("assets/gray-bricks1-albedo.png"),
        aoMap: await carregar("assets/gray-bricks1-ao.png"),
        normalMap: await carregar("assets/gray-bricks1-Normal-dx.png"),
        roughnessMap: await carregar("assets/gray-bricks1-Roughness.png"),
        displacementMap: await carregar("assets/gray-bricks1-Height.png"),
        metalnessMap: await carregar("assets/gray-bricks1-Metallic.png"),
      },
      lateral: {
        map: await carregar("assets/gray-bricks1-albedo.png"),
        aoMap: await carregar("assets/gray-bricks1-ao.png"),
        normalMap: await carregar("assets/gray-bricks1-Normal-dx.png"),
        roughnessMap: await carregar("assets/gray-bricks1-Roughness.png"),
        displacementMap: await carregar("assets/gray-bricks1-Height.png"),
        metalnessMap: await carregar("assets/gray-bricks1-Metallic.png"),
      },
      escada: {
        map: await carregar("assets/gray-bricks1-albedo.png"),
        aoMap: await carregar("assets/gray-bricks1-ao.png"),
        normalMap: await carregar("assets/gray-bricks1-Normal-dx.png"),
        roughnessMap: await carregar("assets/gray-bricks1-Roughness.png"),
        displacementMap: await carregar("assets/gray-bricks1-Height.png"),
        metalnessMap: await carregar("assets/gray-bricks1-Metallic.png")
      }
    },

    area2: {
      topo: {
        map: await carregar("assets/Metal_Plate_048_basecolor.jpg"),
        aoMap: await carregar("assets/Metal_Plate_048_ambientOcclusion.jpg"),
        normalMap: await carregar("assets/Metal_Plate_048_normal.jpg"),
        roughnessMap: await carregar("assets/Metal_Plate_048_roughness.jpg"),
        displacementMap: await carregar("assets/Metal_Plate_048_height.png"),
        metalnessMap: await carregar("assets/Metal_Plate_048_metallic.jpg"),
      },
      lateral: {
        map: await carregar("assets/rusty_metal_04_diff_4k.png"),
        aoMap: await carregar("assets/rusty_metal_04_ao_4k.png"),
        normalMap: await carregar("assets/rusty_metal_04_nor_gl_4k.png"),
        roughnessMap: await carregar("assets/rusty_metal_04_rough_4k.png"),
        displacementMap: await carregar("assets/rusty_metal_04_disp_4k.png"),
        metalnessMap: await carregar("assets/rusty_metal_04_metal_4k.png"),
      },
    },


    objetos: {
      textura1: {
        map: await carregar("assets/Metal_Trimsheet_002_basecolor.jpg"),
        normalMap: await carregar("assets/Metal_Trimsheet_002_normal.jpg"),
        roughnessMap: await carregar("assets/Metal_Trimsheet_002_roughness.jpg"),
        aoMap: await carregar("assets/Metal_Trimsheet_002_ambientOcclusion.jpg"),
        displacementMap: await carregar("assets/Metal_Trimsheet_002_height.png"),
        metalnessMap: await carregar("assets/Metal_Trimsheet_002_metallic.jpg"),
      },
      textura2: {
        map: await carregar("assets/Metal_Corrugated_015_basecolor.jpg"),
        normalMap: await carregar("assets/Metal_Corrugated_015_normal.jpg"),
        roughnessMap: await carregar("assets/Metal_Corrugated_015_roughness.jpg"),
        aoMap: await carregar("assets/Metal_Corrugated_015_ambientOcclusion.jpg"),
        displacementMap: await carregar("assets/Metal_Corrugated_015_height.png"),
        metalnessMap: await carregar("assets/Metal_Corrugated_015_metallic.jpg"),
      }
    },

    paredes: {
      albedo: await carregar("assets/industrial-walls_albedo.png", 10, 2),
      normal: await carregar("assets/industrial-walls_normal-ogl.png", 10, 2),
      height: await carregar("assets/industrial-walls_height.png", 10, 2),
      ao: await carregar("assets/industrial-walls_ao.png", 10, 2),
    },

    coluna: {
      map: await carregar("assets/Stone_Column_001_basecolor.jpg"),
      normalMap: await carregar("assets/Stone_Column_001_normal.jpg"),
      displacementMap: await carregar("assets/Stone_Column_001_height.jpg"),
      roughnessMap: await carregar("assets/Stone_Column_001_roughness.jpg"),
      aoMap: await carregar("assets/Stone_Column_001_ambientOcclusion.jpg"),
    },

    porta: {
      map: await carregar("assets/worn_corrugated_iron_diff_4k.png"),
      normalMap: await carregar("assets/worn_corrugated_iron_nor_gl_4k.png"),
      roughnessMap: await carregar("assets/worn_corrugated_iron_rough_4k.png"),
      aoMap: await carregar("assets/worn_corrugated_iron_ao_4k.png"),
      metalnessMap: await carregar("assets/worn_corrugated_iron_diff_4k.png"),
    },

    altar: {
      map: await carregar("assets/rust-panel-albedo.png"),
      normalMap: await carregar("assets/rust-panel-normal-unity.png"),
      aoMap: await carregar("assets/rust-panel-ao.png"),

    },

    plataforma: {
      map: await carregar("assets/Metal_Corrugated_Galvanized_001_basecolor.jpg"),
      normalMap: await carregar("assets/Metal_Corrugated_Galvanized_001_normal.jpg"),
      roughnessMap: await carregar("assets/Metal_Corrugated_Galvanized_001_roughness.jpg"),
      aoMap: await carregar("assets/Metal_Corrugated_Galvanized_001_ambientOcclusion.jpg"),
      metalnessMap: await carregar("assets/Metal_Corrugated_Galvanized_001_metallic.jpg"),
    },

    area4: {
      base: {
        map: await carregar("assets/beige-stonework_albedo.png"),
        aoMap: await carregar("assets/beige-stonework_ao.png"),
        normalMap: await carregar("assets/beige-stonework_normal-ogl.png"),
        roughnessMap: await carregar("assets/beige-stonework_roughness.png"),
        displacementMap: await carregar("assets/beige-stonework_height.png"),
        metalnessMap: await carregar("assets/beige-stonework_metallic.png"),
      },
      portal: {
        map: await carregar("assets/rustic_stone_wall_diff_1k.jpg"),
        aoMap: await carregar("assets/rustic_stone_wall_ao_1k.jpg"),
        normalMap: await carregar("assets/rustic_stone_wall_nor_gl_1k.jpg"),
        roughnessMap: await carregar("assets/rustic_stone_wall_rough_1k.jpg"),
        displacementMap: await carregar("assets/rustic_stone_wall_disp_1k.jpg"),
        metalnessMap: await carregar("assets/rustic_stone_wall_diff_1k.jpg"),
      },


      teto: {
        map: await carregar("assets/rustic_stone_wall_diff_1k.jpg"),
        aoMap: await carregar("assets/rustic_stone_wall_ao_1k.jpg"),
        normalMap: await carregar("assets/rustic_stone_wall_nor_gl_1k.jpg"),
        roughnessMap: await carregar("assets/rustic_stone_wall_rough_1k.jpg"),
        displacementMap: await carregar("assets/rustic_stone_wall_disp_1k.jpg"),
        metalnessMap: await carregar("assets/rustic_stone_wall_diff_1k.jpg"),
      },

      bottom: {
        map: await carregar("assets/middle-eastern-wall_albedo.png"),
        aoMap: await carregar("assets/middle-eastern-wall_ao.png"),

        roughnessMap: await carregar("assets/rustic_stone_wall_rough_1k.jpg"),
        displacementMap: await carregar("assets/middle-eastern-wall_height.png"),

      },

      estaca: {
        map: await carregar("assets/rock_surface_diff_1k.jpg"),
        aoMap: await carregar("assets/rock_surface_ao_1k.jpg"),
        normalMap: await carregar("assets/rock_surface_nor_gl_1k.jpg"),
        roughnessMap: await carregar("assets/rock_surface_rough_1k.jpg"),
        displacementMap: await carregar("assets/rock_surface_disp_1k.jpg"),

      },

      pilares: {
        map: await carregar("assets/Wood_Gate_Fortified_001_basecolor.jpg"),
        aoMap: await carregar("assets/Wood_Gate_Fortified_001_ambientOcclusion.jpg"),
        normalMap: await carregar("assets/Wood_Gate_Fortified_001_normal.jpg"),
        roughnessMap: await carregar("assets/Wood_Gate_Fortified_001_roughness.jpg"),
        displacementMap: await carregar("assets/Wood_Gate_Fortified_001_height.png"),

      },

       barricadas: {
        map: await carregar("assets/Wood_Door_002_basecolor.jpg"),
        aoMap: await carregar("assets/Wood_Door_002_ambientOcclusion.jpg"),
        normalMap: await carregar("assets/Wood_Door_002_normal.jpg"),
        roughnessMap: await carregar("assets/Wood_Door_002_roughness.jpg"),
        displacementMap: await carregar("assets/Wood_Door_002_height.png"),

      },

      blocoEstaca: {
        map: await carregar("assets/worn-medieval-armor_albedo.png"),
        aoMap: await carregar("assets/worn-medieval-armor_ao.png"),
        normalMap: await carregar("assets/worn-medieval-armor_normal-ogl.png"),

        displacementMap: await carregar("assets/worn-medieval-armor_height.png"),

      }

    }



  };
}

async function carregarSons(audioListener) {
  const audioLoader = new THREE.AudioLoader();

  function carregar(path) {
    return new Promise((resolve, reject) => {
      audioLoader.load(
        path,
        (buffer) => {
          const sound = new THREE.Audio(audioListener);
          sound.setBuffer(buffer);
          resolve(sound);
        },
        undefined,
        reject
      );
    });
  }

  return {
    keyPickup: await carregar("../0_assetsT3/sounds/chave.wav"),
    platformMove: await carregar("../0_assetsT3/sounds/plataformaMovendo.wav"),
    doorOpen: await carregar("../0_assetsT3/sounds/doorOpening.wav"),
    ambientSound: await carregar("../0_assetsT3/sounds/doom.mp3"),
  };
}


// Variáveis globais
let personagem = null;
let LostSouls = [];
let Cacodemons = [];
let lostSoulsAtivados = false;
let CacodemonsAtivados = false;

let ambientSoundPlaying = false;
let ambientSoundInstance = null;

export default async function(scene, audioListener) {
  const texturas = await carregarTexturas();
  const sons = await carregarSons(audioListener);
  const objetosColidiveis = [];
  const rampas = [];

  scene.objetosColidiveis = objetosColidiveis;
  scene.rampas = rampas;

  const iluminacao = new Iluminacao(scene);
  iluminacao.adicionarIluminacaoAmbiente();
  iluminacao.adicionarIluminacaoDirecional();

  // Chão
  const materialComTextura = new THREE.MeshLambertMaterial({
    map: texturas.chao
  });
  const chao = new ParedeLimitante(
    {
      x: 0,
      y: -0.5,
      z: 0
    }, {
      x: 500,
      y: 1,
      z: 500
    },
    materialComTextura,
    scene,
    "chão"
  );
  rampas.push(chao);

  // Skybox
  texturas.sky.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texturas.sky;

  // Estado das chaves
  let chave1Coletada = false;
  let grupoChave1, chave1;
  let grupoChave2, chave2;
  let subirGrupoChave1 = false;
  let subirGrupoChave2 = false;
  const alturaFinal1 = 11;
  const alturaFinal2 = 12;

  // Elementos interativos
  let plataforma, porta, altar;
  let subida = false;
  let subida2 = false;
  let descida = false;
  let descida2 = false;
  let portaaberta = false;
  let altar_ativo = false;
  let noChao = true;

  // Sound state variables to prevent continuous playback
  let platformSoundPlaying = false;
  let doorSoundPlayed = false;

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
    const tex = texturas.paredes;

    // Otimização: Criar o material da parede uma única vez fora do loop
    const materialParede = new THREE.MeshStandardMaterial({
      map: tex.albedo,
      normalMap: tex.normal,
      displacementMap: tex.height,
      aoMap: tex.ao,
      displacementScale: 0.5,
      roughness: 0.9,
      metalness: 0.0,
    });

    const paredes = [{
      nome: "esquerda",
      pos: [-255, 24, 0],
      tam: [10, 50, 500]
    }, {
      nome: "direita",
      pos: [255, 24, 0],
      tam: [10, 50, 500]
    }, {
      nome: "norte",
      pos: [0, 24, -255],
      tam: [500, 50, 10]
    }, {
      nome: "sul",
      pos: [0, 24, 255],
      tam: [500, 50, 10]
    }, ];

    for (let {
        nome,
        pos,
        tam
      } of paredes) {
      const geometry = new THREE.BoxGeometry(...tam);
      geometry.setAttribute(
        "uv2",
        new THREE.BufferAttribute(geometry.attributes.uv.array, 2)
      );

      const mesh = new THREE.Mesh(geometry, materialParede); // Reutilizando o material
      mesh.position.set(...pos);
      mesh.name = `parede ${nome}`;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      scene.add(mesh);
      objetosColidiveis.push(mesh);
    }
  }

  // Cria as áreas do jogo e elementos interativos
  function criarAreas() {
    const altura = 4;
    const pos1 = new THREE.Vector3(-160, altura / 2, -150);
    const pos2 = new THREE.Vector3(15, altura / 2, -150);
    const pos3 = new THREE.Vector3(155, altura / 2, -150);
    const pos4 = new THREE.Vector3(0, altura / 2, 150);

    const texturasArea = {
      topo: {
        map: texturas.area1.topo.map,
        aoMap: texturas.area1.topo.aoMap,
        normalMap: texturas.area1.topo.normalMap,
        roughnessMap: texturas.area1.topo.roughnessMap,
        displacementMap: texturas.area1.topo.displacementMap,
        metalnessMap: texturas.area1.topo.metalnessMap
      },
      lateral: {
        map: texturas.area1.lateral.map,
        aoMap: texturas.area1.lateral.aoMap,
        normalMap: texturas.area1.lateral.normalMap,
        roughnessMap: texturas.area1.lateral.roughnessMap,
        displacementMap: texturas.area1.lateral.displacementMap,
        metalnessMap: texturas.area1.lateral.metalnessMap
      },
      escada: {
        map: texturas.area1.escada.map,
        aoMap: texturas.area1.escada.aoMap,
        normalMap: texturas.area1.escada.normalMap,
        roughnessMap: texturas.area1.escada.roughnessMap,
        displacementMap: texturas.area1.escada.displacementMap,
        metalnessMap: texturas.area1.escada.metalnessMap
      }
    };

    // ajuste de repetição padrão (sobrescrito por makePart)
    [texturasArea.topo.map, texturasArea.lateral.map, texturasArea.escada.map].forEach(tex => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 1);
    });

    const area1 = new Area(new THREE.Vector3(-160, altura / 2, -150), altura, texturasArea, scene);
    area1.makePart({
      x: -15,
      z: 0
    }, {
      x: 10,
      z: 100
    }, "direita");
    area1.makePart({
      x: 15,
      z: 0
    }, {
      x: 60,
      z: 100
    }, "esquerda");
    area1.makePart({
      x: 0,
      z: 30
    }, {
      x: 30,
      z: 80
    }, "frente");
    area1.criarEscada({
      x: 0,
      z: 50
    }, {
      x: 30,
      z: 20
    }, "frente");
    objetosColidiveis.push(...area1.getParts());
    rampas.push(...area1.ramps);

    // Otimização: Material da coluna criado uma única vez
    const texturaColuna = texturas.coluna.map;
    const mapaNormalColuna = texturas.coluna.normalMap;
    const mapaDeslocamentoColuna = texturas.coluna.displacementMap;
    const mapaRoughnessColuna = texturas.coluna.roughnessMap;
    const mapaAOColuna = texturas.coluna.aoMap;

    // Ajustar repeat e wrap para todas as texturas da coluna
    [texturaColuna, mapaNormalColuna, mapaDeslocamentoColuna, mapaRoughnessColuna, mapaAOColuna].forEach(tex => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 1);
    });

    const colunaMat = new THREE.MeshStandardMaterial({
      map: texturaColuna,
      normalMap: mapaNormalColuna,
      displacementMap: mapaDeslocamentoColuna,
      roughnessMap: mapaRoughnessColuna,
      aoMap: mapaAOColuna,
      displacementScale: 0.4,
      displacementBias: 0,
      roughness: 0,
    });

    function criarFileiraColunas({
      eixoFixo,
      valorFixo,
      eixoVariavel,
      inicio,
      fim,
      quantidade,
      alturaColuna = 20,
      alturaMinima = 10,
      raio = 2,
    }) {
      const fileira = new THREE.Object3D();

      for (let i = 0; i < quantidade; i++) {
        const t = quantidade === 1 ? 0.5 : i / (quantidade - 1);
        const variavel = inicio + t * (fim - inicio);

        const alturaAtual = Math.random() * (alturaColuna - alturaMinima) + alturaMinima;
        const colunaGeo = new THREE.CylinderGeometry(raio, raio, alturaAtual, 32, 32);
        colunaGeo.setAttribute('uv2', new THREE.BufferAttribute(colunaGeo.attributes.uv.array, 2));

        const coluna = new THREE.Mesh(colunaGeo, colunaMat); // Reutilizando o material
        const pos = {
          x: 0,
          y: alturaAtual / 2,
          z: 0
        };
        pos[eixoFixo] = valorFixo;
        pos[eixoVariavel] = variavel;

        coluna.position.set(pos.x, pos.y, pos.z);
        coluna.castShadow = coluna.receiveShadow = true;

        // NOVO: Adiciona o bloco em cima de algumas colunas (50% de chance)
        if (Math.random() < 0.5) { // 50% de chance de ter um bloco
          const alturaBloco = 2; // Altura do bloco
          const bloco = new THREE.Mesh(
            new THREE.BoxGeometry(raio * 2.5, alturaBloco, raio * 2.5), // Tamanho do bloco baseado no raio da coluna
            new THREE.MeshStandardMaterial({
              map: texturaColuna
            }) // Usa a mesma textura da coluna
          );
          // Otimização: Adicionar uv2 para o bloco também
          bloco.geometry.setAttribute('uv2', new THREE.BufferAttribute(bloco.geometry.attributes.uv.array, 2));
          bloco.position.set(0, (alturaAtual / 2) + (alturaBloco / 2), 0); // Posiciona em cima da coluna
          bloco.castShadow = bloco.receiveShadow = true;
          coluna.add(bloco); // Adiciona o bloco como filho da coluna
        }

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
      alturaColuna: 20,
      alturaMinima: 10,
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
      alturaColuna: 20,
      alturaMinima: 8,
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
      alturaColuna: 20,
      alturaMinima: 12,
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
      alturaColuna: 20,
      alturaMinima: 6,
      cor: "white",
    });
    colunasArea1.add(fileiraFundo);

    // Adiciona todas as colunas à área 1
    area1.obj3D.add(colunasArea1);

    // Suporte e chave 1
    // Define as texturas para o suporte da chave 1
    const texSuporte1 = texturas.coluna;

    // Ajusta repeat e wrap para todas as texturas do suporte1
    Object.values(texSuporte1).forEach(tex => {
      if (tex) { // Check if texture exists before setting properties
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(1, 1); // Adjust as needed for desired look
      }
    });

    const suporte1 = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 10, 32),
      new THREE.MeshStandardMaterial({
        map: texSuporte1.map,

      })
    );
    // Ensure uv2 attribute for aoMap and displacementMap
    suporte1.geometry.setAttribute('uv2', new THREE.BufferAttribute(suporte1.geometry.attributes.uv.array, 2));


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
    const texturasArea2 = {
      topo: {
        map: texturas.area2.topo.map,
        aoMap: texturas.area2.topo.aoMap,
        normalMap: texturas.area2.topo.normalMap,
        roughnessMap: texturas.area2.topo.roughnessMap,
        displacementMap: texturas.area2.topo.displacementMap,
        metalnessMap: texturas.area2.topo.metalnessMap
      },
      lateral: {
        map: texturas.area2.lateral.map,
        aoMap: texturas.area2.lateral.aoMap,
        normalMap: texturas.area2.lateral.normalMap,
        roughnessMap: texturas.area2.lateral.roughnessMap,
        displacementMap: texturas.area2.lateral.displacementMap,
        metalnessMap: texturas.area2.lateral.metalnessMap
      },
    };

    // ajuste de repetição padrão (sobrescrito por makePart)
    [texturasArea2.topo.map, texturasArea2.lateral.map].forEach(tex => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 1);
    });

    const area2 = new Area(new THREE.Vector3(15, altura / 2, -150), altura, texturasArea2, scene);
    area2.makePart({
      x: -15,
      z: 0
    }, {
      x: 60,
      z: 100
    }, "direita");
    area2.makePart({
      x: 15,
      z: 0
    }, {
      x: 10,
      z: 100
    }, "esquerda");
    area2.makePart({
      x: 0,
      z: 30
    }, {
      x: 30,
      z: 80
    }, "frente");

    objetosColidiveis.push(...area2.getParts());

    // === Texturas da porta ===
    const texPorta = {
      map: texturas.porta.map,
      normalMap: texturas.porta.normalMap,
      roughnessMap: texturas.porta.roughnessMap,
      aoMap: texturas.porta.aoMap,
      metalnessMap: texturas.porta.metalnessMap,
    };

    // Ajustar UVs
    Object.values(texPorta).forEach(tex => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 1);
    });

    // Otimização: Criar o material da porta uma única vez
    const matPorta = new THREE.MeshStandardMaterial({
      ...texPorta,
      roughness: 1,
      metalness: 1,
    });

    // Criar geometria da porta com uv2
    const geoPorta = new THREE.BoxGeometry(30, 8, 0.2);
    geoPorta.setAttribute("uv2", new THREE.BufferAttribute(geoPorta.attributes.uv.array, 2));

    porta = new THREE.Mesh(geoPorta, matPorta); // Reutilizando o material
    porta.position.set(15, -0.001, -100.2);
    porta.castShadow = porta.receiveShadow = true;
    objetosColidiveis.push(porta);
    scene.add(porta);

    // === Texturas da plataforma ===
    const texPlat = {
      map: texturas.plataforma.map,
      normalMap: texturas.plataforma.normalMap,
      roughnessMap: texturas.plataforma.roughnessMap,
      aoMap: texturas.plataforma.aoMap,
      metalnessMap: texturas.plataforma.metalnessMap,
    };

    // Ajustar UVs
    Object.values(texPlat).forEach(tex => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 2);
    });

    // Otimização: Criar o material da plataforma uma única vez
    const matPlat = new THREE.MeshStandardMaterial({
      ...texPlat,
      roughness: 0.9,
      metalness: 0.3,
    });

    const geoPlat = new THREE.BoxGeometry(30, 8.1, 18);
    geoPlat.setAttribute("uv2", new THREE.BufferAttribute(geoPlat.attributes.uv.array, 2));

    plataforma = new THREE.Mesh(geoPlat, matPlat); // Reutilizando o material
    plataforma.position.set(15, 0, -111);
    plataforma.castShadow = plataforma.receiveShadow = true;
    objetosColidiveis.push(plataforma);
    scene.add(plataforma);

    // Define as texturas para o altar, usando as texturas de 'coluna'
    const texAltar = texturas.altar;

    // Ajusta repeat e wrap para todas as texturas do altar
    Object.values(texAltar).forEach(tex => {
      if (tex) { // Check if texture exists before setting properties
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2); // Adjust as needed for desired look
      }
    });

    // Otimização: Criar o material do altar uma única vez
    const matAltar = new THREE.MeshStandardMaterial({
      map: texAltar.map,
      normalMap: texAltar.normalMap,
      aoMap: texAltar.aoMap,

    });

    // Criar geometria do altar com uv2 para aoMap e displacementMap
    const geoAltar = new THREE.BoxGeometry(2, 3.5, 2);
    geoAltar.setAttribute('uv2', new THREE.BufferAttribute(geoAltar.attributes.uv.array, 2));

    altar = new THREE.Mesh(
      geoAltar,
      matAltar // Reutilizando o material
    );
    altar.position.set(-2, 0, -98);
    altar.castShadow = true;
    altar.receiveShadow = true;
    objetosColidiveis.push(altar);
    scene.add(altar);

    const textura1 = texturas.objetos.textura1.map;
    const textura1Normal = texturas.objetos.textura1.normalMap;
    const textura1Rough = texturas.objetos.textura1.roughnessMap;
    const textura1AO = texturas.objetos.textura1.aoMap;
    const textura1Disp = texturas.objetos.textura1.displacementMap;
    const textura1Metal = texturas.objetos.textura1.metalnessMap;

    // Aplica repeat em todas as texturas da textura1
    [textura1, textura1Normal, textura1Rough, textura1AO, textura1Disp, textura1Metal].forEach(tex => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 10);
    });

    // Textura simples para os demais objetos (textura2 + mapas extras)
    const textura2 = texturas.objetos.textura2.map;
    const textura2Normal = texturas.objetos.textura2.normalMap;
    const textura2Rough = texturas.objetos.textura2.roughnessMap;
    const textura2AO = texturas.objetos.textura2.aoMap;
    const textura2Disp = texturas.objetos.textura2.displacementMap;
    const textura2Metal = texturas.objetos.textura2.metalnessMap;

    // Aplica repeat nas texturas da textura2
    [textura2, textura2Normal, textura2Rough, textura2AO, textura2Disp, textura2Metal].forEach(tex => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 1);
    });

    // Otimização: Material para objetos com textura1 criado uma única vez
    const materialObjetoTextura1 = new THREE.MeshStandardMaterial({
      map: textura1,
      normalMap: textura1Normal,
      roughnessMap: textura1Rough,
      aoMap: textura1AO,
      displacementMap: textura1Disp,
      metalnessMap: textura1Metal,
      displacementScale: 0,
      roughness: 1.0,
      metalness: 1.0,
    });

    // Otimização: Material para objetos com textura2 criado uma única vez
    const materialObjetoTextura2 = new THREE.MeshStandardMaterial({
      map: textura2,
      normalMap: textura2Normal,
      roughnessMap: textura2Rough,
      aoMap: textura2AO,
      displacementMap: textura2Disp,
      metalnessMap: textura2Metal,
      displacementScale: 0,
      roughness: 1.0,
      metalness: 0.5,
    });

    // Cria o suporte2 e o adiciona ao grupo que vai subir
    const suporte2 = new THREE.Mesh(
      new THREE.BoxGeometry(5, 5, 5),
      materialObjetoTextura2 // Reutilizando o material
    );

    // Ajusta a geometria para suportar displacementMap e aoMap
    suporte2.geometry.attributes.uv2 = suporte2.geometry.attributes.uv;

    suporte2.position.set(-25, 4.5, 0);
    suporte2.castShadow = true;
    suporte2.receiveShadow = true;


    // Cria a chave2 separadamente e a posiciona fixamente em y = 4
    chave2 = criarChave(0xffff00, 0.4);
    chave2.position.set(area2.obj3D.position.x - 25, 7, area2.obj3D.position.z);
    chave2.rotation.x = Math.PI / 2;
    chave2.castShadow = true;
    scene.add(chave2);
    objetosColidiveis.push(chave2);

    // Grupo que sobe apenas com o suporte2
    grupoChave2 = new THREE.Object3D();
    grupoChave2.add(suporte2);
    grupoChave2.position.copy(area2.obj3D.position);
    objetosColidiveis.push(grupoChave2);
    scene.add(grupoChave2);

    // Função para criar objetos com múltiplos mapas de textura
    function criarObjetoComTexturas({
      geoArgs,
      pos
    }, scene, listaColisao) {
      const geometry = new THREE.BoxGeometry(...geoArgs);
      geometry.setAttribute('uv2', new THREE.BufferAttribute(geometry.attributes.uv.array, 2));

      const mesh = new THREE.Mesh(geometry, materialObjetoTextura1); // Reutilizando o material
      mesh.position.set(...pos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      listaColisao.push(mesh);
      return mesh;
    }

    // Função para criar objetos simples com textura ou cor
    function criarObjeto({
      geoArgs,
      pos,
      textura = null,
      color = 0xffffff
    }, scene, listaColisao) {
      const geometry = new THREE.BoxGeometry(...geoArgs);

      let material;
      if (textura === textura2) {
        geometry.setAttribute('uv2', new THREE.BufferAttribute(geometry.attributes.uv.array, 2));
        material = materialObjetoTextura2; // Reutilizando o material
      } else {
        material = textura
          ? new THREE.MeshLambertMaterial({
            map: textura
          }) :
          new THREE.MeshLambertMaterial({
            color
          });
      }

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...pos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      listaColisao.push(mesh);
      return mesh;
    }

    // Lista de objetos decorativos
    const objetos_Area2 = [{
      geoArgs: [10, 70, 10],
      pos: [0, 20, -190]
    }, {
      geoArgs: [10, 50, 10],
      pos: [-30, 15, -180]
    }, {
      geoArgs: [10, 30, 10],
      pos: [30, 10, -180]
    }, {
      geoArgs: [5, 5, 5],
      pos: [30, 13, -150]
    }, {
      geoArgs: [5, 5, 5],
      pos: [-25, 7, -150]
    }, {
      geoArgs: [5, 5, 5],
      pos: [-15, 8, -130]
    }, {
      geoArgs: [5, 5, 5],
      pos: [20, 7, -130]
    }, {
      geoArgs: [5, 5, 5],
      pos: [-40, 7, -120]
    }, {
      geoArgs: [5, 5, 5],
      pos: [10, 7, -160]
    }, {
      geoArgs: [5, 5, 5],
      pos: [-50, 13, -150]
    }, {
      geoArgs: [5, 5, 5],
      pos: [-18, 8, -110]
    }, {
      geoArgs: [5, 5, 5],
      pos: [2, 8, -140]
    }, {
      geoArgs: [5, 5, 5],
      pos: [-40, 9, -135]
    }, ];

    // Criação dos objetos na cena
    objetos_Area2.forEach((obj, i) => {
      if (i < 3) {
        criarObjetoComTexturas(obj, scene, objetosColidiveis);
      } else {
        criarObjeto({ ...obj,
          textura: textura2
        }, scene, objetosColidiveis);
      }
    });


    // Área 4
    createArea4(scene, objetosColidiveis, rampas, texturas.area4);
    createArea3(scene, objetosColidiveis, rampas);


  }

  // Cria limites invisíveis para evitar que o personagem caia fora do mapa
  function criarLimitesInvisíveis() {
    const mat = new THREE.MeshLambertMaterial({
      color: 0xff0000
    });
    const ceuGeo = new THREE.BoxGeometry(600, 5, 600);

    const limites = [{
      pos: [0, 300, 0],
      geo: ceuGeo
    }, {
      pos: [0, -2.5, 0],
      geo: ceuGeo
    }, {
      pos: [300, 0, 0],
      geo: new THREE.BoxGeometry(5, 600, 600)
    }, {
      pos: [-300, 0, 0],
      geo: new THREE.BoxGeometry(5, 600, 600)
    }, {
      pos: [0, 0, 300],
      geo: new THREE.BoxGeometry(600, 600, 5)
    }, {
      pos: [0, 0, -300],
      geo: new THREE.BoxGeometry(600, 600, 5)
    }, ];

    for (let {
        pos,
        geo
      } of limites) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...pos);
      mesh.visible = false;
      scene.add(mesh);
      objetosColidiveis.push(mesh);
    }
  }

  function toggleAmbientSound(playMusic) {
    if (!ambientSoundInstance) {
      ambientSoundInstance = sons.ambientSound;
      ambientSoundInstance.setLoop(true);
      ambientSoundInstance.setVolume(0.5);
    }

    if (playMusic && !ambientSoundPlaying) {
      ambientSoundInstance.play();
      ambientSoundPlaying = true;
    } else if (!playMusic && ambientSoundPlaying) {
      ambientSoundInstance.stop();
      ambientSoundPlaying = false;
    }
  }

  toggleAmbientSound(true);


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

    if (LostSouls.length == 0) {
      subirGrupoChave1 = true;
    }

    if (Cacodemons.length == 0) {
      subirGrupoChave2 = true;
    }

    // Elevação dos grupos com chaves
    if (subirGrupoChave1 && grupoChave1.position.y < alturaFinal1) {
      grupoChave1.position.y = Math.min(grupoChave1.position.y + 0.1, alturaFinal1);
      if (grupoChave1.position.y == alturaFinal1)
        subirGrupoChave1 = false;
    }
    if (subirGrupoChave2 && grupoChave2.position.y < alturaFinal2) {
      grupoChave2.position.y = Math.min(grupoChave2.position.y + 0.1, alturaFinal2);
      if (grupoChave2.position.y == alturaFinal1)
        subirGrupoChave2 = false;
    }

    // Coleta da chave 1
    if (!chave1Coletada && personagem && grupoChave1.position.y >= alturaFinal1) {
      const distancia = personagem.position.distanceTo(
        chave1.getWorldPosition(new THREE.Vector3())
      );
      if (distancia < 7) {
        chave1.visible = false;
        chave1Coletada = true;
        sons.keyPickup.play();
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
        if (!portaaberta) {
          portaaberta = true;
          sons.doorOpen.play();
        }
      }
    }

    if (portaaberta && porta.position.x > -16 && altar_ativo) {
      porta.position.x = Math.max(porta.position.x - 0.4, -16);
    }

    // ------------------- LÓGICA DA PLATAFORMA -------------------
    const posPlataforma = plataforma.getWorldPosition(new THREE.Vector3());
    const PosicaoSubida = -0.01;
    const PosicaoDescida = -4;
    const distanciaX_da_Plataforma = 15;
    const distanciaZ_da_Plataforma = 14;
    const velocidade_plataforma = 0.1;
    const posicaoChao = 1;
    const posicaoTopo = 5;

    const dx = personagem.position.x - posPlataforma.x;
    const dz = personagem.position.z - posPlataforma.z;
    const distanciaPlataformaZ_Atual = Math.abs(dz);
    const distanciaPlataformaX_Atual = Math.abs(dx);

    const emCima = personagem.position.x > 0 &&
      personagem.position.x < 30 &&
      personagem.position.z > -119 &&
      personagem.position.z < -105;

    function ajustarPlataforma(subindo, alvo) {
      const initialY = plataforma.position.y;

      if (subindo) {
        plataforma.position.y = Math.min(plataforma.position.y + velocidade_plataforma, alvo);
        if (plataforma.position.y === alvo) {
          if (platformSoundPlaying) {
            sons.platformMove.stop();
            platformSoundPlaying = false;
          }
          return false;
        }
      } else {
        plataforma.position.y = Math.max(plataforma.position.y - velocidade_plataforma, alvo);
        if (plataforma.position.y === alvo) {
          if (platformSoundPlaying) {
            sons.platformMove.stop();
            platformSoundPlaying = false;
          }
          return false;
        }
      }

      if (plataforma.position.y !== initialY && !platformSoundPlaying) {
        sons.platformMove.play();
        platformSoundPlaying = true;
      }
      return true;
    }

    if (portaaberta && porta.position.x === -16) {

      if (personagem.position.y === posicaoChao && !emCima) noChao = true;
      else if ((personagem.position.y === posicaoTopo) && !emCima) noChao = false;

      if (noChao) {
        // Descida quando no chão
        if (!descida2 && !subida &&
          ((distanciaPlataformaZ_Atual <= distanciaZ_da_Plataforma &&
              distanciaPlataformaZ_Atual >= distanciaZ_da_Plataforma - 5) &&
            distanciaPlataformaX_Atual <= distanciaX_da_Plataforma &&
            plataforma.position.y > PosicaoDescida && !emCima &&
            personagem.position.y == posicaoChao)) {
          descida2 = true;
        }
        if (descida2) {
          descida2 = ajustarPlataforma(false, PosicaoDescida);
        }

        // Subida com personagem em cima
        if (!subida && plataforma.position.y < PosicaoSubida && emCima) {
          subida = true;
        }
        if (subida) {
          subida = ajustarPlataforma(true, PosicaoSubida);
        }

      } else {
        // Subida quando no ar
        if (!subida2 && !descida &&
          (distanciaPlataformaZ_Atual <= distanciaZ_da_Plataforma &&
            distanciaPlataformaX_Atual <= distanciaX_da_Plataforma &&
            plataforma.position.y < PosicaoSubida && !emCima &&
            personagem.position.y == posicaoTopo)) {
          subida2 = true;
        }
        if (subida2) {
          subida2 = ajustarPlataforma(true, PosicaoSubida);
        }

        // Descida com personagem em cima
        if (!descida && plataforma.position.y > PosicaoDescida && emCima) {
          personagem.position.y -= velocidade_plataforma + 0.01;
          descida = true;
        }
        if (descida) {
          // mantém ajuste de Y só enquanto está em cima
          if (emCima) {
            personagem.position.y -= velocidade_plataforma + 0.01;
          }
          descida = ajustarPlataforma(false, PosicaoDescida);
        }
      }
    }



    const x = personagem.position.x;
    const z = personagem.position.z;


    if (!lostSoulsAtivados && (x >= -180 && x <= -100 && z >= -200 && z <= -120)) {
      lostSoulsAtivados = true;
      for (const inimigo of LostSouls) {
        inimigo.alerta = true;
      }
    }

    if (!CacodemonsAtivados && (x >= -20 && x <= 41 && z >= -200 && z <= -120)) {
      CacodemonsAtivados = true;
      for (const inimigo of Cacodemons) {
        inimigo.alerta = true;
      }
    }
    
    // Chame a função de atualização das colunas da Area4
    updateAnimatedColumns();

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
    toggleAmbientSound,
  };
}