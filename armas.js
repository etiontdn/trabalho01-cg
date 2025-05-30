import * as THREE from "three";
import { setDefaultMaterial } from "../../libs/util/util.js";
import crosshair from "./crosshair.js";

const armas = [];
const disparos = [];

//TODO: disparo alinhada na mira ou não?

export default function criarArmas(
    scene,
    personagemControls,
    objetosColidiveis,
    rampas
) {
    const armaMat = new THREE.MeshPhongMaterial({ color: "grey" });

    const armaGeo = new THREE.CylinderGeometry(0.8, 0.8, 7);
    let arma2 = new THREE.Object3D();
    let arma2_1 = new THREE.Mesh( armaGeo, armaMat );
    let arma2_2 = new THREE.Mesh( armaGeo, armaMat );
    arma2_1.material.side = THREE.DoubleSide;
    arma2_2.material.side = THREE.DoubleSide;
    arma2.add(arma2_1);
    arma2.add(arma2_2);
    arma2_1.position.set(0.6, 0, 0);
    arma2_2.position.set(-0.6, 0, 0);
    arma2.rotation.x = - Math.PI / 0.70;
    personagemControls.getObject().add(arma2);
    arma2.position.set(0, -5, -7);
    armas.push(arma2);

    arma2.cadencia = 0.75;
    

    criarArma({raio: 0.8, comprimento:7}, 0.5);
    criarArma({raio: 0.6, comprimento:8}, 0.2)

    let armaAtual = 0;
    let calcDelta = 0;

    let disparar = false;
    document.addEventListener("mousedown", () => (disparar = true));
    document.addEventListener("mouseup", () => (disparar = false));

    document.addEventListener("keydown", (e) => {
        if (e.key == 1) {
            armaAtual = 0;
        } else if (e.key == 2) {
            armaAtual = 1;
        } else if (e.key == 3) {
            armaAtual = 2;
        }
    });

    let changeWeaponEvent = { deltaY: 0 };

    document.addEventListener(
        "wheel",
        (e) => {
            changeWeaponEvent = e;
            e.preventDefault();
            e.stopPropagation();
        },
        { passive: false }
    );

    const clock = new THREE.Clock();

    function criarArma(tamanho, cadencia) {
        const armaGeo = new THREE.CylinderGeometry(tamanho.raio, tamanho.raio, tamanho.comprimento);
        const arma = new THREE.Mesh(armaGeo, armaMat);
        arma.material.side = THREE.DoubleSide;
        arma.rotation.x = -Math.PI / 0.7;
        arma.position.set(0, -5, -7);
        personagemControls.getObject().add(arma);
        arma.cadencia = cadencia;
        armas.push(arma);
    }

    function criarDisparo() {
        const disparoGeo = new THREE.SphereGeometry(0.5, 10, 10);
        const disparoMat = setDefaultMaterial("black");
        const tiro = new THREE.Mesh(disparoGeo, disparoMat);

        crosshair.active = true;

        armas[armaAtual].getWorldPosition(tiro.position);
        // talvez seria bom mudar? assim fica óbvio que não sai da arma direito
        // no trabalho pede para sair da arma, mas
        // nos jogos atuais o disparo sai da câmera e não da arma
        // e o disparo em si acaba sendo apenas um raycast comum
        // tiro.position.y += 4.5;
        tiro.userData.dir = personagemControls
            .getObject()
            .getWorldDirection(new THREE.Vector3())
            .clone();

        scene.add(tiro);
        disparos.push(tiro);
    }

    function updateArmas(frameAtual) {
        if (frameAtual % 30 == 0) {
            if (changeWeaponEvent.deltaY > 0) {
                armaAtual += 1;
                if (armaAtual >= armas.length) {
                    armaAtual = 0;
                }
            } else if (changeWeaponEvent.deltaY < 0) {
                armaAtual -= 1;
                if (armaAtual < 0) {
                    armaAtual = armas.length - 1;
                }
            }
            changeWeaponEvent = { deltaY: 0 };
        }
        for (let i = 0; i < armas.length; i++) {
            if (i == armaAtual) {
                armas[i].visible = true;
            } else {
                armas[i].visible = false;
            }
        }
    }

    function updateDisparos(frameAtual) {
        const delta = clock.getDelta();
        const speed = 200;

        updateArmas(frameAtual);

        calcDelta += delta;

        if (disparar && calcDelta > armas[armaAtual].cadencia) {
            criarDisparo();
            calcDelta = 0;
        }

        for (let i = 0; i < disparos.length; i++) {
            const tiro = disparos[i];
            const dir = tiro.userData.dir.clone().normalize();
            tiro.position.addScaledVector(dir, speed * delta);

            const tiroBB = new THREE.Box3().setFromObject(tiro);
            let colidiu = false;
            const alvos = objetosColidiveis.concat(rampas);
            for (let alvo of alvos) {
                const alvoBB = new THREE.Box3().setFromObject(alvo);
                if (tiroBB.intersectsBox(alvoBB)) {
                    colidiu = true;
                    break;
                }
            }

            if (colidiu) {
                scene.remove(tiro);
                disparos.splice(i, 1);
                i--;
            }
        }
    }

    return { armas, updateDisparos };
}
