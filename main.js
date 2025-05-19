import * as THREE from "three";
import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";
import createScene from "./ambiente/scene.js";
import { initRenderer, initCamera, onWindowResize } from "../libs/util/util.js";

const renderer = initRenderer(); // Init a basic renderer
const camera = initCamera(new THREE.Vector3(0, 500, 0)); // Init camera in this position
const orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener(
    "resize",
    function () {
        onWindowResize(camera, renderer);
    },
    false
);

const scene = createScene();

render();
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera); // Render scene
}
