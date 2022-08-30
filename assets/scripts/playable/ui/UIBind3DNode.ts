import { _decorator, Component, UITransform, Camera, Vec3, Node } from "cc";

const { ccclass, property, requireComponent } = _decorator;

const vec3Temp1 = new Vec3();

@ccclass('UIBind3DNode')
@requireComponent(UITransform)
export class UIBind3DNode extends Component {
    @property(Node)
    public target: Node = null;
    @property
    public readonly offset = new Vec3();
    @property(Camera)
    public camera: Camera = null;

    onEnable(): void {
        if (this.camera == null)
            this.camera = Camera.mainCamera;
    }

    update(): void {
        if (this.target == null) return;
        this.node.position = this.camera.convertToUINode(this.target.worldPosition, this.node.parent, vec3Temp1).add(this.offset);
    }
}