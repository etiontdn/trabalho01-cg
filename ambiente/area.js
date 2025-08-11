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

function ajustarRepeticao(tex, repeatX, repeatY) {
    if (!tex) return;
    [
        'map', 'aoMap', 'normalMap', 'roughnessMap',
        'displacementMap', 'opacityMap', 'metalnessMap'
    ].forEach(prop => {
        const textura = tex[prop];
        if (textura && textura instanceof THREE.Texture) {
            tex[prop] = textura.clone();
            tex[prop].wrapS = tex[prop].wrapT = THREE.RepeatWrapping;
            tex[prop].repeat.set(repeatX, repeatY);
        }
    });
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
        scene.add(this.obj3D);
    }

    makePart(pos, tamanho, ancora) {
        const ancoraPosition = posAncora(tamanho, ancora);
        const geo = new THREE.BoxGeometry(tamanho.x, this.altura, tamanho.z);
        geo.setAttribute("uv2", new THREE.BufferAttribute(geo.attributes.uv.array, 2));

        const topoTex = this.texturas.topo || {};
        const lateralTex = this.texturas.lateral || {};

        // Repetição personalizada
        ajustarRepeticao(topoTex, tamanho.x / 10, tamanho.z / 10);

        const lateralXTex = { ...lateralTex };
        const lateralZTex = { ...lateralTex };
        ajustarRepeticao(lateralXTex, tamanho.z / 10, this.altura / 10); // left & right
        ajustarRepeticao(lateralZTex, tamanho.x / 10, this.altura / 10); // front & back

        const materialTopo = new THREE.MeshStandardMaterial({
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

        const materialLateralX = new THREE.MeshStandardMaterial({
            map: lateralXTex.map || null,
            aoMap: lateralXTex.aoMap || null,
            normalMap: lateralXTex.normalMap || null,
            roughnessMap: lateralXTex.roughnessMap || null,
            displacementMap: lateralXTex.displacementMap || null,
            metalnessMap: lateralXTex.metalnessMap || null,
            displacementScale: lateralXTex.displacementMap ? 0.0 : 0,
            alphaMap: lateralXTex.opacityMap || null,
            transparent: !!lateralXTex.opacityMap,
            ...(lateralXTex.map ? {} : { color: 0x999999 }),
        });

        const materialLateralZ = new THREE.MeshStandardMaterial({
            map: lateralZTex.map || null,
            aoMap: lateralZTex.aoMap || null,
            normalMap: lateralZTex.normalMap || null,
            roughnessMap: lateralZTex.roughnessMap || null,
            displacementMap: lateralZTex.displacementMap || null,
            metalnessMap: lateralZTex.metalnessMap || null,
            displacementScale: lateralZTex.displacementMap ? 0.0 : 0,
            alphaMap: lateralZTex.opacityMap || null,
            transparent: !!lateralZTex.opacityMap,
            ...(lateralZTex.map ? {} : { color: 0x999999 }),
        });

        const materiais = [
            materialLateralX, // 0: right
            materialLateralX, // 1: left
            materialTopo,     // 2: top
            materialLateralZ, // 3: bottom
            materialLateralZ, // 4: front
            materialLateralZ  // 5: back
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
    const escTex = this.texturas.escada || {};

    // Clona e ajusta repetição de todos os mapas da textura da escada
    ajustarRepeticao(escTex, tamanho.x / 10, this.altura / 10);

    // Cria material padrão com todos os mapas, igual para a área
    const degrauMaterial = new THREE.MeshStandardMaterial({
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
