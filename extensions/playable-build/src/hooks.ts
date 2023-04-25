import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { IAssetPathInfo, IBuildResult as IBuildResult2, IBuildTaskOption } from '../@types/packages/builder/@types';
import { packSingleHtml } from './packSingleHtml';

const PACKAGE_NAME = 'playable-build';
// const imageSuffixes = ['.png', '.jpg', '.bmp', '.jpeg', '.gif', '.ico', '.tiff', '.webp', '.image', '.pvr', '.pkm', '.astc'];
// const binarySuffixeds = ['.binary', '.bin', '.dbbin', '.skel', '.cconb'];
const txtSuffixes = ['.txt', '.xml', '.vsh', '.fsh', '.atlas', '.tmx', '.tsx', '.json', '.ExportJson', '.plist', '.fnt', '.rt', '.mtl', '.pmtl', '.prefab', '.log'];
const scriptSuffix = ['.js', '.effect', 'chunk'];
const resourceAssets = ["cc.ImageAsset", "cc.AudioClip", "cc.JsonAsset", "dragonBones.DragonBonesAsset", "dragonBones.DragonBonesAtlasAsset", "sp.SkeletonData", "cc.Asset"];
const zipJsonAssets = ["cc.JsonAsset", "dragonBones.DragonBonesAsset", "dragonBones.DragonBonesAtlasAsset", "sp.SkeletonData"];
const modelAssets = ["cc.Mesh", "cc.Skeleton", "cc.Prefab", "cc.Material", "cc.AnimationClip", "cc.Texture2D", "cc.ImageAsset"];


interface IOptions {
    export3DFile: boolean;
    packDataJS: boolean;
}

interface ITaskOptions extends IBuildTaskOption {
    packages: {
        'playable-build': IOptions;
        "web-mobile": { embedWebDebugger: boolean }
    };
}

interface IBuildResult extends IBuildResult2 {
    __task: {
        cache: { assetUuids: string[] }
    }
}

function log(...arg: any[]) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}

export async function load() {
    console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
}

export async function onBeforeBuild(options: ITaskOptions) {
    // Todo some thing
    options.replaceSplashScreen = true;
    options.mainBundleCompressionType = "none";
    log(`${PACKAGE_NAME}`, 'onBeforeBuild', options);
}

export async function onBeforeCompressSettings(options: ITaskOptions, result: IBuildResult) {
    // const pkgOptions = options.packages[PACKAGE_NAME];
    // if (pkgOptions.webTestOption) {
    //     console.debug('webTestOption', true);
    // }
    // Todo some thing
    log(`${PACKAGE_NAME}`, 'onBeforeCompressSettings', options, result);
}

export async function onAfterCompressSettings(options: ITaskOptions, result: IBuildResult) {
    // Todo some thing
    log(`${PACKAGE_NAME}`, 'onAfterCompressSettings');
}

export async function onAfterBuild(options: ITaskOptions, result: IBuildResult) {
    const enableVConsole = options.packages["web-mobile"].embedWebDebugger;
    log("onAfterBuild", options, result, enableVConsole);
    copyBuildTemplate(Editor.Project.path + "/build-templates/playable", result.dest);
    let assetPath = `${result.dest}/assets`;
    const rawFilenames = await translateResources(options, result);
    const filenames = foreachDirectory(assetPath);
    let text = packageToBase64(result.dest, filenames);
    fs.writeFileSync(`${result.dest}/assets.js`, "assetsMap=" + text, { encoding: "utf8" });
    const builder = options.packages[PACKAGE_NAME];
    packSingleHtml(result.dest, options.name, enableVConsole, builder.packDataJS);
    await packageZip(result.dest, options.name);

    if (options.packages[PACKAGE_NAME].packDataJS) {
        let text = packageToDatajs(rawFilenames);
        fs.writeFileSync(`${result.dest}/data.js`, "assetsPackage=" + text, { encoding: "utf8" });
    }
}

function copyBuildTemplate(sourcePath: string, targetPath: string): void {
    if (!fs.existsSync(sourcePath)) return console.error("can not find build template: " + sourcePath);
    log(`${PACKAGE_NAME} copy build-template: `, sourcePath);
    copyFolderRecursiveSync(sourcePath, targetPath);
}

function changeExtension(file: string, extension: string) {
    const basename = path.basename(file, path.extname(file));
    return path.join(path.dirname(file), basename + extension);
}

async function translateResources(options: ITaskOptions, result: IBuildResult) {
    const assetUuids: string[] = result["__task"].cache.assetUuids;
    const assetUuidSet = new Set<string>(assetUuids);
    const resourcePath = `${result.dest}/`;
    const assetDbPathLength = "db://assets/".length;
    const targetPathAssetsLength = result.paths.assets.length + 1;
    const textSerializeNames = ["json", "text", "_skeletonJson", "_dragonBonesJson", "_atlasJson"];

    const filenames: string[] = [];
    const datajsMap: Record<string, string> = {};
    const resourceMap: Record<string, string> = {};
    const metaDatasMap: Record<string, string> = {};

    const translateRaw = function (type: string, sourcePath: string, targetPath: string, rawName?: boolean) {
        sourcePath = sourcePath.slice(assetDbPathLength);
        // 把cocos的resources目录转成PT仓库能认识的resource目录
        if (sourcePath.startsWith("resources"))
            sourcePath = sourcePath.replace("resources", "resource");

        const result: { filePath: string; resourceKey: string; } | undefined = translateResource(sourcePath, targetPath, rawName);

        // 还原原始的Json内容，因为Cocos会给Json文件中增加一些信息。
        if (result != null && zipJsonAssets.includes(type))
            unpackJsonAsset(result);
    }

    const translateResource = function (sourcePath: string, targetPath: string, rawName: boolean = true) {
        // cocos 这个bug，文件在import里，但获得的即是在native里，或者该文件被JSON合并了。
        if (!fs.existsSync(targetPath)) {
            targetPath = targetPath.replace(`\\native\\`, `\\import\\`);
            if (!fs.existsSync(targetPath)) {
                console.log("Cocos Bug: can't find file path", sourcePath, targetPath);
                return;
            }
            console.log("Cocos Bug: the file path in native which no import", sourcePath, targetPath)
        }

        const targetRelativePath = targetPath.slice(targetPathAssetsLength).replace(/\\/g, `/`);
        if (rawName) {
            sourcePath = changeExtension(sourcePath, path.extname(targetPath));
        } else {
            sourcePath = path.join(path.dirname(sourcePath), path.basename(targetRelativePath));
        }
        const newPath = resourcePath + sourcePath;
        fs.mkdirSync(path.dirname(newPath), { recursive: true });
        fs.renameSync(targetPath, newPath);

        filenames.push(newPath);
        const dataJSKey = getDatajsKey(newPath);
        if (datajsMap[dataJSKey] != null)
            console.error(`警告！datajs出现相同的key: ${dataJSKey} ${sourcePath}`);

        datajsMap[dataJSKey] = targetRelativePath;
        const resourceKey = "assets/" + targetRelativePath;
        resourceMap[resourceKey] = sourcePath;

        console.log("translateResource", resourceKey, newPath);
        return { filePath: newPath, resourceKey: resourceKey };
    }

    const unpackJsonAsset = function (result: { filePath: string; resourceKey: string; }) {
        const jsonText = fs.readFileSync(result.filePath, { encoding: "utf8" });
        try {
            const jsonMetaData = JSON.parse(jsonText);
            const dataNames: string[] = jsonMetaData[3][0][1];
            if (dataNames == null || !Array.isArray(dataNames))
                return;
            const indexData = dataNames.findIndex((value) => textSerializeNames.includes(value)) + 1;

            const jsonData = jsonMetaData[5][0][indexData];
            if (indexData < 0 && jsonData == null)
                return;
            fs.writeFileSync(result.filePath, typeof jsonData === "string" ? jsonData : JSON.stringify(jsonData), { encoding: "utf8" });
            jsonMetaData[5][0][indexData] = "";
            metaDatasMap[result.resourceKey] = JSON.stringify(jsonMetaData);
        } catch (error) {
            console.log(error, JSON.parse(jsonText));
        }
    }

    for (const uuid of assetUuidSet) {
        const assetPathInfos = result.getAssetPathInfo(uuid);
        if (assetPathInfos == null || assetPathInfos.length == 0) continue;

        for (const assetPathInfo of assetPathInfos) {
            if (assetPathInfo == null || assetPathInfo.bundleName == "internal" || assetPathInfo.bundleName == "main")
                continue;
            if (assetPathInfo.json == null && assetPathInfo.raw == null)
                continue;

            const assetInfo = await Editor.Message.request("asset-db", "query-asset-info", uuid);
            if (assetInfo == null) continue;
            let sourcePath = assetInfo.source;

            if (sourcePath == null || sourcePath == "") {
                // 这里会有内部模型的贴图也会被导出来。
                if (assetInfo.importer.startsWith("gltf") && modelAssets.includes(assetInfo.type)) {
                    if (!options.packages[PACKAGE_NAME].export3DFile) continue;

                    sourcePath = assetInfo.path;
                    if (sourcePath.startsWith("db://internal/")) continue;

                    if (assetPathInfo.json != null)
                        translateRaw(assetInfo.type, sourcePath, assetPathInfo.json, assetInfo.type == "cc.Prefab");

                    if (assetPathInfo.raw != null) {
                        for (const raw of assetPathInfo.raw)
                            translateRaw(assetInfo.type, sourcePath, raw, false);
                    }
                }
            } else {
                // 只导出以下的格式到resource中
                if (!resourceAssets.includes(assetInfo.type))
                    continue;

                if (sourcePath.startsWith("db://internal/")) continue;
                const targetPath = assetPathInfo.raw != null && assetPathInfo.raw.length > 0 ? assetPathInfo.raw[0] : assetPathInfo.json;
                translateRaw(assetInfo.type, sourcePath, targetPath!);
            }
        }
    }

    fs.writeFileSync(`${result.dest}/dataMap.js`, "datajsMap=" + JSON.stringify(datajsMap)
        + "\nresourceMap=" + JSON.stringify(resourceMap)
        + "\nmetaDatasMap=" + JSON.stringify(metaDatasMap), { encoding: "utf8" });

    return filenames;
}

function foreachDirectory(dir: string, filenames: string[] = []): string[] {
    const paths = fs.readdirSync(dir);
    for (const path of paths) {
        const filename = `${dir}/${path}`;
        if (fs.statSync(filename).isDirectory())
            foreachDirectory(filename, filenames);
        else
            filenames.push(filename);
    }
    return filenames;
}

function packageToBase64(assetPath: string, filenames: string[]): string {
    const assets: Record<string, string> = {};
    const pathLength = assetPath.length + 1;
    for (let filename of filenames) {
        const key = filename.slice(pathLength);
        if (checkSuffix(filename, txtSuffixes) || checkSuffix(filename, scriptSuffix)) {
            assets[key] = fs.readFileSync(filename, { encoding: "utf8" });
        } else {
            const data = fs.readFileSync(filename);
            assets[key] = Buffer.from(data).toString("base64");
        }
    }
    return JSON.stringify(assets);
}

function getDatajsKey(filename: string): string {
    return path.basename(filename).replace('.', '_');
}

function packageToDatajs(filenames: string[]): string {
    const assets: Record<string, string> = {};
    for (const filename of filenames) {
        const key = getDatajsKey(filename);
        if (checkSuffix(filename, txtSuffixes) || checkSuffix(filename, scriptSuffix)) {
            assets[key] = fs.readFileSync(filename, { encoding: "utf8" });
        } else {
            const data = fs.readFileSync(filename);
            assets[key] = Buffer.from(data).toString("base64");
            console.log("packageToDatajs", filename);
        }
    }

    console.log("packageToDatajs file total count", filenames.length);
    return JSON.stringify(assets);
}

async function packageZip(projectPath: string, projectName: string) {
    fs.renameSync(`${projectPath}/index.html`, `${projectPath}/${projectName}.html`);
    const zipPath = path.dirname(projectPath);
    const output = fs.createWriteStream(path.join(zipPath, `${projectName}.zip`));
    const archive = archiver('zip', {
        zlib: {
            level: 9
        } // Sets the compression level.
    });
    archive.pipe(output);
    archive.file(`index.html`, { name: `${projectName}.html` })
    archive.directory(projectPath, projectName);
    await archive.finalize();

    fs.renameSync(`${projectPath}/${projectName}.html`, `${projectPath}/index.html`);
}

function checkSuffix(filename: string, suffixes: readonly string[]): boolean {
    const suffix = path.extname(filename);
    return suffixes.indexOf(suffix) != -1;
}

export function unload() {
    console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
}

function copyFileSync(source: string, target: string): void {
    let targetFile = target;
    // If target is a directory, a new file with the same name will be created
    if (fs.existsSync(target) && fs.lstatSync(target).isDirectory())
        targetFile = path.join(target, path.basename(source));
    fs.writeFileSync(targetFile, fs.readFileSync(source));
    // console.log("copyFileSync", targetFile, source);
}

function copyFolderRecursiveSync(source: string, target: string) {
    // Check if folder needs to be created or integrated
    // let targetFolder = path.join(target, path.basename(source));
    if (!fs.existsSync(target))
        fs.mkdirSync(target);

    // Copy
    if (fs.lstatSync(source).isDirectory()) {
        const files = fs.readdirSync(source);
        for (const file of files) {
            const curSource = path.join(source, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, path.join(target, file));
            } else {
                copyFileSync(curSource, target);
            }
        }
    }
}