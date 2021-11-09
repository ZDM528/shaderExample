import Character from "../Character";
import CharacterComponent from "../CharacterComponent";
import Skill from "./Skill";

export default class SkillController extends CharacterComponent<Character> {
    #skillableCount: number = 0;
    /** 是否可使用技能，普攻 */
    public get skillable() { return this.#skillableCount >= 0; }
    #skillList: Skill[];
    /** 技能列表（包括普通攻击） */
    public get skillList() { return this.#skillList; }
    /** 普通攻击 */
    public get attackSkill() { return this.#skillList[0]; }
    /** 第一个技能 */
    public get skill() { return this.#skillList[1]; }

    public initialize(skills: Skill[]): void {
        this.#skillList = skills;
        this.#skillableCount = 0;
        this.character.diedEvent.AddEvent(this.onDied, this);
        for (let skill of skills)
            skill.initialize(this.character, this);
    }

    /** 开启使用技能 */
    public enableSkill(): void {
        this.#skillableCount++;
    }

    /** 关闭使用技能 */
    public disableSkill(): void {
        this.#skillableCount--;
    }

    protected onDied(): void {
        for (let skill of this.skillList)
            skill.Complete(false);
        this.disableSkill();
    }
}