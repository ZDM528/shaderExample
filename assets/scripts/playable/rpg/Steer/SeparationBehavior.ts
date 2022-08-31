import { Vec3 } from "cc";
import Steering from "./Steering";
import SteerMover from "./SteerMover";

const vec3Temp1 = new Vec3();
const vec3Temp2 = new Vec3();

export default class SeparationBehavior extends Steering {

    public constructor(public readonly threshold: number = 2, public readonly decayCoefficient: number = -25) {
        super();
    }

    public getSteering(mover: SteerMover): Readonly<Vec3> {
        let linear = vec3Temp1.set();
        for (let target of mover.getNeibours()) {
            if (target == mover) continue;
            let direction = Vec3.subtract(vec3Temp2, target.position, mover.position);
            let distance = direction.length();
            if (distance < this.threshold) {
                let strength = Math.min(this.decayCoefficient / (distance * distance), mover.maxAcceleration);
                direction.multiplyScalar(strength / distance);
                linear.add(direction);
            }
        }
        return linear;
    }
}