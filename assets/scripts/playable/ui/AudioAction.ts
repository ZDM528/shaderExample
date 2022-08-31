import { Button, Component, Enum, Node, _decorator } from "cc";
import { audioManager } from "../core/AudioManager";

enum InteractType {
    ButtonClick,
    Press,
    Release,
}

const { ccclass, property, menu, disallowMultiple } = _decorator;

@ccclass('AudioAction')
@disallowMultiple
@menu("UI/AudioAction")
export class AudioAction extends Component {
    @property({ type: Enum(InteractType) })
    readonly interactType: InteractType = InteractType.ButtonClick;
    @property
    readonly audioName: string = "";

    onEnable(): void {
        switch (this.interactType) {
            case InteractType.ButtonClick:
                this.getComponent(Button).node.on(Button.EventType.CLICK, this.onInteract, this);
                break;
            case InteractType.Press:
                this.node.on(Node.EventType.TOUCH_START, this.onInteract, this);
                break;
            case InteractType.Release:
                this.node.on(Node.EventType.TOUCH_END, this.onInteract, this);
                break;
        }
    }

    onDisable(): void {
        switch (this.interactType) {
            case InteractType.ButtonClick:
                this.getComponent(Button).node.off(Button.EventType.CLICK, this.onInteract, this);
                break;
            case InteractType.Press:
                this.node.off(Node.EventType.TOUCH_START, this.onInteract, this);
                break;
            case InteractType.Release:
                this.node.off(Node.EventType.TOUCH_END, this.onInteract, this);
                break;
        }
    }

    private onInteract(): void {
        audioManager.playEffect(this.audioName);
    }
}