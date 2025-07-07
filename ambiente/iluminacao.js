import * as THREE from "three";

const corAmbiente = "rgb(255,255,255)";
const intensidadeLuzAmbiente = 0.5;

//Como fazer a luz perto de 11h que o professor pediu?
const posicaoLuzDirecional = new THREE.Vector3(200, 200, 0);
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
        luzDirecional.shadow.camera.left = -256;
        luzDirecional.shadow.camera.right = 256;
        luzDirecional.shadow.camera.top = 256;
        luzDirecional.shadow.camera.bottom = -256;
        luzDirecional.shadow.mapSize.width = 4000;
        luzDirecional.shadow.mapSize.height = 4000;
        luzDirecional.shadow.camera.near = 0.1;
        luzDirecional.shadow.camera.far = 4000;
        luzDirecional.shadow.bias = -0.00005;
        luzDirecional.shadow.normalBias = -0.00005;
        luzDirecional.shadow.camera.position.set(-50,-50,-50)
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
