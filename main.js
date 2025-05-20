import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";
import createScene from "./ambiente/scene.js";
import { initRenderer, onWindowResize } from "../libs/util/util.js";
import createCamera from "./camera.js";
import createPersonagem from "./personagem.js";

const renderer = initRenderer();
const camera = createCamera();

const orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.

const scene = createScene();
const personagem = createPersonagem();
scene.add(personagem);

window.addEventListener(
    "resize",
    function () {
        onWindowResize(camera, renderer);
    },
    false
);

render();
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera); // Render scene
}
