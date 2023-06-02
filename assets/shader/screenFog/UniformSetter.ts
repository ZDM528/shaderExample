import { MeshRenderer } from 'cc';
import { Vec4 } from 'cc';
import { Camera } from 'cc';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UniformSetter')
export class UniformSetter extends Component {

    @property(Camera)
    camera: Camera;

    start() {
        let material = this.node.getComponent(MeshRenderer).sharedMaterial;
        material.setProperty("cameraProjInv", this.camera.camera.matProjInv);
        material.setProperty("cameraWorldPos", new Vec4(this.camera.camera.position.x, this.camera.camera.position.y, this.camera.camera.position.z, 1.0));
    }

    update(deltaTime: number) {

    }
}

