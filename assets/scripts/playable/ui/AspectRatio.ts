import { CCObject, Component, Enum, Node, Sprite, UITransform, _decorator } from "cc";
import { EDITOR } from "cc/env";

const { ccclass, property, requireComponent, executeInEditMode, disallowMultiple, menu } = _decorator;

enum AspectRatioType {
    FitOut,
    FitIn,
    FitWidth,
    FitHeight,
}

@ccclass('AspectRatio')
@requireComponent(Sprite)
@executeInEditMode
@disallowMultiple
@menu("UI/AspectRatio")
export class AspectRatio extends Component {
    @property
    private _type: AspectRatioType = AspectRatioType.FitOut;
    @property({ type: Enum(AspectRatioType) })
    get type(): AspectRatioType { return this._type; };
    set type(value) { this._type = value; this.updateAspectRatio(); }

    private sprite: Sprite;

    onLoad(): void {
        if (EDITOR) this._objFlags |= CCObject.Flags.IsSizeLocked;
        this.sprite = this.getComponent(Sprite);
        this.sprite.node.on(Sprite.EventType.SPRITE_FRAME_CHANGED, this.updateAspectRatio, this);
        this.node.parent.on(Node.EventType.SIZE_CHANGED, this.updateAspectRatio, this);
        this.updateAspectRatio();
    }

    onDestroy(): void {
        this.sprite.node?.off(Sprite.EventType.SPRITE_FRAME_CHANGED, this.updateAspectRatio, this);
        this.node.parent.off(Node.EventType.SIZE_CHANGED, this.updateAspectRatio, this);
    }

    public updateAspectRatio(): void {
        let parentTransform = this.node.parent?.getComponent(UITransform);
        if (parentTransform == null) return;
        let spriteFrame = this.sprite.spriteFrame;
        if (spriteFrame == null) return;
        let transform = this.getComponent(UITransform);
        switch (this.type) {
            case AspectRatioType.FitOut: {
                let ratio = Math.max(parentTransform.width / spriteFrame.width, parentTransform.height / spriteFrame.height);
                transform.width = spriteFrame.width * ratio;
                transform.height = spriteFrame.height * ratio;
                break;
            }
            case AspectRatioType.FitIn: {
                let ratio = Math.min(parentTransform.width / spriteFrame.width, parentTransform.height / spriteFrame.height);
                transform.width = spriteFrame.width * ratio;
                transform.height = spriteFrame.height * ratio;
                break;
            }
            case AspectRatioType.FitWidth: {
                let ratio = parentTransform.width / spriteFrame.width;
                transform.width = spriteFrame.width * ratio;
                transform.height = spriteFrame.height * ratio;
                break;
            }
            case AspectRatioType.FitHeight: {
                let ratio = parentTransform.height / spriteFrame.height;
                transform.width = spriteFrame.width * ratio;
                transform.height = spriteFrame.height * ratio;
                break;
            }
        }
    }
}