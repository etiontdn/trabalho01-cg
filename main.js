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
import { PMREMGenerator } from "../build/three.module.js";

let renderer = iniciarRenderer();
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0px";
document.body.appendChild(labelRenderer.domElement);

const camera = createCamera();

// Cria personagem e controles
const { scene, objetosColidiveis, rampas, updateScene, setPersonagem, setInimigos } =
    createScene(new THREE.Scene()); // ✅ setPersonagem incluído
let primeiroFrame = false;
render();
primeiroFrame = true;
const { personagem, personagemControls, updateControl } = createPersonagem(
    camera,
    renderer,
    objetosColidiveis,
    rampas
);
scene.add(personagem);
scene.personagem = personagem;
// ✅ Passa o personagem para o scene.js
setPersonagem(personagem);

const { updateEnemies, inimigos } = createEnemies(
    scene,
    objetosColidiveis,
    rampas,
    personagem
);

setInimigos(inimigos.lostSouls, inimigos.cacodemons);



const todosInimigos = [...inimigos.lostSouls, ...inimigos.cacodemons, ...inimigos.soldados, ...inimigos.painElementals];
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

function render() {
    requestAnimationFrame(render);
    // NOTE: Apenas para teste de animação do crosshair
    // if (renderer.info.render.frame % 120 == 0) {
    //     crosshair.active = true;
    // }
    crosshair.animate(renderer);

    if (primeiroFrame) {
        updateControl();
        updateDisparos(renderer.info.render.frame);
        updateEnemies(renderer.info.render.frame);
        updateScene();
    }

    renderer.render(scene, camera); // Render scene
    labelRenderer.render(scene, camera);
}
