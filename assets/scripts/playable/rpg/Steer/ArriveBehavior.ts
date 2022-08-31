import { Vec3 } from "cc";
import Steering from "./Steering";
import SteerMover from "./SteerMover";

const vec3Temp1 = new Vec3();

export default class ArriveBehavior extends Steering {

    public constructor(public readonly slowRadius: number = 5, public readonly targetRadius: number = 1.5) {
        super();
    }

    public getSteering(mover: SteerMover): Readonly<Vec3> {
        let direction = Vec3.subtract(vec3Temp1, mover.targetPosition, mover.position);
        let distance = direction.length();
        if (distance < this.targetRadius) {
            // mover.velocity.set();
            return direction.multiplyScalar(distance - this.targetRadius);
        }

        let targetSpeed: number;
        if (distance > this.slowRadius)
            targetSpeed = mover.maxAcceleration;
        else
            targetSpeed = mover.maxAcceleration * (distance / this.slowRadius);

        let targetVelocity = direction.multiplyScalar(targetSpeed / distance);
        let linear = targetVelocity.subtract(mover.velocity);
        return mover.limitLinear(linear);
    }
}