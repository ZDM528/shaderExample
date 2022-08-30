import { assert, Mat4, Vec3 } from "cc";

enum CurveType {
    Curve,
    Centripetal,
    Chordal,
    Catmullrom,
}

interface CurveData {
    tangents: Vec3[],
    normals: Vec3[],
    binormals: Vec3[],
}

/**
 * Extensible curve object.
 *
 * Some common of curve methods:
 * .getPoint( t, optionalTarget ), .getTangent( t, optionalTarget )
 * .getPointAt( u, optionalTarget ), .getTangentAt( u, optionalTarget )
 * .getPoints(), .getSpacedPoints()
 * .getLength()
 * .updateArcLengths()
 *
 * This following curves inherit from THREE.Curve:
 *
 * -- 2D curves --
 * THREE.ArcCurve
 * THREE.CubicBezierCurve
 * THREE.EllipseCurve
 * THREE.LineCurve
 * THREE.QuadraticBezierCurve
 * THREE.SplineCurve
 *
 * -- 3D curves --
 * THREE.CatmullRomCurve3
 * THREE.CubicBezierCurve3
 * THREE.LineCurve3
 * THREE.QuadraticBezierCurve3
 *
 * A series of curves can be represented as a THREE.CurvePath.
 *
 **/
export default class Curve {
    public static readonly CurveType = CurveType;
    private cacheArcLengths: number[] = [];
    public needsUpdate: boolean = false;
    public constructor(public curveType: CurveType = CurveType.Curve, public arcLengthDivisions: number = 200) {
    }

    public getPoint(t: number, optionalTarget?: Vec3): Vec3 {
        console.warn('THREE.Curve: .getPoint() not implemented.');
        return null;
    }

    // Get point at relative position in curve according to arc length
    // - u [0 .. 1]
    public getPointAt(u, optionalTarget?: Vec3): Vec3 {
        assert(u <= 1.0);
        const t = this.getUtoTmapping(u);
        return this.getPoint(t, optionalTarget);
    }

    // Get sequence of points using getPoint( t )
    public getPoints(divisions: number = 5): Vec3[] {
        const points: Vec3[] = [];
        for (let d = 0; d <= divisions; d++)
            points.push(this.getPoint(d / divisions));
        return points;
    }

    // Get sequence of points using getPointAt( u )

    public getSpacedPoints(divisions: number = 5): Vec3[] {
        const points: Vec3[] = [];
        for (let d = 0; d <= divisions; d++) {
            points.push(this.getPointAt(d / divisions));
        }
        return points;
    }

    // Get total curve arc length

    public getLength(): number {
        const lengths = this.getLengths();
        return lengths[lengths.length - 1];
    }

    // Get list of cumulative segment lengths

    public getLengths(divisions = this.arcLengthDivisions): number[] {
        if (this.cacheArcLengths && (this.cacheArcLengths.length === divisions + 1) && !this.needsUpdate) {
            return this.cacheArcLengths;
        }

        this.needsUpdate = false;

        const cache: number[] = [];
        let current: Vec3, last: Vec3 = this.getPoint(0);
        let sum = 0;

        cache.push(0);

        for (let p = 1; p <= divisions; p++) {
            current = this.getPoint(p / divisions);
            sum += Vec3.distance(current, last);
            cache.push(sum);
            last = current;
        }

        this.cacheArcLengths = cache;
        return cache; // { sums: cache, sum: sum }; Sum is in the last element.
    }

    public updateArcLengths(): void {
        this.needsUpdate = true;
        this.getLengths();
    }

    // Given u ( 0 .. 1 ), get a t to find p. This gives you points which are equidistant
    public getUtoTmapping(u: number, distance?: number): number {
        const arcLengths = this.getLengths();

        let i = 0;
        const il = arcLengths.length;
        let targetArcLength; // The targeted u distance value to get
        if (distance) {
            targetArcLength = distance;
        } else {
            targetArcLength = u * arcLengths[il - 1];
        }

        // binary search for the index with largest value smaller than target u distance
        let low = 0, high = il - 1, comparison;
        while (low <= high) {
            i = Math.floor(low + (high - low) / 2); // less likely to overflow, though probably not issue here, JS doesn't really have integers, all numbers are floats
            comparison = arcLengths[i] - targetArcLength;
            if (comparison < 0) {
                low = i + 1;
            } else if (comparison > 0) {
                high = i - 1;
            } else {
                high = i;
                break;
                // DONE
            }
        }

        i = high;
        if (arcLengths[i] === targetArcLength)
            return i / (il - 1);

        // we could get finer grain at lengths, or use simple interpolation between two points

        const lengthBefore = arcLengths[i];
        const lengthAfter = arcLengths[i + 1];
        const segmentLength = lengthAfter - lengthBefore;
        // determine where we are between the 'before' and 'after' points
        const segmentFraction = (targetArcLength - lengthBefore) / segmentLength;
        // add that fractional amount to t
        const t = (i + segmentFraction) / (il - 1);
        return t;
    }

    // Returns a unit vector tangent at t
    // In case any sub curve does not implement its tangent derivation,
    // 2 points a small delta apart will be used to find its gradient
    // which seems to give a reasonable approximation
    public getTangent(t: number, optionalTarget?: Vec3): Vec3 {
        const delta = 0.0001;
        let t1 = t - delta;
        let t2 = t + delta;

        // Capping in case of danger
        if (t1 < 0) t1 = 0;
        if (t2 > 1) t2 = 1;

        const pt1 = this.getPoint(t1);
        const pt2 = this.getPoint(t2);
        const tangent = optionalTarget || new Vec3();
        // const tangent = optionalTarget || ((pt1.isVector2) ? new Vec2() : new Vec3());
        tangent.set(pt2).subtract(pt1).normalize();
        return tangent;
    }

    public getTangentAt(u: number, optionalTarget?: Vec3) {
        const t = this.getUtoTmapping(u);
        return this.getTangent(t, optionalTarget);
    }

    public computeFrenetFrames(segments, closed): CurveData {
        // see http://www.cs.indiana.edu/pub/techreports/TR425.pdf
        const normal = new Vec3();

        const tangents: Vec3[] = [];
        const normals: Vec3[] = [];
        const binormals: Vec3[] = [];
        const vec = new Vec3();
        const mat = new Mat4();
        // compute the tangent vectors for each segment on the curve
        for (let i = 0; i <= segments; i++) {
            const u = i / segments;
            tangents[i] = this.getTangentAt(u, new Vec3());
        }

        // select an initial normal vector perpendicular to the first tangent vector,
        // and in the direction of the minimum tangent xyz component

        normals[0] = new Vec3();
        binormals[0] = new Vec3();
        let min = Number.MAX_VALUE;
        const tx = Math.abs(tangents[0].x);
        const ty = Math.abs(tangents[0].y);
        const tz = Math.abs(tangents[0].z);
        if (tx <= min) {
            min = tx;
            normal.set(1, 0, 0);
        }

        if (ty <= min) {
            min = ty;
            normal.set(0, 1, 0);
        }

        if (tz <= min) {
            normal.set(0, 0, 1);
        }

        Vec3.cross(vec, tangents[0], normal).normalize();

        Vec3.cross(normals[0], tangents[0], vec);
        Vec3.cross(binormals[0], tangents[0], normals[0]);

        // compute the slowly-varying normal and binormal vectors for each segment on the curve

        for (let i = 1; i <= segments; i++) {
            normals[i] = normals[i - 1].clone();
            binormals[i] = binormals[i - 1].clone();
            Vec3.cross(vec, tangents[i - 1], tangents[i]);

            if (vec.length() > Number.EPSILON) {
                vec.normalize();
                const theta = Math.acos(Math.clamp(tangents[i - 1].dot(tangents[i]), - 1, 1)); // clamp for floating pt errors
                normals[i].transformMat4(mat.rotate(theta, vec));
            }

            Vec3.cross(binormals[i], tangents[i], normals[i]);
        }

        // if the curve is closed, postprocess the vectors so the first and last normal vectors are the same

        if (closed === true) {
            let theta = Math.acos(Math.clamp(normals[0].dot(normals[segments]), - 1, 1));
            theta /= segments;

            if (tangents[0].dot(Vec3.cross(vec, normals[0], normals[segments])) > 0) {
                theta = - theta;
            }

            for (let i = 1; i <= segments; i++) {
                // twist a little...
                normals[i].transformMat4(mat.rotate(theta * i, tangents[i]));
                Vec3.cross(binormals[i], tangents[i], normals[i]);
            }
        }

        return { tangents: tangents, normals: normals, binormals: binormals };
    }

    public clone(): Curve {
        return new Curve(this.curveType, this.arcLengthDivisions);
    }

    public copy(source): Curve {
        this.arcLengthDivisions = source.arcLengthDivisions;
        return this;
    }
}