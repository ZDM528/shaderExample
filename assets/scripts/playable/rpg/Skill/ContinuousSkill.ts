import { game, Node } from "cc";
import CampManager from "../Camp/CampManager";
import Character from "../Character";
import { ContinuousSkillConfig } from "../Configs/SkillConfig";
import EffectManager from "../EffectManager";
import Skill from "./Skill";

/**
 * 持续性技能，通用持续性技能类
 */
export default class ContinuousSkill extends Skill<ContinuousSkillConfig> {
    private onUpdateFunc = this.onUpdate.bind(this);
    private effectNode: Node;
    private elapseTime: number = 0;
    private attackTime: number = 0;

    protected async onStart(target: Character) {
        super.onStart(target);
        this.effectNode = await EffectManager.createEffectNode(this.config.effect, this.character.gameObject);
        this.character.schedule(this.onUpdateFunc, 0, Infinity);
        this.elapseTime = 0;
        this.attackTime = this.config.attackInterval;
    }

    protected onAnimationComplete(): void {
        // do nothing 
    }

    onUpdate(): void {
        this.UpdateAttack();
        this.elapseTime += game.deltaTime;
        if (this.elapseTime >= this.config.duration) {
            this.Complete(true);
        }
    }

    protected UpdateAttack(): void {
        this.attackTime += game.deltaTime;
        if (this.attackTime <= this.config.attackInterval) return;
        this.attackTime -= this.config.attackInterval;
        let targetList = CampManager.instance.searchAroundEnemies(this.character, this.config.attackRadius);
        for (let target of targetList) {
            target.beHit(this.character, this.config.damage);
            EffectManager.playStrikeEffect(this.config.strikeEffect, this.config.strikeAudio, target);
        }
    }

    protected onEnd(result: boolean): void {
        super.onEnd(result);
        this.character.unschedule(this.onUpdateFunc);
        EffectManager.destroyEffect(this.effectNode);
    }
}