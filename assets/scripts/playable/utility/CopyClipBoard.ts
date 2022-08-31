import { Button, CCString, Component, Label, UIOpacity, Vec3, _decorator } from "cc";
import { playable } from "../core/Playable";
import LocalizeManager from "../localize/LocalizeManager";
import { XTween } from "../xtween/XTween";

const { ccclass, property, requireComponent } = _decorator;
@ccclass("CopyClipBoard")
@requireComponent(Button)
export default class CopyClipBoard extends Component {
    @property(Label)
    readonly promptLabel: Label = null;
    @property
    readonly promptOffsetY: number = 200;
    @property(CCString)
    readonly codeKey: string = "code";

    private startPosition: Vec3 = new Vec3();
    private targetPosition: Vec3 = new Vec3();

    onEnable(): void {
        this.node.on(Button.EventType.CLICK, this.copyToClipBoard, this);
        this.promptLabel.node.active = false;
        this.startPosition.set(this.promptLabel.node.position);
        this.targetPosition.set(this.startPosition);
        this.targetPosition.y += this.promptOffsetY;
    }

    onDisable(): void {
        this.node.off(Button.EventType.CLICK, this.copyToClipBoard, this);
    }

    public copyToClipBoard(): void {
        let data = LocalizeManager.getCurLocalizeValue(this.codeKey);
        let result = playable.copyToClipBoard(data.value);

        if (result && this.promptLabel != null) {
            XTween.removeTagTweens(this.promptLabel.node);
            let uiOpacity = this.promptLabel.getOrAddComponent(UIOpacity);
            uiOpacity.opacity = 255;
            this.promptLabel.node.active = true;
            this.promptLabel.node.position = this.startPosition;
            const duration = 1;
            XTween.to(this.promptLabel.node, duration, { position: this.targetPosition, alpha: 0 }, { easing: "quinticIn" }).set({ active: false }).play();
        }
    }
}