import { JsonAsset, Label, resources, warn } from "cc";
import { DEV } from "cc/env";
import ActionEvent from "../utility/ActionEvent";
import TextStyle from "./TextStyle";
import { TextStyleConfig } from "./TextStyleConfig";

interface LocalizeData {
    value: string;
    style: TextStyleConfig;
    stage: "game" | "ending";
    group: string;
    resource: string;
}

interface LocalizeDatas {
    [x: string]: LocalizeData;
}

interface LanguageConfig {
    fallbackLocale: string,
    languages: { [x: string]: LocalizeDatas }
}

declare global {
    function createTextStyle(TextStyle): TextStyle;
}

export default class LocalizeManager {
    public static readonly version = "1.0.0";
    public static readonly onChangedLocalizeEvent = new ActionEvent();
    private static _defaultLanguage: string;
    private static readonly languages = new Map<string, LocalizeDatas>();
    private static curLanguage: LocalizeDatas;
    private static curLanguageName: string;
    public static get defaultLanguage() { return LocalizeManager._defaultLanguage; }
    public static get curLocalizeName() { return LocalizeManager.curLanguageName; }
    public static format: (format: string, ...params: any[]) => string;
    private static textStyle: TextStyle;

    public static initialize(config: JsonAsset): void {
        LocalizeManager.format = String.format;
        LocalizeManager.loadLanguageConfig(config);
        LocalizeManager.textStyle = globalThis.createTextStyle?.(TextStyle) ?? new TextStyle();
        if (DEV) {
            Object.defineProperty(globalThis, "lang", {
                get: () => { return LocalizeManager.curLanguageName; },
                set: (value) => { LocalizeManager.setLocalize(value); }
            });
        }
    }

    public static loadLanguageConfig(config: JsonAsset): void {
        // let languageConfig =  LocalizeManager.loadLocalizeData(config);
        let languageConfig = config.json as LanguageConfig;
        LocalizeManager._defaultLanguage = languageConfig.fallbackLocale;
        LocalizeManager.languages.clear();
        for (let language of Object.keys(languageConfig.languages)) {
            let languageDatas = languageConfig.languages[language];
            LocalizeManager.languages.set(language, languageDatas);
        }

        LocalizeManager.curLanguageName = null;
        LocalizeManager.curLanguage = null;
        // resources.release(filePath, JsonAsset);
        globalThis.langConfig = languageConfig;
    }

    public static updateStyle(label: Label, key: string): void {
        let localizeData = LocalizeManager.getCurLocalizeValue(key);
        if (localizeData == null) return warn(`update style faile! there is not ${key} key`);
        LocalizeManager.textStyle.updateStyle(label, localizeData.style);
    }

    public static setLocalize(languageName: string): void {
        if (languageName == LocalizeManager.curLocalizeName) return;
        let localuageData = LocalizeManager.languages.get(languageName);
        if (localuageData == null) {
            warn(`Cannot find ${languageName} language, use default language ${LocalizeManager.defaultLanguage}`);
            localuageData = LocalizeManager.languages.get(LocalizeManager.defaultLanguage);
            if (localuageData == null)
                return warn(`Cannot find default ${languageName} language`);
        }

        LocalizeManager.curLanguageName = languageName;
        LocalizeManager.curLanguage = localuageData;
        LocalizeManager.onChangedLocalizeEvent.dispatchAction();
    }

    public static getCurLocalizeValue(key: string): LocalizeData {
        if (LocalizeManager.curLanguage == null) return null;
        return LocalizeManager.curLanguage[key];
    }

    // protected static async loadLocalizeData(filename: string): Promise<LanguageConfig> {
    //     return new Promise<any>((resolve, reject) => {
    //         resources.load(filename, JsonAsset, (error, asset) => {
    //             if (error != null) return reject(error);
    //             resolve(asset.json);
    //         });
    //     });
    // }
}
