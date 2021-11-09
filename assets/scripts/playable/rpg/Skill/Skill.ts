import { game } from "cc";
import { audioManager } from "../../core/AudioManager";
import ActionEvent, { Action } from "../../utility/ActionEvent";
import Character from "../Character";
import CharacterAnimator from "../CharacterAnimator";
import CharacterMoveController from "../CharacterMoveController";
import SkillConfig from "../Configs/SkillConfig";
import EffectManager from "../EffectManager";
import SkillController from "./SkillController";

/**
 * 技能，角色技能
 */
export default class Skill<T extends SkillConfig = SkillConfig> {
    /** 技能配置信息 */
    public readonly config: T;
    #character: Character;
    /** 所属角色 */
    public get character() { return this.#character; }
    #skillController: SkillController;
    /** 技能组件 */
    public get skillController() { return this.#skillController; }
    /** 技能开始事件 */
    public readonly onSkillStartEvent = new ActionEvent();
    /** 技能结束事件 */
    public readonly onSkillEndEvent = new ActionEvent();
    private skillStartTime: number = 0;
    /** 技能是否已经冷却完毕 */
    public get isCooldown() { return (game.totalTime - this.skillStartTime) * 0.001 > this.config.cooldown; }
    /** 获得技能剩余冷却时长，正数表示剩余时长，小于0表示已经冷却完毕。单位秒 */
    public get cooldowningTime() { return this.config.cooldown - (game.totalTime - this.skillStartTime) * 0.001; }
    private onCompletedCallback: Action<boolean>;
    #isExecuting: boolean = false;
    /** 技能是否在执行中 */
    public get isExecuting() { return this.#isExecuting; }

    /**
     * 创建一个技能
     * @param config 技能配置信息
     */
    public constructor(config: T) {
        this.config = config;
    }

    /**
     * 初始化技术属性
     * @param character 所属的角色
     * @param skillController 技能组件
     */
    public initialize(character: Character, skillController: SkillController): void {
        this.#character = character;
        this.#skillController = skillController;
    }

    /**
     * 执行一个技能
     * @param target 
     * @param onCallback 
     */
    public execute(target: Character, onCallback?: Action<boolean>): void {
        if (!this.isCooldown || this.isExecuting) {
            if (onCallback) onCallback(false);
            return;
        }

        this.onCompletedCallback = onCallback;
        this.skillStartTime = game.totalTime;
        this.onStart(target);
        let animator = this.character.getCharaterComponent(CharacterAnimator);
        animator?.play(this.config.animationName, this.onAnimationComplete.bind(this, target), this.onEffectEvent.bind(this, target), this.onDamageEvent.bind(this, target));
    }

    /**
     * 技能开始回调函数
     * @param target 技能目标
     */
    protected onStart(target: Character): void {
        this.#isExecuting = true;
        if (!!this.config.movable)
            this.character.getCharaterComponent(CharacterMoveController)?.disableMove();
        this.skillController.disableSkill();
        this.onSkillStartEvent.DispatchAction();
        audioManager.playEffect(this.config.executeeAudio);
    }

    /**
     * 技能特效事件回调
     * @param target 技能目标
     */
    protected onEffectEvent(target: Character): void {
        if (this.config.effect)
            EffectManager.playEffectByConfig(this.config.effect, this.character.gameObject);
    }

    /**
     * 技能伤害事件回调
     * @param target 技能目标
     */
    protected onDamageEvent(target: Character): void {
        target.beHit(this.character, this.config.damage);
        EffectManager.playStrikeEffect(this.config.strikeEffect, this.config.strikeAudio, target);
    }

    /**
     * 技能结束事件回调
     * @param result 技能目标
     */
    protected onEnd(result: boolean): void {
        this.#isExecuting = false;
        if (!!this.config.movable)
            this.character.getCharaterComponent(CharacterMoveController)?.enableMove();
        this.skillController.enableSkill();
        this.onSkillEndEvent.DispatchAction();
        if (this.onCompletedCallback) {
            this.onCompletedCallback(result);
            this.onCompletedCallback = null;
        }
    }

    /**
     * 技能结束
     */
    protected onAnimationComplete(): void {
        this.Complete(true);
    }

    /**
     * 结束技能
     * @param result 执行技能结果，成功或失败
     */
    public Complete(result: boolean): void {
        if (!this.isExecuting) return;
        this.onEnd(result);
    }
}