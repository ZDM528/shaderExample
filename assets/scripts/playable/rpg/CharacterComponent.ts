import BaseCharacter from "./BaseCharacter";

export default abstract class CharacterComponent<T extends BaseCharacter = BaseCharacter> {
    #character: T;
    public get character() { return this.#character; }

    public constructor(character: T) {
        this.#character = character;
    }

    /** 初始化组件，子对象可以自定义参数和类型 */
    public initialize(...args: any[]): void { }

    /** 组件完成，此函数会由Character在被清理的时候调用 */
    public finalize(): void { }

    public onEnable(): void { }

    public onDisable(): void { }

    /** 销毁此组件 */
    public destroy(): void {
        this.#character.removeComponent(this.constructor as AnyConstructor);
    }
}