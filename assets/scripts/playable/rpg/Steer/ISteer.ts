import { Vec3 } from "cc";

export default interface ISteer {
    readonly radius: number;
    readonly velocity: Readonly<Vec3>;
    readonly position: Vec3;
}