// chave.js
import * as THREE from "three";
import { CSG } from '../../libs/other/CSGMesh.js'  

export function criarChave(corHex = 0xffff00, escala = 1.0) {
    // Cubo base
    const cubeGeo = new THREE.BoxGeometry(3, 3, 3);
    
    // --- MODIFICAÇÃO AQUI: Ajustar propriedades do MeshPhongMaterial ---
    const cubeMat = new THREE.MeshPhongMaterial({ 
        color: corHex,
        specular: 0xcccccc, // Cor do brilho especular (geralmente branco ou cinza claro)
        shininess: 100     // Intensidade do brilho (valores comuns: 30 a 200)
    });
    // --- FIM DA MODIFICAÇÃO ---

    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);

    // Cilindros para subtrair
    const cylinderGeo = new THREE.CylinderGeometry(1, 1, 6, 32);

    const cylXGeo = cylinderGeo.clone();
    cylXGeo.rotateZ(Math.PI / 2);

    const cylYGeo = cylinderGeo.clone();

    const cylZGeo = cylinderGeo.clone();
    cylZGeo.rotateX(Math.PI / 2);

    // --- MODIFICAÇÃO AQUI: Ajustar propriedades do MeshPhongMaterial para os cilindros também ---
    const cylinderMat = new THREE.MeshPhongMaterial({ 
        color: corHex,
        specular: 0xcccccc, // Usar a mesma cor de brilho
        shininess: 100      // Usar a mesma intensidade de brilho
    });
    // --- FIM DA MODIFICAÇÃO ---

    // Criar meshes com geometria rotacionada
    const cylX = new THREE.Mesh(cylXGeo, cylinderMat);
    const cylY = new THREE.Mesh(cylYGeo, cylinderMat);
    const cylZ = new THREE.Mesh(cylZGeo, cylinderMat);

    // Transformar meshes em CSG
    const cubeCSG = CSG.fromMesh(cubeMesh);
    const cylXCSG = CSG.fromMesh(cylX);
    const cylYCSG = CSG.fromMesh(cylY);
    const cylZCSG = CSG.fromMesh(cylZ);

    // Subtrair cilindros do cubo
    let chaveCSG = cubeCSG.subtract(cylXCSG);
    chaveCSG = chaveCSG.subtract(cylYCSG);
    chaveCSG = chaveCSG.subtract(cylZCSG);

    // Converter de volta para mesh
    const chaveMesh = CSG.toMesh(chaveCSG, cubeMesh.matrix, cubeMat); // Note que chaveMesh reusa cubeMat

    // Ajustes finais
    chaveMesh.castShadow = true;
    chaveMesh.receiveShadow = true;
    chaveMesh.position.set(0, 0, 0);

    // Criar luz pontual dentro do cubo
    const luzInterna = new THREE.PointLight(corHex, 20, 20);
    luzInterna.position.set(0, 0, 0);

    // Criar esfera emissiva para a bola de luz
    const esferaGeo = new THREE.SphereGeometry(0.7, 32, 32);
    const esferaMat = new THREE.MeshPhongMaterial({ color: corHex, emissive: new THREE.Color(corHex), emissiveIntensity: 1 });
    const esferaLuz = new THREE.Mesh(esferaGeo, esferaMat);
    esferaLuz.position.set(0, 0, 0);

    // Criar grupo para chave + luz + esfera emissiva
    const grupo = new THREE.Group();
    grupo.position.set(0, 7, 0);
    grupo.add(chaveMesh);
    grupo.add(luzInterna);
    grupo.add(esferaLuz);

    // Aplicar escala proporcional a todo o grupo
    grupo.scale.set(escala, escala, escala);

    return grupo;
}