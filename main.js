import createScene from "./ambiente/scene.js";
import { initRenderer, onWindowResize } from "../libs/util/util.js";
import createCamera from "./camera.js";
import createPersonagem from "./personagem.js";
import crosshair from "./crosshair.js";
import createArmas from "./armas.js";
import { LostSoul, Cacodemon, createEnemies } from './inimigos.js';

const renderer = initRenderer();
const camera = createCamera();
const { scene, objetosColidiveis, rampas } = createScene();
const { personagem, personagemControls, updateControl } = createPersonagem(
    camera,
    renderer,
    objetosColidiveis,
    rampas
);
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
    personagem,
);

scene.add(personagem);

window.addEventListener("resize", () => onWindowResize(camera, renderer));

render();
function render() {
    requestAnimationFrame(render);
    // NOTE: Apenas para teste de animação do crosshair
    // if (renderer.info.render.frame % 120 == 0) {
    //     crosshair.active = true;
    // }
    crosshair.animate(renderer);
    updateControl();
    updateDisparos(renderer.info.render.frame);
    updateEnemies(renderer.info.render.frame);
    renderer.render(scene, camera); // Render scene
}
