// main.js
import createScene from "./ambiente/scene.js";
import * as THREE from "three";
import { onWindowResize } from "../libs/util/util.js";
import iniciarRenderer from "./renderer.js";
import createCamera from "./camera.js";
import createPersonagem from "./personagem.js";
import crosshair from "./crosshair.js";
import createArmas from "./armas.js";
import createArea3 from "./ambiente/area3.js";
import createArea4 from "./ambiente/area4.js";
import { createEnemies } from "./inimigos.js";
import { CSS2DRenderer } from "../build/jsm/renderers/CSS2DRenderer.js";

const renderer = iniciarRenderer();

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0px";
document.body.appendChild(labelRenderer.domElement);

const camera = createCamera();

// --- NOVO: Cria o AudioListener e o anexa à câmera ---
const audioListener = new THREE.AudioListener();
camera.add(audioListener);

// --- NOVO: Variável para controlar se o contexto de áudio foi retomado ---
let audioContextResumed = false;

// --- NOVO: Variável para controlar o estado da música de fundo ---
let isMusicPlaying = true; // Começa ligada

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


async function iniciarCena() {
    const cenaBase = new THREE.Scene();

    // --- MODIFICADO: Passa o audioListener para createScene e obtém toggleAmbientSound ---
    const {
        scene,
        objetosColidiveis,
        rampas,
        updateScene,
        setPersonagem,
        setInimigos,
        toggleAmbientSound // NOVO: Obtenha a função toggleAmbientSound
    } = await createScene(cenaBase, audioListener); // Passa o audioListener

    await createArea4(scene, objetosColidiveis, rampas);
    await createArea3(scene, objetosColidiveis, rampas);

    const {
        personagem,
        personagemControls,
        updateControl,
        ativar
    } = createPersonagem(camera, renderer, objetosColidiveis, rampas);

    scene.add(personagem);
    scene.personagem = personagem;
    setPersonagem(personagem);

    const { updateEnemies, inimigos } = createEnemies(
        scene,
        objetosColidiveis,
        rampas,
        personagem
    );

    setInimigos(inimigos.lostSouls, inimigos.cacodemons);

    const todosInimigos = [...inimigos.lostSouls, ...inimigos.cacodemons];

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

    // --- NOVO: Listener para a tecla 'Q' ---
    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'q') {
            isMusicPlaying = !isMusicPlaying;
            toggleAmbientSound(isMusicPlaying);
            console.log(`Música de fundo: ${isMusicPlaying ? 'Ligada' : 'Desligada'}`);
        }
    });

    // Delay para ativar após renderizar pelo menos 1 frame
    setTimeout(() => {
        ativar();
    }, 100);

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