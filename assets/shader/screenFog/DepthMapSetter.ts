import { MeshRenderer } from 'cc';
import { director } from 'cc';
import { RenderTexture } from 'cc';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DepthMapSetter')
export class DepthMapSetter extends Component {

    @property(RenderTexture)
    reanderTexture: RenderTexture;

    start() {
        const material = this.node.getComponent(MeshRenderer).sharedMaterial;
        material.setProperty("depthTexture", this.reanderTexture.window.framebuffer.depthStencilTexture);
        let pass0 = material.passes[0];
        let bindingIndex = pass0.getBinding("depthTexture");
        pass0.bindSampler(bindingIndex, director.root.pipeline.globalDSManager.pointSampler);
    }

    update(deltaTime: number) {

    }
}

