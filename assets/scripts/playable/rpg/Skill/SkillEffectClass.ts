import { Component } from "cc";
import Character from "../Character";
import Skill from "./Skill";

/**
 * 技能特效类，当一个技能执行时，会有相应的特效，如果该特效有特定逻辑，需要继承自此类
 */
export default class SkillEffectClass<T extends Skill = Skill> extends Component {
    #skill: T;
    /** 所属技能 */
    public get skill() { return this.#skill; }
    /** 所属角色 */
    public get character() { return this.#skill.character; }
    #target: Character;
    /** 技能目标 */
    public get target() { return this.#target; }

    /**
     * #### 初始化
     * @param skill 技能
     * @param target 技能目标对象
     * @param params 自定义参数
     */
    public initialize(skill: T, target: Character, ...params: any[]): void {
        this.#skill = skill;
        this.#target = target;
    }
}
