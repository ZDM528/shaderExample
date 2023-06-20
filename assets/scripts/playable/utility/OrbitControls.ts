import { BitMask, Camera, Component, EventMouse, EventTouch, Input, Mat4, Vec3, _decorator, input, screen, sys } from 'cc';
import { OrbitFollowTarget } from './OrbitFollowTarget';
const { ccclass, requireComponent, property } = _decorator;

const __vec3Temp1 = new Vec3();

enum MouseMoveKey {
    None = 0,
    Left = 1 << 0,
    Right = 1 << 2,
    Middle = 1 << 3,
}

@ccclass('OrbitControls')
@requireComponent([Camera, OrbitFollowTarget])
export default class OrbitControls extends Component {
    @property({ group: { name: "polar", id: "1" }, slide: true, range: [0, 180, 1], displayName: "最小极角", tooltip: "极角，与Y轴之间的夹角" })
    polarMinAngle: number = 0;
    @property({ group: { name: "polar", id: "1" }, slide: true, range: [0, 180, 1], displayName: "最大极角", tooltip: "极角，与Y轴之间的夹角" })
    polarMaxAngle: number = 180;
    @property({ group: { name: "polar", id: "1" }, slide: true, range: [0, 1, 0.01], displayName: "转动速率" })
    polarAngleRate: number = 1;

    @property({ group: { name: "azimuth", id: "2" }, slide: true, range: [-360, 360, 1], displayName: "最小方位角", tooltip: "方位角度，基于XZ平面的Y轴旋转" })
    azimuthMinAngle: number = -360;
    @property({ group: { name: "azimuth", id: "2" }, slide: true, range: [-360, 360, 1], displayName: "最大方位角", tooltip: "方位角度，基于XZ平面的Y轴旋转" })
    azimuthMaxAngle: number = 360;
    @property({ group: { name: "azimuth", id: "2" }, slide: true, range: [0, 1, 0.01], displayName: "转动速率" })
    azimuthAngleRate: number = 1;

    @property({ group: { name: "radialDistance", id: "3" }, slide: true, min: 0, displayName: "最小径向距离", tooltip: "球面半径，可以理解为与目标的距离" })
    radialMinDistance: number = 1;
    @property({ group: { name: "radialDistance", id: "3" }, slide: true, min: 0, displayName: "最大径向距离", tooltip: "球面半径，可以理解为与目标的距离" })
    radialMaxDistance: number = 1000;
    @property({ group: { name: "radialDistance", id: "3" }, slide: true, range: [0, 1, 0.01], displayName: "滚动速率" })
    public radialDistanceRate: number = 0.5;

    // @property({ group: { name: "rotate", id: "4" }, slide: true, range: [0, 1, 0.01], displayName: "源点转动速率" })
    rotateAngleRate: number = 1;

    @property({ type: BitMask(MouseMoveKey) })
    readonly disableButtonKeys: MouseMoveKey = MouseMoveKey.None;

    private _target: Vec3;
    private readonly orbitPosition: Vec3 = new Vec3();
    private readonly pan = new Vec3();

    private buttonPressing: number = 0;
    private camera: Camera = null;
    private orbitFollow: OrbitFollowTarget;

    onLoad(): void {
        this.orbitFollow = this.getComponent(OrbitFollowTarget);
        this.camera = this.getComponent(Camera);
    }

    onEnable(): void {
        if (sys.isMobile) {
            input.on(Input.EventType.TOUCH_START, this.onMouseDown, this);
            input.on(Input.EventType.TOUCH_MOVE, this.onMouseMove, this);
            input.on(Input.EventType.TOUCH_END, this.onMouseUp, this);
            input.on(Input.EventType.TOUCH_CANCEL, this.onMouseUp, this);
        } else {
            input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
            input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
            input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
            input.on(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
        }

        this.updateTarget();
    }

    onDisable(): void {
        if (sys.isMobile) {
            input.off(Input.EventType.TOUCH_START, this.onMouseDown, this);
            input.off(Input.EventType.TOUCH_MOVE, this.onMouseMove, this);
            input.off(Input.EventType.TOUCH_END, this.onMouseUp, this);
            input.off(Input.EventType.TOUCH_CANCEL, this.onMouseUp, this);
        } else {
            input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
            input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
            input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
            input.off(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
        }
    }

    private getButton(event: EventMouse | EventTouch): number {
        return event instanceof EventMouse ? event.getButton() : 0;
    }

    private onMouseDown(event: EventMouse | EventTouch): void {
        if (this.buttonPressing != 0) return;
        let buttonMask = 1 << this.getButton(event);
        this.buttonPressing |= buttonMask;
    }

    private onMouseMove(event: EventMouse | EventTouch): void {
        if (this.buttonPressing == 0) return;
        let buttonMask = 1 << this.getButton(event);
        if ((this.buttonPressing & buttonMask) == 0) return;

        if (this.buttonPressing & (1 << EventMouse.BUTTON_MIDDLE)) {
            if ((this.disableButtonKeys & MouseMoveKey.Middle) == 0) this.panOffset(event.getDeltaX(), event.getDeltaY());
        } else if (this.buttonPressing & (1 << EventMouse.BUTTON_LEFT)) {
            // if ((this.disableButtonKeys & MouseMoveKey.Left) ==0) this.rotateOrigin(event.getDeltaX(), event.getDeltaY());
        } else if (this.buttonPressing & (1 << EventMouse.BUTTON_RIGHT)) {
            if ((this.disableButtonKeys & MouseMoveKey.Right) == 0) {
                this.azimuthOffset(event.getDeltaX());
                this.polarOffset(-event.getDeltaY());
            }
        }
    }

    private onMouseUp(event: EventMouse | EventTouch): void {
        let buttonMask = 1 << this.getButton(event);
        if ((this.buttonPressing & buttonMask) == 0) return;
        this.buttonPressing = 0;
    }

    private onMouseWheel(event: EventMouse): void {
        this.radiusOffset(event.getScrollY());
    }

    public getTargetPosition(): Readonly<Vec3> {
        return this._target;
        // return this._target instanceof Node ? this._target.worldPosition : this._target as Vec3;
    }

    public setTarget(v: Vec3): void {
        console.assert(v != null);
        this._target = v.clone();
        // this._target = v instanceof Vec3 ? v.clone() : v;
        this.orbitPosition.set(this.getTargetPosition());
        this.pan.set(0, 0, 0);
    }

    public updateTarget(): void {
        this.setTarget(this.orbitFollow.lookatPosition);
        this.orbitFollow.target = this.orbitPosition;
    }

    public rotateOrigin(deltaX: number, deltaY: number): void {
        const dx = this.rotateAngleRate * deltaX * 0.25;
        const dy = this.rotateAngleRate * deltaY * 0.25;
        this.setTarget(this.orbitFollow.lookatPosition);

        const eulerAngles: Vec3 = this.orbitFollow.node.eulerAngles;
        eulerAngles.x += dy;
        eulerAngles.y += dx;
        this.orbitFollow.computeLookatPosition();
    }

    public panOffset(deltaX: number, deltaY: number): void {
        const panLeft = (distance: number, matrix: Mat4) => {
            const v = __vec3Temp1.set(matrix.m00, matrix.m01, matrix.m02);
            v.multiplyScalar(-distance);
            this.pan.add(v);
            this.orbitPosition.set(this.getTargetPosition()).add(this.pan);
        };
        const panUp = (distance: number, matrix: Mat4) => {
            const v = __vec3Temp1.set(matrix.m04, matrix.m05, matrix.m06);
            v.multiplyScalar(-distance);
            this.pan.add(v);
            this.orbitPosition.set(this.getTargetPosition()).add(this.pan);
        };

        const worldMatrix = this.node.worldMatrix;
        const windowSize = screen.windowSize;
        switch (this.camera.projection) {
            case Camera.ProjectionType.PERSPECTIVE: {
                const offset = Vec3.subtract(__vec3Temp1, this.getTargetPosition(), this.node.worldPosition);
                const targetDistance = offset.length() * Math.tan(this.camera.fov / 2 * Math.DEGREE_TO_RADIAN);

                panLeft(2 * deltaX * targetDistance / windowSize.height, worldMatrix);
                panUp(2 * deltaY * targetDistance / windowSize.height, worldMatrix);
            } break;
            case Camera.ProjectionType.ORTHO: {
                panLeft(deltaX * this.camera.orthoHeight / windowSize.width, worldMatrix);
                panUp(deltaY * this.camera.orthoHeight / this.camera.camera.aspect / windowSize.height, worldMatrix);
            } break;
        }
    }

    public azimuthOffset(deltaX: number): void {
        const dv = this.azimuthAngleRate * deltaX * 0.25;
        this.orbitFollow.azimuthAngle = Math.minmax(this.azimuthMinAngle, this.azimuthMaxAngle, this.orbitFollow.azimuthAngle - dv);
    }

    public polarOffset(deltaY: number): void {
        const dv = this.polarAngleRate * deltaY * 0.25;
        this.orbitFollow.polarAngle = Math.minmax(this.polarMinAngle, this.polarMaxAngle, this.orbitFollow.polarAngle - dv);
    }

    public radiusOffset(delta: number): void {
        const dv = this.radialDistanceRate * delta * 0.01;
        this.orbitFollow.radialDistance = Math.minmax(this.radialMinDistance, this.radialMaxDistance, this.orbitFollow.radialDistance - dv);
    }
}