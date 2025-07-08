import * as THREE from "three";
export default function () {
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.5,
        2000
    );
    return camera;
}
