import { game, JsonAsset, warn } from "cc";
import { BUILD, DEV } from "cc/env";
import Timer from "../extenstion/Timer";
import GameConfigManager from "../gameConfig/GameConfigManager";
import LocalizeManager from "../localize/LocalizeManager";
import { View } from "../ui/View";
import ActionEvent from "../utility/ActionEvent";
import { XTween } from "../xtween/XTween";
import { audioManager } from "./AudioManager";
import { GameManager } from "./GameManager";
import { Main } from "./Main";

/** 跳转类型 */
export enum InstallType {
    None = 1,
    Global = 2,
    Auto = 4,
    Induce = 8
}

const installTypeWrap: string[] = [];
installTypeWrap[InstallType.Global] = "globalClick";
installTypeWrap[InstallType.Auto] = "autoClick";
installTypeWrap[InstallType.Induce] = "youdaoClick";

function windowWidth(): number {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
}

function windowHeight(): number {
    return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
}

class Playable {
    /**
     * 重玩事件，@param 参数1是重玩次数，默认从1开始。
     */
    public readonly retryEvent = new ActionEvent<number>();
    public readonly startGameEvent = new ActionEvent();
    private _isGameStarted: boolean = false;
    public get isGameStarted() { return this._isGameStarted; }
    private _retryCount: number = 0;
    public get retryCount() { return this._retryCount; }
    private _enabledAction: boolean = true;
    public get enableAction() { return this._enabledAction; }
    public set enableAction(value) { this._enabledAction = value; }
    public get isInduce() { return !globalThis.mvPlayable?.disable_induce_click ?? true; }
    private _isGameOver: boolean = false;
    public get isGameOver() { return this._isGameOver; }

    public async initialize(audioPath: string, gameConfig: JsonAsset, langConfig: JsonAsset) {
        console.logColor("Playable initialize");
        if (DEV) {
            // 给调试版本增加一个命令，快速到ending。
            globalThis.showCanvas = (isShow: boolean = true) => GameManager.instance.activeCanvas(isShow);
            globalThis.gameOver = (result?: boolean) => this.gameEnd(result);
            globalThis.gameRetry2 = () => this.retryGame();
        }

        await this.checkWindowResize();

        const mvPlayable = globalThis.mvPlayable;
        if (mvPlayable != null) {
            mvPlayable.addEventListener("gameStart", this.gameStart.bind(this));
            mvPlayable.addEventListener("gameEnd", this.gameEnd.bind(this));
            mvPlayable.addEventListener("reloadLanguage", () => {
                LocalizeManager.loadLanguageConfig(langConfig);
                LocalizeManager.setLocalize(mvPlayable?.languageName ?? "zh-cn");
            });
            mvPlayable.addEventListener("enableSounds", (enable) => audioManager.enableSounds = enable);
        }

        try {
            GameConfigManager.initialize(gameConfig);
        } catch (error) {
            warn(error);
        }
        try {
            LocalizeManager.initialize(langConfig);
            LocalizeManager.setLocalize(mvPlayable?.languageName ?? "zh-cn");
        } catch (error) {
            warn(error);
        }

        audioManager.initialize(audioPath);

        await this.reloadScene();

        if (GameManager.instance.disableRetryActions)
            this.retryEvent.addEventOnce(() => this.enableAction = false);
            
        this.gameReady();
    }

    private async checkWindowResize() {
        let width = windowWidth(), height = windowHeight();
        // 检测当前环境是不是已经有窗口大小了，如果没有则等到有时才初始化。
        if (width == 0 || height == 0) {
            await new Promise<void>(resolve => {
                let handle = setInterval(() => {
                    width = windowWidth(), height = windowHeight()
                    if (width != 0 && height != 0) {
                        clearInterval(handle);
                        resolve();
                    }
                }, 1);
            });
        }

        // setInterval(() => {
        //     let newWidth = windowWidth(), newHeight = windowHeight()
        //     if (width != newWidth || height != newHeight) {
        //         width = newWidth, height = newHeight;
        //         this.dispatchSizeEvent();
        //     }
        // }, 100);
        this.dispatchSizeEvent();
    }

    private dispatchSizeEvent(): void {
        if (typeof (Event) === 'function') {
            // modern browsers
            window.dispatchEvent(new Event('resize'));
        } else {
            // for IE and other old browsers
            // causes deprecation warning on modern browsers
            let event = window.document.createEvent('UIEvents');
            event.initUIEvent('resize', true, false, window, 0);
            window.dispatchEvent(event);
        }
    }

    public gameReady(): void {
        console.logColor(`game launch time: ${game.totalTime / 1000}s`, "#AA0000");
        // if (globalThis.mvPlayable != null)
        //     mvPlayable.sendGameEvent("gameReady");
        // else this.gameStart();
        if (!BUILD)
            this.gameStart()
        else if (globalThis.mvPlayable != null)
            mvPlayable.sendGameEvent("gameReady");
    }

    private gameStart(startSounds: boolean = true): void {
        console.logColor("game start");
        this.dispatchSizeEvent();
        audioManager.playMusic("bm_bgm");
        if (!startSounds && document) {
            audioManager.enableSounds = false;
            const enableSounds = () => {
                audioManager.enableSounds = true;
                canvas.removeEventListener("touchstart", enableSounds);
                canvas.removeEventListener("touchend", enableSounds);
                canvas.removeEventListener("mousedown", enableSounds);
            };
            const canvas = document.getElementById('GameCanvas') as HTMLCanvasElement;
            canvas?.addEventListener('touchstart', enableSounds, { once: true });
            canvas?.addEventListener('touchend', enableSounds, { once: true });
            canvas?.addEventListener('mousedown', enableSounds, { once: true });
        }
        this._isGameStarted = true;
        this.startGameEvent.dispatchActionAndComplete();
    }

    public gameEnd<T extends View>(...params: Parameters<T["intialize"]>): void {
        this._isGameOver = true;
        GameManager.instance.hideGameView();
        GameManager.instance.createEndingView<T>(...params);
        globalThis.mvPlayable?.sendGameEvent("gameEnd", params[0]);
    }

    public install(type?: InstallType, index?: number): void {
        const installValue = installTypeWrap[type & -type]; // 只取最右边第一个1的位。
        globalThis.mvPlayable?.install(installValue, index);
    }

    /** 埋点接口 */
    public sendAction(action: number, force: boolean = false): void {
        if (!this.enableAction && !force) return;
        let str = "action&action=" + action;
        globalThis.mvPlayable?.sendAction(str);
    }

    public async reloadScene(): Promise<void> {
        XTween.removeAllTweens();
        Timer.instance.removeAll();
        await Main.reloadGameScene();
        // await GameManager.instance.initialize();
    }

    public async retryGame(): Promise<void> {
        this._retryCount++;
        await this.reloadScene();
        audioManager.playMusic("bm_bgm");
        globalThis.mvPlayable?.sendGameEvent("gameRetry");
        this.retryEvent.dispatchAction(this.retryCount);
        this.startGameEvent.dispatchAction();
    }

    public copyToClipBoard(text: string): boolean {
        let input = document.createElement("input");
        document.body.appendChild(input);
        input.value = text;
        input.select(); // 选择对象
        const result = document.execCommand("copy");
        document.body.removeChild(input);
        console.warn("copyToClipBoard", result, text);
        return result;
    }
}

export const playable = new Playable();
Main.onLoadedGameScene = playable.initialize.bind(playable);