import { Vector2 } from "./Vector2";

export class RVOMath {
    public static readonly RVO_EPSILON = 0.00001;

    public static Sqr(scalar: number): number {
        return scalar * scalar;
    }

    public static Sqrt(scalar: number): number {
        return Math.sqrt(scalar);
    }

    public static AbsSq(vector: Vector2): number {
        return Vector2.Dot(vector, vector);
    }

    public static FAbs(scalar: number): number {
        return Math.abs(scalar);
    }

    public static Abs(vector: Vector2): number {
        return RVOMath.Sqrt(RVOMath.AbsSq(vector));
    }

    public static Normalize(vector: Vector2, out: Vector2 = new Vector2): Vector2 {
        let length = RVOMath.Abs(vector);
        return Vector2.Divide(vector, length, out);
    }

    public static Det(vector1: Vector2, vector2: Vector2): number {
        return vector1.x * vector2.y - vector1.y * vector2.x;
    }

    public static DistSqPointLineSegment(vector1: Vector2, vector2: Vector2, vector3: Vector2): number {
        let vt1 = Vector2.Subtract(vector3, vector1);
        let vt2 = Vector2.Subtract(vector2, vector1);
        let r = Vector2.Dot(vt1, vt2) / RVOMath.AbsSq(vt2);
        if (r < 0) return RVOMath.AbsSq(vt1);
        if (r > 1) return RVOMath.AbsSq(Vector2.Subtract(vector3, vector2));
        vt2 = Vector2.Multiply(vt2, r, vt2);
        vt2 = Vector2.Add(vector1, vt2, vt2);
        return RVOMath.AbsSq(Vector2.Subtract(vector3, vt2, vt2));
    }

    public static LeftOf(a: Vector2, b: Vector2, c: Vector2): number {
        return RVOMath.Det(Vector2.Subtract(a, c), Vector2.Subtract(b, a));
    }

}