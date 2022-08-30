/** 角色默认的动画类型 */

export enum CharacterAnimationType {
    Bron,
    Sleep,
    Idle,
    Walk,
    Run,
    Attack,
    Skill,
    Die
}

const values: string[] = [];
for (let key of Object.keys(CharacterAnimationType))
    values.push(key);
export const CharacterAnimationValue: readonly string[] = values;

export function setCharacterAnimationValue(type: CharacterAnimationType, value: string) {
    values[type] = value;
}