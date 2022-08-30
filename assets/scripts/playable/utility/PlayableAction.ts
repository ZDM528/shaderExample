import { _decorator, Component, Node, Button, Enum, CCInteger } from "cc";
import { playable } from "../core/Playable";

const { ccclass, property } = _decorator;

enum EventType {
    DOWN,
    UP,
    MOVE,
    CLICK,
}

enum TriggerType {
    Once,
    Always,
}

@ccclass('PlayableAction')
export class PlayableAction extends Component {
    @property({ type: CCInteger, min: 0 })
    readonly action: number = 0;
    @property({ type: Enum(EventType) })
    readonly eventType: EventType = EventType.CLICK;
    @property({ type: Enum(TriggerType) })
    readonly triggerType: TriggerType = TriggerType.Once;

    onEnable(): void {
        switch (this.eventType) {
            case EventType.DOWN:
                this.addEvent(Node.EventType.TOUCH_START);
                break;
            case EventType.UP:
                this.addEvent(Node.EventType.TOUCH_END);
                break;
            case EventType.MOVE:
                this.addEvent(Node.EventType.TOUCH_MOVE);
                break;
            case EventType.CLICK:
                this.addEvent(Button.EventType.CLICK);
                break;
        }
    }

    private addEvent(type: string): void {
        switch (this.triggerType) {
            case TriggerType.Once:
                this.node.once(type, this.sendAction, this);
                break;
            case TriggerType.Always:
                this.node.on(type, this.sendAction, this);
                break;
        }
    }

    public sendAction(): void {
        playable.sendAction(this.action)
    }
}