"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
const fs_1 = __importDefault(require("fs"));
let langConfigData;
let langConfigPath;
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    getLangConfigData() {
        return langConfigData;
    }
};
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
const load = async function () {
    let isReady = await Editor.Message.request("asset-db", "query-ready");
    if (isReady)
        onAssetReady();
    else
        Editor.Message.addBroadcastListener("asset-db:ready", onAssetReady);
};
exports.load = load;
async function onAssetReady() {
    langConfigPath = await Editor.Profile.getConfig("playable-config", "langConfigPath");
    if (langConfigPath == null || langConfigPath == "")
        return console.warn("get langConfigPath failed!", langConfigPath);
    const projectPrefix = "project://";
    if (langConfigPath.startsWith(projectPrefix))
        langConfigPath = langConfigPath.substring(projectPrefix.length);
    loadLangKeys(langConfigPath);
    Editor.Message.addBroadcastListener("asset-db:asset-change", onAssetChange);
}
function onAssetChange(uuid, dump) {
    if (dump.source.endsWith(langConfigPath)) {
        loadLangKeys(langConfigPath);
    }
}
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
const unload = function () {
};
exports.unload = unload;
function loadLangKeys(filename) {
    var _a, _b;
    let configText = fs_1.default.readFileSync(Editor.Utils.Path.join(Editor.Project.path, langConfigPath), { encoding: "utf8" });
    let configObj;
    try {
        configObj = JSON.parse(configText);
    }
    catch (error) {
        return console.warn(error);
    }
    langConfigData = {};
    let keys = Object.keys(configObj.languages);
    if (keys.length == 0)
        return;
    let configData = (_b = (_a = configObj.languages['zh-cn']) !== null && _a !== void 0 ? _a : configObj.languages.en) !== null && _b !== void 0 ? _b : configObj.languages[keys[0]];
    Object.assign(langConfigData, configData);
    console.log("langConfigData", filename, Object.keys(langConfigData));
}
