import { CCFloat, Renderable2D, UIOpacity, _decorator } from "cc";
import { TweenComponent } from "./TweenComponent";

const { ccclass, property } = _decorator;

@ccclass('TweenAlpha')
export class TweenAlpha extends TweenComponent {

    @property({ type: CCFloat, min: 0, max: 1, slide: true })
    readonly startAlpha: number = 0;
    @property({ type: CCFloat, min: 0, max: 1, slide: true })
    readonly endAlpha: number = 1;

    public get tweenTarget(): { alpha: number } {
        let renderable2D = this.node.getComponent(Renderable2D);
        if (renderable2D != null) return renderable2D;
        let uiopacity = this.node.getOrAddComponent(UIOpacity);
        return uiopacity;
    }

    protected createProperties(): {} {
        let target = this.tweenTarget;
        target.alpha = this.startAlpha;
        return { alpha: this.endAlpha };
    }
}