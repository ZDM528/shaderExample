import { IVec2Like, Vec2, _decorator } from "cc";

const { ccclass, property } = _decorator;
@ccclass("Polar")
export default class Polar {
    @property
    public radius: number = 0;
    @property
    public theta: number = 0;

    public constructor(radius: number = 50, theta: number = 0) {
        this.radius = radius;
        this.theta = theta;
    }

    public set(radius: number, theta: number): Polar {
        this.radius = radius;
        this.theta = theta;
        return this;
    }

    public copy(other: Polar): Polar {
        this.radius = other.radius;
        this.theta = other.theta;
        return this;
    }

    public setFromVector(v: IVec2Like): Polar {
        return this.setFromCoord(v.x, v.y);
    }

    public setFromCoord(x: number, y: number): Polar {
        this.radius = Math.sqrt(x * x + y * y);
        this.theta = Math.atan2(y, x);
        return this;
    }

    public toCoords<T extends IVec2Like>(out: T  /**= new Vec2() */): T {
        out.x = this.radius * Math.cos(this.theta);
        out.y = this.radius * Math.sin(this.theta);
        return out;
    }

    public clone(): Polar {
        return new Polar(this.radius, this.theta);
    }
}