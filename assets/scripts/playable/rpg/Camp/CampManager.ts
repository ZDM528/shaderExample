import { Vec3 } from "cc";
import ActionEvent, { Func } from "../../utility/ActionEvent";
import Character from "../Character";
import { CharacterCamp } from "./CharacterCamp";

/**
 * 阵营管理器，用来区分和查找敌人。
 */
export default class CampManager {
    public static readonly instance = new CampManager();
    public readonly onCampAddEvent = new ActionEvent<Character, ReadonlyArray<Character>>();
    public readonly onCampRemoveEvent = new ActionEvent<Character, ReadonlyArray<Character>>();
    private campMap = new Map<CharacterCamp, Character[]>();

    /**
     * 添加一个角色
     * @param camp 该角色的阵营
     * @param character 角色对象
     */
    public addCharacter(camp: CharacterCamp, character: Character): void {
        let characterList = this.campMap.get(camp);
        if (characterList == null) {
            characterList = [];
            this.campMap.set(camp, characterList);
        }
        characterList.push(character);
        this.onCampAddEvent.DispatchAction(character, characterList);
    }

    /**
     * 删除一个角色
     * @param camp 该角色的阵营
     * @param character 角色对象
     * @returns 是否删除成功
     */
    public removeCharacter(camp: CharacterCamp, character: Character): boolean {
        let characterList = this.campMap.get(camp);
        if (characterList == null) return false;
        let result = this.removeCharacterFromList(characterList, character);
        this.onCampRemoveEvent.DispatchAction(character, characterList);
        return result;
    }

    /**
     * 销毁整个阵营的角色
     * @param camp 角色的阵营
     */
    public destroyCampCharacters(camp: CharacterCamp): void {
        let characterList = this.campMap.get(camp);
        if (characterList == null) return;
        for (let i = characterList.length - 1; i >= 0; i--) {
            const character = characterList[i];
            character.gameObject.active = false;
            character.destroy();
        }
    }

    /**
     * 获得该阵营的所有角色
     * @param camp 阵营
     * @returns 角色列表，是只读的哦，不要修改内容。
     */
    public getCampCharacterList(camp: CharacterCamp): ReadonlyArray<Character> {
        return this.campMap.get(camp);
    }

    /**
     * 查找最近的敌人
     * @param character 以此角色为中心，找最近的敌人
     * @returns 返回最近的敌人
     */
    public searchNearlyEnemy(character: Character): Character {
        return this.searchOtherCampCharacter(character, Infinity, (character, target) => {
            return Vec3.squaredDistance(character.gameObject.position, target.gameObject.position);
        }, (newDistance, oldDistance) => newDistance < oldDistance);
    }

    /**
     * 查找周围的敌人
     * @param character 以此角色为中心，找周围的敌人
     * @param radius 查找半径
     * @returns 返回周围的敌人（不为null）
     */
    public searchAroundEnemies(character: Character, radius: number): Character[] {
        let targetList: Character[] = [];
        let radiusSq = radius * radius;
        for (let item of this.campMap) {
            if (item[0] == character.config.camp) continue;
            for (let target of item[1]) {
                let distanceSquared = Vec3.squaredDistance(character.gameObject.worldPosition, target.gameObject.worldPosition);
                if (distanceSquared <= radiusSq) targetList.push(target);
            }
        }
        return targetList;
    }

    /**
     * 查找其它阵营的角色
     * @param character 以此角色为中心来查找其它阵营的角色
     * @param compareValue 用来新比较过滤的值
     * @param Filter 过滤器
     * @param Compare 比较器
     * @returns 返回其它阵营的角色
     */
    public searchOtherCampCharacter(character: Character, compareValue: number, Filter: Func<number, Character, Character>, Compare: Func<boolean, number, number>): Character {
        let finalCharacter: Character;
        for (let item of this.campMap) {
            if (item[0] == character.config.camp) continue;
            for (let target of item[1]) {
                let newValue = Filter(character, target);
                if (Compare(newValue, compareValue)) {
                    compareValue = newValue;
                    finalCharacter = target;
                }
            }
        }
        return finalCharacter;
    }

    private removeCharacterFromList(characterList: Character[], character: Character): boolean {
        let index = characterList.indexOf(character);
        if (index != -1)
            return characterList.splice(index, 1) != null;
        return false;
    }
}