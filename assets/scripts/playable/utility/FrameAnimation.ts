import { Component, Sprite, SpriteFrame, _decorator, Animation, AnimationClip, SpriteAtlas, Enum, resources, UITransform } from "cc";

const { ccclass, property } = _decorator;

@ccclass("FrameAnimationData")
class FrameAnimationData {
    @property
    readonly animationName: string = "";
    @property([SpriteFrame])
    readonly spriteFrames: SpriteFrame[] = [];
    @property({ tooltip: "动画帧率，单位为帧/秒。注意此属性仅用于编辑器动画编辑。" })
    readonly sample: number = 10;
    @property({ type: Enum(AnimationClip.WrapMode) })
    readonly wrapMode = AnimationClip.WrapMode.Normal;
}

@ccclass('FrameAnimation')
export class FrameAnimation extends Component {
    @property([FrameAnimationData])
    readonly frameAnimationData: FrameAnimationData[] = [];
    @property
    readonly awakePlayIndex: number = -1;
    @property({ tooltip: "是否在所有动画最后增加一个空白帧。" })
    readonly hasEndEmptyFrame: boolean = true;

    private animation: Animation;
    onLoad() {
        this.initialize();
    }

    private initialize(): void {
        let sprite = this.getOrAddComponent(Sprite);
        sprite.sizeMode = Sprite.SizeMode.RAW;
        sprite.trim = false;
        let uitransform = sprite.getComponent(UITransform);

        this.animation = this.getOrAddComponent(Animation);
        for (let data of this.frameAnimationData) {
            // let atlas = await new Promise<SpriteAtlas>(resolve => resources.load(data.frameAtlasPath, SpriteAtlas, (error, asset) => resolve(asset)));
            let spriteFrames: SpriteFrame[] = data.spriteFrames;
            if (spriteFrames.length > 0) {
                uitransform.setContentSize(spriteFrames[0].width, spriteFrames[1].height);
                if (this.hasEndEmptyFrame)
                    spriteFrames.push(new SpriteFrame());
            }
            let clip = AnimationClip.createWithSpriteFrames(spriteFrames, data.sample);
            clip.name = data.animationName;
            let state = this.animation.createState(clip, data.animationName);
            state.wrapMode = data.wrapMode;
        }

        if (this.awakePlayIndex != -1)
            this.play(this.frameAnimationData[0].animationName);
    }

    public play(animationName?: string, onCompleted?: () => void, thisArg?: any): void {
        this.animation.play(animationName);
        if (onCompleted) this.animation.once(Animation.EventType.STOP, onCompleted, thisArg);
    }
}