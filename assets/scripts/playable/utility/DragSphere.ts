
import { Enum, EventHandler } from 'cc';
import { Camera, Component, EventTouch, geometry, Input, input, Node, Vec2, Vec3, _decorator } from 'cc';
const { ccclass, property } = _decorator;

const vec2Temp = new Vec2();
const vec3Temp1 = new Vec3();
const vec3Temp2 = new Vec3();
const rayTemp = new geometry.Ray();
const sphereTemp = new geometry.Sphere();

enum LockAxisType {
    None = 0,
    X = 1 << 1,
    Y = 1 << 2,
    Z = 1 << 4,
    XY = X | Y,
    XZ = X | Z,
    YZ = Y | Z,
}

@ccclass('DragSphere')
export class DragSphere extends Component {
    @property(Camera)
    readonly mainCamera: Camera = null;
    @property([Node])
    readonly sphereNodes: Node[] = [];
    @property
    readonly sphereRadius: number = 0.5;
    @property(EventHandler)
    readonly dragEvents: EventHandler[] = [];
    @property({ type: Enum(LockAxisType) })
    readonly lockAxis: LockAxisType = LockAxisType.None;

    protected dragNode: Node = null;
    private touchId: number = null;

    onEnable(): void {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onDisable(): void {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    protected onTouchStart(event: EventTouch): void {
        if (this.touchId != null) return;
        this.touchId = event.touch.getID();

        this.dragNode = this.raycastModel(event);
    }

    protected onTouchMove(event: EventTouch): void {
        if (this.touchId != event.touch.getID()) return;
        if (this.dragNode == null) return;

        let curLocation = event.getLocation(vec2Temp);
        let direction = Vec3.subtract(vec3Temp1, this.dragNode.worldPosition, this.mainCamera.node.worldPosition);
        let length = Vec3.dot(direction, this.mainCamera.node.forward);
        let zRate = (length - this.mainCamera.near) / (this.mainCamera.far - this.mainCamera.near);
        let position = this.mainCamera.screenToWorld(vec3Temp1.set(curLocation.x, curLocation.y, zRate), vec3Temp2);
        if (this.lockAxis & LockAxisType.X)
            position.x = 0;
        if (this.lockAxis & LockAxisType.Y)
            position.y = 0;
        if (this.lockAxis & LockAxisType.Z)
            position.z = 0;
        this.dragNode.worldPosition = position;
        EventHandler.emitEvents(this.dragEvents, this.dragNode);
    }

    protected onTouchEnd(event: EventTouch): void {
        if (this.touchId != event.touch.getID()) return;
        this.touchId = null;
    }

    protected raycastModel(event: EventTouch): Node {
        let location = event.getLocation(vec2Temp);
        let ray = this.mainCamera.screenPointToRay(location.x, location.y, rayTemp);

        sphereTemp.radius = this.sphereRadius;
        for (let node of this.sphereNodes) {
            sphereTemp.center = node.worldPosition;
            let result = geometry.intersect.raySphere(ray, sphereTemp);
            if (result != 0) return node;
        }
    }
}