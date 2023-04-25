"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    PortraitAndLandscape() {
        switchPortraitAndLandscape();
    },
    IPhone6() {
        setDesignResolution(1334, 750);
    },
    IPhoneX() {
        setDesignResolution(1624, 750);
    },
    IPad() {
        setDesignResolution(2048, 1536);
    },
};
const canvasSize = {
    width: 1334, height: 750,
    switch: function () {
        let temp = this.width;
        this.width = this.height;
        this.height = temp;
    },
    resize: function (width, height) {
        this.width = width, this.height = height;
    }
};
const RATIO_SCALE = 10000;
const designSize = {
    designWidth: 0, designHeight: 0, sizeRatio: 0
};
async function setDesignResolution(width, height) {
    if (canvasSize.width > canvasSize.height)
        canvasSize.resize(width, height);
    else
        canvasSize.resize(height, width);
    resetDesignResolutionSize(canvasSize.width, canvasSize.height);
}
async function switchPortraitAndLandscape() {
    canvasSize.switch();
    resetDesignResolutionSize(canvasSize.width, canvasSize.height);
}
async function sendEvent(width, height, ratio) {
    const options = {
        name: 'mobile-type',
        method: 'setDesignResolution',
        args: [width, height, ratio]
    };
    await Editor.Message.request('scene', 'execute-scene-script', options);
}
function swapDesignSize() {
    let temp = designSize.designWidth;
    designSize.designWidth = designSize.designHeight;
    designSize.designHeight = temp;
}
function resetDesignResolutionSize(width, height) {
    if (width > height && designSize.designWidth < designSize.designHeight ||
        width < height && designSize.designWidth > designSize.designHeight) {
        swapDesignSize();
    }
    let rateWidth = designSize.designWidth / width;
    let rateHeight = designSize.designHeight / height;
    let rate = (rateWidth + rateHeight) / 2;
    let newWidth = width * rate;
    let newHeight = height * rate;
    designSize.sizeRatio = Math.round(width / height * RATIO_SCALE);
    sendEvent(newWidth, newHeight, designSize.sizeRatio);
}
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
const load = async function () {
    designSize.designWidth = canvasSize.width, designSize.designHeight = canvasSize.height;
    let isReady = await Editor.Message.request("scene", "query-is-ready");
    if (isReady) {
        resetDesignResolutionSize(canvasSize.width, canvasSize.height);
    }
    else {
        Editor.Message.addBroadcastListener("scene:ready", () => resetDesignResolutionSize(canvasSize.width, canvasSize.height));
    }
};
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
const unload = async function () { };
exports.unload = unload;
