import { Component, EventHandler, EventTouch, Node, Sprite, SpriteFrame, _decorator } from "cc";
import { EDITOR } from "cc/env";

const { ccclass, property, executeInEditMode } = _decorator;

enum EventType {
    /**
     * @param value switch value
     * @param this SwitchButton instance
     */
    SWITCH = 'switch',
}

@ccclass('SwitchButton')
@executeInEditMode
export class SwitchButton extends Component {
    public static readonly EventType = EventType;

    @property(Sprite)
    private _sprite: Sprite = null;
    @property(Sprite)
    public get sprite(): Sprite { return this._sprite; }
    public set sprite(value: Sprite) {
        if (this._sprite == value) return;
        this._sprite = value;
        this.updateState();
    }
    @property(SpriteFrame)
    readonly offSpriteFrame: SpriteFrame = null;
    @property(SpriteFrame)
    readonly onSpriteFrame: SpriteFrame = null;
    @property(SpriteFrame)
    readonly disabledSpriteFrame: SpriteFrame = null;

    @property
    private _switch: boolean = false;
    @property
    public get switch(): boolean { return this._switch; }
    public set switch(value: boolean) {
        if (this.switch == value) return;
        this._switch = value;
        this.updateState();
        EventHandler.emitEvents(this.switchEvents, this);
        this.node.emit(EventType.SWITCH, value, this);
    }

    @property
    private _interactable: boolean = true;
    @property
    public get interactable(): boolean { return this._interactable; }
    public set interactable(value: boolean) {
        if (this._interactable == value) return;
        this._interactable = value;
        this.updateState();
    }

    @property(EventHandler)
    readonly switchEvents: EventHandler[] = [];

    onEnable(): void {
        if (!EDITOR)
            this.registerNodeEvent();
    }

    onDisable(): void {
        if (!EDITOR)
            this.unregisterNodeEvent();
    }

    protected registerNodeEvent() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchBegan, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnded, this);
    }

    protected unregisterNodeEvent() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchBegan, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnded, this);
    }

    protected onTouchBegan(event: EventTouch) {
        if (!this._interactable || !this.enabledInHierarchy) { return; }

        event.propagationStopped = true;
    }

    protected onTouchEnded(event: EventTouch) {
        if (!this._interactable || !this.enabledInHierarchy)
            return;

        this.switch = !this.switch;
        event.propagationStopped = true;
    }

    protected updateState() {
        if (this.sprite == null) return;

        if (this.interactable) {
            this.sprite.spriteFrame = this.switch ? this.onSpriteFrame : this.offSpriteFrame;
        } else {
            this.sprite.spriteFrame = this.disabledSpriteFrame;
        }
    }
}