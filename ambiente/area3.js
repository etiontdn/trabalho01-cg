import * as THREE from "three";
import { CSG } from '../../libs/other/CSGMesh.js'  

function createArea3(scene, objetosColidiveis, rampas) {
    const mat = new THREE.MeshPhongMaterial();
    const radialSegments = 128;
    const profArea3 = 100;

    const area4 = new THREE.Object3D();
    area4.position.set(150, 0, -150);

    const tetoHolder = new THREE.Object3D();

    // CSG PARA O TETO

        // TETO POR FORA
        const rTeto = 80;
        const tetoGeo = new THREE.CylinderGeometry(rTeto, rTeto, profArea3, radialSegments);
        const tetoExt = new THREE.Mesh(tetoGeo, mat);
        tetoExt.position.set(0, rTeto, 0);
        scene.add(tetoExt);

        // TETO POR DENTRO
        const rTetoInt = rTeto*0.95;
        const tetoIntGeo = new THREE.CylinderGeometry(rTetoInt, rTetoInt, profArea3, radialSegments);
        const tetoInt = new THREE.Mesh(tetoIntGeo, mat);
        tetoInt.position.set(0, rTeto, 0);
        scene.add(tetoInt);

        // CSG 1° SUBTRAÇÃO
        const csgTeto = CSG.fromMesh(tetoExt).subtract(CSG.fromMesh(tetoInt));
        const resultTeto1Mesh = CSG.toMesh(csgTeto, new THREE.Matrix4(), mat);
        resultTeto1Mesh.position.set(0, rTeto, 0);
        
        scene.remove(tetoExt);
        scene.remove(tetoInt);

        // CSG 1° SOMA
        const profDisco = profArea3*0.05;
        const discoGeo = new THREE.CylinderGeometry(rTeto, rTeto, profDisco, radialSegments);
        const disco1 = new THREE.Mesh(discoGeo, mat);
        disco1.position.set(0, (profArea3/2 - profDisco/2)*0.95, 0);
        disco1.updateMatrixWorld();

        const disco2 = new THREE.Mesh(discoGeo, mat);
        disco2.position.set(0, -(profArea3/2 - profDisco/2)*0.95, 0);
        disco2.updateMatrixWorld();

        const resultTeto2Mesh = CSG.toMesh(
            CSG.fromMesh(disco1).union(CSG.fromMesh(disco2)),
            new THREE.Matrix4(),
            mat
        );

        const resultTeto3Mesh = CSG.toMesh(
            csgTeto.union(CSG.fromMesh(resultTeto2Mesh)),
            new THREE.Matrix4(),
            mat
        );

        resultTeto3Mesh.position.y += profArea3 / 2;
        resultTeto3Mesh.rotation.x = Math.PI / 2;
        resultTeto3Mesh.updateMatrixWorld();

        scene.add(resultTeto3Mesh);

        // BLOCO PRO TETO
        const blocoGeoProCsg = new THREE.BoxGeometry(rTeto*2, rTeto*2.5, profArea3);
        const blocoProCsg = new THREE.Mesh(blocoGeoProCsg, mat);
        blocoProCsg.position.set(0, rTeto/2, 0);
        scene.add(blocoProCsg);

        // CSG 2° SUBTRAÇÃO
        const csgTetoFinal = CSG.fromMesh(resultTeto3Mesh).subtract(CSG.fromMesh(blocoProCsg));
        const resultTetoFinalMesh = CSG.toMesh(csgTetoFinal, new THREE.Matrix4(), mat);
        scene.remove(resultTeto3Mesh);
        scene.remove(blocoProCsg);
        resultTetoFinalMesh.geometry.center();
        tetoHolder.add(resultTetoFinalMesh);
        
        tetoHolder.position.set(0, rTeto/2, 0);

    area4.add(tetoHolder);

    // PAREDES
        const altParede = rTeto * 0.315;
        const profParede = rTeto * 0.065;

        const paredeTrasGeo = new THREE.BoxGeometry(rTeto*1.5, altParede, profParede);
        const paredeLateralGeo = new THREE.BoxGeometry(profParede, altParede, profArea3);
        
        const paredeSul = new THREE.Mesh(paredeTrasGeo, mat);
        const paredeOeste = new THREE.Mesh(paredeLateralGeo, mat);
        const paredeLeste = new THREE.Mesh(paredeLateralGeo, mat);
        
        paredeSul.position.set(0, altParede/2, -(profArea3/2 - profDisco/2)*0.95);
        
        paredeOeste.position.set(profArea3/2*1.195, altParede/2, 0);
        paredeLeste.position.set(-profArea3/2*1.195, altParede/2, 0);
        
        
        // PAREDES SUL
            const paredesSulGeo = new THREE.BoxGeometry(rTeto/4, altParede, profParede-0.1);
            const paredesSul1 = new THREE.Mesh(paredesSulGeo, mat);
            const paredesSul2 = new THREE.Mesh(paredesSulGeo, mat);
            
            paredesSul1.position.set(-profArea3/2, altParede/2, (profArea3/2 - profDisco/2)*0.95);
            paredesSul2.position.set( profArea3/2, altParede/2, (profArea3/2 - profDisco/2)*0.95);

        area4.add(paredeSul);
        area4.add(paredeOeste);
        area4.add(paredeLeste);
        area4.add(paredesSul1);
        area4.add(paredesSul2);

        // BASE
        const baseGeo = new THREE.BoxGeometry(rTeto*1.8, 0.1, profArea3*1.1);
        const base = new THREE.Mesh(baseGeo, mat);
        base.position.set(0, 0.05, 0);
        area4.add(base);

    // PASSANDO PRA COLIDIVEIS
        objetosColidiveis.push(paredeSul, paredeOeste, paredeLeste, paredesSul1, paredesSul2, base);

    scene.add(area4);
}

export default createArea3;

