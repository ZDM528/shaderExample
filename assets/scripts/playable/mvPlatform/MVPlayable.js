"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 素材与仓库的游戏事件通信，就是素材调用这些接口。
 */
class GameEvent {
    constructor(platform) {
        this.platform = platform;
    }
    gameReady() {
        var _a;
        log("MV platform gameReady");
        (_a = globalThis.gameReady) === null || _a === void 0 ? void 0 : _a.call(globalThis);
    }
    gameEnd(result) {
        var _a;
        log(`MV platform gameEnd ${result}`);
        (_a = globalThis.gameEnd) === null || _a === void 0 ? void 0 : _a.call(globalThis, result);
    }
    gameRetry() {
        var _a;
        log("MV platform gameRetry");
        (_a = globalThis.gameRetry) === null || _a === void 0 ? void 0 : _a.call(globalThis);
    }
}
function log(data, color = "#00AAEE") {
    console.log(`%c${data}`, `color:${color}`);
}
class MVPlayable {
    constructor(legacy = true) {
        this.gameEvent = new GameEvent(this);
        this.eventMap = new Map();
        let doc = document;
        doc.addEventListener("PLAYABLE:redirect", (e) => {
            if (e.detail.type == "ending")
                this.dispatchEventListener("gameEnd", e.detail.params[0]);
        });
        doc.addEventListener('PLAYABLE:switchScene', (e) => {
            this.dispatchEventListener("switchScene", e.detail.scene);
        });
        if (legacy) {
            globalThis.forceMuted = (muted = true) => this.dispatchEventListener("enableSounds", !muted);
            globalThis.stopAllSound = () => this.dispatchEventListener("enableSounds", false);
            globalThis.recoveryAllSound = () => this.dispatchEventListener("enableSounds", true);
            globalThis.gameStart = (startSounds = true) => this.dispatchEventListener("gameStart", startSounds);
            globalThis.retry = () => this.dispatchEventListener("reloadLanguage");
        }
    }
    /**
     * 当前渠道名称
     */
    get channel() { var _a; return (_a = globalThis.MW_CONFIG) === null || _a === void 0 ? void 0 : _a.channel; }
    /**
     * 是否屏蔽素材内置全局可点
     * @description true: 屏蔽全局可点； false: 启动全局可点
     * @default false 默认为false, 只有头条、穿山甲、抖音、pangle渠道设置为true
     */
    get disable_global_click() { var _a; return (_a = globalThis.MW_CONFIG) === null || _a === void 0 ? void 0 : _a.disable_global_click; }
    /**
     * 是否屏蔽素材内置自动跳转逻辑
     * @description true: 屏蔽自动跳转； false: 启动自动跳转
     * @default false 默认为false, 只有输出给DSP的渠道设置为true
     */
    get disable_auto_click() { var _a; return (_a = globalThis.MW_CONFIG) === null || _a === void 0 ? void 0 : _a.disable_auto_click; }
    /**
     * 是否屏蔽素材内置诱导跳转逻辑
     * @description true: 屏蔽诱导跳转； false: 启动诱导跳转
     * @default false 默认为false
     */
    get disable_induce_click() { var _a; return (_a = globalThis.MW_CONFIG) === null || _a === void 0 ? void 0 : _a.disable_yd_click; }
    /**
     * 获得当前语言
     */
    get languageName() {
        var _a;
        let urlLang = this.getQueryString("lang");
        let language = urlLang !== null && urlLang !== void 0 ? urlLang : ((_a = globalThis.MW_LIVE_PREVIEW_LANGUAGE) !== null && _a !== void 0 ? _a : globalThis.navigator.language);
        return (language + "").toLowerCase();
    }
    getQueryString(name) {
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        let r = window.location.search.substr(1).match(reg);
        if (r)
            return r[2];
    }
    ;
    /**
     * 监听仓库事件
     * @param type 事件类型
     * @param callback 事件触发时回调
     */
    addEventListener(type, callback) {
        this.eventMap.set(type, callback);
    }
    /**
     * 内部函数，请勿调用。
     * @param type 派发事件类型
     * @param params 该事件对应的参数
     * @returns 该事件返回的参数
     */
    dispatchEventListener(type, ...params) {
        let callback = this.eventMap.get(type);
        if (callback)
            return callback(...params);
    }
    /**
     * 给仓库发送游戏事件
     * @param type 事件类型
     * @param params 该事件对应的参数
     * @returns 该事件返回的参数
     */
    sendGameEvent(type, ...params) {
        return this.gameEvent[type].call(this.gameEvent, ...params);
    }
    /**
     * 跳转安装接口
     * @param type 跳转类型
     * @param index 策划要求的跳转索引
     */
    install(type, index) {
        var _a;
        log(`MV platform install ${type} ${index}`);
        (_a = globalThis.install) === null || _a === void 0 ? void 0 : _a.call(globalThis, { type: type });
    }
    /**
     * 发送埋点接口
     * @param action 埋点标识
     */
    sendAction(action) {
        var _a;
        (_a = globalThis.HttpAPI) === null || _a === void 0 ? void 0 : _a.sendPoint(action);
        log(`MV platform sendAction ${action}`);
    }
}
/** 当前MVPlayble 的版本号 */
MVPlayable.version = "1.1.2";
globalThis.mvPlayable = new MVPlayable();
