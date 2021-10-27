import { Component, tween, Vec3, _decorator } from "cc";

const { ccclass, property } = _decorator;

@ccclass('TweenScale')
export class TweenScale extends Component {
    @property
    readonly scale: number = 0.1;
    @property
    readonly duration: number = 0.5;
    // @property
    // readonly easing: string = "linear";
    @property
    readonly playOnLoad: boolean = true;

    onLoad(): void {
        if (this.playOnLoad)
            this.startTween();
    }

    public startTween(): void {
        tween(this.node).repeatForever(
            tween(this.node).by(this.duration, { scale: new Vec3(this.scale, this.scale, this.scale) })
                .by(this.duration, { scale: new Vec3(-this.scale, -this.scale, -this.scale) })
        ).start();
    }
}