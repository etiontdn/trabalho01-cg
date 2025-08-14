import * as THREE from "three";
import { SpriteMixer } from "../libs/sprites/SpriteMixer.js";
import crosshair from "./crosshair.js";
import { takeDamage } from "./damage.js";
import { Cacodemon } from "./inimigos.js";

const armas = [];
const disparos = [];

export default function criarArmas(
    scene,
    personagemControls,
    objetosColidiveis,
    rampas,
    inimigos
) {
    const mixer = new SpriteMixer();
    const armaMat = new THREE.MeshPhongMaterial({ color: "grey" });

    //Metralhadora
    criarArmaSprite(
        "../0_assetsT3/objects/chaingun.png", // URL
        0.1, // cadência
        0.1, // frame duration
        3, // total de frames no spritesheet
        3, // colunas
        1, // linhas
        1.7, // largura em unidades
        1.2, // altura em unidades
        2 // dano da arma
    );

    // Rocket Launcher
    criarArmaSprite(
        "./assets/rocket.png", // URL
        0.5, // cadência
        0.2, // frame duration
        3, // total de frames no spritesheet
        3, // colunas
        1, // linhas
        1, // largura em unidades
        1.2, // altura em unidades
        10 // dano da arma
    );

    // lançador
    criarArma({ raio: 0.23, comprimento: 2 }, 0.5, 10);

    // Shotgun
    const armaGeo = new THREE.CylinderGeometry(0.15, 0.15, 4);
    let arma2 = new THREE.Object3D();
    let arma2_1 = new THREE.Mesh(armaGeo, armaMat);
    let arma2_2 = new THREE.Mesh(armaGeo, armaMat);
    arma2_1.material.side = THREE.DoubleSide;
    arma2_2.material.side = THREE.DoubleSide;
    arma2.add(arma2_1);
    arma2.add(arma2_2);
    arma2_1.position.set(0.1, 0, 0);
    arma2_2.position.set(-0.1, 0, 0);
    arma2.rotation.x = -Math.PI / 0.7;
    personagemControls.getObject().add(arma2);
    arma2.position.set(0, -1, 0.4);
    armas.push(arma2);
    arma2.cadencia = 0.75;
    arma2.dano = 7;

    // Arma?
    criarArma({ raio: 0.15, comprimento: 2 }, 0.5, 3);

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

    let frameAtual = 0; // contador de frames para controlar troca de arma

    function criarArmaSprite(
        spriteUrl,
        cadencia,
        fd, // frame duration
        totalFrames,
        cols,
        rows,
        largura,
        altura,
        dano
    ) {
        const texture = new THREE.TextureLoader().load(spriteUrl);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1 / cols, 1 / rows);

        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
        });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(0, -0.94, -2);
        sprite.scale.set(largura, altura, 1);

        sprite.userData = {
            cadencia,
            currentFrame: 0,
            totalFrames,
            cols,
            rows,
            elapsed: 0,
            frameDuration: fd / totalFrames,
            isAnimating: false,
        };

        personagemControls.getObject().add(sprite);
        sprite.dano = dano;
        armas.push(sprite);
    }

    function criarArma(tamanho, cadencia, dano) {
        const armaGeo = new THREE.CylinderGeometry(
            tamanho.raio,
            tamanho.raio,
            tamanho.comprimento
        );
        const arma = new THREE.Mesh(armaGeo, armaMat);
        arma.material.side = THREE.DoubleSide;
        arma.rotation.x = -Math.PI / 0.7;
        arma.position.set(0, -1, -1.1);
        personagemControls.getObject().add(arma);
        arma.cadencia = cadencia;
        arma.dano = dano;
        armas.push(arma);
    }

    function criarDisparo(visivel = true) {
        const disparoGeo = new THREE.SphereGeometry(0.2, 10, 10);
        const disparoMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const tiro = new THREE.Mesh(disparoGeo, disparoMat);

        crosshair.active = true;
        tiro.visible = visivel;

        armas[armaAtual].getWorldPosition(tiro.position);
        tiro.position.y += 0.2;
        tiro.userData.dir = personagemControls
            .getObject()
            .getWorldDirection(new THREE.Vector3())
            .clone();

        scene.add(tiro);
        disparos.push(tiro);
    }

    function criarDisparoCacodemon(inimigo) {
        const disparoGeo = new THREE.SphereGeometry(1, 10, 10);
        const disparoMat = new THREE.MeshLambertMaterial({ color: 0xffff00 });
        const tiro = new THREE.Mesh(disparoGeo, disparoMat);

        tiro.position.copy(inimigo.entidade.position);
        // tiro.position.y -= 1;
        const vetorPos = inimigo.ultimaPosicaoInimigo; // Posição do alvo
        const posInicial = inimigo.ultimaPosicaoEntidade;

        const direcao = new THREE.Vector3().subVectors(vetorPos, posInicial);
        tiro.userData.dir = direcao;
        tiro.eInimigo = true;
        scene.add(tiro);
        disparos.push(tiro);
    }

    function updateArmas(frameAtual) {
        if (frameAtual % 30 === 0) {
            if (changeWeaponEvent.deltaY > 0) {
                armaAtual++;
                if (armaAtual >= armas.length) armaAtual = 0;
            } else if (changeWeaponEvent.deltaY < 0) {
                armaAtual--;
                if (armaAtual < 0) armaAtual = armas.length - 1;
            }
            changeWeaponEvent = { deltaY: 0 };
        }
        for (let i = 0; i < armas.length; i++) {
            armas[i].visible = i === armaAtual;
        }
    }

    function animateSprites(sprite, delta) {
        const d = sprite.userData;
        if (!d.isAnimating) return;

        d.elapsed += delta;
        while (d.elapsed >= d.cadencia) {
            d.elapsed -= d.frameDuration;
            d.currentFrame++;
            if (d.currentFrame < d.totalFrames) {
                const col = d.currentFrame % d.cols;
                const row = Math.floor(d.currentFrame / d.cols);
                sprite.material.map.offset.set(
                    col / d.cols,
                    1 - (row + 1) / d.rows
                );
                sprite.material.map.needsUpdate = true;

                if (d.currentFrame === 1) {
                    criarDisparo();
                }
            } else {
                d.currentFrame = 0;
                d.elapsed = 0;
                d.isAnimating = false;
                sprite.material.map.offset.set(0, 1 - 1 / d.rows);
                sprite.material.map.needsUpdate = true;
                break;
            }
        }
    }

    function updateDisparos() {
        const delta = clock.getDelta();

        updateArmas(frameAtual);
        frameAtual++;

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

        inimigos.forEach((inimigo) => {
            if (
                inimigo.estadoAtual == "ataque a distancia" &&
                inimigo instanceof Cacodemon
            ) {
                if (!inimigo.disparou) {
                    criarDisparoCacodemon(inimigo);
                    inimigo.disparou = true;
                }
            }
        });

        const speed = 200;

        for (let i = 0; i < disparos.length; i++) {
            const tiro = disparos[i];
            const dir = tiro.userData.dir.clone().normalize();
            tiro.position.addScaledVector(dir, speed * delta);

            const tiroBB = new THREE.Box3().setFromObject(tiro);
            let colidiu = false;
            const alvos = objetosColidiveis.concat(rampas);
            if (tiro.eInimigo) {
                const personagemBB = new THREE.Box3().setFromObject(
                    scene.personagem
                );
                if (tiroBB.intersectsBox(personagemBB)) {
                    colidiu = true;
                    takeDamage();
                    scene.personagem.vida -= 8;
                    scene.personagem.updateHealthBar();
                    break;
                }
            }
            for (let alvo of alvos) {
                const alvoBB = new THREE.Box3().setFromObject(alvo);
                if (tiroBB.intersectsBox(alvoBB)) {
                    colidiu = true;
                    break;
                }
            }
            for (let inimigo of inimigos) {
                if (!inimigo.bb || !inimigo.enemyObj) continue;
                inimigo.bb.setFromObject(inimigo.enemyObj);
                if (tiroBB.intersectsBox(inimigo.bb) && !tiro.eInimigo) {
                    colidiu = true;
                    inimigo.hp -= armas[armaAtual].dano;
                    inimigo.alerta = true;
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

    return updateDisparos;
}
