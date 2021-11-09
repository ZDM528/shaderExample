import { Node, Vec3 } from "cc";
import Missile from "./Missile";

/**
 * 直线飞行器，就是直接在XZ平面上飞身敌人。
 */
export default class StraightMissile extends Missile {
    private direction: Vec3 = new Vec3();
    private moveDir: Vec3 = new Vec3();

    update(deltaTime: number): void {
        if (this.target == null || !this.target.isValid) {
            this.node.destroy();
            return;
        }

        Vec3.subtract(this.direction, this.target.beStrokedPoint.worldPosition, this.node.worldPosition);
        let moveDistance = deltaTime * this.skill.config.missileSpeed;
        let remainDistance = Vec3.len(this.direction);
        this.setDirection(this.direction);

        if (remainDistance <= moveDistance) {
            this.arrive();
        } else {
            Vec3.multiplyScalar(this.moveDir, this.direction, moveDistance / remainDistance);
            this.node.translate(this.moveDir, Node.NodeSpace.WORLD);
        }
    }

    public setDirection(direction: Vec3): void {
        let angle = Math.atan2(direction.y, direction.x) * Math.RADIAN_TO_DEGREE;
        this.node.angle = angle;
    }
}