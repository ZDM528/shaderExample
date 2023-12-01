import { _decorator, Component, EventTouch, Material, Node, Vec2 } from 'cc';
import { OrbitFollowTarget } from '../../scripts/playable/utility/OrbitFollowTarget';
import { Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RoadDemo')
export class RoadDemo extends Component {

    @property(Node)
    private readonly operationPanel: Node;

    @property(Node)
    private readonly player: Node;

    @property(OrbitFollowTarget)
    private readonly orbitFollow: OrbitFollowTarget;

    @property(Material)
    private readonly roadMaterial: Material;

    @property(Material)
    private readonly borderMaterial: Material;


    speed: number = 7;
    canMove: boolean = false;
    start() {
        this.operationPanel.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.operationPanel.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.operationPanel.on(Node.EventType.TOUCH_END, this.touchEnd, this);

    }

    touchStart(e: EventTouch) {
        this.canMove = true;
    }

    touchMove(e: EventTouch) {
        const delatX = e.getDeltaX();
        let tempPos = new Vec3(this.player.position);
        tempPos.x += -delatX * 0.01;
        tempPos.x = Math.minmax(-0.5, 0.5, tempPos.x);
        this.player.position = tempPos;
    }

    touchEnd() {
        this.canMove = false;
    }

    update(deltaTime: number) {
        if (this.canMove) {
            let tempPos = new Vec3(this.player.position);
            tempPos.z += deltaTime * this.speed;
            this.player.position = tempPos;
            if (tempPos.z > 90) {
                tempPos.z = 0;
                this.orbitFollow.forceSettle();
            }
        }
    }
}
// https://forum.cocos.org/t/cocos-creator-3d/87689