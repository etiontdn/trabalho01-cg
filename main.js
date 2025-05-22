import createScene from "./ambiente/scene.js";
import { initRenderer, onWindowResize } from "../libs/util/util.js";
import createCamera from "./camera.js";
import createPersonagem from "./personagem.js";

const renderer = initRenderer();
const camera = createCamera();
const scene = createScene();

const { personagemControls, update } = createPersonagem(camera, renderer);

scene.add(personagemControls.getObject());

window.addEventListener("resize", () => onWindowResize(camera, renderer));

render();
function render() {
    requestAnimationFrame(render);
    update();
    renderer.render(scene, camera); // Render scene
}