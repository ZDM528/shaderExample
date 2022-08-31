import { Node, Vec3, _decorator } from "cc";
import { audioManager } from "../core/AudioManager";
import ActionEvent from "../utility/ActionEvent";
import BaseObject from "./BaseObject";
import CampManager from "./Camp/CampManager";
import ICharacterConfig, { ICharacterConfigData } from "./Configs/CharacterConfig";

const { ccclass, property } = _decorator;
@ccclass('BaseCharacter')
export default class BaseCharacter extends BaseObject {
    /** 生命值事件，第一个参数是当前生命值，第二个参数是最大生命值 */
    public readonly healthEvent = new ActionEvent<number, number>();
    /** 攻击目标事件，第一个参数是目标，第二个参数是攻击伤害值 */
    public readonly hitEvent = new ActionEvent<BaseCharacter, number, Vec3>();
    /** 被攻击事件，第一个参数是目标，第二个参数是攻击伤害值 */
    public readonly beHitEvent = new ActionEvent<BaseCharacter, number, Vec3>();
    /** 死亡事件 */
    public readonly diedEvent = new ActionEvent<BaseCharacter>();
    /** 复活事件 */
    public readonly reviveEvent = new ActionEvent();
    /** 杀死敌人事件 */
    public readonly killEnemyEvent = new ActionEvent<BaseCharacter>();

    /** 所属GameObject */
    public get gameObject() { return this.node; }
    private _config: ICharacterConfigData = null;
    /** 角色配置信息 */
    public get config() { return this._config; }

    protected _health: number;
    /** 当前生命值 */
    public get health() { return this._health; }
    /** 最大生命值 */
    public get maxHealth() { return this.config.health; }
    protected _isDeath: boolean = false;
    /** 是否已死亡 */
    public get isDeath() { return this._isDeath; }

    protected _beStrokedPoint: Node;
    /** 受击点，如果没有配置，则默认为角色根节点 */
    public get beStrokedPoint() { return this._beStrokedPoint; }

    public get useAnimationEvent() { return this.config.useAnimationEvent; }

    /**
     * #### 初始化角色对象
     * @param config 角色配置表
     */
    public initialize(config: ICharacterConfigData, ...args: any): void {
        super.initialize();
        this._config = config;
        this._health = config.health;
        this._isDeath = false;

        this.updateBestrokedPoint(this.node);
        if (config.camp != null)
            CampManager.instance.addCharacter(config.camp, this);
    }

    public updateBestrokedPoint(node: Node): void {
        this._beStrokedPoint = this.config.beStrokedName == null ? node : node.searchChild(this.config.beStrokedName);
    }

    public resetConfig(config: ICharacterConfig): void {
        let increaseHealth = config.health - this.config.health;
        this._config = config;
        if (increaseHealth > 0) {
            this._health += increaseHealth;
            this.healthEvent.dispatchAction(this.health, this.maxHealth);
        }
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
    public beHit(damage: number, soruce: BaseCharacter, hitPosition?: Vec3): void {
        if (this.damageHealth(damage, soruce)) {
            soruce.hitEvent.dispatchAction(this, damage, hitPosition);
            this.beHitEvent.dispatchAction(soruce, damage, hitPosition);
            if (this.isDeath)
                soruce.killEnemyEvent.dispatchAction(this);
        }
    }

    /**
     * 伤害生命值
     * @param damage 伤害值
     * @returns 如果角色死亡，返回false
     */
    public damageHealth(damage: number, soruce?: BaseCharacter): boolean {
        if (this.isDeath) return false;
        this._health -= damage;
        if (this.health <= 0) {
            this.die(soruce);
        } else {
            if (this.config.damageAudio)
                audioManager.playEffect(this.config.damageAudio);
        }
        this.healthEvent.dispatchAction(this.health, this.maxHealth);
        return true;
    }

    /**
     * 使角色死亡
     */
    public die(soruce?: BaseCharacter): void {
        if (this.isDeath) return;
        this._isDeath = true;
        this._health = 0;

        if (this.config.deathAudio)
            audioManager.playEffect(this.config.deathAudio);
        if (this.config.camp != null)
            CampManager.instance.removeCharacter(this.config.camp, this);
        this.diedEvent.dispatchAction(soruce);
    }

    /**
     * 复活
     */
    public revive(): void {
        if (!this.isDeath) return;
        this._isDeath = false;
        this._health = this.config.health;
        this.reviveEvent.dispatchAction();
    }
}