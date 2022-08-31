import { game, Vec3 } from "cc";
import Curve from "../../curve/Curve";
import Steering from "./Steering";
import SteerMover from "./SteerMover";

const vec3Temp1 = new Vec3();

export default class FollowPathBehavior extends Steering {
    private currentDistance: number = 0;


    public constructor(public readonly path: Curve, public readonly moveSpeed = 5) {
        super();
    }

    public getSteering(mover: SteerMover): Readonly<Vec3> {
        this.currentDistance += this.moveSpeed * game.deltaTime;
        let targetPosition = this.path.getPointAt(this.currentDistance, vec3Temp1);
        return null;
    }
}