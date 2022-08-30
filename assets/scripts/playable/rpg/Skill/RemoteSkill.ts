import BaseCharacter from "../BaseCharacter";
import { IRemoteSkillConfig } from "../Configs/SkillConfig";
import EffectManager from "../EffectManager";
import Missile from "./Missile/Missile";
import Skill from "./Skill";

/**
 * 远程技能，通用的远程技能类
 */
export default class RemoteSkill extends Skill<IRemoteSkillConfig> {

    protected async onDamageEvent(target: BaseCharacter) {
        let missileNode = await EffectManager.createEffectNodeByConfig(this.config.missileEffect, this.character.gameObject);
        let missile = missileNode.getOrAddComponent(this.config.missileEffect.effectClass) as Missile;
        if (this.config.missileEffect.effectClassParams)
            missile.initialize(this, target, ...this.config.missileEffect.effectClassParams);
        else
            missile.initialize(this, target);
    }
}