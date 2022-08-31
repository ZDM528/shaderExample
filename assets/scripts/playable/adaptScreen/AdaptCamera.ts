import { Camera, Component, Enum, view, _decorator } from "cc";
import { EDITOR_WITHOUT_RUN } from "../extenstion/CocosExtenstion";
import { AdaptScreenManager, OrientationType } from "./AdaptScreenManager";

const { ccclass, property, requireComponent, executeInEditMode, disallowMultiple, menu } = _decorator;

@ccclass('AspectCamera')
@requireComponent(Camera)
@executeInEditMode
@disallowMultiple
@menu("UI/AspectCamera")
export class AspectCamera extends Component {
    @property({ type: Enum(OrientationType), readonly: true })
    public get orientationType() { return EDITOR_WITHOUT_RUN && view.editorCanvasSizeRatio > AdaptScreenManager.RATIO_UNIT ? OrientationType.Landscape : OrientationType.Portrait; }

    @property
    private _hFovAxis: Camera.FOVAxis = Camera.FOVAxis.HORIZONTAL;
    @property({ type: Enum(Camera.FOVAxis), group: "Landscape", displayName: "FovAxis" })
    public get hFovAxis() { return this._hFovAxis; }
    public set hFovAxis(v) {
        if (this._hFovAxis == v) return;
        this._hFovAxis = v;
        if (EDITOR_WITHOUT_RUN && view.editorCanvasSizeRatio > AdaptScreenManager.RATIO_UNIT)
            this.camera.fovAxis = v;
    }
    @property
    private _hFov: number = 32;
    @property({ group: "Landscape", displayName: "Fov" })
    public get hFov() { return this._hFov; }
    public set hFov(v) {
        if (this._hFov == v) return;
        this._hFov = v;
        if (EDITOR_WITHOUT_RUN && view.editorCanvasSizeRatio > AdaptScreenManager.RATIO_UNIT)
            this.camera.fov = v;
    }

    @property
    private _vFovAxis: Camera.FOVAxis = Camera.FOVAxis.VERTICAL;
    @property({ type: Enum(Camera.FOVAxis), group: "Portrait", displayName: "FovAxis" })
    public get vFovAxis() { return this._vFovAxis; }
    public set vFovAxis(v) {
        if (this._vFovAxis == v) return;
        this._vFovAxis = v;
        if (EDITOR_WITHOUT_RUN && view.editorCanvasSizeRatio <= AdaptScreenManager.RATIO_UNIT)
            this.camera.fovAxis = v;
    }

    @property
    private _vFov: number = 60;
    @property({ group: "Portrait", displayName: "Fov" })
    public get vFov() { return this._vFov; }
    public set vFov(v) {
        if (this._vFov == v) return;
        this._vFov = v;
        if (EDITOR_WITHOUT_RUN && view.editorCanvasSizeRatio <= AdaptScreenManager.RATIO_UNIT)
            this.camera.fov = v;
    }

    public get camera() { return this.getComponent(Camera); }

    onLoad(): void {
        if (EDITOR_WITHOUT_RUN) {
            view.on('editor-canvas-resize', this.onResizeChanged, this);
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
        let camera = this.camera;
        if (ratio > AdaptScreenManager.RATIO_UNIT) { // Landscape
            camera.fovAxis = this.hFovAxis;
            camera.fov = this.hFov;
        } else { // Portrait
            camera.fovAxis = this.vFovAxis;
            camera.fov = this.vFov;
        }
    }

    private onResizeEvent(): void {
        this.onResizeChanged(AdaptScreenManager.canvasSizeRatio);
    }
}