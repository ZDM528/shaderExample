
import { Canvas, Component, ResolutionPolicy, screen, view, _decorator } from 'cc';
import ActionEvent from '../utility/ActionEvent';
const { ccclass, property, menu, disallowMultiple, requireComponent, executeInEditMode } = _decorator;

export enum OrientationType {
    Portrait,
    Landscape,
}

const ratioUnit = 10000;
const designWidth = 1334;
const designHeight = 750;

function getRatioValue(width: number, height: number): number {
    return Math.round(width / height * ratioUnit);
}

@ccclass('AdaptScreenManager')
@disallowMultiple
@requireComponent(Canvas)
@menu("UI/AdaptScreenManager")
export class AdaptScreenManager extends Component {
    /** 第一个参数为宽，第二个参数为高，第三个参数为适配比例 */
    public static readonly RATIO_UNIT = ratioUnit;
    public static readonly onResizeEvent = new ActionEvent<number, number, number>();
    public static readonly defaultSizeRatios = [getRatioValue(designWidth, designHeight), getRatioValue(designHeight, designWidth)];
    private static _designWidth: number = designWidth;
    private static _designHeight: number = designHeight;
    private static _canvasSizeRatio: number = 0;
    public static get canvasSizeRatio() { return AdaptScreenManager._canvasSizeRatio; }

    public static get designWidth() { return AdaptScreenManager._designWidth; }
    public static get designHeight() { return AdaptScreenManager._designHeight; }
    /** 竖屏模型 */
    public static get isPortrait() { return AdaptScreenManager.designHeight > AdaptScreenManager.designWidth; }
    /** 横屏模型 */
    public static get isLandscape() { return AdaptScreenManager.designWidth > AdaptScreenManager.designHeight; }

    onLoad() {
        let designSize = view.getDesignResolutionSize();
        AdaptScreenManager._designWidth = designSize.width;
        AdaptScreenManager._designHeight = designSize.height;
        view.setResizeCallback(AdaptScreenManager.onCanvasResize);
        AdaptScreenManager.onCanvasResize();
    }

    onDestroy(): void {
        view.setResizeCallback(null);
    }

    private static swapDesignSize(): void {
        let width = AdaptScreenManager.designWidth;
        AdaptScreenManager._designWidth = AdaptScreenManager.designHeight;
        AdaptScreenManager._designHeight = width;
    }

    public static onCanvasResize(): void {
        let canvasSize = screen.windowSize;
        AdaptScreenManager.resetDesignResolutionSize(canvasSize.width, canvasSize.height);
    }

    public static resetDesignResolutionSize(width: number, height: number): void {
        if (width > height && AdaptScreenManager.designWidth < AdaptScreenManager.designHeight ||
            width < height && AdaptScreenManager.designWidth > AdaptScreenManager.designHeight) {
            AdaptScreenManager.swapDesignSize();
        }

        let rateWidth = AdaptScreenManager.designWidth / width;
        let rateHeight = AdaptScreenManager.designHeight / height;
        let rate = (rateWidth + rateHeight) / 2;
        let newWidth = width * rate;
        let newHeight = height * rate;

        AdaptScreenManager._canvasSizeRatio = getRatioValue(width, height);

        view.setDesignResolutionSize(newWidth, newHeight, ResolutionPolicy.SHOW_ALL);
        AdaptScreenManager.onResizeEvent.dispatchAction(newWidth, newHeight, AdaptScreenManager.canvasSizeRatio);
    }
}
