import { Node } from "cc";
import { audioManager } from "../core/AudioManager";
import ActionEvent, { Action } from "../utility/ActionEvent";
import BaseCharacter from "./BaseCharacter";
import CampManager from "./Camp/CampManager";
import CharacterConfig from "./Configs/CharacterConfig";

export default class Character extends BaseCharacter {
    /** 生命值事件，第一个参数是当前生命值，第二个参数是最大生命值 */
    public readonly healthEvent = new ActionEvent<number, number>();
    /** 攻击目标事件，第一个参数是目标，第二个参数是攻击伤害值 */
    public readonly hitEvent = new ActionEvent<Character, number>();
    /** 被攻击事件，第一个参数是目标，第二个参数是攻击伤害值 */
    public readonly beHitEvent = new ActionEvent<Character, number>();
    /** 死亡事件 */
    public readonly diedEvent = new ActionEvent();
    /** 杀死敌人事件 */
    public readonly killEnemyEvent = new ActionEvent<Character>();

    /** 所属GameObject */
    public get gameObject() { return this.node; }
    #config: CharacterConfig = null;
    /** 角色配置信息 */
    public get config() { return this.#config; }

    #health: number;
    /** 当前生命值 */
    public get health() { return this.#health; }
    /** 最大生命值 */
    public get maxHealth() { return this.config.health; }
    #isDeath: boolean = false;
    /** 是否已死亡 */
    public get isDeath() { return this.#isDeath; }


    #beStrokedPoint: Node;
    /** 受击点，如果没有配置，则默认为角色根节点 */
    public get beStrokedPoint() { return this.#beStrokedPoint; }

    //#region animation
    private onEffectEvent: Action;
    private onDamageEvent: Action;
    //#endregion

    /**
     * #### 初始化角色对象
     * @param config 角色配置表
     */
    public initialize(config: CharacterConfig, ...args: any): void {
        this.#config = config;
        this.#health = config.health;
        this.#isDeath = false;

        this.#beStrokedPoint = this.config.beStrokedName == null ? this.gameObject : this.gameObject.searchChild(this.config.beStrokedName);
        if (config.camp != null)
            CampManager.instance.addCharacter(config.camp, this);
    }

    public finalize(): void {
        if (!this.isDeath && this.config.camp != null)
            CampManager.instance.removeCharacter(this.config.camp, this);
        super.finalize();
    }

    /**
     * 受到攻击伤害
     * @param soruce 攻击自己的角色
     * @param damage 伤害值
     */
    public beHit(soruce: Character, damage: number): void {
        if (this.damageHealth(damage)) {
            soruce.hitEvent.DispatchAction(this, damage);
            this.beHitEvent.DispatchAction(soruce, damage);
            if (this.isDeath)
                soruce.killEnemyEvent.DispatchAction(this);
        }
    }

    /**
     * 伤害生命值
     * @param damage 伤害值
     * @returns 如果角色死亡，返回false
     */
    public damageHealth(damage: number): boolean {
        if (this.isDeath) return false;
        this.#health -= damage;
        if (this.health <= 0) {
            this.die();
        } else {
            if (this.config.damageAudio)
                audioManager.playEffect(this.config.damageAudio);
        }
        this.healthEvent.DispatchAction(this.#health, this.maxHealth);
        return true;
    }

    /**
     * 使角色死亡
     */
    public die(): void {
        if (this.isDeath) return;
        this.#isDeath = true;
        this.#health = 0;

        if (this.config.deathAudio)
            audioManager.playEffect(this.config.deathAudio);
        if (this.config.camp != null)
            CampManager.instance.removeCharacter(this.config.camp, this);
        this.diedEvent.DispatchAction();
    }

    public setAnimationEffect(onEffectEvent: Action, onDamageEvent: Action): void {
        this.onEffectEvent = onEffectEvent;
        this.onDamageEvent = onDamageEvent;
    }

    /**
     * #### 动画事件回调，外部请匆调用
     */
    public onAnimationEffectEvent(): void {
        if (this.onEffectEvent != null)
            this.onEffectEvent();
    }

    /**
     * #### 动画事件回调，外部请匆调用
     */
    public onAnimationDamageEvent(): void {
        if (this.onDamageEvent != null)
            this.onDamageEvent();
    }
}