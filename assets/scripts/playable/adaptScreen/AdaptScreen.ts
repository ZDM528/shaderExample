import { BitMask, Component, Enum, ISizeLike, IVec2, log, Node, Size, UITransform, Vec2, Vec3, view, Widget, _decorator } from 'cc';
import { EDITOR_WITHOUT_RUN } from '../extenstion/CocosExtenstion';
import { AspectRatio } from '../ui/AspectRatio';
import { AdaptScreenManager } from './AdaptScreenManager';
const { ccclass, property, executeInEditMode, disallowMultiple, menu } = _decorator;

enum DataMask {
    NONE = 0,
    ALL = 0xffffffff,
    /** 节点位置 */
    POSITION = 1 << 0,
    /** 节点旋转 */
    ROTATION = 1 << 1,
    /** 节点缩放 */
    SCALE = 1 << 2,
    /** 节点大小 */
    SIZE = 1 << 3,
    /** 节点锚点 */
    ANCHOR = 1 << 4,
    /** widget适配 */
    WIDGET = 1 << 5,
}

enum RatioType {
    IPhone6_Landscape = 17787,
    IPhone6_Portrait = 5622,
    IPhoneX_Landscape = 21653,
    IPhoneX_Portrait = 4618,
    IPad_Landscape = 13333,
    IPad_Portrait = 7500,
}

@ccclass('AdaptWidgetData')
class WidgetData {
    @property({ visible: true })
    _alignFlags: number = 0;
    @property({ visible: true })
    _top: number = 0;
    @property({ visible: true })
    _bottom: number = 0;
    @property({ visible: true })
    _left: number = 0;
    @property({ visible: true })
    _right: number = 0;
    @property({ visible: true })
    _horizontalCenter: number = 0;
    @property({ visible: true })
    _verticalCenter: number = 0;
    @property({ visible: true })
    _isAbsTop: boolean = false;
    @property({ visible: true })
    _isAbsBottom: boolean = false;
    @property({ visible: true })
    _isAbsLeft: boolean = false;
    @property({ visible: true })
    _isAbsRight: boolean = false;
    @property({ visible: true })
    _isAbsHorizontalCenter: boolean = false;
    @property({ visible: true })
    _isAbsVerticalCenter: boolean = false;

    public constructor() { }

    public saveData(data: Widget): void {
        for (let key of Object.keys(this))
            this[key] = data[key];
    }

    public updateData(data: Widget): void {
        for (let key of Object.keys(this))
            data[key] = this[key];
        data.setDirty();
    }

    public set(other: WidgetData): void {
        for (let key of Object.keys(other))
            this[key] = other[key];
    }
}

@ccclass('AdaptTransformData')
class TransformData {
    @property({ type: Enum(RatioType), readonly: true, displayName: "MobileType" })
    public readonly ratio: number = 0;
    @property({ type: BitMask(DataMask) })
    public _recordMask: number = DataMask.NONE;
    @property({ visible: false })
    private _position = new Vec3();
    @property({ visible: false })
    private _euler = new Vec3();
    @property({ visible: false })
    private _scale = new Vec3();
    @property({ visible: false })
    private _size = new Size();
    @property({ visible: false })
    private _anchorPoint = new Vec2();
    @property({ type: WidgetData })
    private _widgetData = new WidgetData();

    @property({ editorOnly: true, visible: false })
    public adaptScreen: AdaptScreen = null;

    public constructor(ratio: number) {
        this.ratio = ratio;
    }

    @property({ type: BitMask(DataMask) })
    public get recordMask() { return this._recordMask; }
    public set recordMask(v) {
        if (v == this._recordMask) return;
        this.adaptScreen?.onRecordMaskChanged(this, this._recordMask, v);
        this._recordMask = v;
    }

    public get position(): Readonly<Vec3> { return this._position; }
    public set position(v: Readonly<Vec3>) { this._position.set(v); this._recordMask |= DataMask.POSITION; }

    public get euler(): Readonly<Vec3> { return this._euler; }
    public set euler(v: Readonly<Vec3>) { this._euler.set(v); this._recordMask |= DataMask.ROTATION; }

    public get scale(): Readonly<Vec3> { return this._scale; }
    public set scale(v: Readonly<Vec3>) { this._scale.set(v); this._recordMask |= DataMask.SCALE; }

    public get size(): Readonly<Size> { return this._size; }
    public set size(v: Readonly<Size>) { this._size.set(v); this._recordMask |= DataMask.SIZE; }

    public get anchorPoint(): Readonly<Vec2> { return this._anchorPoint; }
    public set anchorPoint(v: Readonly<Vec2>) { this._anchorPoint.set(v); this._recordMask |= DataMask.ANCHOR; }

    public setWidgetData(widget: Widget) { this._widgetData.saveData(widget); this._recordMask |= DataMask.WIDGET; }
    public updateWidgetData(widget: Widget) { this._widgetData.updateData(widget); }
}

declare module "cc" {
    interface View {
        readonly editorCanvasSizeRatio: number;
    }
}

@ccclass('AdaptScreen')
@executeInEditMode(true)
@disallowMultiple
@menu("UI/AdaptScreen")
export class AdaptScreen extends Component {
    @property({ type: [TransformData] })
    private _transformDatas: TransformData[] = [];

    @property([TransformData])
    public get transformDatas() { return this._transformDatas; }
    public set transformDatas(v) {
        if (v == this._transformDatas) return;
        this._transformDatas = v;
        this._transformData = this._transformDatas.find(v => v.ratio == this._transformData.ratio);
    }

    /** editor only */
    private _transformData: TransformData;
    private get transformData(): TransformData {
        if (EDITOR_WITHOUT_RUN && this._transformData == null && view.editorCanvasSizeRatio) {
            log("create TransformData", this.node.name, view.editorCanvasSizeRatio);
            this._transformData = new TransformData(view.editorCanvasSizeRatio);
            this._transformData.adaptScreen = this;
            this.transformDatas.push(this._transformData);
        }
        return this._transformData;
    }
    private resolutionChangedTime: number = 0;
    private widgetRecursiveDirty: Function;

    onLoad(): void {
        if (EDITOR_WITHOUT_RUN) {
            this.node.on(Node.EventType.TRANSFORM_CHANGED, this.saveTransformData, this);
            this.node.on(Node.EventType.SIZE_CHANGED, this.saveTransformSize, this);
            this.node.on(Node.EventType.ANCHOR_CHANGED, this.saveTransformAnchorPoint, this);
            view.on('editor-canvas-resize', this.onEditorSizeChanged, this);
            this.onEditorSizeChanged(view.editorCanvasSizeRatio);

            let addComponentFunc: Function = this.node.addComponent;
            this.node.addComponent = (...args) => {
                let component = addComponentFunc.call(this.node, ...args);
                this.node.emit("addComponent", component);
                return component;
            }

            this.node.on("addComponent", this.onAddComponent, this);

            let widget = this.getComponent(Widget);
            if (widget != null)
                this.addWidgetEvent(widget);
        } else {
            AdaptScreenManager.onResizeEvent.addEvent(this.onResizeEvent, this);
            this.onResizeEvent();
        }
    }

    onDestroy(): void {
        if (EDITOR_WITHOUT_RUN) {
            this.node.off(Node.EventType.TRANSFORM_CHANGED, this.saveTransformData, this);
            this.node.off(Node.EventType.SIZE_CHANGED, this.saveTransformSize, this);
            this.node.off(Node.EventType.ANCHOR_CHANGED, this.saveTransformAnchorPoint, this);
            view.off('editor-canvas-resize', this.onEditorSizeChanged, this);
            this.node.off("addComponent", this.onAddComponent, this);

            let widget = this.getComponent(Widget);
            if (widget && this.widgetRecursiveDirty)
                widget["_recursiveDirty"] = this.widgetRecursiveDirty;
        } else {
            AdaptScreenManager.onResizeEvent.removeEvent(this.onResizeEvent, this);
        }
    }

    private onAddComponent(component: Component): void {
        if (component instanceof Widget)
            this.addWidgetEvent(component);
    }

    private addWidgetEvent(widget: Widget): void {
        this.widgetRecursiveDirty = widget["_recursiveDirty"];
        widget["_recursiveDirty"] = () => {
            this.widgetRecursiveDirty.call(widget);
            this.saveWidget();
        };
    }

    private onEditorSizeChanged(ratio: number): void {
        this.resolutionChangedTime = Date.now();
        let transformData = this._transformData = this.transformDatas.find(v => v.ratio == ratio);
        if (transformData == null) {
            let nearest = this.getNearestTransformData(ratio);
            if (nearest != null) {
                this.updateTransformData(nearest);
            }
        } else {
            this.updateTransformData(transformData);
        }
    }

    private onResizeEvent(): void {
        let ratio = AdaptScreenManager.canvasSizeRatio;
        let transformData = this.getNearestTransformData(ratio);
        if (transformData != null)
            this.updateTransformData(transformData);
    }

    public onRecordMaskChanged(data: TransformData, oldMask: number, newMask: number): void {
        let addMask = newMask & ~oldMask;
        if (addMask & DataMask.POSITION)
            this.saveTransformData(Node.TransformBit.POSITION, data);
        if (addMask & DataMask.ROTATION)
            this.saveTransformData(Node.TransformBit.ROTATION, data);
        if (addMask & DataMask.SCALE)
            this.saveTransformData(Node.TransformBit.SCALE, data);
        if (addMask & DataMask.SIZE)
            this.saveTransformSize(null, data);
        if (addMask & DataMask.ANCHOR)
            this.saveTransformAnchorPoint(null, data);
        if (addMask & DataMask.WIDGET)
            this.saveWidget(data);
    }

    private saveTransformData(type: number, data?: TransformData): void {
        // 跳过当切换分辨率时带来的变化
        if (Date.now() - this.resolutionChangedTime < 100) return;
        if (data == null) data = this.transformData;

        if (type & Node.TransformBit.SCALE)
            data.scale = this.node.scale;

        if (type & Node.TransformBit.ROTATION)
            data.euler = this.node.eulerAngles;

        let widget = this.node.getComponent(Widget);
        if (type & Node.TransformBit.POSITION && widget == null)
            data.position = this.node.position;
    }

    private saveTransformSize(size: ISizeLike, data?: TransformData): void {
        // 跳过当切换分辨率时带来的变化
        if (Date.now() - this.resolutionChangedTime < 100) return;
        if (data == null) data = this.transformData;

        let uiTransform = this.node.getComponent(UITransform);
        if (uiTransform == null) return;
        if (this.node.getComponent(AspectRatio) != null) return;
        let widget = this.node.getComponent(Widget);
        if (widget) {
            if (widget.isStretchWidth && data.size.height == uiTransform.height) return;
            if (widget.isStretchHeight && data.size.width == uiTransform.width) return;
        }
        data.size = uiTransform.contentSize;
    }

    private saveTransformAnchorPoint(anchorPoint: IVec2, data?: TransformData): void {
        // 跳过当切换分辨率时带来的变化
        if (Date.now() - this.resolutionChangedTime < 100) return;
        if (data == null) data = this.transformData;

        let uiTransform = this.node.getComponent(UITransform);
        if (uiTransform == null) return;
        data.anchorPoint = uiTransform.anchorPoint;
    }

    private saveWidget(data?: TransformData): void {
        // 跳过当切换分辨率时带来的变化
        if (Date.now() - this.resolutionChangedTime < 100) return;
        if (data == null) data = this.transformData;

        let widget = this.node.getComponent(Widget);
        if (widget == null) return;
        data.setWidgetData(widget);
    }

    public updateTransformData(data: TransformData): void {
        let defaultData = this.getDefaultTransformData(data.ratio);

        if (data.recordMask & DataMask.POSITION)
            this.node.setPosition(data.position);
        else if (defaultData && defaultData.recordMask & DataMask.POSITION)
            this.node.setPosition(defaultData.position);

        if (data.recordMask & DataMask.ROTATION)
            this.node.setRotationFromEuler(data.euler);
        else if (defaultData && defaultData.recordMask & DataMask.ROTATION)
            this.node.setRotationFromEuler(defaultData.euler);

        if (data.recordMask & DataMask.SCALE)
            this.node.setScale(data.scale);
        else if (defaultData && defaultData.recordMask & DataMask.SCALE)
            this.node.setScale(defaultData.scale);

        let uiTransform = this.node.getComponent(UITransform);
        if (uiTransform != null) {
            if (data.recordMask & DataMask.SIZE)
                uiTransform.setContentSize(data.size);
            else if (defaultData && defaultData.recordMask & DataMask.SIZE)
                uiTransform.setContentSize(defaultData.size);

            if (data.recordMask & DataMask.ANCHOR)
                uiTransform.setAnchorPoint(data.anchorPoint);
            else if (defaultData && defaultData.recordMask & DataMask.ANCHOR)
                uiTransform.setAnchorPoint(defaultData.anchorPoint);
        }

        let widget = this.node.getComponent(Widget);
        if (widget != null) {
            if (data.recordMask & DataMask.WIDGET)
                data.updateWidgetData(widget);
            else if (defaultData && defaultData.recordMask & DataMask.WIDGET)
                defaultData.updateWidgetData(widget);
        }
    }

    public getNearestTransformData(ratio: number): TransformData {
        let min = Infinity;
        let index = -1;
        for (let i = 0; i < this.transformDatas.length; i++) {
            let value = Math.abs(this.transformDatas[i].ratio - ratio);
            if (value < min)
                min = value, index = i;
        }
        return this.transformDatas[index];
    }

    public getDefaultTransformData(ratio: number): TransformData {
        let minRatio = Infinity;
        for (let defaultRatio of AdaptScreenManager.defaultSizeRatios) {
            let value = Math.abs(defaultRatio - ratio);
            if (value < minRatio)
                minRatio = value;
        }
        return this.transformDatas.find(v => v.ratio == minRatio);
    }
}