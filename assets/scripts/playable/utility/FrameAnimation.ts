import { Component, Sprite, SpriteFrame, _decorator, Animation, AnimationClip, SpriteAtlas, Enum, resources } from "cc";

const { ccclass, property, requireComponent } = _decorator;

@ccclass("FrameAnimationData")
class FrameAnimationData {
    @property
    readonly animationName: string = "";
    @property
    readonly frameAtlasPath: string = "";
    @property
    readonly sample: number = 10;
    @property({ type: Enum(AnimationClip.WrapMode) })
    readonly wrapMode = AnimationClip.WrapMode.Normal;
}

@ccclass('FrameAnimation')
@requireComponent(Sprite)
export class FrameAnimation extends Component {
    @property([FrameAnimationData])
    readonly frameAnimationData: FrameAnimationData[] = [];
    @property
    readonly awakePlayIndex: number = -1;

    private animation: Animation;
    async onLoad() {
        this.animation = this.getOrAddComponent(Animation);
        for (let data of this.frameAnimationData) {
            let atlas = await new Promise<SpriteAtlas>(resolve => resources.load(data.frameAtlasPath, SpriteAtlas, (error, asset) => resolve(asset)));
            let spriteFrames: SpriteFrame[];
            if (atlas == null)
                spriteFrames = await new Promise<SpriteFrame[]>(resolve => resources.loadDir(data.frameAtlasPath, SpriteFrame, (error, asset) => resolve(asset)));
            else
                spriteFrames = atlas.getSpriteFrames();
            let clip = AnimationClip.createWithSpriteFrames(spriteFrames, data.sample);
            let state = this.animation.createState(clip, data.animationName);
            state.wrapMode = data.wrapMode;
        }

        if (this.awakePlayIndex != -1)
            this.play(this.frameAnimationData[0].animationName);
    }

    public play(animationName: string, onCompleted?: () => void, thisArg?: any): void {
        this.animation.play(animationName);
        if (onCompleted) this.animation.once(Animation.EventType.STOP, onCompleted, thisArg);
    }
}