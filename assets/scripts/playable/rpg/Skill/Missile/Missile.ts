import { Quat, Vec3 } from "cc";
import EffectManager from "../../EffectManager";
import RemoteSkill from "../RemoteSkill";
import SkillEffectClass from "../SkillEffectClass";

const EPSILON = 0.000001;

/**
 * 远程技能飞行器，所有远程技能攻击时，都会创建一个飞行器，再由飞行器攻击敌人。
 */
export default class Missile extends SkillEffectClass<RemoteSkill> {
    private rotation: Quat = new Quat();

    protected arrive(): void {
        this.target.beHit(this.skill.config.damage, this.skill.character);
        this.node.destroy();
        EffectManager.playStrikeEffect(this.skill.config.strikeEffect, this.skill.config.strikeAudio, this.target);
    }

    public setDirection(direction: Vec3): void {
        this.node.lookAt(this.target.beStrokedPoint.position);
    }

    // public static fromViewUp(out: Laya.Matrix3x3, view: Laya.Vector3, up?: Laya.Vector3) {
    //     if (Laya.Vector3.scalarLengthSquared(view) < EPSILON * EPSILON) {
    //         out.identity();
    //         return out;
    //     }

    //     up = up || new Laya.Vector3(0, 1, 0);
    //     const v3_1 = new Laya.Vector3();
    //     const v3_2 = new Laya.Vector3();
    //     Laya.Vector3.cross(up, view, v3_2);
    //     Laya.Vector3.normalize(v3_1, v3_2);

    //     if (Laya.Vector3.scalarLengthSquared(v3_1) < EPSILON * EPSILON) {
    //         out.identity();
    //         return out;
    //     }

    //     Laya.Vector3.cross(view, v3_1, v3_2);
    //     out.elements.set([
    //         v3_1.x, v3_1.y, v3_1.z,
    //         v3_2.x, v3_2.y, v3_2.z,
    //         view.x, view.y, view.z,
    //     ]);

    //     return out;
    // }

    // public static fromViewUp2(out: Laya.Quaternion, view: Laya.Vector3, up?: Laya.Vector3) {
    //     const m3_1 = new Laya.Matrix3x3();
    //     Missile.fromViewUp(m3_1, view, up);
    //     let q4_1 = new Laya.Quaternion();
    //     Laya.Quaternion.rotationMatrix(m3_1, q4_1);
    //     q4_1.normalize(out);
    //     return out;
    // }
}