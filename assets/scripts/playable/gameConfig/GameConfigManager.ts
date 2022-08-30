import { JsonAsset, sys } from "cc";
import { DEBUG, DEV } from "cc/env";
import ActionEvent from "../utility/ActionEvent";

export interface IGameConfig<T> {
    /** 可重玩次数，-1为无限次 */
    playAgain: number;
    /** Json数据 */
    getJsonAsset(): {};
    /** storage key, valid in DEV model. */
    getStorageKey(): string;
    /**
     * 设置调试数据，发布后，该数据不会被修改
     * @param name 
     * @param value 
     */
    setDebugValue<K extends ObjectProperties<T>>(name: K, value: T[K]): void;
}

interface GameConfigJson {
    playAgain?: number;
    gameConfig: { [x: string]: { value: any, items?: Array<{ pl_key: string, value: any }> } };
}

export default class GameConfigManager {
    private static _configValue = {} as IGameConfig<any>;
    public static get configValue() { return GameConfigManager._configValue; }
    private static _configJson = {} as GameConfigJson;
    public static get configJson(): GameConfigJson { return GameConfigManager._configJson; }
    public static readonly onInitEvent = new ActionEvent();

    public static initialize(config: JsonAsset): void {
        // let data = await GameConfigManager.loadConfigData(filePath);
        let data: GameConfigJson = config.json as GameConfigJson;

        if (DEV && globalThis.CC_PROJECTNAME != null) {
            GameConfigManager.configValue.getStorageKey = function () { return `${globalThis.CC_PROJECTNAME}#gameConfig`; };
            let key = GameConfigManager.configValue.getStorageKey();
            let storageConfig = sys.localStorage.getItem(key);
            if (storageConfig != null) {
                try {
                    let newData = JSON.parse(storageConfig);
                    data = Object.assignDepth(data, newData);
                } catch (error) {
                    console.warn(error);
                }
            }
        }

        for (let key of Object.keys(data.gameConfig)) {
            let items = data.gameConfig[key].items;
            if (items != null) {
                for (let item of items)
                    GameConfigManager.addConfigProperty(GameConfigManager.configValue, item.pl_key, item, "value");
                // GameConfigManager.configValue[item.pl_key] = item.value;
            } else {
                GameConfigManager.addConfigProperty(GameConfigManager.configValue, key, data.gameConfig[key], "value");
                // GameConfigManager.configValue[key] = data.gameConfig[key].value;
            }
        }

        GameConfigManager._configJson = data;
        GameConfigManager.configValue.playAgain = (data.playAgain == -1) ? Infinity : (data.playAgain ?? 0);
        GameConfigManager.configValue.getJsonAsset = function () { return GameConfigManager.configJson; };
        GameConfigManager.configValue.setDebugValue = function (key: PropertyKey, value: any) { if (DEBUG) GameConfigManager.configValue[key] = value; }
        globalThis.gameConfig = GameConfigManager.configValue;
        GameConfigManager.onInitEvent.dispatchAction();
        // resources.release(filePath, JsonAsset);
    }

    private static addConfigProperty(t: Object, tp: PropertyKey, s: Object, sp: PropertyKey): void {
        Object.defineProperty(t, tp, {
            get: function () { return s[sp]; },
            set: function (v) { s[sp] = v; }
        });
    }

    // protected static async loadConfigData(filename: string): Promise<GameConfigJson> {
    //     return new Promise<any>((resolve, reject) => {
    //         resources.load(filename, JsonAsset, (error, asset) => {
    //             if (error != null) return reject(error);
    //             resolve(asset.json);
    //         });
    //     });
    // }
}