import { Camera, IVec3, Vec3 } from "cc";
import { Node } from "cc";
import { XTween } from "../xtween/XTween";
import { Action } from "./ActionEvent";

const vec3Temp1 = new Vec3();

export default class Utility {
    public static shakeCamera(node: Node = Camera.mainCamera.node, offset: { min: number, max: number } = { min: -0.5, max: 0.5 }, interval: number = 0.03, repeat: number = 4, callback?: Action): void {
        let xMinOffset = Math.randomRange(offset.min, offset.max);
        let zMinOffset = Math.randomRange(offset.min, offset.max);
        new XTween(node, repeat, true).by(interval, { positionX: xMinOffset, positionY: zMinOffset }).call(callback).play();
    }

    public static pointNearSegment(segmentP1: IVec3, segmentP2: IVec3, point: IVec3, out: Vec3 = new Vec3()): Vec3 {
        let lineDirection = Vec3.subtract(out, segmentP2, segmentP1);
        let lineLength = lineDirection.length();
        lineDirection.multiplyScalar(1 / lineLength);
        let pointDirection = Vec3.subtract(vec3Temp1, point, segmentP1);
        let dotLength = Vec3.dot(lineDirection, pointDirection);
        let projectLength = Math.clamp(dotLength, 0, lineLength);
        return Vec3.add(out, segmentP1, lineDirection.multiplyScalar(projectLength));
    }
}