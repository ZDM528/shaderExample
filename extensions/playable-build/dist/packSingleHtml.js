"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.packSingleHtml = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function packIndexJs(filename) {
    let data = fs_1.default.readFileSync(filename, { encoding: "utf8" });
    data = data.replace(`System.register(["./application.js"]`, `System.register("chunks:///index.js",["chunks:///application.js"]`);
    fs_1.default.writeFileSync(filename, data, "utf8");
}
function packApplicationJs(filename) {
    let data = fs_1.default.readFileSync(filename, { encoding: "utf8" });
    data = data.replace(`System.register([]`, `System.register("chunks:///application.js", []`);
    data = data.replace(`src/settings.json`, "");
    data = data.replace(`src/effect.bin`, "");
    data = data.replace(`cc = engine;`, `
  cc = engine;
  System.import("chunks:///downloadHandle.js");
  cc.settings._settings = window.cocosSettings;
  // cc.effectSettings._data = ArrayBuffer;
  `);
    fs_1.default.writeFileSync(filename, data, "utf8");
}
function packDownloadHandleJs(filename) {
    let data = fs_1.default.readFileSync(`${path_1.default.dirname(__dirname)}/assets/downloadHandle.js`, { encoding: "utf8" });
    fs_1.default.writeFileSync(filename, data, "utf8");
}
function packSettingsConfig(inputName, outputName) {
    let data = fs_1.default.readFileSync(inputName, { encoding: "utf8" });
    let cocosSettings = JSON.parse(data);
    cocosSettings.splashScreen.totalTime = 0;
    cocosSettings.splashScreen.base64src = "";
    fs_1.default.writeFileSync(outputName, `cocosSettings=${JSON.stringify(cocosSettings)}`, "utf8");
    fs_1.default.rmSync(inputName);
    return cocosSettings.scripting.scriptPackages;
}
function packCCJs(filename) {
    let data = fs_1.default.readFileSync(filename, { encoding: "utf8" });
    data = data.replace(`System.register([]`, `System.register("chunks:///cc.js",[]`);
    fs_1.default.writeFileSync(filename, data, "utf8");
}
function packScriptFiles(filename, chunks) {
    let data = fs_1.default.readFileSync(filename, { encoding: "utf8" });
    data = data.replace(`System.register([]`, `System.register("${chunks}", []`);
    fs_1.default.writeFileSync(filename, data, "utf8");
}
function packScriptPackages(outPath, scriptPackages) {
    for (let script of scriptPackages) {
        let chunks = script.replace("../", "chunks:///");
        packScriptFiles(path_1.default.join(outPath, "/temp", script), chunks);
    }
}
function packIndexHtml(filename, importmapPath, scriptPackages, packVConsole, packDataJs) {
    let data = fs_1.default.readFileSync(filename, { encoding: "utf8" });
    let importmapData = fs_1.default.readFileSync(importmapPath, { encoding: "utf8" });
    // 这两行会导致仓库有可以引入.png
    data = data.replace(`<!--<link rel="apple-touch-icon" href=".png" />-->`, "");
    data = data.replace(`<!--<link rel="apple-touch-icon-precomposed" href=".png" />-->`, "");
    let scripts = "";
    if (packVConsole) {
        data += `<script src="./vconsole.min.js"></script>
<script type="text/javascript">
    // open web debugger console
    window.VConsole && (window.vConsole = new VConsole());
</script>`;
    }
    for (let script of scriptPackages)
        scripts += `<script src="${script.replace("../", "")}" charset="utf-8"> </script>\n`;
    data = data.replace(`<!-- dataJS -->`, packDataJs ? `<script src="data.js" charset="utf-8"> </script>\n` : "");
    data = data.replace(`<!-- packages scripts -->`, `${scripts}`);
    const importmapNewData = importmapData.replace(`./../cocos-js/cc.js`, "chunks:///cc.js");
    data = data.replace(`<script type="systemjs-importmap" charset="utf-8"></script>`, `<script type="systemjs-importmap" charset="utf-8">
  ${importmapNewData}
  </script>`);
    // data = data.replace(`<script src="src/import-map.json" type="systemjs-importmap" charset="utf-8"> </script>`,
    //   dataJS + `<script src="assets.js" charset="utf-8"> </script>
    //    <script src="dataMap.js" charset="utf-8"> </script>
    //    ${scripts}
    //    <script src="src/settings.js" charset="utf-8"> </script>
    //    <script src="assets.js" charset="utf-8"> </script>
    //    <script src="./cocos-js/cc.js" charset="utf-8"> </script>
    //    <script src="downloadHandle.js" charset="utf-8"> </script>
    //    <script src="application.js" charset="utf-8"> </script>
    //    <script type="systemjs-importmap" charset="utf-8">{"imports":{"cc":"chunks:///cc.js"}}</script>
    //    <script src="index.js" charset="utf-8"> </script>`);
    // // polyfills脚本在内嵌以后，会导致System不会自动import，需要手动import一下。
    // data = data.replace("System.import('./index.js').catch(function(err) { console.error(err); })", `System.import("cc", "chunks:///cc.js");
    // System.import("chunks:///index.js");`);
    fs_1.default.writeFileSync(filename, data, "utf8");
}
function packSingleHtml(outPath, projectName, packVConsole, packDataJs) {
    packIndexJs(`${outPath}/index.js`);
    packApplicationJs(`${outPath}/application.js`);
    packDownloadHandleJs(`${outPath}/downloadHandle.js`);
    const scriptPackages = packSettingsConfig(`${outPath}/src/settings.json`, `${outPath}/src/settings.js`);
    const importmapPath = `${outPath}/src/import-map.json`;
    packScriptPackages(outPath, scriptPackages);
    packCCJs(`${outPath}/cocos-js/cc.js`);
    packIndexHtml(`${outPath}/index.html`, importmapPath, scriptPackages, packVConsole, packDataJs);
    fs_1.default.rmSync(importmapPath);
    fs_1.default.rmdirSync(`${outPath}/assets`, { recursive: true });
}
exports.packSingleHtml = packSingleHtml;
