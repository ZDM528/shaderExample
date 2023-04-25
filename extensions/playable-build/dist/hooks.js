"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.onAfterBuild = exports.onAfterCompressSettings = exports.onBeforeCompressSettings = exports.onBeforeBuild = exports.load = void 0;
const archiver_1 = __importDefault(require("archiver"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const packSingleHtml_1 = require("./packSingleHtml");
const PACKAGE_NAME = 'playable-build';
// const imageSuffixes = ['.png', '.jpg', '.bmp', '.jpeg', '.gif', '.ico', '.tiff', '.webp', '.image', '.pvr', '.pkm', '.astc'];
// const binarySuffixeds = ['.binary', '.bin', '.dbbin', '.skel', '.cconb'];
const txtSuffixes = ['.txt', '.xml', '.vsh', '.fsh', '.atlas', '.tmx', '.tsx', '.json', '.ExportJson', '.plist', '.fnt', '.rt', '.mtl', '.pmtl', '.prefab', '.log'];
const scriptSuffix = ['.js', '.effect', 'chunk'];
const resourceAssets = ["cc.ImageAsset", "cc.AudioClip", "cc.JsonAsset", "dragonBones.DragonBonesAsset", "dragonBones.DragonBonesAtlasAsset", "sp.SkeletonData", "cc.Asset"];
const zipJsonAssets = ["cc.JsonAsset", "dragonBones.DragonBonesAsset", "dragonBones.DragonBonesAtlasAsset", "sp.SkeletonData"];
const modelAssets = ["cc.Mesh", "cc.Skeleton", "cc.Prefab", "cc.Material", "cc.AnimationClip", "cc.Texture2D", "cc.ImageAsset"];
function log(...arg) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}
async function load() {
    console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
}
exports.load = load;
async function onBeforeBuild(options) {
    // Todo some thing
    options.replaceSplashScreen = true;
    options.mainBundleCompressionType = "none";
    log(`${PACKAGE_NAME}`, 'onBeforeBuild', options);
}
exports.onBeforeBuild = onBeforeBuild;
async function onBeforeCompressSettings(options, result) {
    // const pkgOptions = options.packages[PACKAGE_NAME];
    // if (pkgOptions.webTestOption) {
    //     console.debug('webTestOption', true);
    // }
    // Todo some thing
    log(`${PACKAGE_NAME}`, 'onBeforeCompressSettings', options, result);
}
exports.onBeforeCompressSettings = onBeforeCompressSettings;
async function onAfterCompressSettings(options, result) {
    // Todo some thing
    log(`${PACKAGE_NAME}`, 'onAfterCompressSettings');
}
exports.onAfterCompressSettings = onAfterCompressSettings;
async function onAfterBuild(options, result) {
    const enableVConsole = options.packages["web-mobile"].embedWebDebugger;
    log("onAfterBuild", options, result, enableVConsole);
    copyBuildTemplate(Editor.Project.path + "/build-templates/playable", result.dest);
    let assetPath = `${result.dest}/assets`;
    const rawFilenames = await translateResources(options, result);
    const filenames = foreachDirectory(assetPath);
    let text = packageToBase64(result.dest, filenames);
    fs_1.default.writeFileSync(`${result.dest}/assets.js`, "assetsMap=" + text, { encoding: "utf8" });
    const builder = options.packages[PACKAGE_NAME];
    (0, packSingleHtml_1.packSingleHtml)(result.dest, options.name, enableVConsole, builder.packDataJS);
    await packageZip(result.dest, options.name);
    if (options.packages[PACKAGE_NAME].packDataJS) {
        let text = packageToDatajs(rawFilenames);
        fs_1.default.writeFileSync(`${result.dest}/data.js`, "assetsPackage=" + text, { encoding: "utf8" });
    }
}
exports.onAfterBuild = onAfterBuild;
function copyBuildTemplate(sourcePath, targetPath) {
    if (!fs_1.default.existsSync(sourcePath))
        return console.error("can not find build template: " + sourcePath);
    log(`${PACKAGE_NAME} copy build-template: `, sourcePath);
    copyFolderRecursiveSync(sourcePath, targetPath);
}
function changeExtension(file, extension) {
    const basename = path_1.default.basename(file, path_1.default.extname(file));
    return path_1.default.join(path_1.default.dirname(file), basename + extension);
}
async function translateResources(options, result) {
    const assetUuids = result["__task"].cache.assetUuids;
    const assetUuidSet = new Set(assetUuids);
    const resourcePath = `${result.dest}/`;
    const assetDbPathLength = "db://assets/".length;
    const targetPathAssetsLength = result.paths.assets.length + 1;
    const textSerializeNames = ["json", "text", "_skeletonJson", "_dragonBonesJson", "_atlasJson"];
    const filenames = [];
    const datajsMap = {};
    const resourceMap = {};
    const metaDatasMap = {};
    const translateRaw = function (type, sourcePath, targetPath, rawName) {
        sourcePath = sourcePath.slice(assetDbPathLength);
        // 把cocos的resources目录转成PT仓库能认识的resource目录
        if (sourcePath.startsWith("resources"))
            sourcePath = sourcePath.replace("resources", "resource");
        const result = translateResource(sourcePath, targetPath, rawName);
        // 还原原始的Json内容，因为Cocos会给Json文件中增加一些信息。
        if (result != null && zipJsonAssets.includes(type))
            unpackJsonAsset(result);
    };
    const translateResource = function (sourcePath, targetPath, rawName = true) {
        // cocos 这个bug，文件在import里，但获得的即是在native里，或者该文件被JSON合并了。
        if (!fs_1.default.existsSync(targetPath)) {
            targetPath = targetPath.replace(`\\native\\`, `\\import\\`);
            if (!fs_1.default.existsSync(targetPath)) {
                console.log("Cocos Bug: can't find file path", sourcePath, targetPath);
                return;
            }
            console.log("Cocos Bug: the file path in native which no import", sourcePath, targetPath);
        }
        const targetRelativePath = targetPath.slice(targetPathAssetsLength).replace(/\\/g, `/`);
        if (rawName) {
            sourcePath = changeExtension(sourcePath, path_1.default.extname(targetPath));
        }
        else {
            sourcePath = path_1.default.join(path_1.default.dirname(sourcePath), path_1.default.basename(targetRelativePath));
        }
        const newPath = resourcePath + sourcePath;
        fs_1.default.mkdirSync(path_1.default.dirname(newPath), { recursive: true });
        fs_1.default.renameSync(targetPath, newPath);
        filenames.push(newPath);
        const dataJSKey = getDatajsKey(newPath);
        if (datajsMap[dataJSKey] != null)
            console.error(`警告！datajs出现相同的key: ${dataJSKey} ${sourcePath}`);
        datajsMap[dataJSKey] = targetRelativePath;
        const resourceKey = "assets/" + targetRelativePath;
        resourceMap[resourceKey] = sourcePath;
        console.log("translateResource", resourceKey, newPath);
        return { filePath: newPath, resourceKey: resourceKey };
    };
    const unpackJsonAsset = function (result) {
        const jsonText = fs_1.default.readFileSync(result.filePath, { encoding: "utf8" });
        try {
            const jsonMetaData = JSON.parse(jsonText);
            const dataNames = jsonMetaData[3][0][1];
            if (dataNames == null || !Array.isArray(dataNames))
                return;
            const indexData = dataNames.findIndex((value) => textSerializeNames.includes(value)) + 1;
            const jsonData = jsonMetaData[5][0][indexData];
            if (indexData < 0 && jsonData == null)
                return;
            fs_1.default.writeFileSync(result.filePath, typeof jsonData === "string" ? jsonData : JSON.stringify(jsonData), { encoding: "utf8" });
            jsonMetaData[5][0][indexData] = "";
            metaDatasMap[result.resourceKey] = JSON.stringify(jsonMetaData);
        }
        catch (error) {
            console.log(error, JSON.parse(jsonText));
        }
    };
    for (const uuid of assetUuidSet) {
        const assetPathInfos = result.getAssetPathInfo(uuid);
        if (assetPathInfos == null || assetPathInfos.length == 0)
            continue;
        for (const assetPathInfo of assetPathInfos) {
            if (assetPathInfo == null || assetPathInfo.bundleName == "internal" || assetPathInfo.bundleName == "main")
                continue;
            if (assetPathInfo.json == null && assetPathInfo.raw == null)
                continue;
            const assetInfo = await Editor.Message.request("asset-db", "query-asset-info", uuid);
            if (assetInfo == null)
                continue;
            let sourcePath = assetInfo.source;
            if (sourcePath == null || sourcePath == "") {
                // 这里会有内部模型的贴图也会被导出来。
                if (assetInfo.importer.startsWith("gltf") && modelAssets.includes(assetInfo.type)) {
                    if (!options.packages[PACKAGE_NAME].export3DFile)
                        continue;
                    sourcePath = assetInfo.path;
                    if (sourcePath.startsWith("db://internal/"))
                        continue;
                    if (assetPathInfo.json != null)
                        translateRaw(assetInfo.type, sourcePath, assetPathInfo.json, assetInfo.type == "cc.Prefab");
                    if (assetPathInfo.raw != null) {
                        for (const raw of assetPathInfo.raw)
                            translateRaw(assetInfo.type, sourcePath, raw, false);
                    }
                }
            }
            else {
                // 只导出以下的格式到resource中
                if (!resourceAssets.includes(assetInfo.type))
                    continue;
                if (sourcePath.startsWith("db://internal/"))
                    continue;
                const targetPath = assetPathInfo.raw != null && assetPathInfo.raw.length > 0 ? assetPathInfo.raw[0] : assetPathInfo.json;
                translateRaw(assetInfo.type, sourcePath, targetPath);
            }
        }
    }
    fs_1.default.writeFileSync(`${result.dest}/dataMap.js`, "datajsMap=" + JSON.stringify(datajsMap)
        + "\nresourceMap=" + JSON.stringify(resourceMap)
        + "\nmetaDatasMap=" + JSON.stringify(metaDatasMap), { encoding: "utf8" });
    return filenames;
}
function foreachDirectory(dir, filenames = []) {
    const paths = fs_1.default.readdirSync(dir);
    for (const path of paths) {
        const filename = `${dir}/${path}`;
        if (fs_1.default.statSync(filename).isDirectory())
            foreachDirectory(filename, filenames);
        else
            filenames.push(filename);
    }
    return filenames;
}
function packageToBase64(assetPath, filenames) {
    const assets = {};
    const pathLength = assetPath.length + 1;
    for (let filename of filenames) {
        const key = filename.slice(pathLength);
        if (checkSuffix(filename, txtSuffixes) || checkSuffix(filename, scriptSuffix)) {
            assets[key] = fs_1.default.readFileSync(filename, { encoding: "utf8" });
        }
        else {
            const data = fs_1.default.readFileSync(filename);
            assets[key] = Buffer.from(data).toString("base64");
        }
    }
    return JSON.stringify(assets);
}
function getDatajsKey(filename) {
    return path_1.default.basename(filename).replace('.', '_');
}
function packageToDatajs(filenames) {
    const assets = {};
    for (const filename of filenames) {
        const key = getDatajsKey(filename);
        if (checkSuffix(filename, txtSuffixes) || checkSuffix(filename, scriptSuffix)) {
            assets[key] = fs_1.default.readFileSync(filename, { encoding: "utf8" });
        }
        else {
            const data = fs_1.default.readFileSync(filename);
            assets[key] = Buffer.from(data).toString("base64");
            console.log("packageToDatajs", filename);
        }
    }
    console.log("packageToDatajs file total count", filenames.length);
    return JSON.stringify(assets);
}
async function packageZip(projectPath, projectName) {
    fs_1.default.renameSync(`${projectPath}/index.html`, `${projectPath}/${projectName}.html`);
    const zipPath = path_1.default.dirname(projectPath);
    const output = fs_1.default.createWriteStream(path_1.default.join(zipPath, `${projectName}.zip`));
    const archive = (0, archiver_1.default)('zip', {
        zlib: {
            level: 9
        } // Sets the compression level.
    });
    archive.pipe(output);
    archive.file(`index.html`, { name: `${projectName}.html` });
    archive.directory(projectPath, projectName);
    await archive.finalize();
    fs_1.default.renameSync(`${projectPath}/${projectName}.html`, `${projectPath}/index.html`);
}
function checkSuffix(filename, suffixes) {
    const suffix = path_1.default.extname(filename);
    return suffixes.indexOf(suffix) != -1;
}
function unload() {
    console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
}
exports.unload = unload;
function copyFileSync(source, target) {
    let targetFile = target;
    // If target is a directory, a new file with the same name will be created
    if (fs_1.default.existsSync(target) && fs_1.default.lstatSync(target).isDirectory())
        targetFile = path_1.default.join(target, path_1.default.basename(source));
    fs_1.default.writeFileSync(targetFile, fs_1.default.readFileSync(source));
    // console.log("copyFileSync", targetFile, source);
}
function copyFolderRecursiveSync(source, target) {
    // Check if folder needs to be created or integrated
    // let targetFolder = path.join(target, path.basename(source));
    if (!fs_1.default.existsSync(target))
        fs_1.default.mkdirSync(target);
    // Copy
    if (fs_1.default.lstatSync(source).isDirectory()) {
        const files = fs_1.default.readdirSync(source);
        for (const file of files) {
            const curSource = path_1.default.join(source, file);
            if (fs_1.default.lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, path_1.default.join(target, file));
            }
            else {
                copyFileSync(curSource, target);
            }
        }
    }
}
