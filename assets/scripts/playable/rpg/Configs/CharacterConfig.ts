import { assert } from "cc";
import { CharacterCamp, CharacterColorCamp } from "../Camp/CharacterCamp";

export interface ICharacterConfigData {
    /** 角色阵营 */
    camp?: CharacterCamp | CharacterColorCamp;
    /** 生命值 */
    health?: number;
    /** 走路速度 */
    walkSpeed?: number;
    /** 跑步速度 */
    runSpeed?: number;
    /** 角色身体半径 */
    bodyRadius?: number;
    /** 角色身体高度 */
    bodyHeight?: number;
    /** 视野半径 */
    sightRadius?: number;
    /** 视野角度 */
    sightAngle?: number;
    /** 攻击伤害 */
    attackValue?:number;
    /** 攻击间隔 */
    attackInterval?:number;
    /** 受伤音效 */
    damageAudio?: string;
    /** 死亡音效 */
    deathAudio?: string;
    /** 受击点名称 */
    beStrokedName?: string;
    /** 是否使用动画事件 */
    useAnimationEvent?: boolean;
    /** 尸体显示时长，没有配置表示不删除，一起存在，单位秒 */
    corpseTime?: number;
    /** 等级 */
    level?: number;
}

/**
 * 角色配置信息，创建角色时需要。
 */
export default interface ICharacterConfig extends Readonly<ICharacterConfigData> {
    /** 改变等级 */
    setLevelConfig(level: number): void;
}

export class CharacterConfig implements Required<ICharacterConfig> {
    private configs: ICharacterConfigData[] = [];
    private indexLevel: number = 0;
    private defaultLevel: number = 0;
    public get defaultConfig() { return this.configs[this.defaultLevel]; }
    public get curConfig() { return this.configs[this.indexLevel]; }

    public get level(): number { return this.indexLevel; }
    public get camp(): CharacterCamp | CharacterColorCamp { return this.curConfig.camp ?? this.defaultConfig.camp; }
    public get health(): number { return this.curConfig.health ?? this.defaultConfig.health; }
    public get walkSpeed(): number { return this.curConfig.walkSpeed ?? this.defaultConfig.walkSpeed; }
    public get runSpeed(): number { return this.curConfig.runSpeed ?? this.defaultConfig.runSpeed; }
    public get bodyRadius(): number { return this.curConfig.bodyRadius ?? this.defaultConfig.bodyRadius; }
    public get bodyHeight(): number { return this.curConfig.bodyHeight ?? this.defaultConfig.bodyHeight; }
    public get sightRadius(): number { return this.curConfig.sightRadius ?? this.defaultConfig.sightRadius; }
    public get sightAngle(): number { return this.curConfig.sightAngle ?? this.defaultConfig.sightAngle; }
    public get attackValue(): number { return this.curConfig.attackValue ?? this.defaultConfig.attackValue; }
    public get attackInterval(): number { return this.curConfig.attackInterval ?? this.defaultConfig.attackInterval; }
    public get damageAudio(): string { return this.curConfig.damageAudio ?? this.defaultConfig.damageAudio; }
    public get deathAudio(): string { return this.curConfig.deathAudio ?? this.defaultConfig.deathAudio; }
    public get beStrokedName(): string { return this.curConfig.beStrokedName ?? this.defaultConfig.beStrokedName; }
    public get useAnimationEvent(): boolean { return this.curConfig.useAnimationEvent ?? this.defaultConfig.useAnimationEvent; }
    public get corpseTime(): number { return this.curConfig.corpseTime ?? this.defaultConfig.corpseTime; }

    public constructor(...configs: Partial<ICharacterConfigData>[]) {
        this.configs = configs;
    }

    public setLevelConfig(indexLevel: number): void {
        this.indexLevel = indexLevel;
        assert(this.configs[indexLevel] != null);
    }
}