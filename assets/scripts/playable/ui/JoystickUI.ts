import { assert, Component, Enum, EventHandler, EventTouch, IVec2, Node, UITransform, Vec2, Vec3, Widget, _decorator } from "cc";

const vec2Temp1 = new Vec2()
const vec3Temp1 = new Vec3();

const { ccclass, property, menu } = _decorator;

export enum EventType {
    /**
     * @param {IVec2} joystickValue - The joystickValue for JoystickUI.
     * @param {JoystickUI} joystickUI - The JoystickUI component.
     */
    Start = "JoystickStart",
    /**
     * @param {IVec2} joystickValue - The joystickValue for JoystickUI.
     * @param {JoystickUI} joystickUI - The JoystickUI component.
     */
    Move = "JoystickMove",
    /**
     * @param {IVec2} joystickValue - The joystickValue for JoystickUI.
     * @param {number} deltaTime - frame delta time.
     * @param {JoystickUI} joystickUI - The JoystickUI component.
     */
    UpdateMove = "JoystickUpdateMove",
    /**
     * @param {IVec2} joystickValue - The joystickValue for JoystickUI.
     * @param {JoystickUI} joystickUI - The JoystickUI component.
     */
    Stop = "JoystickStop",
}

export enum JoystickCenterType {
    Inside,
    Cross,
    Outside,
}

export enum JoyStickControlType {
    Fixed,
    Touch,
    TouchFade,
    TouchBack,
}

export enum JoyStickFrozenType {
    None,
    Horizontal,
    Vertical,
}

@ccclass
@menu("UI/JoystickUI")
export default class JoystickUI extends Component {
    public static readonly EventType = EventType;

    @property(UITransform)
    readonly controlPanel: UITransform = null;
    @property(UITransform)
    readonly center: UITransform = null;
    @property({ type: Enum(JoyStickControlType) })
    controlType: JoyStickControlType = JoyStickControlType.Fixed;
    @property({ type: Enum(JoystickCenterType) })
    centerType: JoystickCenterType = JoystickCenterType.Cross;
    @property({ type: Enum(JoyStickFrozenType) })
    frozenType: JoyStickFrozenType = JoyStickFrozenType.None;

    @property(EventHandler)
    readonly startEvents: EventHandler[] = [];
    @property(EventHandler)
    readonly moveEvents: EventHandler[] = [];
    @property(EventHandler)
    readonly updateMoveEvents: EventHandler[] = [];
    @property(EventHandler)
    readonly stopEvents: EventHandler[] = [];

    protected transform: UITransform;
    protected initPosition: Vec3;
    private touchId: number;

    private _joystickValue: Vec2 = new Vec2();
    public get joystickValue() { return this._joystickValue; }
    public get joystickDistance() {
        let distance = this.controlPanel.width * 0.5;
        switch (this.centerType) {
            case JoystickCenterType.Inside:
                distance -= this.center.width * 0.5;
                break;
            case JoystickCenterType.Cross:
                break; // nothing
            case JoystickCenterType.Outside:
                distance += this.center.width * 0.5;
                break;
        }
        return distance;
    }

    onEnable(): void {
        this.transform = this.node.getComponent(UITransform);
        this.node.on(Node.EventType.TOUCH_START, this.onJoystickStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onJoystickMoving, this);
        this.node.on(Node.EventType.TOUCH_END, this.onJoystickStop, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onJoystickStop, this);
        assert(this.controlPanel.node.parent == this.node);

        switch (this.controlType) {
            case JoyStickControlType.TouchFade:
                this.controlPanel.node.active = false;
            case JoyStickControlType.TouchBack:
                this.initPosition = this.controlPanel.node.position.clone();
                break;
        }
    }

    onDisable(): void {
        this.onJoystickStop({ touch: { getID: () => { return this.touchId ?? 0 } } } as EventTouch);
        this.node.off(Node.EventType.TOUCH_START, this.onJoystickStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onJoystickMoving, this);
        this.node.off(Node.EventType.TOUCH_END, this.onJoystickStop, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onJoystickStop, this);
    }

    update(deltaTime: number): void {
        if (this.touchId != null) {
            if(this.joystickValue.x != 0 && this.joystickValue.y != 0) {
                EventHandler.emitEvents(this.updateMoveEvents, this.joystickValue, deltaTime);
                this.node.emit(EventType.UpdateMove, this.joystickValue, deltaTime, this);
            }
        }
    }

    private onJoystickStart(event: EventTouch) {
        if (this.touchId != null) return;
        this.touchId = event.touch.getID();

        let uiPoint = event.getUILocation();
        let position = this.transform.convertToNodeSpaceAR(vec3Temp1.set(uiPoint.x, uiPoint.y, 0), vec3Temp1);

        switch (this.controlType) {
            case JoyStickControlType.Fixed:
                break;
            case JoyStickControlType.TouchFade:
                this.controlPanel.node.active = true;
            case JoyStickControlType.Touch:
            case JoyStickControlType.TouchBack:
                this.controlPanel.node.position = position;
                break;
        }
        this.updateJoystickValue(position);
        EventHandler.emitEvents(this.startEvents, this.joystickValue);
        this.node.emit(EventType.Start, this.joystickValue, this);
    }

    private onJoystickMoving(event: EventTouch) {
        if (this.touchId != event.touch.getID()) return;
        let uiPoint = event.getUILocation();
        let position = this.transform.convertToNodeSpaceAR(vec3Temp1.set(uiPoint.x, uiPoint.y, 0), vec3Temp1);
        this.updateJoystickValue(position);
        EventHandler.emitEvents(this.moveEvents, this.joystickValue);
        this.node.emit(EventType.Move, this.joystickValue, this);
    }

    private onJoystickStop(event: EventTouch) {
        if (this.touchId != event.touch.getID()) return;
        this.touchId = null;

        switch (this.controlType) {
            case JoyStickControlType.TouchFade:
                this.controlPanel.node.active = false;
            case JoyStickControlType.TouchBack:
                let widget = this.controlPanel.getComponent(Widget);
                if (widget != null)
                    widget.updateAlignment();
                else
                    this.controlPanel.node.position = this.initPosition;
                break;
        }

        this.joystickValue.set(Vec2.ZERO);
        this.updateCenterPosition();
        EventHandler.emitEvents(this.stopEvents, this.joystickValue);
        this.node.emit(EventType.Stop, this.joystickValue, this);
    }

    private updateJoystickValue(position: Vec3): void {
        let offset = position.subtract(this.controlPanel.node.position);
        offset.z = 0;
        switch (this.frozenType) {
            case JoyStickFrozenType.Horizontal:
                offset.x = 0;
                break;
            case JoyStickFrozenType.Vertical:
                offset.y = 0;
                break;
        }
        this._joystickValue = JoystickUI.calcuateJoystickValue(this.joystickValue.set(offset.x, offset.y), this.joystickDistance);
        this.updateCenterPosition();
    }

    private updateCenterPosition(): void {
        let position = Vec2.multiplyScalar(vec2Temp1, this.joystickValue, this.joystickDistance);
        this.center.node.position = vec3Temp1.set(position.x, position.y, 0);
    }

    private static calcuateJoystickValue(direction: Vec2, joystickDistance: number): Vec2 {
        let touchRadius = direction.length();
        if (touchRadius == 0) return direction;
        return direction.multiplyScalar(Math.min(1, touchRadius / joystickDistance) / touchRadius);
    }
}