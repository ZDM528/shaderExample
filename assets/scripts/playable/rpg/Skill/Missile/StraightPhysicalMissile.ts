import { Collider } from "cc";
import { ITriggerEvent, RigidBody, Vec3 } from "cc";
import BaseCharacter from "../../BaseCharacter";
import RemoteSkill from "../RemoteSkill";
import Missile from "./Missile";

/**
 * 直线飞行器，就是直接在XZ平面上飞身敌人。
 */
export default class StraightPhysicalMissile extends Missile {
    private direction: Vec3 = new Vec3();
    private moveDir: Vec3 = new Vec3();
    private destoryDistance: number;
    private startPosition: Vec3;
    private rigidBody: RigidBody;

    public initialize(skill: RemoteSkill, target: BaseCharacter, destoryDistance: number = 10): void {
        super.initialize(skill, target);
        this.destoryDistance = destoryDistance;
        this.startPosition = this.node.worldPosition.clone();
        this.node.forward = this.direction = this.character.node.forward.clone();
        this.rigidBody = this.node.getComponent(RigidBody);

        let collider = this.getComponent(Collider);
        collider.on('onTriggerEnter', this.onTrigger, this);
    }

    onDisable(): void {
        let collider = this.getComponent(Collider);
        collider.off('onTriggerEnter', this.onTrigger, this);
    }

    update(deltaTime: number): void {
        let distance = Vec3.distance(this.node.worldPosition, this.startPosition);
        if (distance > this.destoryDistance) {
            this.node.destroy();
            return;
        }

        Vec3.multiplyScalar(this.moveDir, this.direction, -this.skill.config.missileSpeed);
        this.rigidBody.setLinearVelocity(this.moveDir);
    }

    private onTrigger(event: ITriggerEvent) {
        let target = event.otherCollider.getComponentInParents(BaseCharacter);
        if (target == null || target == this.character) return;
        this._target = target;
        this.arrive();
    }
}