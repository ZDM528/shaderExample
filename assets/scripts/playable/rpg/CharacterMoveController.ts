import BaseCharacter from "./BaseCharacter";
import CharacterComponent from "./CharacterComponent";

export default class CharacterMoveController extends CharacterComponent<BaseCharacter> {
    /** 移动速度 */
    public get moveSpeed() { return this.character.config.runSpeed; }

    private _frozenableCount: number = 0;
    /** 是否被冻结 */
    public get frozenable() { return this._frozenableCount > 0; }
    private _moveableCount: number = 0;
    /** 是否可移动 */
    public get moveable() { return this._moveableCount >= 0; }

    public initialize(...params: any): void {
        this._moveableCount = 0;
        this.character.diedEvent.addEvent(() => {
            this.disableMove();
        });
        super.initialize();
    }

    /** 开启角色移动 */
    public enableMove(): void {
        this._moveableCount++;
    }

    /** 关闭角色移动 */
    public disableMove(): void {
        this._moveableCount--;
    }

    /** 开启冻结 */
    public enableFrozen(): void {
        this._frozenableCount++;
    }

    /** 关闭冻结 */
    public disableFrozen(): void {
        this._frozenableCount--;
    }
}