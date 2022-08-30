import { Vec3, _decorator } from "cc";
import { TweenComponent } from "./TweenComponent";

const { ccclass, property } = _decorator;

@ccclass('TweenScale')
export class TweenScale extends TweenComponent {
    @property
    readonly startScale: Vec3 = new Vec3(1, 1, 1);
    @property
    readonly endScale: Vec3 = new Vec3(1.1, 1.1, 1.1)

    protected createProperties(): {} {
        let target = this.tweenTarget;
        target.scale = this.startScale;
        return { scale: this.endScale };
    }
}