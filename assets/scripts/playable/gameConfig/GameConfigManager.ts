import { Asset, resources } from "cc";
import GameConfigType from "./GameConfigType";

type ConfigType = { readonly [Property in keyof GameConfigType]: GameConfigType[Property] } & { readonly playAgain?: number };

interface GameConfigJson {
    playAgain: number;
    gameConfig: { [x: string]: { value: any, items?: Array<{ pl_key: string, value: any }> } };
}

export default class GameConfigManager {
    private static _configValue = {} as any;
    public static get configValue(): ConfigType { return GameConfigManager._configValue; }

    public static async initialize(filePath: string): Promise<void> {
        let data = await GameConfigManager.loadConfigData(filePath);
        for (let key of Object.keys(data.gameConfig)) {
            let items = data.gameConfig[key].items;
            if (items != null) {
                for (let item of items)
                    GameConfigManager.configValue[item.pl_key] = item.value;
            } else {
                GameConfigManager.configValue[key] = data.gameConfig[key].value;
            }
        }
        GameConfigManager._configValue.playAgain = data.playAgain;
        globalThis.gameConfig = GameConfigManager.configValue;
        resources.release(filePath, Asset);
    }

    protected static async loadConfigData(filename: string): Promise<GameConfigJson> {
        return new Promise<any>((resolve, reject) => {
            resources.load(filename, Asset, (error, asset) => {
                if (error != null) return reject(error);
                resolve(JSON.parse(asset._nativeAsset));
            });
        });
    }
}
export const gameConfig: ConfigType = GameConfigManager.configValue;
