// main.js
import createScene from "./ambiente/scene.js";
import * as THREE from "three";
import { onWindowResize } from "../libs/util/util.js";
import iniciarRenderer from "./renderer.js";
import createCamera from "./camera.js";
import createPersonagem from "./personagem.js";
import crosshair from "./crosshair.js";
import createArmas from "./armas.js";
import { createEnemies } from "./inimigos.js";
import { CSS2DRenderer } from "../build/jsm/renderers/CSS2DRenderer.js";

const renderer = iniciarRenderer();

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0px";
document.body.appendChild(labelRenderer.domElement);

const camera = createCamera();

const audioListener = new THREE.AudioListener();
camera.add(audioListener);

async function iniciarCena() {
    const cenaBase = new THREE.Scene();

    // Estado local para a música de fundo
    let isMusicPlaying = true;

    // --- NOVO: Variável para controlar se o contexto de áudio foi retomado ---
    let audioContextResumed = false;

    // --- NOVO: Adiciona um listener para retomar o contexto de áudio após a interação do usuário ---
    document.addEventListener('click', () => {
        if (!audioContextResumed) {
            if (audioListener.context.state === 'suspended') {
                audioListener.context.resume().then(() => {
                    console.log('AudioContext resumed successfully!');
                    audioContextResumed = true; // Define como true para não tentar retomar novamente
                });
            }
        }
    }, { once: true }); // O { once: true } garante que o evento seja removido após a primeira execução

    const {
        scene,
        objetosColidiveis,
        rampas,
        updateScene,
        setPersonagem,
        setInimigos,
        toggleAmbientSound
    } = await createScene(cenaBase, audioListener);

    // Garante que o som ambiente seja iniciado após a cena ser carregada
    toggleAmbientSound(isMusicPlaying);

    const {
        personagem,
        personagemControls,
        updateControl,
        ativar
    } = createPersonagem(camera, scene, objetosColidiveis, rampas);

    scene.add(personagem);
    scene.personagem = personagem;
    setPersonagem(personagem);

    const { updateEnemies, inimigos } = createEnemies(
        scene,
        objetosColidiveis,
        rampas,
        personagem
    );

    // -- ALTERAÇÃO AQUI: Inclua inimigos.cacodemonsArea4 na chamada setInimigos --
    setInimigos(inimigos.lostSouls, inimigos.cacodemons, inimigos.soldados, inimigos.painElementals, inimigos.cacodemonsArea4);

    // -- ALTERAÇÃO AQUI: Inclua inimigos.cacodemonsArea4 em todosInimigos --
    const todosInimigos = [
        ...inimigos.lostSouls,
        ...inimigos.cacodemons,
        ...inimigos.soldados,
        ...inimigos.painElementals,
        ...inimigos.cacodemonsArea4 // Adicionado
    ];

    const updateDisparos = createArmas(
        scene,
        personagemControls,
        objetosColidiveis,
        rampas,
        todosInimigos
    );

    window.addEventListener("resize", () => {
        onWindowResize(camera, renderer);
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'q') {
            isMusicPlaying = !isMusicPlaying;
            toggleAmbientSound(isMusicPlaying);
            console.log(`Música de fundo: ${isMusicPlaying ? 'Ligada' : 'Desligada'}`);
        }
    });

    // --- CORREÇÃO: Reintroduzindo o setTimeout para ativar os controles ---
    // Isso dá um pequeno tempo para a cena se estabilizar antes do personagem começar a interagir.
    setTimeout(() => {
        ativar();
        console.log("Controles do personagem ativados.");
    }, 1000); // Atraso de 500ms (0.5 segundos)

    function render() {
        requestAnimationFrame(render);
        crosshair.animate(renderer);

        updateControl();
        updateDisparos(renderer.info.render.frame);
        updateEnemies(renderer.info.render.frame);
        updateScene();

        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
    }

    render();
}

iniciarCena();