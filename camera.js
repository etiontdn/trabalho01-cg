import * as THREE from "three";
import { initCamera } from "../libs/util/util.js";
export default function () {
    const camera = initCamera(new THREE.Vector3(0, 500, 0)); // Init camera in this position
    return camera;
}
