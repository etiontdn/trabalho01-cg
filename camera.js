import * as THREE from "three";
import { initCamera } from "../libs/util/util.js";
export default function () {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    return camera;
}