import { Component, EventTouch, Node, _decorator } from "cc";
import ActionEvent from "./ActionEvent";

const { ccclass, property } = _decorator;

@ccclass('TouchController')
export class TouchController extends Component {
    public readonly touchStart = new ActionEvent<EventTouch>();
    public readonly touchMove = new ActionEvent<EventTouch>();
    public readonly touchEnd = new ActionEvent<EventTouch>();

    private touchId: number;

    onEnable(): void {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    onDisable(): void {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    private onTouchStart(event: EventTouch): void {
        if (this.touchId != null) return;
        this.touchId = event.getID();
        this.touchStart.dispatchAction(event);
    }

    private onTouchEnd(event: EventTouch): void {
        if (this.touchId != event.getID()) return;
        this.touchId = null;
        this.touchEnd.dispatchAction(event);
    }

    private onTouchMove(event: EventTouch): void {
        if (this.touchId != event.getID()) return;
        this.touchMove.dispatchAction(event);
    }
}