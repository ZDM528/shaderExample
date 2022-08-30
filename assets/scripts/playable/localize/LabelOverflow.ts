import { Component, Enum, Label, UITransform, _decorator, Node, CCInteger } from "cc";
import LocalizeLabel from "./LocalizeLabel";

const { ccclass, requireComponent, menu, property } = _decorator;
@ccclass
@requireComponent(Label)
@requireComponent(LocalizeLabel)
@menu("UI/LabelOverflow")
export default class LabelOverflow extends Component {
    @property({ type: CCInteger })
    private maxWidth: number = 100;
    @property({ type: CCInteger })
    private maxHeight: number = 100;
    @property({ type: Enum(Label.Overflow) })
    private overflow = Label.Overflow.NONE;

    onLoad(): void {
        let label = this.getComponent(Label);
        let localizeLabel = this.getComponent(LocalizeLabel);

        let setLabelText: Function = localizeLabel["onSetLabelText"];
        localizeLabel["onSetLabelText"] = (text) => {
            label.overflow = Label.Overflow.NONE;
            setLabelText.call(localizeLabel, text);
        }

        let uitransfrom = this.node.getComponent(UITransform);
        this.node.on(Node.EventType.SIZE_CHANGED, () => {
            if (uitransfrom.width <= this.maxWidth || label.overflow != Label.Overflow.NONE) return;
            uitransfrom.setContentSize(this.maxWidth, this.maxHeight);
            label.overflow = this.overflow;
            label["setVertsDirty"]();
        }, this);
    }
}