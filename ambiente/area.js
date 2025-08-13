// area.js
import * as THREE from "three";

const castShadow = true;
const rampaVisivel = false;
const escadaVisivel = true;

const posAncora = (tamanho, ancora) => {
    let pos = { x: 0, z: 0 };
    switch (ancora) {
        case "esquerda": pos.x = tamanho.x / 2; break;
        case "direita": pos.x = -tamanho.x / 2; break;
        case "frente":  pos.z = -tamanho.z / 2; break;
        case "fundo":   pos.z = tamanho.z / 2; break;
    }
    return pos;
};

// Modificado para clonar apenas a textura principal e os mapas se existirem
function ajustarRepeticao(tex, repeatX, repeatY) {
    const newTex = {};
    for (const prop of ['map', 'aoMap', 'normalMap', 'roughnessMap', 'displacementMap', 'opacityMap', 'metalnessMap']) {
        if (tex[prop] && tex[prop] instanceof THREE.Texture) {
            newTex[prop] = tex[prop].clone();
            newTex[prop].wrapS = newTex[prop].wrapT = THREE.RepeatWrapping;
            newTex[prop].repeat.set(repeatX, repeatY);
        } else {
            newTex[prop] = tex[prop]; // Mantém valores que não são texturas (e.g., cor)
        }
    }
    return newTex;
}

class Area {
    constructor(pos, altura, texturas, scene) {
        this.obj3D = new THREE.Object3D();
        this.obj3D.castShadow = castShadow;
        this.obj3D.receiveShadow = castShadow;
        this.obj3D.position.set(pos.x, altura / 2, pos.z);
        this.altura = altura;
        this.scene = scene;
        this.parts = [];
        this.ramps = [];
        this.texturas = texturas;

        // Otimização: Criar materiais uma única vez no construtor
        // Materiais para as partes da área
        const topoTex = this.texturas.topo || {};
        const lateralTex = this.texturas.lateral || {};

        this.materialTopo = new THREE.MeshStandardMaterial({
            map: topoTex.map || null,
            aoMap: topoTex.aoMap || null,
            normalMap: topoTex.normalMap || null,
            roughnessMap: topoTex.roughnessMap || null,
            displacementMap: topoTex.displacementMap || null,
            metalnessMap: topoTex.metalnessMap || null,
            displacementScale: topoTex.displacementMap ? 0.0 : 0,
            alphaMap: topoTex.opacityMap || null,
            transparent: !!topoTex.opacityMap,
            ...(topoTex.map ? {} : { color: 0x999999 }),
        });

        this.materialLateral = new THREE.MeshStandardMaterial({
            map: lateralTex.map || null,
            aoMap: lateralTex.aoMap || null,
            normalMap: lateralTex.normalMap || null,
            roughnessMap: lateralTex.roughnessMap || null,
            displacementMap: lateralTex.displacementMap || null,
            metalnessMap: lateralTex.metalnessMap || null,
            displacementScale: lateralTex.displacementMap ? 0.0 : 0,
            alphaMap: lateralTex.opacityMap || null,
            transparent: !!lateralTex.opacityMap,
            ...(lateralTex.map ? {} : { color: 0x999999 }),
        });

        // Material para os degraus da escada
        const escTex = this.texturas.escada || {};
        this.materialEscada = new THREE.MeshStandardMaterial({
            map: escTex.map || null,
            aoMap: escTex.aoMap || null,
            normalMap: escTex.normalMap || null,
            roughnessMap: escTex.roughnessMap || null,
            displacementMap: escTex.displacementMap || null,
            metalnessMap: escTex.metalnessMap || null,
            displacementScale: escTex.displacementMap ? 0.0 : 0,
            alphaMap: escTex.opacityMap || null,
            transparent: !!escTex.opacityMap,
            ...(escTex.map ? {} : { color: 0x999999 }),
        });

        scene.add(this.obj3D);
    }

    makePart(pos, tamanho, ancora) {
        const ancoraPosition = posAncora(tamanho, ancora);
        const geo = new THREE.BoxGeometry(tamanho.x, this.altura, tamanho.z);
        geo.setAttribute("uv2", new THREE.BufferAttribute(geo.attributes.uv.array, 2));

        // Clona e ajusta a repetição das texturas para esta parte específica
        const topoTexAjustado = ajustarRepeticao(this.texturas.topo || {}, tamanho.x / 10, tamanho.z / 10);
        const lateralXTexAjustado = ajustarRepeticao(this.texturas.lateral || {}, tamanho.z / 10, this.altura / 10);
        const lateralZTexAjustado = ajustarRepeticao(this.texturas.lateral || {}, tamanho.x / 10, this.altura / 10);

        // Clona os materiais para aplicar as texturas ajustadas, mantendo a base
        const materialTopoInst = this.materialTopo.clone();
        Object.assign(materialTopoInst, topoTexAjustado);

        const materialLateralXInst = this.materialLateral.clone();
        Object.assign(materialLateralXInst, lateralXTexAjustado);

        const materialLateralZInst = this.materialLateral.clone();
        Object.assign(materialLateralZInst, lateralZTexAjustado);

        const materiais = [
            materialLateralXInst, // 0: right
            materialLateralXInst, // 1: left
            materialTopoInst,     // 2: top
            materialLateralZInst, // 3: bottom
            materialLateralZInst, // 4: front
            materialLateralZInst  // 5: back
        ];

        const mesh = new THREE.Mesh(geo, materiais);
        mesh.position.set(
            pos.x + ancoraPosition.x,
            0,
            pos.z + ancoraPosition.z
        );
        mesh.castShadow = castShadow;
        mesh.receiveShadow = castShadow;
        this.obj3D.add(mesh);
        this.parts.push(mesh);
        return mesh;
    }

    criarRampa(tamanho) {
        const rampGeo = new THREE.BoxGeometry(tamanho.x, 0, tamanho.z);
        const rampMat = new THREE.MeshLambertMaterial({ visible: rampaVisivel });
        const ramp = new THREE.Mesh(rampGeo, rampMat);
        const angulo = Math.atan2(this.altura, tamanho.z);
        ramp.rotation.x = angulo;
        ramp.position.set(0, 0, 0);
        ramp.eRampa = true;
        this.ramps.push(ramp);
        return ramp;
    }

    criarEscada(pos, tamanho, ancora) {
        // Clona e ajusta repetição de todos os mapas da textura da escada
        const escTexAjustado = ajustarRepeticao(this.texturas.escada || {}, tamanho.x / 10, this.altura / 10);

        // Clona o material da escada e aplica as texturas ajustadas
        const degrauMaterial = this.materialEscada.clone();
        Object.assign(degrauMaterial, escTexAjustado);

        const degraus = 8;
        const degrauGeo = new THREE.BoxGeometry(
            tamanho.x,
            this.altura / degraus,
            tamanho.z / degraus
        );
        degrauGeo.setAttribute("uv2", new THREE.BufferAttribute(degrauGeo.attributes.uv.array, 2));

        const escada = new THREE.Object3D();
        const ancoraPosition = posAncora(tamanho, ancora);
        escada.position.set(
            pos.x + ancoraPosition.x,
            0,
            pos.z + ancoraPosition.z
        );

        for (let i = 0; i < degraus; i++) {
            const degrau = new THREE.Mesh(degrauGeo, degrauMaterial);
            degrau.position.set(
                0,
                -this.altura / 2 + i * (this.altura / degraus) + this.altura / degraus / 2,
                -(-tamanho.z / 2 + (i * tamanho.z) / degraus + tamanho.z / degraus / 2)
            );
            degrau.castShadow = castShadow;
            degrau.receiveShadow = castShadow;
            escada.add(degrau);
        }

        escada.add(this.criarRampa(tamanho));
        escada.visible = escadaVisivel;
        this.obj3D.add(escada);
        return escada;
    }

    getParts() {
        return this.parts;
    }
}

export default Area;