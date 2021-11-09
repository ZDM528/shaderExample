import { CharacterCamp } from "../Camp/CharacterCamp";

/**
 * 角色配置信息，创建角色时需要。
 */
export default interface CharacterConfig {
    /** 角色阵营 */
    camp?: CharacterCamp;
    /** 生命值 */
    health: number;
    /** 走路速度 */
    walkSpeed?: number;
    /** 跑步速度 */
    runSpeed: number;
    /** 角色身体半径 */
    bodyRadius: number;
    /** 视野半径 */
    sightRadius?: number;
    /** 视野角度 */
    sightAngle?: number;
    /** 受伤音效 */
    damageAudio?: string;
    /** 死亡音效 */
    deathAudio?: string;
    /** 受击点名称 */
    beStrokedName?: string;
    /** 是否使用动画事件 */
    useAnimationEvent?: boolean;
    /** 尸体显示时长，没有配置表示不删除，一起存在，单位毫秒 */
    corpseTime?: number;
}