import { Prefab, Node } from "cc";
import SkillEffectClass from "../Skill/SkillEffectClass";

/**
 * 技能特效配置信息
 */
export interface IEffectConfig {
    /** 特效名称，或者特效Prefab。 */
    effectAsset: string | Prefab | Node,
    /** 特效绑点名称，如果为null，则是根目录位置，如果不为null，表示绑在施法者身上的某个点。 */
    bindPoint?: string | Node;
    /** 是否绑在角色身上 */
    isLocal: boolean;
    /** 是否朝向跟绑点一致 */
    isForward?:boolean;
    /** 要挂在特效对象身上的自定义类 */
    effectClass?: any; // typeof SkillEffectClass;
    /** 自定义类参数 */
    effectClassParams?: any[];
}

/**
 * 技能配置信息，创建技能时需要
 */
export default interface ISkillConfig {
    /** 技能动作名称 */
    animationName: string;
    /** 技能动画混入时间 */
    crossFadeTime?: number;
    /** 攻击半径 */
    attackRadius?: number;
    /** 冷却时长，单位秒 */
    cooldown: number;
    /** 消耗能量 */
    costEnergy?: number;
    /** 技能伤害 */
    damage: number;
    /** 技能自身特效 */
    effect?: IEffectConfig;
    /** 攻击特效，即目标受击特效 */
    strikeEffect?: string | Node | Prefab;
    /** 攻击音效 */
    executeAudio?: string;
    /** 受击音效 */
    strikeAudio?: string;
    /** 是否可移动，默认不可移动 */
    movable?: boolean;
}

/** 远程技能配置信息 */
export interface IRemoteSkillConfig extends ISkillConfig {
    /** 飞行器速度 */
    missileSpeed: number;
    /** 飞行器特效 */
    missileEffect: IEffectConfig;
}

/** 持续性技能配置信息 */
export interface IContinuousSkillConfig extends ISkillConfig {
    /** 技能持续时长。单位毫秒 */
    duration: number;
    /** 攻击间隔 */
    attackInterval: number;
}