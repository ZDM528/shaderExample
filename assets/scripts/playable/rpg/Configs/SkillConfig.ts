import { Prefab } from "cc";
import SkillEffectClass from "../Skill/SkillEffectClass";

/**
 * 技能特效配置信息
 */
export interface EffectConfig {
    /** 特效名称，或者特效Prefab。 */
    effectName: string | Prefab,
    /** 特效绑点名称，如果为null，则是根目录位置，如果不为null，表示绑在施法者身上的某个点。 */
    bindName?: string;
    /** 是否绑在角色身上 */
    isLocal: boolean;
    /** 要挂在特效对象身上的自定义类 */
    effectClass: any; // typeof SkillEffectClass;
    /** 自定义类参数 */
    effectClassParams?: any[];
}

/**
 * 技能配置信息，创建技能时需要
 */
export default interface SkillConfig {
    /** 技能动作名称 */
    animationName: string;
    /** 攻击半径 */
    attackRadius: number;
    /** 冷却时长，单位秒 */
    cooldown: number;
    /** 消耗能量 */
    costEnergy?: number;
    /** 技能伤害 */
    damage: number;
    /** 技能自身特效 */
    effect?: EffectConfig;
    /** 攻击特效，即目标受击特效 */
    strikeEffect?: string;
    /** 攻击音效 */
    executeeAudio?: string;
    /** 受击音效 */
    strikeAudio?: string;
    /** 是否可移动，默认不可移动 */
    movable?: boolean;
}

/** 远程技能配置信息 */
export interface RemoteSkillConfig extends SkillConfig {
    /** 飞行器速度 */
    missileSpeed: number;
    /** 飞行器特效 */
    missileEffect: EffectConfig;
}

/** 持续性技能配置信息 */
export interface ContinuousSkillConfig extends SkillConfig {
    /** 技能持续时长。单位毫秒 */
    duration: number;
    /** 攻击间隔 */
    attackInterval: number;
}