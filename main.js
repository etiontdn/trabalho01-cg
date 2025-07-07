import createScene from "./ambiente/scene.js";
import * as THREE from "three";
import { onWindowResize } from "../libs/util/util.js";
import iniciarRenderer from "./renderer.js";
import createCamera from "./camera.js";
import createPersonagem from "./personagem.js";
import crosshair from "./crosshair.js";
import createArmas from "./armas.js";
import { LostSoul, Cacodemon, createEnemies } from "./inimigos.js";

let renderer = iniciarRenderer();
const camera = createCamera();
let firstRender = false;

// Cria personagem e controles
const { scene, objetosColidiveis, rampas, updateScene, setPersonagem } =
    createScene(); // ✅ setPersonagem incluído
render();
firstRender = true;
const { personagem, personagemControls, updateControl } = createPersonagem(
    camera,
    renderer,
    objetosColidiveis,
    rampas
);

// ✅ Passa o personagem para o scene.js
setPersonagem(personagem);

const { armas, updateDisparos } = createArmas(
    scene,
    personagemControls,
    objetosColidiveis,
    rampas
);
const updateEnemies = createEnemies(
    scene,
    objetosColidiveis,
    rampas,
    personagem
);

scene.add(personagem);

window.addEventListener("resize", () => onWindowResize(camera, renderer));

function render() {
    requestAnimationFrame(render);
    // NOTE: Apenas para teste de animação do crosshair
    // if (renderer.info.render.frame % 120 == 0) {
    //     crosshair.active = true;
    // }
    crosshair.animate(renderer);

    if (firstRender) {
        updateControl();
        updateDisparos(renderer.info.render.frame);
        updateEnemies(renderer.info.render.frame);
        updateScene();
    }
    renderer.render(scene, camera); // Render scene
}
