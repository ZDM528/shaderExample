import { director, Director, UIOpacity } from "cc";
import { CCObject, Node, Renderable2D, System } from "cc";
import { EDITOR } from "cc/env";
import { XTween } from "./XTween";

/**
 * CocosCreator vesrsion 3.4.1
 */
declare module "cc" {
    interface Renderable2D {
        colorR: number;
        colorG: number;
        colorB: number;
        colorA: number;
        alpha: number;
    }

    interface UIOpacity {
        alpha: number;
    }

    interface Node {
        /** 2D节点的alpha[范围0~1]，实现原理，从当前节点获得Renderable2D对象，如果有就使用color.a，没有的话，就会获得或者是自动添加一个UIOpacity，再修改UIOpacity的opacity */
        alpha: number;
        positionX: number;
        positionY: number;
        positionZ: number;
        worldPositionX: number;
        worldPositionY: number;
        worldPositionZ: number;
        eulerAngleX: number;
        eulerAngleY: number;
        eulerAngleZ: number;
        scaleX: number;
        scaleY: number;
        scaleZ: number;
        scaleXY: number;
        scaleXZ: number;
        scaleXYZ: number;
    }
}

Object.defineProperties(Renderable2D.prototype, {
    "colorR": {
        get: function () { return this.color.r; },
        set: function (v) {
            if (this.color.r == v) return;
            this.color.r = v;
            this._updateColor();
            if (EDITOR)
                this.node.emit(Node.EventType.COLOR_CHANGED, this.color.clone());
        },
        enumerable: true,
        configurable: true
    },
    "colorG": {
        get: function () { return this.color.g; },
        set: function (v) {
            if (this.color.g == v) return;
            this.color.g = v;
            this._updateColor();
            if (EDITOR)
                this.node.emit(Node.EventType.COLOR_CHANGED, this.color.clone());
        },
        enumerable: true,
        configurable: true
    },
    "colorB": {
        get: function () { return this.color.b; },
        set: function (v) {
            if (this.color.b == v) return;
            this.color.b = v;
            this._updateColor();
            if (EDITOR)
                this.node.emit(Node.EventType.COLOR_CHANGED, this.color.clone());
        },
        enumerable: true,
        configurable: true
    },
    "colorA": {
        get: function () { return this.color.a; },
        set: function (v) {
            if (this.color.a == v) return;
            this.color.a = v;
            this._updateColor();
            if (EDITOR)
                this.node.emit(Node.EventType.COLOR_CHANGED, this.color.clone());
        },
        enumerable: true,
        configurable: true
    },
    "alpha": {
        get: function () { return this.color.a / 255; },
        set: function (v) {
            this.color.a = v * 255;
            this._updateColor();
            if (EDITOR)
                this.node.emit(Node.EventType.COLOR_CHANGED, this.color.clone());
        },
        enumerable: true,
        configurable: true
    },
});

Object.defineProperties(UIOpacity.prototype, {
    "alpha": {
        get: function () { return this.opacity / 255; },
        set: function (v) {
            // if (this.opacity == v) return;
            this.opacity = v * 255;
        },
        enumerable: true,
        configurable: true
    },
});

Object.defineProperties(Node.prototype, {
    alpha: {
        get: function () {
            const self: Node = this;
            let renderable2D = self.getComponent(Renderable2D);
            if (renderable2D != null) return renderable2D.alpha;
            let uiOpacity = self.getComponent(UIOpacity);
            return uiOpacity.alpha;
        },
        set: function (v) {
            const self: Node = this;
            let renderable2D = self.getComponent(Renderable2D);
            if (renderable2D != null) {
                if (renderable2D.alpha != v)
                    renderable2D.alpha = v;
            } else {
                let uiOpacity = self.getComponent(UIOpacity);
                if (uiOpacity.alpha != v)
                    uiOpacity.alpha = v;
            }
        },
        enumerable: true,
        configurable: true
    },
    positionX: {
        get: function () { return this.position.x; },
        set: function (v) {
            if (this.position.x == v) return;
            this.position.x = v;
            this.setPosition(this.position);
        },
        enumerable: true,
        configurable: true
    },
    positionY: {
        get: function () { return this.position.y; },
        set: function (v) {
            if (this.position.y == v) return;
            this.position.y = v;
            this.setPosition(this.position);
        },
        enumerable: true,
        configurable: true
    },
    positionZ: {
        get: function () { return this.position.z; },
        set: function (v) {
            if (this.position.z == v) return;
            this.position.z = v;
            this.setPosition(this.position);
        },
        enumerable: true,
        configurable: true
    },
    worldPositionX: {
        get: function () { return this.worldPosition.x; },
        set: function (v) {
            if (this.worldPosition.x == v) return;
            this.worldPosition.x = v;
            this.setWorldPosition(this.worldPosition);
        },
        enumerable: true,
        configurable: true
    },
    worldPositionY: {
        get: function () { return this.worldPosition.y; },
        set: function (v) {
            if (this.worldPosition.y == v) return;
            this.worldPosition.y = v;
            this.setWorldPosition(this.worldPosition);
        },
        enumerable: true,
        configurable: true
    },
    worldPositionZ: {
        get: function () { return this.worldPosition.z; },
        set: function (v) {
            if (this.worldPosition.z == v) return;
            this.worldPosition.z = v;
            this.setWorldPosition(this.worldPosition);
        },
        enumerable: true,
        configurable: true
    },
    eulerAngleX: {
        get: function () { return this.eulerAngles.x; },
        set: function (v) {
            if (this.eulerAngles.x == v) return;
            this.eulerAngles.x = v;
            this.setRotationFromEuler(this.eulerAngles);
        },
        enumerable: true,
        configurable: true
    },
    eulerAngleY: {
        get: function () { return this.eulerAngles.y; },
        set: function (v) {
            if (this.eulerAngles.y == v) return;
            this.eulerAngles.y = v;
            this.setRotationFromEuler(this.eulerAngles);
        },
        enumerable: true,
        configurable: true
    },
    eulerAngleZ: {
        get: function () { return this.eulerAngles.z; },
        set: function (v) {
            if (this.eulerAngles.z == v) return;
            this.eulerAngles.z = v;
            this.setRotationFromEuler(this.eulerAngles);
        },
        enumerable: true,
        configurable: true
    },
    scaleX: {
        get: function () { return this.scale.x; },
        set: function (v) {
            if (this.scale.x == v) return;
            this.scale.x = v;
            this.setScale(this.scale);
        },
        enumerable: true,
        configurable: true
    },
    scaleY: {
        get: function () { return this.scale.y; },
        set: function (v) {
            if (this.scale.y == v) return;
            this.scale.y = v;
            this.setScale(this.scale);
        },
        enumerable: true,
        configurable: true
    },
    scaleZ: {
        get: function () { return this.scale.z; },
        set: function (v) {
            if (this.scale.z == v) return;
            this.scale.z = v;
            this.setScale(this.scale);
        },
        enumerable: true,
        configurable: true
    },
    scaleXY: {
        get: function () { return this.scale.x; },
        set: function (v) {
            this.setScale(v, v);
        },
        enumerable: true,
        configurable: true
    },
    scaleXZ: {
        get: function () { return this.scale.x; },
        set: function (v) {
            this.setScale(v, this.scaleY, v);
        },
        enumerable: true,
        configurable: true
    },

    scaleXYZ: {
        get: function () { return this.scale.x; },
        set: function (v) {
            this.setScale(v, v, v);
        },
        enumerable: true,
        configurable: true
    },
});

let oldUpdateActions = XTween.prototype._updateActions;
XTween.prototype._updateActions = function updateActions(deltaTime: number): boolean {
    if (this.target instanceof CCObject && !this.target.isValid) return true;
    return oldUpdateActions.call(this, deltaTime);
}

export class XTweenSystem extends System {
    static readonly ID = 'XTWEEN';
    update(dt: number) {
        XTween.updateTweens();
    }
}

// director.on(Director.EVENT_INIT, () => {
// cocos的取决于，在打playable后，此次不回调。
//     log("XTween Director.EVENT_INIT");
const xtweenSystem = new XTweenSystem();
director.registerSystem(XTweenSystem.ID, xtweenSystem, System.Priority.MEDIUM);
// });
// log("XTween Director.on");
