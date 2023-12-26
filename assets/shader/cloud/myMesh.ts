import { _decorator, Component, Node, MeshRenderer, primitives, utils } from 'cc';
const { ccclass, property,executeInEditMode } = _decorator;

@ccclass('myMesh')
@executeInEditMode
export class myMesh extends Component {

    start() {
        const renderer = this.node.getComponent(MeshRenderer);
        if (!renderer) {
            return;
        }
        const plane: primitives.IGeometry = primitives.plane({
            width: 10,
            length: 10,
            widthSegments: 100,
            lengthSegments:100,
        })
        renderer.mesh = utils.MeshUtils.createMesh(plane);
    }

    update(deltaTime: number) {
        
    }
}

