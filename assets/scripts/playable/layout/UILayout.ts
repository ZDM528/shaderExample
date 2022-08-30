import { CCFloat, Component, director, Director, Enum, Node, UITransform, Vec2, _decorator } from "cc";
import LayoutElement from "./LayoutElement";

interface SetPositionEvent {
    (uiTransform: UITransform, x: number, height: number): void;
}

interface OnForeachChildren {
    (uiTransform: UITransform, element: LayoutElement): void;
}

interface GetChildSize {
    (child: UITransform, element: LayoutElement, totalSize: number, size: number): number;
}

interface GetChildSize2 {
    (child: UITransform, element: LayoutElement): number;
}

enum LayoutType {
    Horizontal,
    Vertical,
}

export enum LayoutAlignment {
    /** 无处理 */
    None,
    /** 正向排序 */
    Forward,
    /** 逆向排序 */
    Backward,
    /** 居中排序 */
    Center,
    /** 填充 */
    Full,
    /** 按子大小自动计算内容大小 */
    Content,
}

abstract class BaseLayout {
    public constructor(protected readonly layout: UILayout) { }
    public abstract get layoutType(): LayoutAlignment;
    public abstract get alignment(): LayoutAlignment;
    public abstract get sign(): number;
    public abstract getNodeAnchor(uiTransform: UITransform): Vec2;
    public abstract getMargins(): Vec2[];
    public abstract setNodePosition(uiTransform: UITransform, x: number, y: number): void;
    public abstract getLayoutSize(uiTransform: UITransform): number;
    public abstract setLayoutSize(uiTransform: UITransform, w: number): void;
    public abstract getNoLayoutSize(uiTransform: UITransform): number;
    public abstract setNoLayoutSize(uiTransform: UITransform, h: number): void;
    public abstract getLayoutAnchor(uiTransform: UITransform): number;
    public abstract getNoLayoutAnchor(uiTransform: UITransform): number;
    public abstract getElementMinSize(uiTransform: UITransform, element: LayoutElement): number;
    public abstract getElementPreferredSize(uiTransform: UITransform, element: LayoutElement): number;
    public abstract getElementFlexibleSize(element: LayoutElement): number;
}

class HorizontalLayout extends BaseLayout {
    public get layoutType() { return this.layout.horizontalAlignment; }

    public get alignment() { return this.layout.verticalAlignment; }

    public get sign(): number { return 1; }

    public getNodeAnchor(uiTransform: UITransform): Vec2 {
        return uiTransform.anchorPoint;
    }

    public getMargins(): Vec2[] {
        return [new Vec2(this.layout.left, this.layout.right), new Vec2(this.layout.top, this.layout.bottom)];
    }

    public setNodePosition(uiTransform: UITransform, x: number, y: number): void {
        uiTransform.node.setPosition(x, y, 0);
    }

    public getLayoutSize(uiTransform: UITransform): number {
        return this.layout.childScaleWidth ? uiTransform.width * uiTransform.node.scale.x : uiTransform.width;
    }

    public setLayoutSize(uiTransform: UITransform, w: number): void {
        uiTransform.width = this.layout.childScaleWidth ? w / uiTransform.node.scale.x : w;
    }

    public getNoLayoutSize(uiTransform: UITransform): number {
        return this.layout.childScaleHeight ? uiTransform.height * uiTransform.node.scale.y : uiTransform.height;
    }

    public setNoLayoutSize(uiTransform: UITransform, h: number): void {
        uiTransform.height = this.layout.childScaleHeight ? h / uiTransform.node.scale.y : h;
    }

    public getLayoutAnchor(uiTransform: UITransform): number {
        return uiTransform.anchorX;
    }

    public getNoLayoutAnchor(uiTransform: UITransform): number {
        return uiTransform.anchorY;
    }

    public getElementMinSize(uiTransform: UITransform, element: LayoutElement): number {
        return this.layout.childScaleWidth ? element.minWidth * uiTransform.node.scale.x : element.minWidth;
    }

    public getElementPreferredSize(uiTransform: UITransform, element: LayoutElement): number {
        let width = Math.max(element.preferredWidth, element.minWidth);
        return this.layout.childScaleWidth ? width * uiTransform.node.scale.x : width;
    }

    public getElementFlexibleSize(element: LayoutElement): number {
        return element.flexibleWidth;
    }
}

class VerticalLayout extends BaseLayout {
    public get layoutType() { return this.layout.verticalAlignment; }

    public get alignment() { return this.layout.horizontalAlignment; }

    public get sign(): number { return -1; }

    public getNodeAnchor(uiTransform: UITransform): Vec2 {
        return new Vec2(1 - uiTransform.anchorY, 1 - uiTransform.anchorX);
    }

    public getMargins(): Vec2[] {
        return [new Vec2(this.layout.bottom, this.layout.top), new Vec2(this.layout.right, this.layout.left)];
    }

    public setNodePosition(uiTransform: UITransform, x: number, y: number): void {
        uiTransform.node.setPosition(y, x, 0);
    }

    public getLayoutSize(uiTransform: UITransform): number {
        return this.layout.childScaleHeight ? uiTransform.height * uiTransform.node.scale.y : uiTransform.height;
    }

    public setLayoutSize(uiTransform: UITransform, h: number): void {
        uiTransform.height = this.layout.childScaleHeight ? h / uiTransform.node.scale.y : h;
    }

    public getNoLayoutSize(uiTransform: UITransform): number {
        return this.layout.childScaleWidth ? uiTransform.width * uiTransform.node.scale.x : uiTransform.width;
    }

    public setNoLayoutSize(uiTransform: UITransform, w: number): void {
        uiTransform.width = this.layout.childScaleWidth ? w / uiTransform.node.scale.x : w;
    }

    public getLayoutAnchor(uiTransform: UITransform): number {
        return uiTransform.anchorY;
    }
    public getNoLayoutAnchor(uiTransform: UITransform): number {
        return uiTransform.anchorX;
    }

    public getElementMinSize(uiTransform: UITransform, element: LayoutElement): number {
        return this.layout.childScaleHeight ? element.minHeight * uiTransform.node.scale.y : element.minHeight;
    }

    public getElementPreferredSize(uiTransform: UITransform, element: LayoutElement): number {
        let height = Math.max(element.preferredHeight, element.minHeight);
        return this.layout.childScaleHeight ? height * uiTransform.node.scale.y : height;
    }

    public getElementFlexibleSize(element: LayoutElement): number {
        return element.flexibleHeight;
    }
}

const { ccclass, menu, property, executeInEditMode } = _decorator;
@ccclass
@menu("Layout/UILayout")
@executeInEditMode
export default class UILayout extends Component {
    public static readonly LayoutType = LayoutType;
    @property({ type: Enum(LayoutType) })
    private _type: LayoutType = LayoutType.Horizontal;
    @property({ type: Enum(LayoutType), displayOrder: 0 })
    public get type(): LayoutType {
        return this._type;
    }
    public set type(value: LayoutType) {
        if (this._type == value) return;
        this._type = value;
        this.craeteLayout();
        this.layoutDirty();
    }
    @property
    private _top: number = 0;
    @property
    private _bottom: number = 0;
    @property
    private _left: number = 0;
    @property
    private _right: number = 0;
    @property
    private _spacing: number = 0;
    @property
    private _childScaleWidth: boolean = false;
    @property
    private _childScaleHeight: boolean = false;
    @property
    private _reverse: boolean = false;
    @property
    private _horizontalAlignment: LayoutAlignment = LayoutAlignment.Center;
    @property
    private _verticalAlignment: LayoutAlignment = LayoutAlignment.Center;

    @property({ type: Enum(LayoutAlignment), displayOrder: 2, tooltip: "水平对齐方式" })
    public get horizontalAlignment() { return this._horizontalAlignment; }
    public set horizontalAlignment(v) {
        if (this._horizontalAlignment == v) return;
        this._horizontalAlignment = v;
        this.layoutDirty();
    }

    @property({ type: Enum(LayoutAlignment), displayOrder: 2, tooltip: "垂直对齐方式" })
    public get verticalAlignment() { return this._verticalAlignment; }
    public set verticalAlignment(v) {
        if (this._verticalAlignment == v) return;
        this._verticalAlignment = v;
        this.layoutDirty();
    }

    @property({ group: { name: "padding", displayOrder: 1 }, displayOrder: 1, tooltip: "容器的边距" })
    public get top() { return this._top; }
    public set top(v) {
        if (this._top == v) return;
        this._top = v;
        this.layoutDirty();
    }

    @property({ group: { name: "padding" }, tooltip: "容器的边距" })
    public get bottom() { return this._bottom; }
    public set bottom(v) {
        if (this._bottom == v) return;
        this._bottom = v;
        this.layoutDirty();
    }

    @property({ group: { name: "padding" }, tooltip: "容器的边距" })
    public get left() { return this._left; }
    public set left(v) {
        if (this._left == v) return;
        this._left = v;
        this.layoutDirty();
    }

    @property({ group: { name: "padding" }, tooltip: "容器的边距" })
    public get right() { return this._right; }
    public set right(v) {
        if (this._right == v) return;
        this._right = v;
        this.layoutDirty();
    }

    @property({ type: CCFloat, tooltip: "子节点之间的间距" })
    public get spacing() { return this._spacing; }
    public set spacing(v) {
        if (this._spacing == v) return;
        this._spacing = v;
        this.layoutDirty();
    }

    @property({ tooltip: "子节点倒过来排序" })
    public get reverse() { return this._reverse; };
    public set reverse(v) {
        if (this._reverse == v) return;
        this._reverse = v;
        this.foreachChildren = this.getForeachChildren(v);
        this.layoutDirty();
    }

    @property({ tooltip: "计算子节点的宽度缩放" })
    public get childScaleWidth() { return this._childScaleWidth; };
    public set childScaleWidth(v) {
        if (this._childScaleWidth == v) return;
        this._childScaleWidth = v;
        this.layoutDirty();
    }

    @property({ tooltip: "计算子节点的高度缩放" })
    public get childScaleHeight() { return this._childScaleHeight; };
    public set childScaleHeight(v) {
        if (this._childScaleHeight == v) return;
        this._childScaleHeight = v;
        this.layoutDirty();
    }

    private isDirty: boolean = false;
    private uiTransform: UITransform;
    private layout: BaseLayout;
    public foreachChildren: (callback: OnForeachChildren) => void;

    onLoad(): void {
        this.uiTransform = this.node.getComponent(UITransform);
        this.craeteLayout();
    }

    onEnable(): void {
        this.foreachChildren = this.getForeachChildren(this.reverse);
        this.addEventListeners();
        this.layoutDirty();
    }

    onDisable(): void {
        this.removeEventListeners();
    }

    private craeteLayout(): void {
        this.layout = this.type == LayoutType.Horizontal ? new HorizontalLayout(this) : new VerticalLayout(this);
    }

    protected getForeachChildren(reverse: boolean): (callback: OnForeachChildren) => void {
        let callChildFunc = (child: UITransform, callback: OnForeachChildren) => {
            let element = child.getComponent(LayoutElement);
            if (!child.node.active || element != null && element.enabled && element.ignoreLayout) return;
            callback(child, element);
        };
        if (reverse) {
            return (callback: OnForeachChildren) => {
                for (let i = this.node.children.length - 1; i >= 0; i--) {
                    callChildFunc(this.node.children[i].getComponent(UITransform), callback);
                }
            };
        } else {
            return (callback: OnForeachChildren) => {
                for (let i = 0; i < this.node.children.length; i++) {
                    callChildFunc(this.node.children[i].getComponent(UITransform), callback);
                }
            };
        }
    }

    protected addEventListeners(): void {
        director.on(Director.EVENT_AFTER_UPDATE, this.doLayout, this);
        this.node.on(Node.EventType.SIZE_CHANGED, this.onResizeChanged, this);
        this.node.on(Node.EventType.ANCHOR_CHANGED, this.layoutDirty, this);
        this.node.on(Node.EventType.CHILD_ADDED, this.onChildAdded, this);
        this.node.on(Node.EventType.CHILD_REMOVED, this.onChildRemoved, this);
        this.node.on('childrenSiblingOrderChanged', this.doLayout, this);
        this.addChildrenEventListeners();
    }

    protected removeEventListeners(): void {
        director.off(Director.EVENT_AFTER_UPDATE, this.doLayout, this);
        this.node.off(Node.EventType.SIZE_CHANGED, this.onResizeChanged, this);
        this.node.off(Node.EventType.ANCHOR_CHANGED, this.layoutDirty, this);
        this.node.off(Node.EventType.CHILD_ADDED, this.onChildAdded, this);
        this.node.off(Node.EventType.CHILD_REMOVED, this.onChildRemoved, this);
        this.node.off('childrenSiblingOrderChanged', this.doLayout, this);
        this.removeChildrenEventListeners();
    }

    protected addChildrenEventListeners(): void {
        for (let child of this.node.children)
            this.addChildEventListeners(child);
    }

    protected removeChildrenEventListeners(): void {
        for (let child of this.node.children)
            this.removeChildEventListeners(child);
    }

    protected addChildEventListeners(child: Node): void {
        // child.on(Node.EventType.SCALE_CHANGED, this.LayoutDirty, this);
        child.on(Node.EventType.SIZE_CHANGED, this.layoutDirty, this);
        child.on(Node.EventType.TRANSFORM_CHANGED, this.layoutDirty, this);
        child.on(Node.EventType.ANCHOR_CHANGED, this.layoutDirty, this);
        child.on('active-in-hierarchy-changed', this.layoutDirty, this);
    }

    protected removeChildEventListeners(child: Node): void {
        // child.off(Node.EventType.SCALE_CHANGED, this.LayoutDirty, this);
        child.off(Node.EventType.SIZE_CHANGED, this.layoutDirty, this);
        child.off(Node.EventType.TRANSFORM_CHANGED, this.layoutDirty, this);
        child.off(Node.EventType.ANCHOR_CHANGED, this.layoutDirty, this);
        child.off('active-in-hierarchy-changed', this.layoutDirty, this);
    }

    protected onChildAdded(child: Node): void {
        this.addChildEventListeners(child);
        this.layoutDirty();
    }

    protected onChildRemoved(child: Node): void {
        this.removeChildEventListeners(child);
        this.layoutDirty();
    }

    protected onResizeChanged(): void {
        this.layoutDirty();
    }

    public layoutDirty(): void {
        this.isDirty = true;
    }

    public doLayout(): void {
        if (!this.isDirty || this.node.children.length <= 0) return;
        this.forceDoLayout();
    }

    public forceDoLayout(): void {
        const margins = this.layout.getMargins();
        const contentSize = this.layout.getLayoutSize(this.uiTransform);
        const anchor = this.layout.getNodeAnchor(this.uiTransform);
        const outHeight = { maxHeight: 0 };
        const alignmentFunc = this.getAlignmentFunction(anchor.y, margins[1], outHeight);

        let result = this.getChildrenSizes();
        let getChildFunc: GetChildSize2;
        let allMargin = margins[0].x + margins[0].y;
        if (result.totalPreferredSize + allMargin <= contentSize) {
            getChildFunc = this.getChildSize(this.getChildElementPreferredSize, result.flexibleSize, contentSize - result.totalPreferredSize - allMargin);
        } else {
            getChildFunc = this.getChildSize(this.getChildElementMinSize, result.shrinkSize, contentSize - result.totalMinSize - allMargin);
        }

        switch (this.layout.layoutType) {
            case LayoutAlignment.None:
                break;
            case LayoutAlignment.Forward:
                this.layoutChildiren(-contentSize * anchor.x + margins[0].x, getChildFunc, alignmentFunc);
                break;
            case LayoutAlignment.Backward:
                this.layoutChildirenBack(contentSize * (1 - anchor.x) - margins[0].y, getChildFunc, alignmentFunc);
                break;
            case LayoutAlignment.Center:
                if (result.flexibleSize > 0)
                    this.layoutChildiren(-contentSize * anchor.x + margins[0].x, getChildFunc, alignmentFunc);
                else
                    this.layoutCenter(contentSize * (anchor.x - 0.5) - margins[0].x + margins[0].y, getChildFunc, alignmentFunc);
                break;
            case LayoutAlignment.Full:
                this.layoutFull(margins[0], contentSize, anchor, alignmentFunc);
                break;
            case LayoutAlignment.Content:
                this.layoutContent(margins[0], anchor, this.layout.getLayoutSize.bind(this), alignmentFunc);
                break;
        }

        if (this.layout.alignment == LayoutAlignment.Content)
            this.layout.setNoLayoutSize(this.uiTransform, outHeight.maxHeight + margins[1].x + margins[1].y);
        this.isDirty = false;
    }

    protected getAlignmentFunction(anchor: number, margin: Vec2, outHeight: { maxHeight: number }): SetPositionEvent {
        return (uiTransform: UITransform, offset: number, childSize: number) => {
            let contentSize = this.layout.getNoLayoutSize(this.uiTransform);
            let childAnchor = this.layout.getNoLayoutAnchor(uiTransform);

            switch (this.layout.alignment) {
                case LayoutAlignment.None:
                    break;
                case LayoutAlignment.Forward:
                    this.layout.setNodePosition(uiTransform, offset, -contentSize * anchor + childAnchor * childSize + margin.y);
                    break;
                case LayoutAlignment.Backward:
                    this.layout.setNodePosition(uiTransform, offset, contentSize * (1 - anchor) - (1 - childAnchor) * childSize - margin.x);
                    break;
                case LayoutAlignment.Center:
                    this.layout.setNodePosition(uiTransform, offset, -contentSize * (anchor - 0.5) - (0.5 - childAnchor) * childSize + margin.x + margin.y);
                    break;
                case LayoutAlignment.Full:
                    childSize = contentSize - margin.x - margin.y;
                    this.layout.setNoLayoutSize(uiTransform, childSize);
                    this.layout.setNodePosition(uiTransform, offset, contentSize * (1 - anchor) - (1 - childAnchor) * childSize - margin.x);
                    break;
                case LayoutAlignment.Content:
                    this.layout.setNodePosition(uiTransform, offset, contentSize * (1 - anchor) - (1 - childAnchor) * childSize - margin.x);
                    outHeight.maxHeight = Math.max(outHeight.maxHeight, childSize);
                    break;
            }
        }
    }

    private getChildSize(getSize: GetChildSize, totalSize: number, size: number): GetChildSize2 {
        return (child: UITransform, element: LayoutElement) => getSize.call(this, child, element, totalSize, size);
    }

    private getChildrenSizes(): { totalMinSize: number, totalPreferredSize: number, shrinkSize: number, flexibleSize: number } {
        let totalMinSize: number = 0, totalPreferredSize: number = 0, shrinkSize: number = 0, flexibleSize: number = 0;
        let count = 0;
        this.foreachChildren((child, element) => {
            count++;
            if (element == null) {
                let nodeSize = this.layout.getLayoutSize(child);
                totalMinSize += nodeSize;
                totalPreferredSize += nodeSize;
            } else {
                let min = this.layout.getElementMinSize(child, element);
                let preferred = this.layout.getElementPreferredSize(child, element);
                let flexible = this.layout.getElementFlexibleSize(element);
                totalMinSize += min;
                totalPreferredSize += preferred;
                shrinkSize += preferred - min;
                flexibleSize += flexible;
            }
        });
        let totalSpacing = Math.max(0, count - 1) * this.spacing;
        return { totalMinSize: totalMinSize + totalSpacing, totalPreferredSize: totalPreferredSize + totalSpacing, shrinkSize, flexibleSize };
    }

    private getChildElementMinSize(child: UITransform, element: LayoutElement, totalShrinkSize: number, size: number): number {
        if (element == null) return this.layout.getLayoutSize(child);
        let minSize = this.layout.getElementMinSize(child, element);
        let preferredSize = this.layout.getElementPreferredSize(child, element);
        if (totalShrinkSize > 0 && size > 0) {
            let shrinkRate = (preferredSize - minSize) / totalShrinkSize;
            minSize += shrinkRate * size;
        }
        this.layout.setLayoutSize(child, minSize);
        return minSize;
    }

    private getChildElementPreferredSize(child: UITransform, element: LayoutElement, totalFlexibleSize: number, size: number): number {
        if (element == null) return this.layout.getLayoutSize(child);
        let flexibleSize = this.layout.getElementFlexibleSize(element);
        let preferredSize = this.layout.getElementPreferredSize(child, element);
        if (totalFlexibleSize > 0 && size > 0) {
            let flexibleRate = flexibleSize / totalFlexibleSize;
            preferredSize += flexibleRate * size;
        }
        this.layout.setLayoutSize(child, preferredSize);
        return preferredSize;
    }

    protected layoutChildiren(lastOffset: number, getChildSize: GetChildSize2, setPosition: SetPositionEvent): void {
        this.foreachChildren((child, element) => {
            let childSize = getChildSize(child, element);
            let anchor = this.layout.getLayoutAnchor(child);
            lastOffset += childSize * anchor;
            setPosition(child, lastOffset, this.layout.getNoLayoutSize(child));
            lastOffset += childSize * (1 - anchor) + this.spacing;
        });
    }

    protected layoutChildirenBack(margin: number, getChildSize: GetChildSize2, setPosition: SetPositionEvent): void {
        let lastOffset = margin;
        this.foreachChildren((child, element) => {
            let childSize = getChildSize(child, element);
            let anchor = this.layout.getLayoutAnchor(child);
            lastOffset -= childSize * (1 - anchor);
            setPosition(child, lastOffset, this.layout.getNoLayoutSize(child));
            lastOffset -= childSize * anchor + this.spacing;
        });
    }

    protected layoutCenter(margin: number, getChildSize: GetChildSize2, setPosition: SetPositionEvent): void {
        let layoutSize = -this.spacing;
        this.foreachChildren((child, element) => {
            layoutSize += getChildSize(child, element) + this.spacing;
        });
        this.layoutChildiren(-layoutSize * 0.5 - margin, getChildSize, setPosition);
    }

    protected layoutContent(margin: Vec2, anchor: Vec2, getChildSize: GetChildSize2, setPosition: SetPositionEvent): void {
        let layoutSize = -this.spacing + margin.x + margin.y;
        this.foreachChildren((child, element) => {
            layoutSize += getChildSize(child, element) + this.spacing;
        });
        this.layout.setLayoutSize(this.uiTransform, layoutSize);
        this.layoutChildiren(margin.x - layoutSize * anchor.x, getChildSize, setPosition);
    }

    protected layoutFull(margin: Vec2, width: number, anchor: Vec2, setPosition: SetPositionEvent): void {
        let childList: UITransform[] = [];
        let newWidth = width;
        this.foreachChildren((child, element) => {
            if (element != null && this.layout.getElementFlexibleSize(element) <= 0) {
                newWidth -= this.layout.getLayoutSize(child) + this.spacing;
            } else {
                childList.push(child);
            }
        });
        let childWidth = (newWidth - margin.x - margin.y + this.spacing) / childList.length - this.spacing;
        for (let child of childList)
            this.layout.setLayoutSize(child, childWidth);
        this.layoutChildiren(margin.x - width * anchor.x, this.layout.getLayoutSize.bind(this), setPosition);
    }
}