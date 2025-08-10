import * as THREE from "three";
import { CSG } from '../../libs/other/CSGMesh.js'  

function createArea4(scene, objetosColidiveis, rampas) {
    const r = 80;
    const altBase = 0.2;
    const altArea = 10;
    const mat = new THREE.MeshPhongMaterial();
    const radialSegments = 128;

    const area4 = new THREE.Object3D();
    area4.position.set(0, 0, 120);
    
    // BASE
    const cylinderGeo = new THREE.CylinderGeometry(r, r, altBase, radialSegments);
    const base = new THREE.Mesh(cylinderGeo, mat);
    base.position.set(0, altBase / 2, 0);
    
    // ESTACAS
    const estacaGeo = new THREE.BoxGeometry(0.5, altArea, 0.5);
    const blocoEstacaGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    
    // TETOS
    const tetoSub1Geo = new THREE.CylinderGeometry(r, r, 3, radialSegments);
    const tetoSub2Geo = new THREE.CylinderGeometry(r*0.75, r*0.75, 3, radialSegments);
    const tetoSub1 = new THREE.Mesh(tetoSub1Geo, mat);
    const tetoSub2 = new THREE.Mesh(tetoSub2Geo, mat);
    const csgTetoSub1 = CSG.fromMesh(tetoSub1);
    const csgTetoSub2 = CSG.fromMesh(tetoSub2);
    const csgTeto = csgTetoSub1.subtract(csgTetoSub2);
    
    // ESCADARIA
    const stepHeight = 0.5;
    const maxHeight  = altArea;
    const degraus    = Math.round(maxHeight / stepHeight);
    const totalDepth = 20;
    const stepDepth  = totalDepth / degraus;
    const stepWidth  = 8;
    const degrauGeo = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);   
    
    
    // PORTAL
    const distX = 5;
    const altAro = 5;
    
    const blocoPortalGeo = new THREE.BoxGeometry(2.1, altArea, 2.1);
    const aroPortalGeo = new THREE.BoxGeometry(distX*2, altAro, 2);
    const colAroPortalGeo = new THREE.CylinderGeometry(4, 4, 2, radialSegments);
    
    const aroPortalMesh = new THREE.Mesh(aroPortalGeo, mat);
    const colAroPortalMesh = new THREE.Mesh(colAroPortalGeo, mat);
    
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
    
    function criaPortal(num_andar, num_portal, dist = r - 2.5){
        const escada = new THREE.Object3D();
        const portal = new THREE.Object3D();
        const estaca1 = new THREE.Mesh(estacaGeo, mat);
        const estaca2 = new THREE.Mesh(estacaGeo, mat);
        const blocoEstaca1 = new THREE.Mesh(blocoEstacaGeo, mat);
        const blocoEstaca2 = new THREE.Mesh(blocoEstacaGeo, mat);
        const blocoPortal1 = new THREE.Mesh(blocoPortalGeo, mat);
        const blocoPortal2 = new THREE.Mesh(blocoPortalGeo, mat);
        const aroPortal = CSG.toMesh(csgAro, new THREE.Matrix4(), mat);
        aroPortal.geometry.center();
        estaca1.position.set(distX, altArea / 2, 1.5);
        estaca2.position.set(-distX, altArea / 2, 1.5);
        blocoEstaca1.position.set(distX, (altArea / 2), 1.5);
        blocoEstaca2.position.set(-distX, (altArea / 2), 1.5);
        blocoPortal1.position.set(distX, (altArea / 2), 0);
        blocoPortal2.position.set(-distX, (altArea / 2), 0);
        aroPortal.position.set(0, altArea - altAro/2, 0);
        portal.add(estaca1);
        portal.add(estaca2);
        portal.add(blocoEstaca1);
        portal.add(blocoEstaca2);
        portal.add(blocoPortal1);
        portal.add(blocoPortal2);
        portal.add(aroPortal);
        
        objetosColidiveis.push(estaca1, estaca2, blocoEstaca1, blocoEstaca2
            , blocoPortal1
            , blocoPortal2 
        );
        portal.position.set(0, 0, dist);
        return portal;
    }

    function criaAndar(andar, num_andar){
        const count = 41;
        const step = (2 * Math.PI) / count;
        for(let i = 1; i <= count; i++){
            const holder = new THREE.Object3D();
            andar.add(holder);
            holder.add(criaPortal(num_andar, i));
            const angle = i * step;
            holder.rotateY(Math.PI + angle);
            holder.updateMatrixWorld();
        }
        const teto = CSG.toMesh(csgTeto, new THREE.Matrix4(), mat);
        teto.position.set(0, altArea + 1.5, 0);
        andar.add(teto);
        objetosColidiveis.push(teto);
    }


    // AQUI É DEFINIDO O NUMERO DE ANDARES DO COLISEU
    const numAndares = 5;
    for(let i = 0; i < numAndares; i++){
        const andar = new THREE.Object3D();
        area4.add(andar);
        criaAndar(andar, i);
        andar.position.set(0, base.geometry.parameters.height + (3 + blocoPortalGeo.parameters.height) * i, 0);
    }
    scene.add(area4);
}

export default createArea4;

            // // ESCADAS
            // if(num_andar == 0 && (num_portal > 3 && num_portal < 38)){
    
            //     for (let i = 0; i < degraus; i++) {
            //         const degrau = new THREE.Mesh(degrauGeo, mat);
    
            //         const y = i * stepHeight + stepHeight / 2;
            //         const z = -totalDepth / 2 + i * stepDepth + stepDepth / 2;
    
            //         degrau.position.set(0, y, z);
            //         degrau.castShadow = true;
            //         degrau.receiveShadow = true;
    
            //         escada.add(degrau);
            //         objetosColidiveis.push(degrau);
            //     }
            //     escada.position.set(0, -1, -40);
            //     portal.add(escada);
            // }