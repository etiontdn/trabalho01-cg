import * as THREE from "three";
// Certifique-se de que o caminho para o seu CSGMesh.js está correto.
// Se estiver a usar 'three-csg-ts', a importação pode ser diferente.
import { CSG } from '../../libs/other/CSGMesh.js' //


function createArea4(scene, objetosColidiveis, rampas, textures) { // Added 'textures' parameter
    const r = 80;
    const altBase = 0.2;
    const altArea = 10;
    
    // Define materials using the passed textures
    const baseMat = new THREE.MeshStandardMaterial({ 
        map: textures.base.map,
        normalMap: textures.base.normalMap,
        
        roughness: 0.7, 
        metalness: 0.0,
    });
    baseMat.map.repeat.set(5,5); // Example repeat values
    baseMat.normalMap.repeat.set(5,5);
    


    const portalMat = new THREE.MeshStandardMaterial({ 
        map: textures.portal.map,
        normalMap: textures.portal.normalMap,
      
        roughness: 0.8, 
        metalness: 0.1,
    });
    portalMat.map.repeat.set(2, 2); // Example repeat values
    portalMat.normalMap.repeat.set(2, 2);
   


    const tetoMat = new THREE.MeshStandardMaterial({ 
        map: textures.teto.map,
        normalMap: textures.teto.normalMap,
        
        roughness: 0.9, 
        metalness: 0.2,
    });
    tetoMat.map.repeat.set(10, 10); 
    tetoMat.normalMap.repeat.set(10, 10);
 


    const radialSegments = 128;

    const area4 = new THREE.Object3D();
    area4.position.set(0, 0, 120);
    
    // BASE
    const cylinderGeo = new THREE.CylinderGeometry(r, r, altBase, radialSegments);
    const base = new THREE.Mesh(cylinderGeo, baseMat); // Use baseMat
    base.position.set(0, altBase / 2, 0);
    base.castShadow = true;
    base.receiveShadow = true;
    
    // ESTACAS
    const estacaGeo = new THREE.BoxGeometry(0.5, altArea, 0.5);
    const blocoEstacaGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    
    // =====================================================================================
    // PRÉ-COMPUTAÇÃO CSG PARA O TETO
    // =====================================================================================
    const tetoSub1Geo = new THREE.CylinderGeometry(r, r, 3, radialSegments);
    const tetoSub2Geo = new THREE.CylinderGeometry(r*0.75, r*0.75, 3, radialSegments);
    
    // Crie as meshes temporárias para a CSG. O material não importa aqui, pois o material final será aplicado depois.
    const tempTetoSub1 = new THREE.Mesh(tetoSub1Geo, new THREE.MeshBasicMaterial());
    const tempTetoSub2 = new THREE.Mesh(tetoSub2Geo, new THREE.MeshBasicMaterial());

    // Converta para CSG
    const csgTetoSub1 = CSG.fromMesh(tempTetoSub1);
    const csgTetoSub2 = CSG.fromMesh(tempTetoSub2);
    
    // Realize a operação CSG uma vez
    const csgTeto = csgTetoSub1.subtract(csgTetoSub2);
    
    // ESCADARIA
    // const stepHeight = 0.5;
    // const maxHeight  = altArea;
    // const degraus    = Math.round(maxHeight / stepHeight);
    // const totalDepth = 20;
    // const stepDepth  = totalDepth / degraus;
    // const stepWidth  = 8;
    // const degrauGeo = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);   
    
    // PORTAL
    const distX = 5;
    const altAro = 5;
    
    const blocoPortalGeo = new THREE.BoxGeometry(2.1, altArea, 2.1);
    // blocoPortalGeo.setAttribute('uv2', new THREE.BufferAttribute(blocoPortalGeo.attributes.uv.array, 2)); // REMOVIDO: uv2 não é mais necessário sem aoMap
    const aroPortalGeo = new THREE.BoxGeometry(distX*2, altAro, 2);
    // aroPortalGeo.setAttribute('uv2', new THREE.BufferAttribute(aroPortalGeo.attributes.uv.array, 2)); // REMOVIDO: uv2 não é mais necessário sem aoMap
    const colAroPortalGeo = new THREE.CylinderGeometry(4, 4, 2, radialSegments);
    // colAroPortalGeo.setAttribute('uv2', new THREE.BufferAttribute(colAroPortalGeo.attributes.uv.array, 2)); // REMOVIDO: uv2 não é mais necessário sem aoMap
    
    // Crie as meshes temporárias para a CSG do aro do portal
    const tempAroPortalMesh = new THREE.Mesh(aroPortalGeo, new THREE.MeshBasicMaterial());
    const tempColAroPortalMesh = new THREE.Mesh(colAroPortalGeo, new THREE.MeshBasicMaterial());
    
    // Posicione e rode as meshes temporárias antes da CSG
    tempAroPortalMesh.position.set(0, (altArea - 1), 0);
    tempColAroPortalMesh.position.set(0, (altArea - 3.3), 0);
    tempColAroPortalMesh.rotation.x = Math.PI / 2;
    
    tempAroPortalMesh.updateMatrixWorld();
    tempColAroPortalMesh.updateMatrixWorld();
    
    // Converta para CSG
    const csgA = CSG.fromMesh(tempColAroPortalMesh);
    const csgB = CSG.fromMesh(tempAroPortalMesh);
    
    // Realize a operação CSG uma vez
    const csgAro = csgB.subtract(csgA);
    
    // Não adicione as meshes temporárias à cena, pois o resultado será o CSG
    // scene.remove(tempColAroPortalMesh); // Não é necessário remover se nunca foram adicionadas
    // scene.remove(tempAroPortalMesh); // Não é necessário remover se nunca foram adicionadas

    area4.add(base);
    
    function criaPortal(num_andar, num_portal, dist = r - 2.5){
        // const escada = new THREE.Object3D();
        const portal = new THREE.Object3D();
        const estaca1 = new THREE.Mesh(estacaGeo, portalMat); // Use portalMat
        const estaca2 = new THREE.Mesh(estacaGeo, portalMat); // Use portalMat
        const blocoEstaca1 = new THREE.Mesh(blocoEstacaGeo, portalMat); // Use portalMat
        const blocoEstaca2 = new THREE.Mesh(blocoEstacaGeo, portalMat); // Use portalMat
        const blocoPortal1 = new THREE.Mesh(blocoPortalGeo, portalMat); // Use portalMat
        const blocoPortal2 = new THREE.Mesh(blocoPortalGeo, portalMat); // Use portalMat
        
        // Use o resultado CSG pré-calculado e converta para THREE.Mesh aqui
        const aroPortal = CSG.toMesh(csgAro, new THREE.Matrix4(), portalMat); // Use portalMat
        aroPortal.geometry.center();

        // REMOVIDO: uv2 não é mais necessário sem aoMap
        // if (!aroPortal.geometry.attributes.uv2 && aroPortal.geometry.attributes.uv) {
        //     aroPortal.geometry.setAttribute('uv2', new THREE.BufferAttribute(aroPortal.geometry.attributes.uv.array, 2));
        // }

        estaca1.position.set(distX, altArea / 2, 1.5);
        estaca2.position.set(-distX, altArea / 2, 1.5);
        blocoEstaca1.position.set(distX, (altArea / 2), 1.5);
        blocoEstaca2.position.set(-distX, (altArea / 2), 1.5);
        blocoPortal1.position.set(distX, (altArea / 2), 0);
        blocoPortal2.position.set(-distX, (altArea / 2), 0);
        aroPortal.position.set(0, altArea - altAro/2, 0);

        estaca1.castShadow = estaca1.receiveShadow = true;
        estaca2.castShadow = estaca2.receiveShadow = true;
        blocoEstaca1.castShadow = blocoEstaca1.receiveShadow = true;
        blocoEstaca2.castShadow = blocoEstaca2.receiveShadow = true;
        blocoPortal1.castShadow = blocoPortal1.receiveShadow = true;
        blocoPortal2.castShadow = blocoPortal2.receiveShadow = true;
        aroPortal.castShadow = aroPortal.receiveShadow = true;


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
        // Use o resultado CSG pré-calculado do teto e converta para THREE.Mesh aqui
        const teto = CSG.toMesh(csgTeto, new THREE.Matrix4(), tetoMat);
        teto.position.set(0, altArea + 1.5, 0);

        // REMOVIDO: uv2 não é mais necessário sem aoMap
        // if (!teto.geometry.attributes.uv2 && teto.geometry.attributes.uv) {
        //     teto.geometry.setAttribute('uv2', new THREE.BufferAttribute(teto.geometry.attributes.uv.array, 2));
        // }

        teto.castShadow = true;
        teto.receiveShadow = true;

        andar.add(teto);
        objetosColidiveis.push(teto);
    }


    //! AQUI É DEFINIDO O NUMERO DE ANDARES DO COLISEU
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