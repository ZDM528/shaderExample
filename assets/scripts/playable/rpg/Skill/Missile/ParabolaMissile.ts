import { Node, Vec3 } from "cc";
import BaseCharacter from "../../BaseCharacter";
import RemoteSkill from "../RemoteSkill";
import Missile from "./Missile";

/**
 * 抛物线飞行器，除了平面飞行外，还会在Y轴上有一个曲线的上下移动。
 */
export default class ParabolaMissile extends Missile {
    public heightScaler: number = 0.2;

    private direction: Vec3 = new Vec3();
    private totalDirection: Vec3 = new Vec3();

    private startPosition: Vec3;

    public initialize(skill: RemoteSkill, target: BaseCharacter, ...params: any[]): void {
        super.initialize(skill, target, ...params);
        this.startPosition = this.node.worldPosition.clone();
    }

    update(deltaTime: number): void {
        Vec3.subtract(this.node.worldPosition, this.target.beStrokedPoint.worldPosition, this.direction);
        this.direction.y = 0;

        let moveOffset = deltaTime * this.skill.config.missileSpeed;
        let remainDistance = Vec3.len(this.direction);
        this.setDirection(this.direction);
        if (remainDistance <= moveOffset) {
            this.arrive();
        } else {
            Vec3.subtract(this.target.beStrokedPoint.worldPosition, this.startPosition, this.totalDirection);
            this.totalDirection.y = 0;
            let totalDistance = Vec3.len(this.totalDirection);
            let progress = remainDistance / totalDistance;
            this.direction.y = Math.sin(progress * Math.PI) * (totalDistance * this.heightScaler) + Math.lerp(this.target.beStrokedPoint.position.y, this.startPosition.y, progress) - this.node.worldPosition.y;
            this.node.translate(this.direction, Node.NodeSpace.WORLD);
        }
    }
}