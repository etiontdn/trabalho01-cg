import * as THREE from "three";
import encontrarCaminho from "./pathfinding.js";
import { Vector3 } from "../build/three.module.js";

const estados = [
    "patrulha" /* espera até algum evento acontecer, e inicia perseguicao */,
    "perseguicao" /* se movimenta até a última posição do personagem,
                      obedecendo regras como distância mínima e checa qual
                      o proximo estado possível */,
    "ataque a distancia" /* se perto o suficiente, e tem uma direcao direta->atira e depois volta a perseguicao */,
    "ataque" /* se perto o suficiente, e tem uma direcao direta->atira e depois volta a perseguicao */,
    "recuo" /* se perto demais recua */,
    "espera",
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
        this.scene = scene;
        this.pathFinding = {
            vetorDirecao: new THREE.Vector3(),
            vetorPos: new THREE.Vector3(),
        };

        this.hp = 0;
        this.speed = 0;
        this.tamanho = new THREE.Vector3(0, 0, 0);
        this.altMinima = 0;
        this.distRecuo = 0;
        this.duracaoEstados = {
            patrulha: 20,
            perseguicao: 60,
            "ataque a distancia": 50,
            ataque: 200,
            recuo: 30,
            morre: 15,
            espera: 120,
        };

        this.alerta = false;
        this.ultimaPosicaoInimigo = new THREE.Vector3(0, 0, 0);
        this.ultimaPosicaoEntidade = new THREE.Vector3(0, 0, 0);
        scene.add(this.entidade);
    }

    loopDeComportamento(frameAtual) {
        if (this.hp <= 0) {
            this.estadoAtual = "morre";
            this.ultimoFrame = frameAtual;
        }
        //console.log([frameAtual, this.framesDesdeOUltimoEstado(frameAtual), this.duracaoEstados[this.estadoAtual]])
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
                    this.pathFinding = encontrarCaminho(this);
                    if (this.checarEstaPertoDemais()) {
                        this.estadoAtual = "patrulha";
                    }
                    console.log(this.checarPodeAtacar());
                    if (this.checarPodeAtacar()) {
                        this.estadoAtual = "ataque";
                    }
                    if (this.checarPodeAtacarADistancia()) {
                        this.estadoAtual = "ataque a distancia";
                    }
                    break;
                case "ataque a distancia":
                    this.estadoAtual = "espera";
                    break;
                case "ataque":
                    this.estadoAtual = "espera";
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
                case "espera":
                    this.estadoAtual = "patrulha"
            }
            this.ultimoFrame = frameAtual;
        }
    }

    framesDesdeOUltimoEstado(frameAtual) {
        return frameAtual - this.ultimoFrame;
    }
    // altera a propriedade alerta se o personagem esta perto o suficiente
    buscarPersonagem() {
        console.log(this.ultimaPosicaoEntidade);
        this.ultimaPosicaoEntidade.copy(this.entidade.position);
        this.ultimaPosicaoInimigo.copy(
            this.scene.personagem
                ? this.scene.personagem.position
                : new THREE.Vector3(0, 0, 0)
        );
        this.alerta = true;
    }
    checarPodeAtacarADistancia() {
        return false;
    }
    checarPodeAtacar() {
        return false;
    }
    checarEstaPertoDemais() {
        return false;
    }
}

export default Entidade;
