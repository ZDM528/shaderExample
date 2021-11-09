import { Animation, dragonBones } from "cc";
import Timer from "../extenstion/Timer";
import { Action } from "../utility/ActionEvent";
import Character from "./Character";
import { CharacterAnimationType } from "./CharacterAnimationType";
import CharacterComponent from "./CharacterComponent";

interface IAnimator {
    play(name: string, callback?: Action<boolean>): void;
}

class CAnimation implements IAnimator {

    constructor(readonly animation: Animation) { }

    play(name: string, onCallback?: Action<boolean>): void {
        if (onCallback != null)
            this.animation.once(Animation.EventType.FINISHED, onCallback);
        this.animation.play(name);
    }
}

class CDragonBones implements IAnimator {
    private onCallback: Action<boolean>;
    private timer: Timer;
    constructor(readonly armature: dragonBones.ArmatureDisplay) {
        this.timer = armature.addComponent(Timer);
    }

    play(name: string, onCallback?: Action<boolean>): void {
        let state = this.armature.playAnimation(name, -1);
        let time = state.totalTime * state.timeScale;
        this.onCallback?.(false);
        this.timer.off(this.onCallback);
        this.onCallback = null;
        if (onCallback != null) {
            this.onCallback = onCallback;
            this.timer.on(time, this.onCallback, this, true);
        }
        // if (onCallback != null)
        //     this.armature.once("complete", onCallback, undefined);
    }
}

export default class CharacterAnimator extends CharacterComponent<Character> {
    private animator: IAnimator;

    public initialize(animator: Animation | dragonBones.ArmatureDisplay): void {
        this.animator = this.creaeteAnimator(animator);

        let dieAnimation = CharacterAnimationType[CharacterAnimationType.Die];
        this.character.diedEvent.AddEvent(() => {
            this.play(dieAnimation, () => {
                if (this.character.config.corpseTime) {
                    this.character.scheduleOnce(() => {
                        this.character.node.destroy();
                    }, this.character.config.corpseTime);
                }
            });
        });
    }

    private creaeteAnimator(animator: Animation | dragonBones.ArmatureDisplay): IAnimator {
        if (animator instanceof Animation)
            return new CAnimation(animator);
        if (animator instanceof dragonBones.ArmatureDisplay)
            return new CDragonBones(animator);
    }

    /**
     * 播放动画
     * @param animationName 动画名称
     * @param onCallback 播放回调，当播放成功时，返回值为true，当被中断时，返回值为false。
     * @param onEffectEvent 特效事件回调
     * @param onDamageEvent 伤害事件回调
     */
    public play(animationName: string | CharacterAnimationType, onCallback?: Action<boolean>, onEffectEvent?: Action, onDamageEvent?: Action): void {
        if (typeof animationName !== "string")
            animationName = CharacterAnimationType[animationName];
        let useAnimationEvent = this.character.config.useAnimationEvent;

        let callback: Action<boolean>;
        if (useAnimationEvent) {
            this.character.setAnimationEffect(onEffectEvent, onDamageEvent);
            callback = onCallback;
        } else if (onCallback || onEffectEvent || onDamageEvent) {
            callback = (result) => {
                if (!useAnimationEvent && result) {
                    onEffectEvent?.();
                    onDamageEvent?.();
                }
                onCallback?.(result);
            };
        }

        this.animator.play(animationName, callback);
    }
}