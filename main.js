import createScene from "./ambiente/scene.js";
import { initRenderer, onWindowResize } from "../libs/util/util.js";
import createCamera from "./camera.js";
import createPersonagem from "./personagem.js";
import crosshair from "./crosshair.js";
import createArmas from "./armas.js";

// Inicializa renderizador e câmera
const renderer = initRenderer();
const camera = createCamera();

// Cria a cena e recupera função de update da animação
const { scene, objetosColidiveis, rampas, updateScene } = createScene();

// Cria personagem e controles
const { personagem, personagemControls, updateControl } = createPersonagem(
    camera,
    renderer,
    objetosColidiveis,
    rampas
);

// Cria armas e sistema de disparos
const { armas, updateDisparos } = createArmas(
    scene,
    personagemControls,
    objetosColidiveis,
    rampas
);

// Adiciona personagem à cena
scene.add(personagem);

// Atualiza tamanho ao redimensionar janela
window.addEventListener("resize", () => onWindowResize(camera, renderer));

// Loop de renderização
render();
function render() {
    requestAnimationFrame(render);

    // Atualiza elementos animados da cena (grupoChave etc.)
    updateScene();

    // Atualiza outros elementos
    crosshair.animate(renderer);
    updateControl();
    updateDisparos(renderer.info.render.frame);

    // Renderiza a cena
    renderer.render(scene, camera);
}