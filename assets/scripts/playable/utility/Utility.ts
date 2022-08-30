import { Camera } from "cc";
import { Node } from "cc";
import { XTween, xtween } from "../xtween/XTween";
import { Action } from "./ActionEvent";

export default class Utility {
    public static shakeCamera(node: Node = Camera.mainCamera.node, offset: { min: number, max: number } = { min: -0.5, max: 0.5 }, interval: number = 0.03, repeat: number = 4, callback?: Action): void {
        let xMinOffset = Math.randomRange(offset.min, offset.max);
        let zMinOffset = Math.randomRange(offset.min, offset.max);
        XTween.repeat(repeat, true, xtween(node).by(interval, { positionX: xMinOffset, positionY: zMinOffset })).call(callback).start();
    }
}