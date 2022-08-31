import { Vec3 } from "cc";
import SteerMover from "./SteerMover";

export default abstract class Steering {
    public weight: number = 1;

    public abstract getSteering(mover: SteerMover): Readonly<Vec3>;
    // public abstract getAngular(mover: SteerMover): number;
}