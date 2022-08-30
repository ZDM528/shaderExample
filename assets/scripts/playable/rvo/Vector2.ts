
export class Vector2 {
    public constructor(public x: number = 0, public y: number = 0) {
    }

    public Copy(other: Vector2): Vector2 {
        this.x = other.x;
        this.y = other.y;
        return this;
    }

    public Clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    public static Add(a: Vector2, b: Vector2, out: Vector2 = new Vector2()): Vector2 {
        out.x = a.x + b.x;
        out.y = a.y + b.y;
        return out;
    }

    public static Subtract(a: Vector2, b: Vector2, out: Vector2 = new Vector2()): Vector2 {
        out.x = a.x - b.x;
        out.y = a.y - b.y;
        return out;
    }

    public static Multiply(a: Vector2, scalar: number, out: Vector2 = new Vector2()): Vector2 {
        out.x = a.x * scalar;
        out.y = a.y * scalar;
        return out;
    }

    public static Divide(a: Vector2, scalar: number, out: Vector2 = new Vector2()): Vector2 {
        out.x = a.x / scalar;
        out.y = a.y / scalar;
        return out;
    }

    public static Dot(a: Vector2, b: Vector2): number {
        return a.x * b.x + a.y * b.y;
    }

    public static Negate(a: Vector2, out: Vector2 = new Vector2()): Vector2 {
        out.x = -a.x;
        out.y = -a.y;
        return out;
    }
}