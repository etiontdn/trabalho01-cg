import * as THREE from "three";
import { OBJLoader } from '../../build/jsm/loaders/OBJLoader.js';
import {MTLLoader} from '../../build/jsm/loaders/MTLLoader.js';
import { CSG } from '../../libs/other/CSGMesh.js';
import { getMaxSize } from "../../libs/util/util.js";

function createArea3(scene, chave2, chave3, objetosColidiveis, rampas, texturas) {
    const radialSegments = 128;
    const profArea3 = 100;

    const castShadow = true;
    const receiveShadow = true;

    const area3 = new THREE.Object3D();
    area3.position.set(150, 0, -150);

    const tetoHolder = new THREE.Object3D();

    const clock = new THREE.Clock();

    //------------------------ TEXTURAS -----------------------//

        //----------------- CAIXAS ----------------//
        const cxMat = new THREE.MeshStandardMaterial({ map: texturas.caixas });

        //----------------- PAREDES ----------------//
        const paredeMat = new THREE.MeshStandardMaterial({
            map: texturas.paredes.map,
            normalMap: texturas.paredes.normalMap,
            roughnessMap: texturas.paredes.roughnessMap,
            aoMap: texturas.paredes.aoMap,
            bumpMap: texturas.paredes.bumpMap,
            displacementMap: texturas.paredes.displacementMap,
            displacementScale: 0.01,
        });

        //----------------- TETO ----------------//
        const tetoMat = new THREE.MeshStandardMaterial({
            map: texturas.paredes.map,
            normalMap: texturas.paredes.normalMap,
            roughnessMap: texturas.paredes.roughnessMap,
            aoMap: texturas.paredes.aoMap,
            bumpMap: texturas.paredes.bumpMap,
            displacementMap: texturas.paredes.displacementMap,
            displacementScale: 0.001,
        });

        //----------------- CHAO ----------------//
        const chaoMat = new THREE.MeshStandardMaterial({
            map: texturas.chao.map,
            normalMap: texturas.chao.normalMap,
            roughnessMap: texturas.chao.roughnessMap,
            aoMap: texturas.chao.aoMap,
            displacementMap: texturas.chao.displacementMap,
            displacementScale: 0.01,
        });

        //----------------- CORRIMAO ----------------//
        const corrimao1Mat = new THREE.MeshStandardMaterial({
            map: texturas.corrimao1.map,
            normalMap: texturas.corrimao1.normalMap,
            roughnessMap: texturas.corrimao1.roughnessMap,
            aoMap: texturas.corrimao1.aoMap,
            displacementMap: texturas.corrimao1.displacementMap,
            displacementScale: 0.001,
        });
        const corrimao2Mat = new THREE.MeshStandardMaterial({
            map: texturas.corrimao2.map,
            normalMap: texturas.corrimao2.normalMap,
            roughnessMap: texturas.corrimao2.roughnessMap,
            aoMap: texturas.corrimao2.aoMap,
            displacementMap: texturas.corrimao2.displacementMap,
            displacementScale: 0.001,
        });

        //----------------- AREAS ALTAS ----------------//
        const AAmat = new THREE.MeshStandardMaterial({
            map: texturas.areasAltas.map,
            normalMap: texturas.areasAltas.normalMap,
            roughnessMap: texturas.areasAltas.roughnessMap,
            aoMap: texturas.areasAltas.aoMap,
            displacementMap: texturas.areasAltas.displacementMap,
            displacementScale: 0.001,
        });

        //----------------- PORTOES ----------------//
        const portaoMat = new THREE.MeshStandardMaterial({
            map: texturas.areasAltas.map,
            normalMap: texturas.areasAltas.normalMap,
            roughnessMap: texturas.areasAltas.roughnessMap,
            aoMap: texturas.areasAltas.aoMap,
            displacementMap: texturas.areasAltas.displacementMap,
            displacementScale: 0.001,
        });

    //------------------------ CSG PARA O TETO -----------------------//

        //---------- TETO POR FORA  ----------//
        const rTeto = 80;
        const tetoGeo = new THREE.CylinderGeometry(rTeto, rTeto, profArea3, radialSegments);
        const tetoExt = new THREE.Mesh(tetoGeo, tetoMat);
        tetoExt.position.set(0, rTeto, 0);
        scene.add(tetoExt);

        //---------- TETO POR DENTRO ---------//
        const rTetoInt = rTeto*0.95;
        const tetoIntGeo = new THREE.CylinderGeometry(rTetoInt, rTetoInt, profArea3, radialSegments);
        const tetoInt = new THREE.Mesh(tetoIntGeo, tetoMat);
        tetoInt.position.set(0, rTeto, 0);
        scene.add(tetoInt);

        //----------------- CSG 1° SUBTRAÇÃO ----------------//
        const csgTeto = CSG.fromMesh(tetoExt).subtract(CSG.fromMesh(tetoInt));
        const resultTeto1Mesh = CSG.toMesh(csgTeto, new THREE.Matrix4(), tetoMat);
        resultTeto1Mesh.position.set(0, rTeto, 0);
        
        scene.remove(tetoExt);
        scene.remove(tetoInt);

        //----------------- CSG 1° SOMA ----------------//
        const profDisco = profArea3*0.05;
        const discoGeo = new THREE.CylinderGeometry(rTeto, rTeto, profDisco, radialSegments);
        const disco1 = new THREE.Mesh(discoGeo, tetoMat);
        disco1.position.set(0, (profArea3/2 - profDisco/2)*0.95, 0);
        disco1.updateMatrixWorld();

        const disco2 = new THREE.Mesh(discoGeo, tetoMat);
        disco2.position.set(0, -(profArea3/2 - profDisco/2)*0.95, 0);
        disco2.updateMatrixWorld();

        const resultTeto2Mesh = CSG.toMesh(
            CSG.fromMesh(disco1).union(CSG.fromMesh(disco2)),
            new THREE.Matrix4(),
            tetoMat
        );

        const resultTeto3Mesh = CSG.toMesh(
            csgTeto.union(CSG.fromMesh(resultTeto2Mesh)),
            new THREE.Matrix4(),
            tetoMat
        );

        resultTeto3Mesh.position.y += profArea3 / 2;
        resultTeto3Mesh.rotation.x = Math.PI / 2;
        resultTeto3Mesh.updateMatrixWorld();

        scene.add(resultTeto3Mesh);

        //----------------- BLOCO PRO TETO ----------------//
        // Bloco que forma a metade do teto, basicamente
        const blocoGeoProCsg = new THREE.BoxGeometry(rTeto*2, rTeto*2.5, profArea3);
        const blocoProCsg = new THREE.Mesh(blocoGeoProCsg, tetoMat);
        blocoProCsg.position.set(0, rTeto/2, 0);
        scene.add(blocoProCsg);

        //----------------- CSG 2° SUBTRAÇÃO ----------------//
        const csgTetoFinal = CSG.fromMesh(resultTeto3Mesh).subtract(CSG.fromMesh(blocoProCsg));
        const resultTetoFinalMesh = CSG.toMesh(csgTetoFinal, new THREE.Matrix4(), tetoMat);
        scene.remove(resultTeto3Mesh);
        scene.remove(blocoProCsg);
        resultTetoFinalMesh.geometry.center();
        tetoHolder.add(resultTetoFinalMesh);
        
        tetoHolder.position.set(0, rTeto/2, 0);

    area3.add(tetoHolder);

    //------------------------ CRIAÇÃO DA AREA -----------------------//
        //----------------- PAREDES LATERAIS ----------------//
        const altParede = rTeto * 0.315;
        const profParede = rTeto * 0.065;

        const paredeTrasGeo = new THREE.BoxGeometry(rTeto*1.5, altParede, profParede);
        const paredeLateralGeo = new THREE.BoxGeometry(profParede, altParede, profArea3);
        
        const paredeNorte = new THREE.Mesh(paredeTrasGeo, paredeMat);
        const paredeOeste = new THREE.Mesh(paredeLateralGeo, paredeMat);
        const paredeLeste = new THREE.Mesh(paredeLateralGeo, paredeMat);
        
        paredeNorte.position.set(0, altParede/2, -(profArea3/2 - profDisco/2)*0.95);
        
        paredeOeste.position.set(profArea3/2*1.195, altParede/2, 0);
        paredeLeste.position.set(-profArea3/2*1.195, altParede/2, 0);
        
        //----------------- PAREDES DA FRENTE ----------------//
        const paredesSulGeo = new THREE.BoxGeometry(rTeto/2.5, altParede, profParede-0.1);
        const paredesSul1 = new THREE.Mesh(paredesSulGeo, paredeMat);
        const paredesSul2 = new THREE.Mesh(paredesSulGeo, paredeMat);
        paredesSul1.position.set( paredeLeste.position.x + (paredesSul1.geometry.parameters.width + paredeLeste.geometry.parameters.width) / 2 , altParede/2, (profArea3/2 - profDisco/2)*0.95);
        paredesSul2.position.set( paredeOeste.position.x - (paredesSul2.geometry.parameters.width + paredeOeste.geometry.parameters.width) / 2, altParede/2, (profArea3/2 - profDisco/2)*0.95);

        area3.add(paredeNorte);
        area3.add(paredeOeste);
        area3.add(paredeLeste);
        area3.add(paredesSul1);
        area3.add(paredesSul2);

        //----------------- CHAO ----------------//
        const baseGeo = new THREE.BoxGeometry(rTeto*1.8, 0.1, profArea3*1.1);
        const base = new THREE.Mesh(baseGeo, chaoMat);
        base.position.set(0, 0.05, 0);
        area3.add(base);

        //-----------------AREAS ALTAS DE DENTRO ----------------//
            //---------- ESCADAS ---------//
            // const degrauWidth  = 10;
            // const baseHeight   = 0.4;
            // const stepDepth    = 1.5;
            // const degrauMat    = AAmat; 

            // function createEscada(posInicial, numDegraus = 17, groundY = 0) {
            //     const escada = new THREE.Object3D();

            //     for (let i = 0; i < numDegraus; i++) {
            //         const altura = baseHeight * (i + 1);

            //         const geo = new THREE.BoxGeometry(degrauWidth, altura, stepDepth);
            //         const degrau = new THREE.Mesh(geo, degrauMat);
            //         const y = groundY + altura / 2;
            //         const z = posInicial.z - (i * stepDepth);
            //         degrau.position.set(posInicial.x, y, z);
            //         degrau.castShadow = castShadow;
            //         degrau.receiveShadow = receiveShadow;
            //         escada.add(degrau);
            //         objetosColidiveis.push(degrau);
            //     }
            //     rampas.push(escada);
            //     return escada;
            // }

            // const posEscada1 = new THREE.Vector3(profArea3/2*1.05, 0, profArea3/2*0.6);
            // const posEscada2 = new THREE.Vector3(-profArea3/2*1.05, 0, profArea3/2*0.6);
            // const escadaDir = createEscada(posEscada1);
            // const escadaEsq = createEscada(posEscada2);
            // area3.add(escadaDir);
            // area3.add(escadaEsq);
            
            //---------- AREAS LATERAIS ALTAS ---------//
            // const areaInnerEndZ = paredeNorte.position.z/2 + 0.01;

            // function criaAreaAltaAposEscada(escada, posEscada) {
            //     const numDegraus = escada.children.length;
            //     if (numDegraus === 0) return null;

            //     const lastIndex = numDegraus - 1;
            //     const lastCenterZ = posEscada.z - (lastIndex * stepDepth);

            //     const lastBackFaceZ = lastCenterZ - (stepDepth / 2);

            //     if (lastBackFaceZ <= areaInnerEndZ) {
            //     return null;
            //     }

            //     const profundidade = lastBackFaceZ - areaInnerEndZ;
            //     const centroZ = areaInnerEndZ + profundidade / 2;

            //     const ultimoDegrau = escada.children[lastIndex];
            //     const alturaUltimo = ultimoDegrau.geometry.parameters.height;

            //     const largura = degrauWidth;

            //     const geo = new THREE.BoxGeometry(largura, alturaUltimo, profundidade);
            //     const mesh = new THREE.Mesh(geo, AAmat);

            //     mesh.position.set(posEscada.x, alturaUltimo / 2, centroZ);

            //     area3.add(mesh);
            //     objetosColidiveis.push(mesh);

            //     return mesh;
            // }
            // const areaAlta1 = criaAreaAltaAposEscada(escadaDir, posEscada1);
            // const areaAlta2 = criaAreaAltaAposEscada(escadaEsq, posEscada2);

            //---------- AREA ALTA FUNDO ---------//
            // const thickness = 20;

            // const altura1 = (typeof areaAlta1 !== 'undefined' && areaAlta1) ? areaAlta1.geometry.parameters.height : 0;
            // const altura2 = (typeof areaAlta2 !== 'undefined' && areaAlta2) ? areaAlta2.geometry.parameters.height : 0;

            // const alturaFundo = Math.max(altura1, altura2);
            // const centerX = (posEscada1.x + posEscada2.x) / 2;

            // const larguraFundo = Math.abs(posEscada1.x - posEscada2.x) + degrauWidth;

            // const centerZ = areaInnerEndZ - (thickness / 2);

            // const centerY = alturaFundo / 2;

            // const fundoGeo = new THREE.BoxGeometry(larguraFundo, alturaFundo, thickness);
            // const fundoMesh = new THREE.Mesh(fundoGeo, AAmat);

            // fundoMesh.position.set(centerX, centerY, centerZ);

            // area3.add(fundoMesh);
            // objetosColidiveis.push(fundoMesh);

            // MATERIAL
            const objMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });

            //---------- CORRIMAO LATERAIS ---------//
            // const corrimaoHeight = 2;
            // const corrimaoDepth = 0.2;
            // const corrimaoGeo = new THREE.BoxGeometry(corrimaoDepth, corrimaoHeight, areaAlta1.geometry.parameters.depth + 2);
            // const corrimao1 = new THREE.Mesh(corrimaoGeo, corrimao1Mat);
            // const corrimao2 = new THREE.Mesh(corrimaoGeo, corrimao1Mat);
            // corrimao1.position.set(areaAlta1.position.x - areaAlta1.geometry.parameters.width*0.45, areaAlta1.position.y + areaAlta1.geometry.parameters.height / 2 + corrimao1.geometry.parameters.height / 2, -2 + areaAlta1.position.z - areaAlta1.geometry.parameters.depth / 2 + corrimao1.geometry.parameters.depth / 2);
            // corrimao2.position.set(areaAlta2.position.x + areaAlta2.geometry.parameters.width*0.45, areaAlta2.position.y + areaAlta2.geometry.parameters.height / 2 + corrimao2.geometry.parameters.height / 2, -2 + areaAlta2.position.z - areaAlta2.geometry.parameters.depth / 2 + corrimao2.geometry.parameters.depth / 2);

            // area3.add(corrimao1);
            // area3.add(corrimao2);
            
            //---------- CORRIMAO FUNDO ---------//
            // const distance = Math.abs(areaAlta1.position.x - areaAlta2.position.x) - 8.75;
            // const corrimaoFundoGeo = new THREE.BoxGeometry(distance, corrimaoHeight, corrimaoDepth);
            // const corrimaoFundo = new THREE.Mesh(corrimaoFundoGeo, corrimao2Mat);
            // corrimaoFundo.position.set(0, areaAlta1.position.y + areaAlta1.geometry.parameters.height / 2 + corrimaoFundo.geometry.parameters.height / 2, -2 + areaInnerEndZ - corrimaoFundo.geometry.parameters.depth / 2);
            // area3.add(corrimaoFundo);
            
        //----------------- CAIXAS ESPALHADAS ----------------//
        const cxGtam = 3.5;
        const cxMtam = 2;
        const cxPtam = 1.2;
        const caixaGrandeGeo = new THREE.BoxGeometry(cxGtam, cxGtam, cxGtam);
        const caixaMediaGeo = new THREE.BoxGeometry(cxMtam, cxMtam, cxMtam);
        const caixaPequenaGeo = new THREE.BoxGeometry(cxPtam, cxPtam, cxPtam);

        function criaPilha(opc, x, y, z){
                const pilha = new THREE.Object3D();
                function criaCaixaG(x, y, z){
                    const caixa = new THREE.Mesh(caixaGrandeGeo, cxMat);
                    caixa.position.set(x, y, z);
                    pilha.add(caixa);
                }
                function criaCaixaM(x, y, z){
                    const caixa = new THREE.Mesh(caixaMediaGeo, cxMat);
                    caixa.position.set(x, y, z);
                    pilha.add(caixa);
                }
                function criaCaixaP(x, y, z){
                    const caixa = new THREE.Mesh(caixaPequenaGeo, cxMat);
                    caixa.position.set(x, y, z);
                    pilha.add(caixa);
                }
                if(opc == 2){
                    criaCaixaM(0, cxMtam / 2, 0);
                    criaCaixaP(0, cxMtam + cxPtam / 2, 0);

                    pilha.children[1].rotateY(Math.PI / 4);
                }
                if(opc == 3){
                    criaCaixaG(0, cxGtam / 2, 0);
                    criaCaixaM(0, cxGtam + cxMtam / 2, 0);
                    criaCaixaP(0, cxGtam + cxMtam + cxPtam / 2, 0);

                    pilha.children[1].rotateY(Math.PI / 4);
                }
                if(opc == 4){
                    criaCaixaG(0,           cxGtam / 2, 0);
                    criaCaixaG(cxGtam,      cxGtam / 2, 0);
                    criaCaixaG(cxGtam * 2,  cxGtam / 2, 0);
                    criaCaixaG(cxGtam * 3,  cxGtam / 2, 0);
                }
                if(opc == 5){
                    criaCaixaG(0, cxGtam / 2, 0);
                    criaCaixaG(-cxGtam, cxGtam / 2, 0);
                    criaCaixaG(0, cxGtam / 2, cxGtam);
                    criaCaixaG(cxGtam, cxGtam / 2, 0);
                    criaCaixaG(0, cxGtam*1.5, 0);
                }
                if(opc == 6){
                    criaCaixaG(0, cxGtam / 2, 0);
                    criaCaixaG(-cxGtam, cxGtam / 2, 0);
                    criaCaixaG(cxGtam, cxGtam / 2, 0);
                    criaCaixaG(-cxGtam/2, cxGtam*1.5, 0);
                    criaCaixaG(cxGtam/2, cxGtam*1.5, 0);
                    criaCaixaG(0, cxGtam*2.5, 0);
                }
                //------ SHADOW CAIXAS -----//
                pilha.children.forEach(child => {
                    child.castShadow = castShadow;
                    child.receiveShadow = receiveShadow;
                    objetosColidiveis.push(child);
                });

                pilha.position.set(x, y, z);
                area3.add(pilha);
            }

            //---------- CAIXAS DA PARTE ALTA ---------//
            // criaPilha(4, fundoMesh.position.x - (fundoMesh.geometry.parameters.width - cxGtam - 2) / 2,
            //             fundoMesh.position.y + (fundoMesh.geometry.parameters.height) / 2,
            //             fundoMesh.position.z - (fundoMesh.geometry.parameters.depth - cxGtam) / 2);
            // criaPilha(2, fundoMesh.position.x - (fundoMesh.geometry.parameters.width - cxGtam - 2) / 2 + cxGtam * 4,
            //             fundoMesh.position.y + (fundoMesh.geometry.parameters.height) / 2,
            //             fundoMesh.position.z - (fundoMesh.geometry.parameters.depth - cxGtam) / 2);
            // criaPilha(2, fundoMesh.position.x + (fundoMesh.geometry.parameters.width - cxGtam - 2) / 2,
            //             fundoMesh.position.y + (fundoMesh.geometry.parameters.height) / 2,
            //             fundoMesh.position.z - (fundoMesh.geometry.parameters.depth - cxGtam) / 2);
            // criaPilha(5, fundoMesh.position.x,
            //             fundoMesh.position.y + (fundoMesh.geometry.parameters.height) / 2,
            //             fundoMesh.position.z - (fundoMesh.geometry.parameters.depth - cxGtam) / 2);
            // criaPilha(6, fundoMesh.position.x + (fundoMesh.geometry.parameters.width - cxGtam - 2) / 4,
            //             fundoMesh.position.y + (fundoMesh.geometry.parameters.height) / 2,
            //             fundoMesh.position.z - (fundoMesh.geometry.parameters.depth - cxGtam) / 2);
            // criaPilha(4, fundoMesh.position.x + (fundoMesh.geometry.parameters.width - cxGtam - 2) / 4,
            //             fundoMesh.position.y + (fundoMesh.geometry.parameters.height) / 2,
            //             fundoMesh.position.z - (fundoMesh.geometry.parameters.depth - cxGtam) / 2 + cxGtam);
            // criaPilha(4,fundoMesh.position.x + (fundoMesh.geometry.parameters.width - cxGtam - 2) / 4 + cxGtam*2,
            //             fundoMesh.position.y + (fundoMesh.geometry.parameters.height) / 2,
            //             fundoMesh.position.z - (fundoMesh.geometry.parameters.depth - cxGtam) / 2);
            // criaPilha(4,fundoMesh.position.x + (fundoMesh.geometry.parameters.width - cxGtam - 2) / 4 + cxGtam*2,
            //             fundoMesh.position.y + (fundoMesh.geometry.parameters.height) / 2 + cxGtam,
            //             fundoMesh.position.z - (fundoMesh.geometry.parameters.depth - cxGtam) / 2);

        //---------- AVIAO ---------//
        function loadOBJFile(modelPath, modelName, desiredScale, angle, visibility)
        {
            var mtlLoader = new MTLLoader( );
            mtlLoader.setPath( modelPath );
            mtlLoader.load( modelName + '.mtl', function ( materials ) {
                materials.preload();

                var objLoader = new OBJLoader( );
                objLoader.setMaterials(materials);
                objLoader.setPath(modelPath);
                objLoader.load( modelName + ".obj", function ( obj ) {
                    obj.visible = visibility;
                    obj.name = modelName;
                    // Set 'castShadow' property for each children of the group
                    obj.traverse( function (child)
                    {
                    if( child.isMesh ){   child.castShadow = true; child.receiveShadow = true; }
                    if( child.material ) child.material.side = THREE.DoubleSide; 
                    });

                    var obj = normalizeAndRescale(obj, desiredScale);
                    var obj = fixPosition(obj);
                    obj.rotateY(THREE.MathUtils.degToRad(angle));
                    obj.position.set(0, 0, 10);
                    area3.add ( obj );
                    // CRIANDO BOX PARA COLISAO COM PES DO AVIAO
                    function criarBox(x, y, z){
                        const boxGeo = new THREE.BoxGeometry(2, 2, 2);
                        const boxMesh = new THREE.Mesh(boxGeo, objMat);
                        boxMesh.position.set(x, y, z);
                        boxMesh.visible = false;
                        objetosColidiveis.push(boxMesh);
                        scene.add(boxMesh);
                    }
                    criarBox(150, 1, -123.9);
                    criarBox(156, 1, -146.39);
                    criarBox(143.59, 1, -145.84);
                });
            });
        }
        function normalizeAndRescale(obj, newScale)
        {
          var scale = getMaxSize(obj);
          obj.scale.set(newScale * (1.0/scale),
                        newScale * (1.0/scale),
                        newScale * (1.0/scale));
          return obj;
        }
        function fixPosition(obj)
        {
          var box = new THREE.Box3().setFromObject( obj );
          if(box.min.y > 0)
            obj.translateY(-box.min.y);
          else
            obj.translateY(-1*box.min.y);
          return obj;
        }
        loadOBJFile('../assets/objects/', 'plane', 55, -90, true);

    //----------------- PORTÃO E SUA LÓGICA ----------------//
        //---------- PORTÕES PARA CSG ---------//
        const portaoW = (paredesSul1.position.distanceTo(paredesSul2.position) - paredesSul1.geometry.parameters.width) / 2;
        const portaGeo = new THREE.BoxGeometry(portaoW, paredesSul1.geometry.parameters.height, paredesSul1.geometry.parameters.depth / 2);
        const portaoEsq = new THREE.Mesh(portaGeo, portaoMat);
        const portaoDir = new THREE.Mesh(portaGeo, portaoMat);
        portaoEsq.position.set(-portaoEsq.geometry.parameters.width / 2, portaoEsq.geometry.parameters.height / 2 ,0);
        portaoDir.position.set(portaoDir.geometry.parameters.width / 2, portaoDir.geometry.parameters.height / 2 , 0);
        scene.add(portaoEsq);
        scene.add(portaoDir);
        portaoEsq.updateMatrixWorld();
        portaoDir.updateMatrixWorld();

        //---------- CILINDRO PARA CSG ---------//
        const rChave = 1.5;
        const cilindroGeo = new THREE.CylinderGeometry(rChave, rChave, portaoEsq.geometry.parameters.depth + 1, radialSegments);
        const cilindroEncaixeChave = new THREE.Mesh(cilindroGeo, paredeMat);
        cilindroEncaixeChave.material.side = THREE.DoubleSide;
        cilindroEncaixeChave.rotateX(Math.PI / 2);
        cilindroEncaixeChave.position.set(0, portaoDir.geometry.parameters.height / 4, 0);
        scene.add(cilindroEncaixeChave);
        cilindroEncaixeChave.updateMatrixWorld();

        //---------- CSG SUBTRAÇÃO ---------//
        const csgPortaoEsqComEncaixe = CSG.fromMesh(portaoEsq).subtract(CSG.fromMesh(cilindroEncaixeChave));
        const csgPortaoDirComEncaixe = CSG.fromMesh(portaoDir).subtract(CSG.fromMesh(cilindroEncaixeChave));

        scene.remove(portaoDir);
        scene.remove(portaoEsq);
        scene.remove(cilindroEncaixeChave);

        const portaoEsqComEncaixe = CSG.toMesh(csgPortaoEsqComEncaixe, new THREE.Matrix4(), portaoMat);
        const portaoDirComEncaixe =  CSG.toMesh(csgPortaoDirComEncaixe, new THREE.Matrix4(), portaoMat);

        portaoEsqComEncaixe.updateMatrixWorld();
        portaoDirComEncaixe.updateMatrixWorld();
        portaoEsqComEncaixe.geometry.center();
        portaoDirComEncaixe.geometry.center();

        portaoEsqComEncaixe.position.set(paredesSul1.position.x + (paredesSul1.geometry.parameters.width) / 2 + portaoW / 2,
                                        paredesSul1.position.y,
                                        paredesSul1.position.z);
        portaoDirComEncaixe.position.set(paredesSul2.position.x - (paredesSul2.geometry.parameters.width) / 2 - portaoW / 2,
                                        paredesSul2.position.y,
                                        paredesSul2.position.z);

        area3.add(portaoEsqComEncaixe);
        area3.add(portaoDirComEncaixe);

        //---------- VARIAVEIS PARA A LÓGICA ---------//
        let portaoAlreadyAnimate = false;
        let portaoAnimating = false;
        let moveProgress  = 0;
        const distMovimento = portaoW * 4/5;
        const rAtivacao = 10;
        const areaAtivacao = new THREE.Object3D();
        area3.add(areaAtivacao);
        const velocidade = 140;

        areaAtivacao.position.set(paredesSul1.position.x + Math.abs(paredesSul2.position.x - paredesSul1.position.x) / 2,
                                    paredesSul1.position.y / 2,
                                    paredesSul1.position.z);
                                
        //--------------- CHAVE 3 --------------//
        chave3.position.set(area3.position.x, area3.position.y - 2, area3.position.z + base.geometry.parameters.depth / 2 + 1);
        scene.add(chave3);
        let chave3Alreadyanimate = false;
        let progresso;
        let chaveAnimating = false;

        //--------------- UPDATE AREA 3 --------------//
        const tmpWorldPos = new THREE.Vector3();
        function updateArea3(chave2Coletada, chave3Coletada, soldados_mortos) {

            if(!chave2Coletada)
                return;

            if(chave3Alreadyanimate)
                return;

            const delta = clock.getDelta();
            const speed = velocidade * delta;

            if(!chaveAnimating && !chave3Coletada && soldados_mortos && !chave3Alreadyanimate) {
                chaveAnimating = true;
                progresso = 0;
            }

            if(chaveAnimating){
                
                progresso += delta * speed;
                chave3.position.y += delta * speed;

                if(progresso >= 4) {
                    progresso = 4;
                    chaveAnimating = false;
                    chave3Alreadyanimate = true;
                }
            }

            if(portaoAlreadyAnimate)
                return;

            if (!portaoAlreadyAnimate && !portaoAnimating) {
                areaAtivacao.getWorldPosition(tmpWorldPos);
                const d = scene.personagem.position.distanceTo(tmpWorldPos);
                chave2.visible = false;
                chave2.position.set(tmpWorldPos.x, tmpWorldPos.y, tmpWorldPos.z);
                if (d < rAtivacao) {
                    portaoAnimating = true;
                    moveProgress = 0;
                    chave2.visible = true;
                }
            }

            if (portaoAnimating) {
                const step = speed * delta;
                moveProgress += step;

                portaoEsqComEncaixe.position.x -= step;
                portaoDirComEncaixe.position.x += step;
                chave2.position.x -= step;

                if (moveProgress >= distMovimento) {
                    portaoAnimating     = false;
                    portaoAlreadyAnimate = true;
                    const overshoot = moveProgress - distMovimento;
                    portaoEsqComEncaixe.position.x += overshoot;
                    portaoDirComEncaixe.position.x -= overshoot;
                }
            }
        }

    //------ SHADOW AREA -----//
    area3.children.forEach(child => {
        child.castShadow = castShadow;
        child.receiveShadow = receiveShadow;
    });

    //---------- PASSANDO ALGUNS COLIDIVEIS ---------//
    objetosColidiveis.push(paredeNorte, paredeOeste, paredeLeste,
        paredesSul1, paredesSul2, base,
        portaoEsqComEncaixe, portaoDirComEncaixe,
    );

    scene.add(area3);

    return updateArea3;
}

export default createArea3;