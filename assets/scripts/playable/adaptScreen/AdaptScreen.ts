import { BitMask, Component, Node, Size, UITransform, Vec2, Vec3, view, Widget, _decorator } from 'cc';
import { EDITOR } from 'cc/env';
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
    @property
    public ratio: number = 0;
    @property(Vec3)
    public position = new Vec3();
    @property(Vec3)
    public euler = new Vec3();
    @property(Vec3)
    public scale = new Vec3();
    @property(Size)
    public size = new Size();
    @property(Vec2)
    public anchorPoint = new Vec2();
    @property(WidgetData)
    public widget = new WidgetData();

    public constructor(ratio: number, other?: TransformData) {
        this.ratio = ratio;
        if (other != null) this.set(other);
    }

    public set(other: TransformData): void {
        this.position.set(other.position);
        this.euler.set(other.euler);
        this.scale.set(other.scale);
        this.size.set(other.size);
        this.anchorPoint.set(other.anchorPoint);
        this.widget.set(other.widget);
    }
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
    @property({ type: [TransformData], visible: false })
    public readonly transformDatas: TransformData[] = [];
    @property({ type: BitMask(DataMask), tooltip: "只记录打勾内容，默认全部记录。" })
    public readonly recordMask: number = DataMask.ALL;

    /** editor only */
    private transformData: TransformData;
    private resolutionChangedTime: number = 0;
    private widgetRecursiveDirty: Function;

    onLoad(): void {
        if (EDITOR) {
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
            AdaptScreenManager.onResizeEvent.AddEvent(this.onResizeEvent, this);
            this.onResizeEvent();
        }
    }

    onDestroy(): void {
        if (EDITOR) {
            this.node.off(Node.EventType.TRANSFORM_CHANGED, this.saveTransformData, this);
            this.node.off(Node.EventType.SIZE_CHANGED, this.saveTransformSize, this);
            this.node.off(Node.EventType.ANCHOR_CHANGED, this.saveTransformAnchorPoint, this);
            view.off('editor-canvas-resize', this.onEditorSizeChanged, this);
            this.node.off("addComponent", this.onAddComponent, this);

            let widget = this.getComponent(Widget);
            if (widget && this.widgetRecursiveDirty)
                widget["_recursiveDirty"] = this.widgetRecursiveDirty;
        } else {
            AdaptScreenManager.onResizeEvent.RemoveEvent(this.onResizeEvent, this);
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
            if (Date.now() - this.resolutionChangedTime > 100) {
                this.saveWidget();
            }
        };
    }

    private onEditorSizeChanged(ratio: number): void {
        this.resolutionChangedTime = Date.now();
        this.transformData = this.transformDatas.find(v => v.ratio == ratio);
        if (this.transformData == null) {
            let nearest = this.getNearestTransformData(ratio);
            this.transformData = new TransformData(ratio, nearest);
            this.transformDatas.push(this.transformData);
            if (nearest == null) {
                this.initSaveTransform();
            } else {
                this.updateTransformData(this.transformData);
            }
        } else {
            this.updateTransformData(this.transformData);
        }
    }

    private onResizeEvent(): void {
        let ratio = AdaptScreenManager.canvasSizeRatio;
        let transformData = this.getNearestTransformData(ratio);
        if (transformData != null)
            this.updateTransformData(transformData);
    }

    private initSaveTransform(): void {
        this.saveTransformData(Node.TransformBit.TRS);
        this.saveTransformSize();
        this.saveTransformAnchorPoint();
        this.saveWidget();
    }

    private saveTransformData(type: number): void {
        if (type & Node.TransformBit.POSITION)
            this.transformData.position.set(this.node.position);
        if (type & Node.TransformBit.ROTATION)
            this.transformData.euler.set(this.node.eulerAngles);
        if (type & Node.TransformBit.SCALE)
            this.transformData.scale.set(this.node.scale);
    }

    private saveTransformSize(): void {
        let uiTransform = this.node.getComponent(UITransform);
        if (uiTransform == null) return;
        this.transformData.size.set(uiTransform.contentSize);
    }

    private saveTransformAnchorPoint(): void {
        let uiTransform = this.node.getComponent(UITransform);
        if (uiTransform == null) return;
        this.transformData.anchorPoint.set(uiTransform.anchorPoint);
    }

    private saveWidget(): void {
        let widget = this.node.getComponent(Widget);
        if (widget == null) return;
        this.transformData.widget.saveData(widget);
    }

    public updateTransformData(data: TransformData): void {
        if (this.recordMask & DataMask.POSITION)
            this.node.setPosition(data.position);
        if (this.recordMask & DataMask.ROTATION)
            this.node.setRotationFromEuler(data.euler);
        if (this.recordMask & DataMask.SCALE)
            this.node.setScale(data.scale);

        let uiTransform = this.node.getComponent(UITransform);
        if (uiTransform != null) {
            if (this.recordMask & DataMask.SIZE)
                uiTransform.setContentSize(data.size);
            if (this.recordMask & DataMask.ANCHOR)
                uiTransform.setAnchorPoint(data.anchorPoint);
        }

        if (this.recordMask & DataMask.WIDGET) {
            let widget = this.node.getComponent(Widget);
            if (widget) data.widget.updateData(widget);
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
}