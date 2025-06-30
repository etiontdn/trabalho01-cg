import * as THREE from "three";
export default function () {
    const camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
    );
    return camera;
}
