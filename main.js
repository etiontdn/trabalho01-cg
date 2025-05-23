import createScene from "./ambiente/scene.js";
import { initRenderer, onWindowResize } from "../libs/util/util.js";
import createCamera from "./camera.js";
import createPersonagem from "./personagem.js";
import crosshair from "./crosshair.js";

const renderer = initRenderer();
const camera = createCamera();
const { scene, objetosColidiveis } = createScene();
const { personagemControls, update, personagem } = createPersonagem(
    camera,
    renderer,
    objetosColidiveis
);

scene.add(personagemControls.getObject());
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
    update();
    renderer.render(scene, camera); // Render scene
}
