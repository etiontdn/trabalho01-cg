import * as THREE from "three";
import { CSS2DObject } from '../build/jsm/renderers/CSS2DRenderer.js';


const estados = [
    "patrulha" /* espera até algum evento acontecer, e inicia perseguicao */,
    "perseguicao" /* se movimenta até a última posição do personagem,
                      obedecendo regras como distância mínima e checa qual
                      o proximo estado possível */,
    "ataque a distancia" /* se perto o suficiente, e tem uma direcao direta->atira e depois volta a perseguicao */,
    "ataque" /* se perto o suficiente, e tem uma direcao direta->atira e depois volta a perseguicao */,
    "recuo" /* se perto demais recua */,
    "morre",
];

class Entidade {
    constructor(scene, spawn) {
        /*
        Decide a duração dos estados e blablabla
        */
        this.estadoAtual = "patrulha";
        this.ultimoFrame = 0;
        this.entidade = new THREE.Object3D();
        this.entidade.position.copy(spawn);

        this.maxHp = 0;
        this.hp = this.maxHp;
        this.speed = 0;
        this.tamanho = new THREE.Vector3();
        this.altMinima = 0;
        this.distRecuo = 0;
        this.duracaoEstados = {
            patrulha: 0,
            perseguicao: 20,
            "ataque a distancia": 5,
            ataque: 5,
            recuo: 10,
            morre: 5,
        };

        this.alerta = false;
        this.ultimaPosicaoInimigo = new THREE.Vector3(0,0,0);

        // === CRIAÇÃO DA BARRA DE VIDA ===
        const container = document.createElement('div');
        container.className = 'health-bar-container';
        const fill = document.createElement('div');
        fill.className = 'health-bar-fill';
        container.appendChild(fill);
        this.healthBarFill = fill;

        // Gera o CSS2DObject para a barra
        const label = new CSS2DObject(container);
        label.position.set(0, this.tamanho.y + 2, 0);
        this.entidade.add(label);

        scene.add(this.entidade);
    }

    loopDeComportamento(frameAtual) {
        const pct = Math.max(this.hp / this.maxHp, 0);
        this.healthBarFill.style.width = `${pct * 100}%`;
        if (pct <= 0) {
            this.healthBarFill.parentElement.style.display = 'none';
        }

        if (this.hp <= 0) {
            this.estadoAtual = "morre";
            this.ultimoFrame = frameAtual;
        }
        if (
            this.framesDesdeOUltimoEstado(frameAtual) >=
            this.duracaoEstados[this.estadoAtual]
        ) {
            this.buscarPersonagem();
            switch (this.estadoAtual) {
                case "patrulha":
                    if (this.alerta) this.estadoAtual = "perseguicao";
                    break;
                case "perseguicao":
                    // if (this.checarPodeAtacarADistancia()) {
                    //     this.estadoAtual = "ataque a distancia";
                    // } else if (this.checharPodeAtacar()) {
                    //     this.estadoAtual = "ataque";
                    // } else if (this.distRecuo > 0) {
                    //     this.estadoAtual = "recuo";
                    // }
                    break;
                case "ataque a distancia":
                    this.estadoAtual = "perseguicao";
                    break;
                case "ataque":
                    this.estadoAtual = "perseguicao";
                    break;
                case "recuo":
                    if (this.distRecuo > 0) {
                        this.estadoAtual = "recuo";
                    } else {
                        this.estadoAtual = "perseguicao";
                    }
                    break;
                case "morre":
                    //removeEntidade();
                    break;
            }
            this.ultimoFrame = frameAtual;
        }
    }

    framesDesdeOUltimoEstado(frameAtual) {
        return this.frameAtual - this.ultimoFrame;
    }
    // altera a propriedade alerta se o personagem esta perto o suficiente
    buscarPersonagem() {}
    checarPodeAtacarADistancia() {}
    checharPodeAtacar() {}
    movimento() {}
}

export default Entidade;