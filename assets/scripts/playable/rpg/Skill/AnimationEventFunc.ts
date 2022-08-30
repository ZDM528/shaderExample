import { Component, _decorator } from "cc";
import BaseCharacter from "../BaseCharacter";

const { ccclass, property } = _decorator;
@ccclass('AnimationEventFunc')
export default class AnimationEventFunc extends Component {
    public getCharacter(): BaseCharacter { return this.getComponentInParents(BaseCharacter); }

    /**
     * #### 动画事件回调，外部请匆调用
     */
    public onAnimationEffectEvent(): void {
        let character = this.getCharacter();
        character?.onAnimationEffectEvent();
    }

    /**
     * #### 动画事件回调，外部请匆调用
     */
    public onAnimationDamageEvent(): void {
        let character = this.getCharacter();
        character?.onAnimationDamageEvent();
    }
}