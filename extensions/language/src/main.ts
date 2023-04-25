import fs from 'fs';

let langConfigData: { [key: string]: LanguageConfig };
let langConfigPath: string;

interface LanguageConfig {
    fallbackLocale: string,
    languages: {
        "zh-cn": any,
        "en": any,
        [x: string]: any
    }
}

/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    getLangConfigData() {
        return langConfigData;
    }
};

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export const load = async function () {
    let isReady = await Editor.Message.request("asset-db", "query-ready");
    if (isReady) onAssetReady();
    else Editor.Message.addBroadcastListener("asset-db:ready", onAssetReady);

};

async function onAssetReady() {
    langConfigPath = await Editor.Profile.getConfig("playable-config", "langConfigPath");
    if (langConfigPath == null || langConfigPath == "") return console.warn("get langConfigPath failed!", langConfigPath)
    const projectPrefix = "project://";
    if (langConfigPath.startsWith(projectPrefix))
        langConfigPath = langConfigPath.substring(projectPrefix.length);
    loadLangKeys(langConfigPath);
    Editor.Message.addBroadcastListener("asset-db:asset-change", onAssetChange);
}

function onAssetChange(uuid: string, dump: { source: string }): void {
    if (dump.source.endsWith(langConfigPath)) {
        loadLangKeys(langConfigPath);
    }
}

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export const unload = function () {
};

function loadLangKeys(filename: string): void {
    let configText = fs.readFileSync(Editor.Utils.Path.join(Editor.Project.path, langConfigPath), { encoding: "utf8" });
    let configObj: LanguageConfig;
    try {
        configObj = JSON.parse(configText);
    } catch (error) {
        return console.warn(error);
    }

    langConfigData = {};
    let keys = Object.keys(configObj.languages);
    if (keys.length == 0) return;
    let configData = configObj.languages['zh-cn'] ?? configObj.languages.en ?? configObj.languages[keys[0]];
    Object.assign(langConfigData, configData)
    console.log("langConfigData", filename, Object.keys(langConfigData));
}