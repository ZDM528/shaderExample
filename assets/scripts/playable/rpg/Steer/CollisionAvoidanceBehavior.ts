import { Vec3 } from "cc";
import ISteer from "./ISteer";
import Steering from "./Steering";
import SteerMover from "./SteerMover";

const vec3Temp1 = new Vec3();
const vec3Temp2 = new Vec3();
const vec3Temp3 = new Vec3();
const vec3Temp4 = new Vec3();
const vec3Temp5 = new Vec3();

export default class CollisionAvoidanceBehavior extends Steering {
    public getSteering(mover: SteerMover): Readonly<Vec3> {
        let shortestTime = Number.POSITIVE_INFINITY;
        let firstTarget: ISteer = null;
        let firstMinSeparation = 0, firstDistance = 0, firstRadius = 0;
        let firstRelativePos = vec3Temp4.set(), firstRelativeVel = vec3Temp5.set();

        let position = mover.position;
        for (let target of mover.getNeibours()) {
            if (target == mover) continue;
            let relativePos = Vec3.subtract(vec3Temp1, position, target.position);
            let relativeVel = Vec3.subtract(vec3Temp2, mover.velocity, target.velocity);
            let distance = relativePos.length();
            let relativeSpeed = relativeVel.length();

            if (relativeSpeed == 0)
                continue;

            let timeToCollision = -1 * Vec3.dot(relativePos, relativeVel) / (relativeSpeed * relativeSpeed);

            let separation = Vec3.multiplyScalar(vec3Temp3, relativeVel, timeToCollision).add(relativePos);
            let minSeparation = separation.length();

            if (minSeparation > mover.radius + target.radius)
                continue;

            if ((timeToCollision > 0) && (timeToCollision < shortestTime)) {
                shortestTime = timeToCollision;
                firstTarget = target;
                firstMinSeparation = minSeparation;
                firstDistance = distance;
                firstRadius = target.radius;
                firstRelativePos.set(relativePos);
                firstRelativeVel.set(relativeVel);
            }
        }

        if (firstTarget == null)
            return Vec3.ZERO;

        let linear: Vec3;
        if (firstMinSeparation <= 0 || firstDistance < mover.radius + firstRadius)
            linear = Vec3.subtract(vec3Temp1, position, firstTarget.position);
        else
            linear = Vec3.multiplyScalar(vec3Temp1, firstRelativeVel, shortestTime).add(firstRelativePos);

        return mover.limitLinear(linear);
    }
}