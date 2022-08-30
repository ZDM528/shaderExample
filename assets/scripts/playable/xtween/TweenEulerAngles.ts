import { Vec3, _decorator } from "cc";
import { TweenComponent } from "./TweenComponent";

const { ccclass, property } = _decorator;

@ccclass('TweenEulerAngles')
export class TweenEulerAngles extends TweenComponent {
    @property
    readonly startEulerAngles: Vec3 = new Vec3(0, 0, 0);
    @property
    readonly endEulerAngles: Vec3 = new Vec3(0, 0, 0);

    protected createProperties(): {} {
        this.node.eulerAngles = this.startEulerAngles;
        return { eulerAngles: this.endEulerAngles };
    }
}