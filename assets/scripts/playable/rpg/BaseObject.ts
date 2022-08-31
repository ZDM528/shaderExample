import { Component } from "cc";
import ActionEvent, { Action } from "../utility/ActionEvent";
import CharacterComponent from "./CharacterComponent";

export default class BaseObject extends Component {
    /** 销毁事件 */
    public readonly finalizeEvent = new ActionEvent();
    /** 销毁事件 */
    public readonly onUpdateEvent = new ActionEvent<number>();

    private _isInitalized: boolean = false;
    public get isInitalized() { return this._isInitalized; }

    //#region animation
    private onEffectEvent: Action;
    private onDamageEvent: Action;
    /** 是否使用动画事件 */
    public get useAnimationEvent() { return false; }
    //#endregion

    /** 角色组件 */
    private components = new Map<any, CharacterComponent>();

    /**
     * 覆盖此函数记得调用 super.onEnable()
     */
    onEnable(): void {
        this.components.forEach((component) => component.onEnable());
    }

    /**
     * 覆盖此函数记得调用 super.update(deltaTime)
     * @param deltaTime 
     */
    update(deltaTime: number): void {
        this.onUpdateEvent.dispatchAction(deltaTime);
        this.components.forEach((component) => component.onUpdate(deltaTime));
    }

    /**
     * 覆盖此函数记得调用 super.onDisable()
     */
    onDisable(): void {
        this.components.forEach((component) => component.onDisable());
    }

    /**
     * 覆盖此函数记得调用 super.onDestroy 
     */
    onDestroy(): void {
        this.finalize();
    }

    /**
     * #### 初始化角色对象
     */
    public initialize(...params: any[]): void {
        if (this.isInitalized) return;
        this._isInitalized = true;
    }

    /**
     * 对象被释放
     * @returns 
     */
    public finalize(): void {
        if (!this.isInitalized) return;
        this.finalizeEvent.dispatchAction();
        this._isInitalized = false;
        this.components.forEach((component) => component.finalize());
        this.components.clear();
    }

    /**
     * 检查角色是否包含此组件
     * @param classType 组件类型
     * @returns 检查结果
     */
    public containsCharacterComponent<T extends CharacterComponent>(classType: AnyConstructor<T>): boolean {
        return this.components.get(classType) != null;
    }

    /**
     * 获得角色组件
     * @param classType 组件类型
     * @returns 组件实例
     */
    public getCharacterComponent<T extends CharacterComponent>(classType: AnyConstructor<T>): T | null {
        let target = this.components.get(classType) as T;
        if (target != null) return target;
        for (const [key, component] of this.components)
            if (component instanceof classType)
                return component;
        return null;
    }

    /**
     * 添加角色组件
     * @param classType 组件类型
     * @param args 组件初始化参数
     */
    public addCharacterComponent<T extends CharacterComponent>(classType: AnyConstructor<T>): T {
        if (this.containsCharacterComponent(classType)) return null;
        let component = new classType(this);
        this.components.set(classType, component);
        return component;
    }

    /**
     * 销毁角色组件
     * @param classType 组件类型
     * @returns 销毁结果
     */
    public removeComponent<T extends CharacterComponent>(classType: AnyConstructor<T>): boolean {
        let component = this.components.get(classType);
        if (component != null) {
            component.onDisable();
            component.finalize();
        }
        return this.components.delete(classType);
    }

    public setAnimationEffect(onEffectEvent: Action, onDamageEvent: Action): void {
        this.onEffectEvent = onEffectEvent;
        this.onDamageEvent = onDamageEvent;
    }

    /**
     * #### 动画事件回调，外部请匆调用
     */
    public onAnimationEffectEvent(): void {
        if (this.onEffectEvent != null)
            this.onEffectEvent();
    }

    /**
     * #### 动画事件回调，外部请匆调用
     */
    public onAnimationDamageEvent(): void {
        if (this.onDamageEvent != null)
            this.onDamageEvent();
    }
}