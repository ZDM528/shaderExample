import { assert, Vec3 } from "cc";
import Curve from "./Curve";


/**
 * Centripetal CatmullRom Curve - which is useful for avoiding
 * cusps and self-intersections in non-uniform catmull rom curves.
 * http://www.cemyuksel.com/research/catmullrom_param/catmullrom.pdf
 *
 * curve.type accepts centripetal(default), chordal and catmullrom
 * curve.tension is used for catmullrom which defaults to 0.5
 */


/*
Based on an optimized c++ solution in
 - http://stackoverflow.com/questions/9489736/catmull-rom-curve-with-no-cusps-and-no-self-intersections/
 - http://ideone.com/NoEbVM

This CubicPoly class could be used for reusing some variables and calculations,
but for three.js curve use, it could be possible inlined and flatten into a single function call
which can be placed in CurveUtils.
*/
class CubicPoly {
    private c0: number = 0;
    private c1: number = 0;
    private c2: number = 0;
    private c3: number = 0;

    /*
     * Compute coefficients for a cubic polynomial
     *   p(s) = c0 + c1*s + c2*s^2 + c3*s^3
     * such that
     *   p(0) = x0, p(1) = x1
     *  and
     *   p'(0) = t0, p'(1) = t1.
     */
    private init(x0: number, x1: number, t0: number, t1: number): void {
        this.c0 = x0;
        this.c1 = t0;
        this.c2 = (x1 - x0) * 3 - 2 * t0 - t1;
        // this.c2 = - 3 * x0 + 3 * x1 - 2 * t0 - t1;
        this.c3 = (x1 - x0) * -2 + t0 + t1;
        // this.c3 = 2 * x0 - 2 * x1 + t0 + t1;
    }

    public initCatmullRom(x0: number, x1: number, x2: number, x3: number, tension: number): void {
        this.init(x1, x2, tension * (x2 - x0), tension * (x3 - x1));
    }

    public initNonuniformCatmullRom(x0: number, x1: number, x2: number, x3: number, dt0: number, dt1: number, dt2: number): void {
        // compute tangents when parameterized in [t1,t2]
        let t1 = (x1 - x0) / dt0 - (x2 - x0) / (dt0 + dt1) + (x2 - x1) / dt1;
        let t2 = (x2 - x1) / dt1 - (x3 - x1) / (dt1 + dt2) + (x3 - x2) / dt2;
        // rescale tangents for parametrization in [0,1]
        t1 *= dt1;
        t2 *= dt1;
        this.init(x1, x2, t1, t2);
    }

    public calc(t: number): number {
        const t2 = t * t;
        const t3 = t2 * t;
        return this.c0 + this.c1 * t + this.c2 * t2 + this.c3 * t3;
    }
}

//
const tmp = new Vec3();
const px = new CubicPoly(), py = new CubicPoly(), pz = new CubicPoly();

export default class CatmullRomCurve3 extends Curve {
    public constructor(public readonly points: Vec3[], private closed: boolean = false, curveType = Curve.CurveType.Centripetal, private tension: number = 0.5) {
        super(curveType);
    }

    public getPoint(t: number, optionalTarget = new Vec3()): Vec3 {
        assert(t <= 1.0);
        const point = optionalTarget;
        const points = this.points;
        const l = points.length;

        const p = (l - (this.closed ? 0 : 1)) * t;
        let intPoint = Math.floor(p);
        let weight = p - intPoint;

        if (this.closed) {
            intPoint += intPoint > 0 ? 0 : (Math.floor(Math.abs(intPoint) / l) + 1) * l;
        } else if (weight === 0 && intPoint === l - 1) {
            intPoint = l - 2;
            weight = 1;
        }

        let p0: Vec3, p3: Vec3; // 4 points (p1 & p2 defined below)
        if (this.closed || intPoint > 0) {
            p0 = points[(intPoint - 1) % l];
        } else {
            // extrapolate first point
            p0 = Vec3.subtract(tmp, points[0], points[1]).add(points[0]);
        }

        const p1 = points[intPoint % l];
        const p2 = points[(intPoint + 1) % l];
        if (this.closed || intPoint + 2 < l) {
            p3 = points[(intPoint + 2) % l];
        } else {
            // extrapolate last point
            p3 = Vec3.subtract(tmp, points[l - 1], points[l - 2]).add(points[l - 1]);
        }

        if (this.curveType === Curve.CurveType.Centripetal || Curve.CurveType.Chordal) {
            // init Centripetal / Chordal Catmull-Rom
            const pow = this.curveType === Curve.CurveType.Chordal ? 0.5 : 0.25;
            let dt0 = Math.pow(Vec3.squaredDistance(p0, p1), pow);
            let dt1 = Math.pow(Vec3.squaredDistance(p1, p2), pow);
            let dt2 = Math.pow(Vec3.squaredDistance(p2, p3), pow);

            // safety check for repeated points
            if (dt1 < 1e-4) dt1 = 1.0;
            if (dt0 < 1e-4) dt0 = dt1;
            if (dt2 < 1e-4) dt2 = dt1;

            px.initNonuniformCatmullRom(p0.x, p1.x, p2.x, p3.x, dt0, dt1, dt2);
            py.initNonuniformCatmullRom(p0.y, p1.y, p2.y, p3.y, dt0, dt1, dt2);
            pz.initNonuniformCatmullRom(p0.z, p1.z, p2.z, p3.z, dt0, dt1, dt2);

        } else if (this.curveType === Curve.CurveType.Catmullrom) {
            px.initCatmullRom(p0.x, p1.x, p2.x, p3.x, this.tension);
            py.initCatmullRom(p0.y, p1.y, p2.y, p3.y, this.tension);
            pz.initCatmullRom(p0.z, p1.z, p2.z, p3.z, this.tension);
        }

        point.set(px.calc(weight), py.calc(weight), pz.calc(weight));
        return point;
    }

    public copy(source: CatmullRomCurve3): CatmullRomCurve3 {
        super.copy(source);

        this.points.length = 0;
        for (let i = 0, l = source.points.length; i < l; i++) {
            const point = source.points[i];
            this.points.push(point.clone());
        }

        this.closed = source.closed;
        this.curveType = source.curveType;
        this.tension = source.tension;
        return this;
    }
}