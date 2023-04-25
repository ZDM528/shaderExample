import fs from 'fs';
import path from 'path';

const PACKAGE_NAME = 'playable-config';

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export const load = async function () {
    let langToolPath: string = await Editor.Profile.getConfig(PACKAGE_NAME, "langConfigDevtool");
    let gameToolPath: string = await Editor.Profile.getConfig(PACKAGE_NAME, "gameConfigDevtool");
    let langConfigPath: string = await Editor.Profile.getConfig(PACKAGE_NAME, "langConfigPath");
    let gameConfigPath: string = await Editor.Profile.getConfig(PACKAGE_NAME, "gameConfigPath");
    let gameInterfacePath: string = await Editor.Profile.getConfig(PACKAGE_NAME, "gameInterfacePath");

    if (langToolPath == null || langToolPath == "") return console.warn("lang config tool not set yet!", langToolPath);
    if (gameToolPath == null || gameToolPath == "") return console.warn("game config tool not set yet!", gameToolPath);
    if (langConfigPath == null || langConfigPath == "") return console.warn("lang config path not set yet!", langConfigPath);
    if (gameConfigPath == null || gameConfigPath == "") return console.warn("game config path not set yet!", gameConfigPath);
    if (gameInterfacePath == null || gameInterfacePath == "") return console.warn("game interface path not set yet!", gameInterfacePath);

    const projectPath = Editor.Project.path;

    const projectPrefix = "project://";
    if (langConfigPath.startsWith(projectPrefix))
        langConfigPath = langConfigPath.substring(projectPrefix.length);
    if (gameConfigPath.startsWith(projectPrefix))
        gameConfigPath = gameConfigPath.substring(projectPrefix.length);
    if (gameInterfacePath.startsWith(projectPrefix))
        gameInterfacePath = gameInterfacePath.substring(projectPrefix.length);

    watchLangFile(langToolPath, `${Editor.Project.path}/lang.xlsx`, path.join(projectPath, langConfigPath));
    watchGameConfigFile(gameToolPath, `${Editor.Project.path}/gameConfig.xlsx`, path.join(projectPath, gameConfigPath), path.join(projectPath, gameInterfacePath));
};

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export const unload = async function () {
    fs.unwatchFile(`${Editor.Project.path}/lang.xlsx`);
    fs.unwatchFile(`${Editor.Project.path}/gameConfig.xlsx`);
};

function watchForWatchFile(filename: string, callback: () => void): void {
    if (!fs.existsSync(filename)) {
        setTimeout(() => watchForWatchFile(filename, callback), 1000);
    } else {
        callback();
    }
}

async function watchLangFile(toolPath: string, excelPath: string, outPath: string) {
    if (!fs.existsSync(excelPath)) {
        await new Promise<void>(resolve => watchForWatchFile(excelPath, resolve));
        exchangeLangFile(toolPath, excelPath, outPath);
    }
    fs.watchFile(excelPath, (cur, pre) => {
        exchangeLangFile(toolPath, excelPath, outPath);
    });
}

function exchangeLangFile(toolPath: string, excelPath: string, outPath: string) {
    const toolIndexPath = path.join(toolPath, "index");

    const tool = require(toolIndexPath);
    const languagesJson = tool.getLanguagesJson(excelPath);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(languagesJson));
    console.log("tranlsate lang config", outPath);
}

async function watchGameConfigFile(toolPath: string, excelPath: string, outJsonPath: string, outTsPath: string) {
    if (!fs.existsSync(excelPath)) {
        await new Promise<void>(resolve => watchForWatchFile(excelPath, resolve));
        exchangeGameConfigFile(toolPath, excelPath, outJsonPath, outTsPath);
    }

    fs.watchFile(excelPath, (cur, pre) => {
        exchangeGameConfigFile(toolPath, excelPath, outJsonPath, outTsPath);
    });
}

function exchangeGameConfigFile(toolPath: string, excelPath: string, outJsonPath: string, outTsPath: string) {
    const toolIndexPath = path.join(toolPath, "index");

    const tool = require(toolIndexPath);
    const jsonConfig = tool.getGameConfigJson(excelPath);
    var tsConfig: string = tool.getGameConfigTypeScriptInterface(jsonConfig);
    const projectName = path.basename(Editor.Project.path);
    tsConfig += `\n\ndeclare global {
    var CC_PROJECTNAME: string;
}
globalThis.CC_PROJECTNAME = "${projectName}";`;

    fs.mkdirSync(path.dirname(outJsonPath), { recursive: true });
    fs.writeFileSync(outJsonPath, JSON.stringify(jsonConfig));
    fs.mkdirSync(path.dirname(outTsPath), { recursive: true });
    fs.writeFileSync(outTsPath, tsConfig);
    console.log("tranlsate game config", outJsonPath);
}