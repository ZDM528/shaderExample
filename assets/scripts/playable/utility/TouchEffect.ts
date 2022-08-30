import { Component, EventTouch, instantiate, Node, ParticleSystem2D, Prefab, UITransform, Vec3, _decorator } from "cc";

const { ccclass, property } = _decorator;

@ccclass('TouchEffect')
export class TouchEffect extends Component {
    @property(Prefab)
    readonly clickEffect: Prefab = null;

    private tempV3 = new Vec3();

    onEnable(): void {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    onDisable(): void {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    private onTouchStart(event: EventTouch): void {
        let location = event.getUILocation();
        let worldPosition = this.tempV3.set(location.x, location.y);
        let effect = instantiate(this.clickEffect);
        effect.setParent(this.node, false);
        effect.position = this.node.getComponent(UITransform).convertToNodeSpaceAR(worldPosition, this.tempV3);
    }
}