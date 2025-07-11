import * as THREE from "three";

function podeDescer(entidade) {
    const vetDir = new THREE.Vector3(0, -1, 0);
    const distancia = entidade.speed / 3;
    const vetorPos = entidade.entidade.position
        .clone()
        .add(vetDir.clone().multiplyScalar(distancia));
    return caminhoEValido(entidade, distancia, vetDir, vetorPos);
}


function podeSubir(entidade) {
    const vetDir = new THREE.Vector3(0, 1, 0);
    const distancia = entidade.speed / 3;
    const vetorPos = entidade.entidade.position
        .clone()
        .add(vetDir.clone().multiplyScalar(distancia));
    return caminhoEValido(entidade, distancia, vetDir, vetorPos);
}

function caminhoEValido(entidade, distancia, vetorDirecao, vetorPos) {
    // Cria geometria de retângulo (trajeto)
    const largura = entidade.tamanho.x;
    const altura = entidade.tamanho.y;
    const comprimento = distancia;

    const geometry = new THREE.BoxGeometry(largura, altura, comprimento);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
    });
    const boxMesh = new THREE.Mesh(geometry, material);

    const centro = new THREE.Vector3()
        .addVectors(entidade.entidade.position, vetorPos)
        .multiplyScalar(0.5);
    boxMesh.position.copy(centro);

    const angulo = Math.atan2(vetorDirecao.x, vetorDirecao.z);
    boxMesh.rotation.y = angulo;

    // Bounding box do boxMesh
    boxMesh.updateMatrixWorld(true);
    console.log(boxMesh.position);
    const boxBB = new THREE.Box3().setFromObject(boxMesh);

    const colidiveis = entidade.scene.rampas.concat(
        entidade.scene.objetosColidiveis
    );
    for (const obj of colidiveis) {
        if (!obj.geometry) continue;
        obj.updateMatrixWorld(true);
        const objBB = new THREE.Box3().setFromObject(obj);
        if (boxBB.intersectsBox(objBB)) {
            return false;
        }
    }
    return true;
}

function encontrarCaminho(entidade) {
    // Caminho horizontal (busca em várias direções)
    const direcoes = [];
    const angNum = 12;
    for (let i = 0; i < angNum; i++) {
        let ang = (180 / angNum) * i;
        direcoes.push(THREE.MathUtils.degToRad(ang));
        direcoes.push(THREE.MathUtils.degToRad(-ang));
    }

    const vetorDireto = new THREE.Vector3();
    vetorDireto.subVectors(
        entidade.ultimaPosicaoInimigo,
        entidade.entidade.position
    );

    // Raycast para baixo a partir do personagem para encontrar a altura do chão
    const raycaster = new THREE.Raycaster();
    const origemRay = entidade.scene.personagem.position.clone();
    raycaster.set(origemRay, new THREE.Vector3(0, -1, 0));
    const colidiveis = entidade.scene.rampas.concat(
        entidade.scene.objetosColidiveis
    );
    const intersects = raycaster.intersectObjects(colidiveis, true);

    if (intersects.length > 0) {
        // Ajusta a altura do vetorDireto para o ponto de interseção
        const alturaChao = intersects[0].point.y;
        vetorDireto.y =
            alturaChao - entidade.entidade.position.y + entidade.altMinima;
    } else {
        // Se não encontrar chão, mantém y = 0
        vetorDireto.y = 0;
    }
    if (vetorDireto.y <= 0) {
        if (!podeDescer(entidade)) {
            vetorDireto.y = 0;
        }
    } else {
        if (!podeSubir(entidade)) {
            vetorDireto.y = 0;
        }
    }

    vetorDireto.normalize();

    let pontoDestino = entidade.entidade.position.clone();

    for (let dir of direcoes) {
        const vetDir = vetorDireto
            .clone()
            .applyAxisAngle(new THREE.Vector3(0, 1, 0), dir);
        const distancia = Math.min(
            entidade.entidade.position.distanceTo(
                entidade.ultimaPosicaoInimigo
            ),
            entidade.speed
        );
        const direcao = vetDir.clone().normalize();
        pontoDestino = entidade.entidade.position
            .clone()
            .add(direcao.clone().multiplyScalar(distancia));

        if (caminhoEValido(entidade, distancia, direcao, pontoDestino)) {
            return { vetorPos: pontoDestino };
        }
    }

    // Se nenhum caminho for válido, retorna o último ponto calculado
    return { vetorPos: pontoDestino };
}

export default encontrarCaminho;
export {caminhoEValido};
