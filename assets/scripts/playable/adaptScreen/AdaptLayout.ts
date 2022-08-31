import { Component, Enum, view, _decorator } from "cc";
import { EDITOR_WITHOUT_RUN } from "../extenstion/CocosExtenstion";
import HorizontalLayout from "../layout/HorizontalLayout";
import VerticalLayout from "../layout/VerticalLayout";
import { AdaptScreenManager } from "./AdaptScreenManager";

enum LayoutType {
    Order,
    Reverse,
}

const { ccclass, property, requireComponent, executeInEditMode, disallowMultiple, menu } = _decorator;
@ccclass('AdaptLayout')
@requireComponent(HorizontalLayout)
@requireComponent(VerticalLayout)
@executeInEditMode
@disallowMultiple
@menu("UI/AdaptLayout")
export default class AdaptLayout extends Component {
    @property({ type: Enum(LayoutType) })
    private _layoutType: LayoutType = LayoutType.Order;
    @property({ type: Enum(LayoutType) })
    public get layoutType(): LayoutType {
        return this._layoutType;
    }
    public set layoutType(value: LayoutType) {
        this._layoutType = value; this.onResizeEvent();
    }

    onLoad(): void {
        if (EDITOR_WITHOUT_RUN) {
            view.on('editor-canvas-resize', this.onResizeChanged, this);
            this.onResizeChanged(view.editorCanvasSizeRatio);
        } else {
            AdaptScreenManager.onResizeEvent.addEvent(this.onResizeEvent, this);
            this.onResizeEvent();
        }
    }

    onDestroy(): void {
        if (EDITOR_WITHOUT_RUN) {
            view.off('editor-canvas-resize', this.onResizeChanged, this);
        } else {
            AdaptScreenManager.onResizeEvent.removeEvent(this.onResizeEvent, this);
        }
    }

    private onResizeChanged(ratio: number): void {
        let hLayout = this.getComponent(HorizontalLayout);
        let vLayout = this.getComponent(VerticalLayout);
        let order = this.layoutType == LayoutType.Order;
        if (ratio > AdaptScreenManager.RATIO_UNIT) { // Landscape
            if (hLayout) hLayout.enabled = order;
            if (vLayout) vLayout.enabled = !order;
        } else { // Portrait
            if (hLayout) hLayout.enabled = !order;
            if (vLayout) vLayout.enabled = order;
        }
    }

    private onResizeEvent(): void {
        this.onResizeChanged(AdaptScreenManager.canvasSizeRatio);
    }
}