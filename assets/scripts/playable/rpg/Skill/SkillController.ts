import BaseCharacter from "../BaseCharacter";
import CharacterComponent from "../CharacterComponent";
import Skill from "./Skill";

export default class SkillController extends CharacterComponent<BaseCharacter> {
    private _skillableCount: number = 0;
    /** 是否可使用技能，普攻 */
    public get skillable() { return this._skillableCount >= 0; }
    private _skillList: Skill[];
    /** 技能列表（包括普通攻击） */
    public get skillList() { return this._skillList; }
    /** 普通攻击 */
    public get attackSkill() { return this._skillList[0]; }
    /** 第一个技能 */
    public get skill() { return this._skillList[1]; }

    public initialize(...skills: Skill[]): void {
        this._skillList = skills;
        this._skillableCount = 0;
        this.character.diedEvent.addEvent(this.onDied, this);
        for (let skill of skills)
            skill.initialize(this.character, this);
        super.initialize();
    }

    /**
     * 重设技术，比喻当技能升级时。
     * @param skill 新的技能
     * @param index 技术索引
     * @returns 
     */
    public resetSkill(skill: Skill, index: number): boolean {
        if (index >= this.skillList.length) return false;
        this.skillList[index]?.finalize();
        this.skillList[index] = skill;
        skill.initialize(this.character, this);
        return true;
    }

    /** 开启使用技能 */
    public enableSkillable(): void {
        this._skillableCount++;
    }

    /** 关闭使用技能 */
    public disableSkillable(): void {
        this._skillableCount--;
    }

    protected onDied(): void {
        for (let skill of this.skillList)
            skill.Complete(false);
        this.disableSkillable();
    }
}