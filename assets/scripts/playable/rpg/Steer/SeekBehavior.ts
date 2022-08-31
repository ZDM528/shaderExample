import { Vec3 } from "cc";
import Steering from "./Steering";
import SteerMover from "./SteerMover";

const vec3Temp1 = new Vec3();

export default class SeekBehavior extends Steering {

    public getSteering(mover: SteerMover): Readonly<Vec3> {
        let linear = Vec3.subtract(vec3Temp1, mover.targetPosition, mover.position);
        linear.multiplyScalar(mover.maxAcceleration / linear.length());
        return linear;
    }
}