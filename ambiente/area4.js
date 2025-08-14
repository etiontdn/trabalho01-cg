// area4.js
import * as THREE from "three";
import { CSG } from '../../libs/other/CSGMesh.js'

let animatedColumns = []; // Array para armazenar as colunas a serem animadas

function createArea4(scene, objetosColidiveis, rampas, textures) {
    const r = 80;
    const altBase = 0.2;
    const altArea = 10;
    const radialSegments = 128;
    const radialSegmentsTeto = 64;

    function createMaterial(texObj, repeatX = 1, repeatY = 1) {
        const materialProperties = {};
        for (const key in texObj) {
            if (texObj[key]) {
                texObj[key].wrapS = texObj[key].wrapT = THREE.RepeatWrapping;
                texObj[key].repeat.set(repeatX, repeatY);
                materialProperties[key] = texObj[key];
            }
        }
        if (!materialProperties.roughnessMap) materialProperties.roughness = 0.5;
        if (!materialProperties.metalnessMap) materialProperties.metalness = 0;
        if (materialProperties.displacementMap) materialProperties.displacementScale = 0;
        return new THREE.MeshStandardMaterial(materialProperties);
    }

    const matBase = createMaterial(textures.base, 50, 50);
    const matPortal = createMaterial(textures.portal, 1, 5);
    const matEstacas = createMaterial(textures.estaca, 1, 10);
    const matBlocoEstacas = createMaterial(textures.blocoEstaca, 1, 1);
    const matTetoTopo = createMaterial(textures.bottom, 5, 5);
    const matTetoLateral = createMaterial(textures.teto, 200, 2);

    const area4 = new THREE.Object3D();
    area4.position.set(0, 0, 120);

    // BASE
    const cylinderGeo = new THREE.CylinderGeometry(r, r, altBase, radialSegments);
    const base = new THREE.Mesh(cylinderGeo, matBase);
    base.position.set(0, altBase / 2, 0);
    base.geometry.setAttribute('uv2', new THREE.BufferAttribute(base.geometry.attributes.uv.array, 2));

    // TETO (restante do código do teto permanece o mesmo)
    const tetoHeight = 3;
    const innerRadiusTeto = r * 0.75;
    const tetoGeoExt = new THREE.CylinderGeometry(r, r, tetoHeight, radialSegmentsTeto);
    const tetoGeoInt = new THREE.CylinderGeometry(innerRadiusTeto, innerRadiusTeto, tetoHeight, radialSegmentsTeto);
    const tetoMeshExt = new THREE.Mesh(tetoGeoExt, new THREE.MeshStandardMaterial());
    const tetoMeshInt = new THREE.Mesh(tetoGeoInt, new THREE.MeshStandardMaterial());
    tetoMeshExt.position.set(0, tetoHeight / 2, 0);
    tetoMeshInt.position.set(0, tetoHeight / 2, 0);
    tetoMeshExt.updateMatrixWorld();
    tetoMeshInt.updateMatrixWorld();
    const csgTeto = CSG.fromMesh(tetoMeshExt).subtract(CSG.fromMesh(tetoMeshInt));
    const tetoMeshBase = CSG.toMesh(csgTeto, new THREE.Matrix4(), new THREE.MeshStandardMaterial());
    if (!tetoMeshBase.geometry.attributes.normal) tetoMeshBase.geometry.computeVertexNormals();
    tetoMeshBase.geometry.clearGroups();

    const posAttr = tetoMeshBase.geometry.attributes.position;
    const normAttr = tetoMeshBase.geometry.attributes.normal;
    const indexAttr = tetoMeshBase.geometry.index;
    let numFaces = indexAttr ? indexAttr.count / 3 : posAttr.count / 3;

    for (let i = 0; i < numFaces; i++) {
        let ia, ib, ic;
        if (indexAttr) {
            ia = indexAttr.getX(i * 3);
            ib = indexAttr.getX(i * 3 + 1);
            ic = indexAttr.getX(i * 3 + 2);
        } else {
            ia = i * 3;
            ib = i * 3 + 1;
            ic = i * 3 + 2;
        }
        const nx = (normAttr.getX(ia) + normAttr.getX(ib) + normAttr.getX(ic)) / 3;
        const ny = (normAttr.getY(ia) + normAttr.getY(ib) + normAttr.getY(ic)) / 3;
        const nz = (normAttr.getZ(ia) + normAttr.getZ(ib) + normAttr.getZ(ic)) / 3;

        if (Math.abs(ny) > Math.abs(nx) && Math.abs(ny) > Math.abs(nz)) {
            tetoMeshBase.geometry.addGroup(i * 3, 3, 0);
        } else {
            tetoMeshBase.geometry.addGroup(i * 3, 3, 1);
        }
    }

    tetoMeshBase.material = [matTetoTopo, matTetoLateral];
    tetoMeshBase.geometry.setAttribute('uv2', new THREE.BufferAttribute(tetoMeshBase.geometry.attributes.uv.array, 2));

    // PORTAL (restante do código do portal permanece o mesmo)
    const distX = 5;
    const altAro = 5;
    const blocoPortalGeo = new THREE.BoxGeometry(2.1, altArea, 2.1);
    const aroPortalGeo = new THREE.BoxGeometry(distX * 2, altAro, 2);
    const colAroPortalGeo = new THREE.CylinderGeometry(4, 4, 2, radialSegments);
    const aroPortalMesh = new THREE.Mesh(aroPortalGeo, matPortal);
    const colAroPortalMesh = new THREE.Mesh(colAroPortalGeo, matPortal);
    aroPortalMesh.geometry.setAttribute('uv2', new THREE.BufferAttribute(aroPortalMesh.geometry.attributes.uv.array, 2));
    colAroPortalMesh.geometry.setAttribute('uv2', new THREE.BufferAttribute(colAroPortalMesh.geometry.attributes.uv.array, 2));
    scene.add(aroPortalMesh);
    scene.add(colAroPortalMesh);
    aroPortalMesh.position.set(0, (altArea - 1), 0);
    colAroPortalMesh.position.set(0, (altArea - 3.3), 0);
    colAroPortalMesh.rotation.x = Math.PI / 2;
    aroPortalMesh.updateMatrixWorld();
    colAroPortalMesh.updateMatrixWorld();
    const csgA = CSG.fromMesh(colAroPortalMesh);
    const csgB = CSG.fromMesh(aroPortalMesh);
    const csgAro = csgB.subtract(csgA);
    scene.remove(colAroPortalMesh);
    scene.remove(aroPortalMesh);

    area4.add(base);

    function criaPortal() {
        const portal = new THREE.Object3D();
        const estacaGeo = new THREE.BoxGeometry(0.5, altArea, 0.5);
        const blocoEstacaGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const estaca1 = new THREE.Mesh(estacaGeo, matEstacas);
        const estaca2 = new THREE.Mesh(estacaGeo, matEstacas);
        const blocoEstaca1 = new THREE.Mesh(blocoEstacaGeo, matBlocoEstacas);
        const blocoEstaca2 = new THREE.Mesh(blocoEstacaGeo, matBlocoEstacas);
        const blocoPortal1 = new THREE.Mesh(blocoPortalGeo, matPortal);
        const blocoPortal2 = new THREE.Mesh(blocoPortalGeo, matPortal);

        [estaca1, estaca2, blocoEstaca1, blocoEstaca2, blocoPortal1, blocoPortal2]
            .forEach(mesh => mesh.geometry.setAttribute('uv2', new THREE.BufferAttribute(mesh.geometry.attributes.uv.array, 2)));

        const aroPortal = CSG.toMesh(csgAro, new THREE.Matrix4(), matPortal);
        aroPortal.geometry.center();
        aroPortal.geometry.setAttribute('uv2', new THREE.BufferAttribute(aroPortal.geometry.attributes.uv.array, 2));

        estaca1.position.set(distX, altArea / 2, 1.5);
        estaca2.position.set(-distX, altArea / 2, 1.5);
        blocoEstaca1.position.set(distX, (altArea / 2), 1.5);
        blocoEstaca2.position.set(-distX, (altArea / 2), 1.5);
        blocoPortal1.position.set(distX, (altArea / 2), 0);
        blocoPortal2.position.set(-distX, (altArea / 2), 0);
        aroPortal.position.set(0, altArea - altAro / 2, 0);

        portal.add(estaca1, estaca2, blocoEstaca1, blocoEstaca2, blocoPortal1, blocoPortal2, aroPortal);
        objetosColidiveis.push(estaca1, estaca2, blocoEstaca1, blocoEstaca2, blocoPortal1, blocoPortal2);
        portal.position.set(0, 0, r - 2.5);
        return portal;
    }

    function criaAndar(andar) {
        const count = 41;
        const step = (2 * Math.PI) / count;
        for (let i = 1; i <= count; i++) {
            const holder = new THREE.Object3D();
            andar.add(holder);
            holder.add(criaPortal());
            holder.rotateY(Math.PI + i * step);
            holder.updateMatrixWorld();
        }
        const teto = tetoMeshBase.clone();
        teto.position.set(0, altArea, 0);
        andar.add(teto);
        objetosColidiveis.push(teto);
    }

    const numAndares = 3;
    for (let i = 0; i < numAndares; i++) {
        const andar = new THREE.Object3D();
        area4.add(andar);
        criaAndar(andar);
        andar.position.set(0, altBase + (altArea + tetoHeight) * i, 0);
    }

    // === ELEMENTOS EXTRAS PARA COMPLEXIDADE VISUAL === //
    const colunaGeo = new THREE.CylinderGeometry(1.5, 1.5, 15, 16);
    colunaGeo.setAttribute('uv2', new THREE.BufferAttribute(colunaGeo.attributes.uv.array, 2));
    
    // --- MODIFICAÇÃO AQUI ---
    // Passe textures.pilares e os valores de repetição para createMaterial
    const colunaMat = createMaterial(textures.pilares, 2, 2); // Exemplo: repetir a textura 5 vezes na vertical
    // --- FIM DA MODIFICAÇÃO ---

    const colunas = new THREE.Object3D();
    const colunaPositions = [
        [0, 7.5, 0],
        [20, 7.5, 20], [-20, 7.5, 20], [20, 7.5, -20], [-20, 7.5, -20],
        [40, 7.5, 0], [-40, 7.5, 0], [0, 7.5, 40], [0, 7.5, -40],
        [30, 7.5, 30], [-30, 7.5, 30], [30, 7.5, -30], [-30, 7.5, -30],
        [55, 7.5, 15], [-55, 7.5, 15], [55, 7.5, -15], [-55, 7.5, -15],
        [15, 7.5, 55], [-15, 7.5, 55], [15, 7.5, -55], [-15, 7.5, -55]
    ];
    colunaPositions.forEach(([x, y, z]) => {
        const c = new THREE.Mesh(colunaGeo, colunaMat);
        c.position.set(x, y, z); // Esta será a altura máxima (ponto de partida da descida)
        c.castShadow = c.receiveShadow = true;
        colunas.add(c);
        objetosColidiveis.push(c);

        // Adiciona a coluna para animação
        animatedColumns.push({
            mesh: c,
            initialY: y, // Esta será a altura máxima (ponto de partida da descida)
            lowestY: y - (8 + Math.random() * 8), // Define o ponto mais baixo para onde vai descer (5 a 10 unidades abaixo)
            speed: 0.1 + Math.random() * 0.1,
            direction: -1 // Começa descendo
        });
    });
    area4.add(colunas);


    const barricadaGeo = new THREE.BoxGeometry(5, 3, 3);
    barricadaGeo.setAttribute('uv2', new THREE.BufferAttribute(barricadaGeo.attributes.uv.array, 2));
    const barricadaMat = new THREE.MeshStandardMaterial({
        map: textures.barricadas.map,
        normalMap: textures.barricadas.normalMap,
        aoMap: textures.barricadas.aoMap,
        roughnessMap: textures.barricadas.roughnessMap
    });
    const barricadas = new THREE.Object3D();
    const barricadePositions = [
        // Mantendo boa distância das colunas e entre si
        [10, 1.5, 15], [-15, 1.5, 10], [15, 1.5, -10], // Posições originais ajustadas se necessário

        // Mais para o centro, espaçadas
        [5, 1.5, 5], [-5, 1.5, 5], [5, 1.5, -5], [-5, 1.5, -5],
        [12, 1.5, 0], [-12, 1.5, 0], [0, 1.5, 12], [0, 1.5, -12],

        // Meio do raio, cuidadosamente posicionadas
        [r * 0.35, 1.5, r * 0.1], [-r * 0.35, 1.5, r * 0.1], [r * 0.1, 1.5, r * 0.35], [r * 0.1, 1.5, -r * 0.35],
        [r * 0.35, 1.5, -r * 0.1], [-r * 0.35, 1.5, -r * 0.1], [-r * 0.1, 1.5, r * 0.35], [-r * 0.1, 1.5, -r * 0.35],

        [r * 0.2, 1.5, r * 0.5], [-r * 0.2, 1.5, r * 0.5], [r * 0.2, 1.5, -r * 0.5], [-r * 0.2, 1.5, -r * 0.5],
        [r * 0.5, 1.5, r * 0.2], [-r * 0.5, 1.5, r * 0.2], [r * 0.5, 1.5, -r * 0.2], [-r * 0.5, 1.5, -r * 0.2],

        // Mais para as bordas do raio, com espaçamento
        [r * 0.65, 1.5, r * 0.05], [-r * 0.65, 1.5, r * 0.05], [r * 0.05, 1.5, r * 0.65], [r * 0.05, 1.5, -r * 0.65],
        [r * 0.65, 1.5, -r * 0.05], [-r * 0.65, 1.5, -r * 0.05], [-r * 0.05, 1.5, r * 0.65], [-r * 0.05, 1.5, -r * 0.65],

        [r * 0.55, 1.5, r * 0.45], [-r * 0.55, 1.5, r * 0.45], [r * 0.55, 1.5, -r * 0.45], [-r * 0.55, 1.5, -r * 0.45],
        [r * 0.45, 1.5, r * 0.55], [-r * 0.45, 1.5, r * 0.55], [r * 0.45, 1.5, -r * 0.55], [-r * 0.45, 1.5, -r * 0.55],

        [r * 0.75, 1.5, r * 0.3], [-r * 0.75, 1.5, r * 0.3], [r * 0.75, 1.5, -r * 0.3], [-r * 0.75, 1.5, -r * 0.3],
        [r * 0.3, 1.5, r * 0.75], [-r * 0.3, 1.5, r * 0.75], [r * 0.3, 1.5, -r * 0.75], [-r * 0.3, 1.5, -r * 0.75],

        // Quase na borda
        [r * 0.85, 1.5, 0], [-r * 0.85, 1.5, 0], [0, 1.5, r * 0.85], [0, 1.5, -r * 0.85],
        [r * 0.8, 1.5, r * 0.15], [-r * 0.8, 1.5, r * 0.15], [r * 0.8, 1.5, -r * 0.15], [-r * 0.8, 1.5, -r * 0.15],
        [r * 0.15, 1.5, r * 0.8], [-r * 0.15, 1.5, r * 0.8], [r * 0.15, 1.5, -r * 0.8], [-r * 0.15, 1.5, -r * 0.8]
    ];

    barricadePositions.forEach(([x, y, z]) => {
        const b = new THREE.Mesh(barricadaGeo, barricadaMat);
        b.position.set(x, y, z);
        b.castShadow = b.receiveShadow = true;
        barricadas.add(b);
        objetosColidiveis.push(b);
    });
    area4.add(barricadas);

    scene.add(area4);
}

// Função de atualização para as colunas animadas
function updateAnimatedColumns() {
    animatedColumns.forEach(col => {
        if (col.direction === -1) { // Descendo
            col.mesh.position.y -= col.speed;
            if (col.mesh.position.y <= col.lowestY) { // Verifica se atingiu o ponto mais baixo
                col.mesh.position.y = col.lowestY; // Garante que não passe do ponto
                col.direction = 1; // Mudar para subir de volta
            }
        } else { // Subindo de volta (para a posição inicial/mais alta)
            col.mesh.position.y += col.speed;
            if (col.mesh.position.y >= col.initialY) { // Verifica se atingiu o ponto mais alto (posição inicial)
                col.mesh.position.y = col.initialY; // Garante que não passe do ponto
                col.direction = -1; // Mudar para descer novamente
                // Recalcula o ponto mais baixo e a velocidade para o próximo ciclo
                col.lowestY = col.initialY - (5 + Math.random() * 5); 
                col.speed = 0.05 + Math.random() * 0.05;
            }
        }
    });
}

export default createArea4;
export { updateAnimatedColumns }; // Exporta a função de atualização