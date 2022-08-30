import { Vec3, _decorator } from "cc";

const { ccclass, property } = _decorator;
@ccclass("Spherical")
export default class Spherical {
    @property
    public radius: number = 0;
    @property
    public phi: number = 0;
    @property
    public theta: number = 0;

    /**
     * Spherical coorditions
     * @param radius 
     * @param phi The polar angle (phi) is measured from the positive y-axis. The positive y-axis is up.
     * @param theta The azimuthal angle (theta) is measured from the positive z-axis.
     */
    public constructor(radius: number = 5, phi: number = 0.5235987755982988, theta: number = 0) {
        this.radius = radius;
        this.phi = phi;
        this.theta = theta;
    }

    public set(radius: number, phi: number, theta: number): Spherical {
        this.radius = radius;
        this.phi = phi;
        this.theta = theta;
        return this;
    }

    public copy(other: Spherical): Spherical {
        this.radius = other.radius;
        this.phi - other.phi;
        this.theta = other.theta;
        return this;
    }

    // restrict phi to be betwee EPS and PI-EPS
    public makeSafe(): Spherical {
        this.phi = Spherical.makeSafePhi(this.phi);
        return this;
    }

    public setFromVector3(v: Vec3): Spherical {
        return this.setFromCartesianCoords(v.x, v.y, v.z);
    }

    public setFromCartesianCoords(x: number, y: number, z: number): Spherical {
        this.radius = Math.sqrt(x * x + y * y + z * z);
        if (this.radius === 0) {
            this.theta = 0;
            this.phi = 0;
        } else {
            this.theta = Math.atan2(x, z);
            this.phi = Math.acos(Math.clamp(y / this.radius, -1, 1));
        }
        return this;
    }

    public toCoords(out: Vec3 = new Vec3): Vec3 {
        const sinPhiRadius = Math.sin(this.phi) * this.radius;
        out.x = sinPhiRadius * Math.sin(this.theta);
        out.y = Math.cos(this.phi) * this.radius;
        out.z = sinPhiRadius * Math.cos(this.theta);
        return out;
    }

    public clone(): Spherical {
        return new Spherical(this.radius, this.phi, this.theta);
    }

    public static makeSafePhi(phi: number): number {
        // if (phi == 0) return Math.EPSILON;
        return Math.max(Math.EPSILON, Math.min(Math.PI - Math.EPSILON, phi));
    }
}