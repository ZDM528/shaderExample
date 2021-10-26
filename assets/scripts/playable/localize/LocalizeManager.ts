import { Asset, Label, resources } from "cc";
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

    public static async initialize(filePath: string): Promise<void> {
        LocalizeManager.format = String.format;
        await LocalizeManager.loadLanguageConfig(filePath);
        LocalizeManager.textStyle = globalThis.createTextStyle?.(TextStyle) ?? new TextStyle();
        if (DEV) {
            Object.defineProperty(globalThis, "lang", {
                get: () => { return LocalizeManager.curLanguageName; },
                set: (value) => { LocalizeManager.setLocalize(value); }
            });
        }
    }

    public static async loadLanguageConfig(filePath: string): Promise<void> {
        let languageConfig = await LocalizeManager.loadLocalizeData(filePath);
        LocalizeManager._defaultLanguage = languageConfig.fallbackLocale;
        LocalizeManager.languages.clear();
        for (let language of Object.keys(languageConfig.languages)) {
            let languageDatas = languageConfig.languages[language];
            LocalizeManager.languages.set(language, languageDatas);
        }

        LocalizeManager.curLanguageName = null;
        LocalizeManager.curLanguage = null;
        resources.release(filePath, Asset);
        globalThis.langConfig = languageConfig;
    }

    public static updateStyle(label: Label, key: string): void {
        let localizeData = LocalizeManager.getCurLocalizeValue(key);
        if (localizeData == null) return console.warn(`update style faile! there is not ${key} key`);
        LocalizeManager.textStyle.updateStyle(label, localizeData.style);
    }

    public static setLocalize(languageName: string): void {
        if (languageName == LocalizeManager.curLocalizeName) return;
        let localuageData = LocalizeManager.languages.get(languageName);
        if (localuageData == null) {
            console.warn(`Cannot find ${languageName} language, use default language${LocalizeManager.defaultLanguage}`);
            localuageData = LocalizeManager.languages.get(LocalizeManager.defaultLanguage);
            if (localuageData == null)
                return console.warn(`Cannot find default ${languageName} language`);
        }

        LocalizeManager.curLanguageName = languageName;
        LocalizeManager.curLanguage = localuageData;
        LocalizeManager.onChangedLocalizeEvent.DispatchAction();
    }

    public static getCurLocalizeValue(key: string): LocalizeData {
        if (LocalizeManager.curLanguage == null) return null;
        return LocalizeManager.curLanguage[key];
    }

    protected static async loadLocalizeData(filename: string): Promise<LanguageConfig> {
        return new Promise<any>((resolve, reject) => {
            resources.load(filename, Asset, (error, asset) => {
                if (error != null) return reject(error);
                resolve(JSON.parse(asset._nativeAsset));
            });
        });
    }
}
