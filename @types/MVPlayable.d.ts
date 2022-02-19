declare global {
    namespace MW_CONFIG {
        var disable_global_click: boolean;
        var disable_auto_click: boolean;
        var disable_yd_click: boolean;
    }
    var MW_LIVE_PREVIEW_LANGUAGE: boolean;
    function gameStart(startSounds?: boolean): void;
    function gameRetry(): void;
    function gameEnd(result: boolean): void;
    function stopAllSound(): void;
    function recoveryAllSound(): void;
    function retry(): void;
    /**
     * 开关声音
     * @param enable 开关，true是关声音，false是开声音
     */
    function forceMuted(enable: boolean): void;
    function gameReady(): void;
    function install(param: {}): void;
    namespace HttpAPI {
        function sendPoint(value: string): void;
    }
    var mvPlayable: MVPlayable;
}
declare type ObjectInclude<T, E> = {
    [k in keyof T]: T[k] extends E ? k : never;
}[keyof T];
/**
 * 这个是仓库通知素材的事件，仓库也只有这唯一一条与素材交互的通道。
 */
interface EventTypeObject {
    /**
     * 游戏开始
     */
    gameStart(startSounds?: boolean): void;
    /**
     * 游戏结束
     * @param result 游戏结果
     */
    gameEnd(result: boolean): void;
    /**
     * 修改当前语言
     * @param name 语言名称
     */
    setLanguage(name: string): boolean;
    /**
     * 重新加载语言
     */
    reloadLanguage(): void;
    /**
     * 开关所有声音
     * @param enable true 为打开，false为关闭
     */
    enableSounds(enable: boolean): void;
}
/**
 * 素材与仓库的游戏事件通信，就是素材调用这些接口。
 */
declare class GameEvent {
    readonly platform: MVPlayable;
    constructor(platform: MVPlayable);
    gameReady(): void;
    gameEnd(result: boolean): void;
    gameRetry(): void;
}
declare class MVPlayable {
    static readonly version = "1.0.0";
    private readonly gameEvent;
    private eventMap;
    /**
     * 是否屏蔽素材内置全局可点
     * @description true: 屏蔽全局可点； false: 启动全局可点
     * @default false 默认为false, 只有头条、穿山甲、抖音、pangle渠道设置为true
     */
    get disable_global_click(): boolean;
    /**
     * 是否屏蔽素材内置自动跳转逻辑
     * @description true: 屏蔽自动跳转； false: 启动自动跳转
     * @default false 默认为false, 只有输出给DSP的渠道设置为true
     */
    get disable_auto_click(): boolean;
    /**
     * 是否屏蔽素材内置诱导跳转逻辑
     * @description true: 屏蔽诱导跳转； false: 启动诱导跳转
     * @default false 默认为false
     */
    get disable_induce_click(): boolean;
    /**
     * 获得当前语言
     */
    get languageName(): string;
    private getQueryString;
    constructor();
    /**
     * 监听仓库事件
     * @param type 事件类型
     * @param callback 事件触发时回调
     */
    addEventListener<T extends ObjectInclude<EventTypeObject, Function>>(type: T, callback: (...params: Parameters<EventTypeObject[T]>) => void): void;
    /**
     * 内部函数，请勿调用。
     * @param type 派发事件类型
     * @param params 该事件对应的参数
     * @returns 该事件返回的参数
     */
    dispatchEventListener<T extends ObjectInclude<EventTypeObject, Function>>(type: T, ...params: Parameters<EventTypeObject[T]>): ReturnType<EventTypeObject[T]>;
    /**
     * 给仓库发送游戏事件
     * @param type 事件类型
     * @param params 该事件对应的参数
     * @returns 该事件返回的参数
     */
    sendGameEvent<T extends ObjectInclude<GameEvent, Function>>(type: T, ...params: Parameters<GameEvent[T]>): ReturnType<GameEvent[T]>;
    install(type?: string, index?: number): void;
    /** 埋点接口 */
    sendAction(action: string): void;
}
export {};
