import { Component } from "cc";
import ActionEvent from "../utility/ActionEvent";
import CharacterComponent from "./CharacterComponent";

export default class BaseCharacter extends Component {
    /** 销毁事件 */
    public readonly finalizeEvent = new ActionEvent();

    #isInitalized: boolean = false;
    public get isInitalized() { return this.#isInitalized; }

    /** 角色组件 */
    #components = new Map<any, CharacterComponent>();

    onEnable(): void {
        this.#components.forEach((component) => component.onEnable());
    }

    onDisable(): void {
        this.#components.forEach((component) => component.onDisable());
    }

    onDestroy(): void {
        this.finalize();
    }

    /**
     * #### 初始化角色对象
     */
    public initialize(...params: any[]): void {
        if (this.isInitalized) return;
        this.#isInitalized = true;
    }

    /**
     * 对象被释放
     * @returns 
     */
    public finalize(): void {
        if (!this.isInitalized) return;
        this.finalizeEvent.DispatchAction();
        this.#isInitalized = false;
        this.#components.forEach((component) => component.finalize());
        this.#components.clear();
    }

    /**
     * 检查角色是否包含此组件
     * @param classType 组件类型
     * @returns 检查结果
     */
    public containsCharacterComponent<T extends CharacterComponent>(classType: AnyConstructor<T>): boolean {
        return this.#components.get(classType) != null;
    }

    /**
     * 获得角色组件
     * @param classType 组件类型
     * @returns 组件实例
     */
    public getCharaterComponent<T extends CharacterComponent>(classType: AnyConstructor<T>): T {
        return this.#components.get(classType) as T;
    }

    /**
     * 添加角色组件
     * @param classType 组件类型
     * @param args 组件初始化参数
     * @returns 组件实例
     */
    public addCharacterComponent<T extends CharacterComponent>(classType: AnyConstructor<T>, ...args: Parameters<T["initialize"]>): T {
        if (this.containsCharacterComponent(classType)) return null;
        let component = new classType(this);
        component.initialize(...args);
        this.#components.set(classType, component);
        return component;
    }

    /**
     * 销毁角色组件
     * @param classType 组件类型
     * @returns 销毁结果
     */
    public removeComponent<T extends CharacterComponent>(classType: AnyConstructor<T>): boolean {
        let component = this.#components.get(classType);
        if (component != null) {
            component.onDisable();
            component.finalize();
        }
        return this.#components.delete(classType);
    }
}