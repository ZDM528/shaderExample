import { Component, Node, Vec3, _decorator } from "cc";
import Polar from "../math/Polar";
import { XTween } from "../xtween/XTween";
import JoystickUI from "./JoystickUI";

const vec3Temp1 = new Vec3();
const vec3Temp2 = new Vec3();

const { ccclass, property } = _decorator;

@ccclass('JoystickGuide')
export class JoystickGuide extends Component {
    @property(JoystickUI)
    readonly joystickUI: JoystickUI = null;
    @property(Node)
    readonly finger: Node = null;
    @property
    readonly angle: number = 45;
    @property
    readonly duration: number = 0.5;
    @property
    readonly delayTime: number = 0.5;

    onEnable(): void {
        this.finger.active = true;
        let radius = this.joystickUI.joystickDistance;
        let polar = new Polar(radius, this.angle * Math.DEGREE_TO_RADIAN);
        let position = polar.toCoords(vec3Temp1);
        let fingerPosition = vec3Temp2.set(position);
        fingerPosition.x += 30;

        this.joystickUI.center.node.position = this.finger.position = Vec3.ZERO;

        new XTween(this, Infinity).set(this.finger, { alpha: 1 }).add(
            new XTween(this, 3, true).add(
                XTween.to(this.joystickUI.center.node, this.duration, { position }),
                XTween.to(this.finger, this.duration, { position })
            )
        ).add(
            new XTween(this).add(
                XTween.to(this.joystickUI.center.node, this.duration, { position: Vec3.ZERO }),
                XTween.to(this.finger, this.duration, { position: fingerPosition, alpha: 0 }).set({ active: false })
            )
        ).delay(this.delayTime).play();

        this.joystickUI.node.once(JoystickUI.EventType.Start, () => this.enabled = false);
    }

    onDisable(): void {
        XTween.removeTagTweens(this);
        this.finger.active = false;
    }
}