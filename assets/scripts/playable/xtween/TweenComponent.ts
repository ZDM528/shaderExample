import { Component, Enum, Vec2, _decorator } from "cc";
import { EasingFunction } from "./CustomEase/CustomEase";
import SvgPathEase from "./CustomEase/SvgPathEase";
import { XTween } from "./XTween";

const { ccclass, property } = _decorator;

enum TweenWay {
    To,
    By,
}

enum TweenEase {
    linear,
    quadraticIn,
    quadraticOut,
    quadraticInOut,
    cubicIn,
    cubicOut,
    cubicInOut,
    quarticIn,
    quarticOut,
    quarticInOut,
    quinticIn,
    quinticOut,
    quinticInOut,
    sinusoidalIn,
    sinusoidalOut,
    sinusoidalInOut,
    exponentialIn,
    exponentialOut,
    exponentialInOut,
    circularIn,
    circularOut,
    circularInOut,
    elasticIn,
    elasticOut,
    elasticInOut,
    backIn,
    backOut,
    backInOut,
    bounceIn,
    bounceOut,
    bounceInOut,
    svgPath,
}

export abstract class TweenComponent extends Component {
    @property
    readonly duration: number = 1;
    @property({ group: "Start" })
    readonly startDelay: Vec2 = new Vec2();
    @property({ group: "Start" })
    readonly playOnLoad: boolean = true;

    @property({ group: "Repeat", tooltip: "重复次数，-1为无限重复，0为不重复，>0为自定义重复次数" })
    readonly repeatCount: number = 1;
    @property({ group: "Repeat" })
    readonly repeatDelay: Vec2 = new Vec2();
    @property({ group: "Repeat" })
    readonly pingPong: boolean = false;

    @property({ type: Enum(TweenWay) })
    readonly tweenWay: TweenWay = TweenWay.To;

    @property({ group: "Ease", type: Enum(TweenEase) })
    readonly easing: TweenEase = TweenEase.linear;
    @property({ group: "Ease", multiline: true, visible: function (this: TweenComponent) { return this.easing == TweenEase.svgPath; } })
    readonly customEaseData: string = "";

    onLoad(): void {
        if (this.playOnLoad && this.enabled) this.execute();
    }

    onEnable(): void {
        if (!this.playOnLoad || !XTween.containTweens(this)) this.execute();
    }

    onDisable(): void {
        if (!this.playOnLoad) XTween.removeTagTweens(this);
    }

    public execute(): void {
        let startDelay = this.startDelay.y == 0 ? this.startDelay.x : Math.randomRange(this.startDelay.x, this.startDelay.y);
        let repeatDelay = this.repeatDelay.y == 0 ? this.repeatDelay.x : Math.randomRange(this.repeatDelay.x, this.repeatDelay.y);

        let tween = new XTween(this.tweenTarget, this.repeatCount == -1 ? Infinity : this.repeatCount, this.pingPong);
        switch (this.tweenWay) {
            case TweenWay.To:
                tween.to(this.duration, this.createProperties(), { easing: this.createEase(this.easing, this.customEaseData) });
                break;
            case TweenWay.By:
                tween.by(this.duration, this.createProperties(), { easing: this.createEase(this.easing, this.customEaseData) });
                break;
        }
        if (repeatDelay > 0)
            tween.delay(repeatDelay);

        new XTween(this).delay(startDelay).add(tween).play()
    }

    public get tweenTarget(): any { return this.node; }

    protected abstract createProperties(): {};

    protected createEase(ease: TweenEase, customData: string): EasingFunction {
        if (ease == TweenEase.svgPath)
            return SvgPathEase.create(customData);
        return XTween.Easing[TweenEase[ease]];
    }
}