import Character from "./Character";
import CharacterComponent from "./CharacterComponent";

export default class CharacterMoveController extends CharacterComponent<Character> {
    /** 移动速度 */
    public get moveSpeed() { return this.character.config.runSpeed; }

    #frozenableCount: number = 0;
    /** 是否被冻结 */
    public get frozenable() { return this.#frozenableCount > 0; }
    #moveableCount: number = 0;
    /** 是否可移动 */
    public get moveable() { return this.#moveableCount >= 0; }

    public initialize(): void {
        this.#moveableCount = 0;
        this.character.diedEvent.AddEvent(()=> {
            this.disableMove();
        });
    }

    /** 开启角色移动 */
    public enableMove(): void {
        this.#moveableCount++;
    }

    /** 关闭角色移动 */
    public disableMove(): void {
        this.#moveableCount--;
    }

    /** 开启冻结 */
    public enableFrozen(): void {
        this.#frozenableCount++;
    }

    /** 关闭冻结 */
    public disableFrozen(): void {
        this.#frozenableCount--;
    }
}