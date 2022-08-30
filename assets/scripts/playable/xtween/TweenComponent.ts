import { Component, Enum, Vec2, _decorator } from "cc";
import { EasingFunction } from "./CustomEase/CustomEase";
import SvgPathEase from "./CustomEase/SvgPathEase";
import { XTween, xtween } from "./XTween";

const { ccclass, property } = _decorator;

enum TweenWay {
    To,
    By,
}

enum TweenEase {
    None,
    QuadraticIn,
    QuadraticOut,
    QuadraticInOut,
    CubicIn,
    CubicOut,
    CubicInOut,
    QuarticIn,
    QuarticOut,
    QuarticInOut,
    QuinticIn,
    QuinticOut,
    QuinticInOut,
    SinusoidalIn,
    SinusoidalOut,
    SinusoidalInOut,
    ExponentialIn,
    ExponentialOut,
    ExponentialInOut,
    CircularIn,
    CircularOut,
    CircularInOut,
    ElasticIn,
    ElasticOut,
    ElasticInOut,
    BackIn,
    BackOut,
    BackInOut,
    BounceIn,
    BounceOut,
    BounceInOut,
    SvgPath,
}

const TweenDefautEase: EasingFunction[] = [
    XTween.Easing.Linear.None,
    XTween.Easing.Quadratic.In,
    XTween.Easing.Quadratic.Out,
    XTween.Easing.Quadratic.InOut,
    XTween.Easing.Cubic.In,
    XTween.Easing.Cubic.Out,
    XTween.Easing.Cubic.InOut,
    XTween.Easing.Quartic.In,
    XTween.Easing.Quartic.Out,
    XTween.Easing.Quartic.InOut,
    XTween.Easing.Quintic.In,
    XTween.Easing.Quintic.Out,
    XTween.Easing.Quintic.InOut,
    XTween.Easing.Sinusoidal.In,
    XTween.Easing.Sinusoidal.Out,
    XTween.Easing.Sinusoidal.InOut,
    XTween.Easing.Exponential.In,
    XTween.Easing.Exponential.Out,
    XTween.Easing.Exponential.InOut,
    XTween.Easing.Circular.In,
    XTween.Easing.Circular.Out,
    XTween.Easing.Circular.InOut,
    XTween.Easing.Elastic.In,
    XTween.Easing.Elastic.Out,
    XTween.Easing.Elastic.InOut,
    XTween.Easing.Back.In,
    XTween.Easing.Back.Out,
    XTween.Easing.Back.InOut,
    XTween.Easing.Bounce.In,
    XTween.Easing.Bounce.Out,
    XTween.Easing.Bounce.InOut,
];

export abstract class TweenComponent extends Component {
    @property
    readonly duration: number = 1;
    @property({ group: "Start" })
    readonly startDelay: Vec2 = new Vec2();
    @property({ group: "Start" })
    readonly playOnLoad: boolean = true;

    @property({ group: "Repeat", tooltip: "重复次数，-1为无限重复，0为不重复，>0为自定义重复次数" })
    readonly repeatCount: number = -1;
    @property({ group: "Repeat" })
    readonly repeatDelay: Vec2 = new Vec2();
    @property({ group: "Repeat" })
    readonly pingPong: boolean = true;

    @property({ type: Enum(TweenWay) })
    readonly tweenWay: TweenWay = TweenWay.To;

    @property({ group: "Ease", type: Enum(TweenEase) })
    readonly easing: TweenEase = TweenEase.None;
    @property({ group: "Ease", multiline: true, visible: function (this: TweenComponent) { return this.easing == TweenEase.SvgPath; } })
    readonly customEaseData: string = "";

    onLoad(): void {
        if (this.playOnLoad && this.enabled) this.execute();
    }

    onEnable(): void {
        if (!this.playOnLoad || !XTween.containTweens(this)) this.execute();
    }

    onDisable(): void {
        if (!this.playOnLoad) XTween.removeTargetTweens(this);
    }

    public execute(): void {
        let tween = this.createTween(this.tweenWay, this.duration, this.createProperties(), this.createEase(this.easing, this.customEaseData));
        let startDelay = this.startDelay.y == 0 ? this.startDelay.x : Math.randomRange(this.startDelay.x, this.startDelay.y);
        let repeatDelay = this.repeatDelay.y == 0 ? this.repeatDelay.x : Math.randomRange(this.repeatDelay.x, this.repeatDelay.y);
        xtween(this).delay(startDelay).then(this.createRepeat(this.repeatCount, this.pingPong, repeatDelay, tween)).start();
    }

    private createRepeat(repeatCount: number, pingPong: boolean, delay: number, tween: XTween<any>): XTween<any> {
        if (repeatCount == 0) return tween;
        if (repeatCount == -1) repeatCount = Infinity;
        return xtween(this).repeat(repeatCount, pingPong, tween.delay(delay));
    }

    private createTween(tweenWay: TweenWay, duration: number, properties: {}, easing: EasingFunction): XTween<any> {
        let tween = xtween(this.tweenTarget);
        switch (tweenWay) {
            case TweenWay.To:
                tween.to(duration, properties, { easing });
                break;
            case TweenWay.By:
                tween.by(duration, properties, { easing });
                break;
        }
        return tween;
    }

    public get tweenTarget(): any { return this.node; }

    protected abstract createProperties(): {};

    protected createEase(ease: TweenEase, customData: string): EasingFunction {
        if (ease == TweenEase.SvgPath)
            return SvgPathEase.create(customData);
        return TweenDefautEase[ease];
    }
}