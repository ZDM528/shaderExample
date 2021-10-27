
import { Canvas, CCObject, Component, ResolutionPolicy, Size, view, _decorator } from 'cc';
import { EDITOR } from 'cc/env';
import ActionEvent from '../utility/ActionEvent';
const { ccclass, property, menu, disallowMultiple, requireComponent, executeInEditMode } = _decorator;

// export enum OrientationType {
//     Portrait,
//     Landscape,
// }


@ccclass('AdaptScreenManager')
@disallowMultiple
@requireComponent(Canvas)
@menu("UI/AdaptScreenManager")
export class AdaptScreenManager extends Component {
    public static readonly onResizeEvent = new ActionEvent<number, number, number>();
    private static readonly RATIO_SCALE = 10000;
    private static _designWidth: number = 1334;
    private static _designHeight: number = 750;
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
        let canvasSize = view.getCanvasSize();
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

        AdaptScreenManager._canvasSizeRatio = Math.trunc(width / height * AdaptScreenManager.RATIO_SCALE);

        view.setDesignResolutionSize(newWidth, newHeight, ResolutionPolicy.SHOW_ALL);
        AdaptScreenManager.onResizeEvent.DispatchAction(newWidth, newHeight, AdaptScreenManager.canvasSizeRatio);
    }
}
