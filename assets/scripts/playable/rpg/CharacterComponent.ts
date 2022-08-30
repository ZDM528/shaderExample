import BaseObject from "./BaseObject";

export default abstract class CharacterComponent<T extends BaseObject = BaseObject> {
    private _character: T;
    public get character() { return this._character; }
    public get node() { return this.character.node; }

    public constructor(character: T) {
        this._character = character;
    }

    /** 初始化组件，子对象可以自定义参数和类型 */
    public initialize(...args: any[]): void {
        if (this.character.enabled) this.onEnable();
    }

    /** 组件完成，此函数会由Character在被清理的时候调用 */
    public finalize(): void { }

    public onEnable(): void { }

    public onDisable(): void { }

    public onUpdate(deltaTime: number): void { }

    /** 销毁此组件 */
    public destroy(): void {
        this._character.removeComponent(this.constructor as AnyConstructor);
    }
}