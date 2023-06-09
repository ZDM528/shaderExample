import { _decorator, Component, EventTouch, Material, Node, Vec3, Vec4 } from 'cc';
const { ccclass, property } = _decorator;


const __tempVec3 = new Vec3();
const __tempVec31 = new Vec3();


@ccclass('planeTest')
export class planeTest extends Component {

    @property(Node)
    readonly operartePanel: Node;

    @property(Node)
    readonly role: Node;

    @property(Material)
    readonly material: Material;


    velocity: Vec3 = new Vec3();
    speed: number = 10;
    posArr: Vec4[] = [];
    width: number;
    height: number;

    start() {
        this.operartePanel.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.operartePanel.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.operartePanel.on(Node.EventType.TOUCH_END, this.touchEnd, this);
    }

    touchStart() {

    }

    touchMove(e: EventTouch) {
        const startLocation = e.getUIStartLocation();
        const curLocation = e.getUILocation();
        const direction = curLocation.subtract(startLocation);
        this.velocity = __tempVec3.set(direction.x, 0.5, -direction.y).normalize();
    }

    touchEnd() {
        this.velocity.set(0, 0, 0);
    }

    update(deltaTime: number) {
        if (this.velocity.x !== 0 || this.velocity.z !== 0) {
            const delatXY = Vec3.multiplyScalar(__tempVec31, this.velocity, this.speed * deltaTime);
            this.role.forward = this.velocity.clone().negative();
            this.role.position = this.role.position.add(delatXY);
            this.material.setProperty("worldPosC", new Vec4(this.role.position.x,this.role.position.y,this.role.position.z,1.0));
        }
    }
}

