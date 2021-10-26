import { DEV } from "cc/env";
import GameConfigManager from "../gameConfig/GameConfigManager";
import LocalizeManager from "../localize/LocalizeManager";
import { mvPlatform } from "../MVPlatform/Platform";
import { View } from "../ui/View";
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

class Playable {
    #retryCount: number = 0;
    public get retryCount() { return this.#retryCount; }

    public async initialize() {
        console.log("Playable initialize");
        if (DEV) {
            // 给调试版本增加一个命令，快速到ending。
            globalThis.gameOver = (result?: boolean) => this.gameEnd(result);
        }

        this.checkWindowResize();

        if (mvPlatform) {
            mvPlatform.addEventListener("gameStart", this.gameStart.bind(this));
            mvPlatform.addEventListener("gameEnd", this.gameEnd.bind(this));
            mvPlatform.addEventListener("reloadLanguage", () => {
                LocalizeManager.loadLanguageConfig("config/languages")
                    .then(() => LocalizeManager.setLocalize(mvPlatform?.languageName ?? "zh-cn"));
            });
            mvPlatform.addEventListener("enableSounds", (enable) => audioManager.enableSounds = enable);
        }

        try {
            await GameConfigManager.initialize("config/gameConfig");
        } catch (error) {
            console.warn(error);
        }
        try {
            await LocalizeManager.initialize("config/languages");
            LocalizeManager.setLocalize(mvPlatform?.languageName ?? "zh-cn");
        } catch (error) {
            console.warn(error);
        }

        audioManager.initialize();
        mvPlatform != null ? mvPlatform.sendGameEvent("gameReady") : this.gameStart();
    }

    private checkWindowResize(): void {
        let width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        let height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        setInterval(() => {
            let newWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            let newHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            if (width != newWidth || height != newHeight) {
                width = newWidth;
                height = newHeight;
                this.dispatchSizeEvent();
            }
        }, 100);
        this.dispatchSizeEvent();
    }

    private dispatchSizeEvent(): void {
        console.log("dispatchSizeEvent");
        if (typeof (Event) === 'function') {
            // modern browsers
            window.dispatchEvent(new Event('resize'));
        } else {
            // for IE and other old browsers
            // causes deprecation warning on modern browsers
            var evt = window.document.createEvent('UIEvents');
            evt.initUIEvent('resize', true, false, window, 0);
            window.dispatchEvent(evt);
        }
    }

    private gameStart(startSounds: boolean = true): void {
        console.log("gameStart");
        this.dispatchSizeEvent();
        Main.reloadGameScene();
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
    }

    public gameEnd<T extends View>(...params: Parameters<T["intialize"]>): void {
        GameManager.instance.createEndingView<T>(...params);
        mvPlatform?.sendGameEvent("gameEnd", params[0]);
    }

    public install(type?: InstallType, index?: number): void {
        const installValue = installTypeWrap[type & -type]; // 只取最右边第一个1的位。
        mvPlatform?.install(installValue, index);
    }

    /** 埋点接口 */
    public sendAction(action: number): void {
        let str = "action&action=" + action;
        mvPlatform.sendAction(str);
    }

    public retryGame(): void {
        this.#retryCount++;
        Main.reloadGameScene();
        audioManager.playMusic("bm_bgm");
        mvPlatform?.sendGameEvent("gameRetry");
    }
}

export const playable = new Playable();
Main.onLoadedGameScene = playable.initialize.bind(playable);