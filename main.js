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

async function iniciarCena() {
    const cenaBase = new THREE.Scene();

    const {
        scene,
        objetosColidiveis,
        rampas,
        updateScene,
        setPersonagem,
        setInimigos
    } = await createScene(cenaBase);

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
