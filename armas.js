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
    
    //Metralhadora
    criarArmaSprite(
        './assets/chaingun.png',    // URL
        0.1,                        // cadência
        3,                          // total de frames no spritesheet
        3,                          // colunas
        1,                          // linhas
        2.5,                          // largura em unidades
        2                           // altura em unidades
    );
    
    // lançador
    criarArma({raio: 0.5, comprimento:5}, 0.5);
    
    // Shotgun
    const armaGeo = new THREE.CylinderGeometry(0.5, 0.5, 4);
    let arma2 = new THREE.Object3D();
    let arma2_1 = new THREE.Mesh( armaGeo, armaMat );
    let arma2_2 = new THREE.Mesh( armaGeo, armaMat );
    arma2_1.material.side = THREE.DoubleSide;
    arma2_2.material.side = THREE.DoubleSide;
    arma2.add(arma2_1);
    arma2.add(arma2_2);
    arma2_1.position.set(0.4, 0, 0);
    arma2_2.position.set(-0.4, 0, 0);
    arma2.rotation.x = - Math.PI / 0.70;
    personagemControls.getObject().add(arma2);
    arma2.position.set(0, -3.5, -5);
    armas.push(arma2);
    arma2.cadencia = 0.75;

    // Arma?
    criarArma({raio: 0.3, comprimento:4}, 0.2);

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
        } else if (e.key == 4) {
            armaAtual = 3;
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

    function criarArmaSprite(spriteUrl, cadencia, totalFrames, cols, rows, largura, altura) {
        const texture = new THREE.TextureLoader().load(spriteUrl);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1 / cols, 1 / rows);

        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(0, -2, -3.92);
        sprite.scale.set(largura, altura, 1);

        
        sprite.userData = {
            cadencia,
            currentFrame: 0,
            totalFrames,
            cols,
            rows,
            elapsedTime: 0,
            frameDuration: cadencia / totalFrames,
            isAnimating: false
        };
        
        personagemControls.getObject().add(sprite);
        armas.push(sprite);
    }

    function criarArma(tamanho, cadencia) {
        const armaGeo = new THREE.CylinderGeometry(tamanho.raio, tamanho.raio, tamanho.comprimento);
        const arma = new THREE.Mesh(armaGeo, armaMat);
        arma.material.side = THREE.DoubleSide;
        arma.rotation.x = -Math.PI / 0.7;
        arma.position.set(0, -3, -4);
        personagemControls.getObject().add(arma);
        arma.cadencia = cadencia;
        armas.push(arma);
    }

    function criarDisparo() {
        const disparoGeo = new THREE.SphereGeometry(0.3, 10, 10);
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

    function animateSprites(sprite, delta) {
    const d = sprite.userData;
    if (!d.isAnimating) return;

    d.elapsed += delta;
    while (d.elapsed >= d.frameDuration) {
      d.elapsed -= d.frameDuration;
      d.currentFrame++;

      if (d.currentFrame < d.totalFrames) {
        const col = d.currentFrame % d.cols;
        const row = Math.floor(d.currentFrame / d.cols);
        sprite.material.map.offset.set(col / d.cols, 1 - (row + 1) / d.rows);
        sprite.material.map.needsUpdate = true;

        if (d.currentFrame === 1) {
          criarDisparo();
        }
      } else {
        d.currentFrame = 0;
        d.isAnimating = false;
        d.elapsed = 0;
        sprite.material.map.offset.set(0, 1 - 1 / d.rows);
        sprite.material.map.needsUpdate = true;
        break;
      }
    }
  }

    function updateDisparos() {
    const delta = clock.getDelta();
    updateArmas();

    const arma = armas[armaAtual];
    if (arma instanceof THREE.Sprite) {
      if (disparar && !arma.userData.isAnimating) {
        arma.userData.isAnimating = true;
        arma.userData.elapsed = 0;
        arma.userData.currentFrame = -1;
      }
      animateSprites(arma, delta);
    } else {
      calcDelta += delta;
      if (disparar && calcDelta > arma.cadencia) {
        criarDisparo();
        calcDelta = 0;
      }
    }

    const speed = 200;

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
    
    // for (let i = 0; i < disparos.length; i++) {
    //   const tiro = disparos[i];
    //   tiro.position.addScaledVector(
    //     tiro.userData.dir.clone().normalize(),
    //     speed * delta
    //   );
    //   const bb = new THREE.Box3().setFromObject(tiro);
    //   if (
    //     objetosColidiveis.concat(rampas).some(alvo =>
    //       new THREE.Box3().setFromObject(alvo).intersectsBox(bb)
    //     )
    //   ) {
    //     scene.remove(tiro);
    //     disparos.splice(i, 1);
    //     i--;
    //   }
    // }

  }

    return { armas, updateDisparos };
}