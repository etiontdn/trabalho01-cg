import * as THREE from "three";

const corAmbiente = "rgb(255,255,255)";
const intensidadeLuzAmbiente = 0.5;

//Como fazer a luz perto de 11h que o professor pediu?
const posicaoLuzDirecional = new THREE.Vector3(500, 500, 0);
const intensidadeLuzDirecional = 2.5;
const corLuzDirecional = "rgb(255,255,255)";

class Iluminacao {
    constructor(scene) {
        this.scene = scene;
    }

    adicionarIluminacaoAmbiente() {
        const luzAmbiente = new THREE.AmbientLight(
            corAmbiente,
            intensidadeLuzAmbiente
        );
        this.scene.add(luzAmbiente);
        return luzAmbiente;
    }

    adicionarIluminacaoDirecional() {
        const luzDirecional = new THREE.DirectionalLight(
            corLuzDirecional,
            intensidadeLuzDirecional
        );
        luzDirecional.position.copy(posicaoLuzDirecional);
        luzDirecional.castShadow = true;
        luzDirecional.target.position.set(0, 0, 0);
        luzDirecional.shadow.camera.left = -512;
        luzDirecional.shadow.camera.right = 512;
        luzDirecional.shadow.camera.top = 512;
        luzDirecional.shadow.camera.bottom = -512;
        luzDirecional.shadow.mapSize.width = 1024;
        luzDirecional.shadow.mapSize.height = 1024;
        luzDirecional.shadow.camera.near = 0.5;
        luzDirecional.shadow.camera.far = 1000;
        const helper = new THREE.CameraHelper(luzDirecional.shadow.camera);
        this.scene.add(helper);
        this.scene.add(luzDirecional.target);
        this.scene.add(luzDirecional);
        return luzDirecional;
    }

    adicionarSpotlight(posicao, intensidade, lookAt, abertura, cor) {
        // TODO: Implementar só se necessário, não sei se vai ser?
        return;
    }

    adicionarLuzPontual(posicao, intensidade, cor) {
        // TODO: Implementar só se necessário, não sei se vai ser?
        return;
    }
}

export default Iluminacao;
