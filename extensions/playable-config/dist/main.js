"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const PACKAGE_NAME = 'playable-config';
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
const load = async function () {
    let langToolPath = await Editor.Profile.getConfig(PACKAGE_NAME, "langConfigDevtool");
    let gameToolPath = await Editor.Profile.getConfig(PACKAGE_NAME, "gameConfigDevtool");
    let langConfigPath = await Editor.Profile.getConfig(PACKAGE_NAME, "langConfigPath");
    let gameConfigPath = await Editor.Profile.getConfig(PACKAGE_NAME, "gameConfigPath");
    let gameInterfacePath = await Editor.Profile.getConfig(PACKAGE_NAME, "gameInterfacePath");
    if (langToolPath == null || langToolPath == "")
        return console.warn("lang config tool not set yet!", langToolPath);
    if (gameToolPath == null || gameToolPath == "")
        return console.warn("game config tool not set yet!", gameToolPath);
    if (langConfigPath == null || langConfigPath == "")
        return console.warn("lang config path not set yet!", langConfigPath);
    if (gameConfigPath == null || gameConfigPath == "")
        return console.warn("game config path not set yet!", gameConfigPath);
    if (gameInterfacePath == null || gameInterfacePath == "")
        return console.warn("game interface path not set yet!", gameInterfacePath);
    const projectPath = Editor.Project.path;
    const projectPrefix = "project://";
    if (langConfigPath.startsWith(projectPrefix))
        langConfigPath = langConfigPath.substring(projectPrefix.length);
    if (gameConfigPath.startsWith(projectPrefix))
        gameConfigPath = gameConfigPath.substring(projectPrefix.length);
    if (gameInterfacePath.startsWith(projectPrefix))
        gameInterfacePath = gameInterfacePath.substring(projectPrefix.length);
    watchLangFile(langToolPath, `${Editor.Project.path}/lang.xlsx`, path_1.default.join(projectPath, langConfigPath));
    watchGameConfigFile(gameToolPath, `${Editor.Project.path}/gameConfig.xlsx`, path_1.default.join(projectPath, gameConfigPath), path_1.default.join(projectPath, gameInterfacePath));
};
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
const unload = async function () {
    fs_1.default.unwatchFile(`${Editor.Project.path}/lang.xlsx`);
    fs_1.default.unwatchFile(`${Editor.Project.path}/gameConfig.xlsx`);
};
exports.unload = unload;
function watchForWatchFile(filename, callback) {
    if (!fs_1.default.existsSync(filename)) {
        setTimeout(() => watchForWatchFile(filename, callback), 1000);
    }
    else {
        callback();
    }
}
async function watchLangFile(toolPath, excelPath, outPath) {
    if (!fs_1.default.existsSync(excelPath)) {
        await new Promise(resolve => watchForWatchFile(excelPath, resolve));
        exchangeLangFile(toolPath, excelPath, outPath);
    }
    fs_1.default.watchFile(excelPath, (cur, pre) => {
        exchangeLangFile(toolPath, excelPath, outPath);
    });
}
function exchangeLangFile(toolPath, excelPath, outPath) {
    const toolIndexPath = path_1.default.join(toolPath, "index");
    const tool = require(toolIndexPath);
    const languagesJson = tool.getLanguagesJson(excelPath);
    fs_1.default.mkdirSync(path_1.default.dirname(outPath), { recursive: true });
    fs_1.default.writeFileSync(outPath, JSON.stringify(languagesJson));
    console.log("tranlsate lang config", outPath);
}
async function watchGameConfigFile(toolPath, excelPath, outJsonPath, outTsPath) {
    if (!fs_1.default.existsSync(excelPath)) {
        await new Promise(resolve => watchForWatchFile(excelPath, resolve));
        exchangeGameConfigFile(toolPath, excelPath, outJsonPath, outTsPath);
    }
    fs_1.default.watchFile(excelPath, (cur, pre) => {
        exchangeGameConfigFile(toolPath, excelPath, outJsonPath, outTsPath);
    });
}
function exchangeGameConfigFile(toolPath, excelPath, outJsonPath, outTsPath) {
    const toolIndexPath = path_1.default.join(toolPath, "index");
    const tool = require(toolIndexPath);
    const jsonConfig = tool.getGameConfigJson(excelPath);
    var tsConfig = tool.getGameConfigTypeScriptInterface(jsonConfig);
    const projectName = path_1.default.basename(Editor.Project.path);
    tsConfig += `\n\ndeclare global {
    var CC_PROJECTNAME: string;
}
globalThis.CC_PROJECTNAME = "${projectName}";`;
    fs_1.default.mkdirSync(path_1.default.dirname(outJsonPath), { recursive: true });
    fs_1.default.writeFileSync(outJsonPath, JSON.stringify(jsonConfig));
    fs_1.default.mkdirSync(path_1.default.dirname(outTsPath), { recursive: true });
    fs_1.default.writeFileSync(outTsPath, tsConfig);
    console.log("tranlsate game config", outJsonPath);
}
