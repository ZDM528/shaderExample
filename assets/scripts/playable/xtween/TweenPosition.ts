import { Vec3, _decorator } from "cc";
import { TweenComponent } from "./TweenComponent";

const { ccclass, property } = _decorator;

@ccclass('TweenPosition')
export class TweenPosition extends TweenComponent {
    @property
    readonly startPosition: Vec3 = new Vec3(0, 0, 0)
    @property
    readonly endPosition: Vec3 = new Vec3(0, 0, 0)

    protected createProperties(): {} {
        let target = this.tweenTarget;
        target.position = this.startPosition;
        return { position: this.endPosition };
    }
}