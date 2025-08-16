import * as THREE from "three";

const corAmbiente = "rgb(255,255,255)";
const intensidadeLuzAmbiente = 0.5;

//Como fazer a luz perto de 11h que o professor pediu?
const posicaoLuzDirecional = new THREE.Vector3(200, 200, 25);
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
        this.luzAmbiente = luzAmbiente;
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
        
        this.scene.add(luzDirecional.target);
        this.scene.add(luzDirecional);
        return luzDirecional;
    }

    adicionarSpotlight(posicao, intensidade, lookAt, abertura, cor = "rgb(255,255,255)") {
        const pos = new THREE.Vector3(posicao.x, posicao.y, posicao.z)

        const alvo = new THREE.Vector3(lookAt.x, lookAt.y, lookAt.z)

        const luz = new THREE.DirectionalLight(cor, intensidade);
        luz.position.copy(pos);
        luz.castShadow = true;

        luz.shadow.camera.left = -40
        luz.shadow.camera.right = 40
        luz.shadow.camera.top = 40
        luz.shadow.camera.bottom = -40

        // configurações de sombra (ajuste se precisar)
        luz.shadow.mapSize.width = 40;
        luz.shadow.mapSize.height = 40;
        luz.shadow.camera.near = 0.1;
        luz.shadow.camera.far = 40;
        luz.shadow.bias = -0.0001;
        luz.shadow.normalBias = -0.0001;

        // target
        luz.target.position.copy(alvo);
        this.scene.add(luz.target);
        this.scene.add(luz);

        return luz;
    }

    adicionarLuzPontual(posicao, intensidade, cor) {
        // TODO: Implementar só se necessário, não sei se vai ser?
        return;
    }
}

export default Iluminacao;
