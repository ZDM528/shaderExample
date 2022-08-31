import { Animation, AnimationState, assert, dragonBones } from "cc";
import Timer from "../extenstion/Timer";
import { Action } from "../utility/ActionEvent";
import BaseObject from "./BaseObject";
import { CharacterAnimationType, CharacterAnimationValue } from "./CharacterAnimationType";
import CharacterComponent from "./CharacterComponent";

interface IAnimator {
    readonly animation: any;
    setAnimation(animation: any);
    onDestroy?(): void;
    play(name: string, crossFadeTime: number, callback?: Action<boolean>): void;
    stop();
    getAnimationDuration(name: string): number;
}

class CAnimation implements IAnimator {
    private onCallback: Action<boolean>;
    private animationName: string;
    private _animation: Animation;
    public get animation() { return this._animation; }

    constructor(animation: Animation) {
        this.setAnimation(animation);
    }

    setAnimation(animation: any) {
        assert(animation != null);
        if (this.animation != null)
            this.animation.off(Animation.EventType.STOP, this.onAnimationStop, this);
        this._animation = animation;
        this.animation.on(Animation.EventType.STOP, this.onAnimationStop, this);
        if (this.animationName != null)
            this.animation.play(this.animationName);
    }

    private onAnimationStop(name: string, state: AnimationState): void {
        if (state.name == this.animationName)
            this.callbackFunc(true);
    }

    onDestroy(): void {
        this.callbackFunc(false);
        this.animation.off(Animation.EventType.STOP, this.onAnimationStop, this);
    }

    private callbackFunc(result: boolean): void {
        this.animationName = null;
        if (this.onCallback != null) {
            let tempFunc: Function = this.onCallback;
            this.onCallback = null;
            tempFunc(result);
        }
    }

    play(name: string, crossFadeTime: number, onCallback?: Action<boolean>): void {
        this.onCallback?.(false);
        this.animationName = name;
        this.onCallback = onCallback;
        if (crossFadeTime != null)
            this.animation.crossFade(name, crossFadeTime);
        else
            this.animation.play(name);
    }

    stop(): void {
        this.animation.stop();
    }

    getAnimationDuration(name: string): number {
        return this.animation.getState(name).duration;
    }
}

class CDragonBones implements IAnimator {
    private onCallback: Action<boolean>;
    private _animation: dragonBones.ArmatureDisplay;
    public get animation() { return this._animation; }

    constructor(animation: dragonBones.ArmatureDisplay) {
        this.setAnimation(animation);
    }

    public setAnimation(animation: dragonBones.ArmatureDisplay) {
        this._animation = animation;
    }

    play(name: string, crossFadeTime: number, onCallback?: Action<boolean>): void {
        let state = this.animation.playAnimation(name, -1);
        let time = state.totalTime * state.timeScale;
        this.onCallback?.(false);
        Timer.instance.remove(this.onCallback);
        this.onCallback = null;
        if (onCallback != null) {
            this.onCallback = onCallback;
            Timer.instance.once(time, this.onCallback, this);
        }
        // if (onCallback != null)
        //     this.armature.once("complete", onCallback, undefined);
    }

    stop(): void {
        throw "CDragonBones stop";
    }

    onDestroy(): void {
        Timer.instance.remove(this.onCallback);
    }

    getAnimationDuration(name: string): number {
        throw "CDragonBones getAnimationDuration";
    }
}

export default class CharacterAnimator extends CharacterComponent<BaseObject> {
    private animator: IAnimator;
    public get animation(): Animation | dragonBones.ArmatureDisplay { return this.animator.animation; }
    public setAnimation(animation: Animation | dragonBones.ArmatureDisplay) {
        this.animator.setAnimation(animation);
    }

    public initialize(animation: Animation | dragonBones.ArmatureDisplay): void {
        this.animator = this.createAnimator(animation);
        // let dieAnimation = CharacterAnimationValue[CharacterAnimationType.Die];
        // this.character.diedEvent.addEvent(() => {
        //     this.play(dieAnimation, undefined, () => {
        //         if (this.character.config.corpseTime) {
        //             xtween(this.character.node).delay(this.character.config.corpseTime).by(0.3, { positionY: -this.character.config.bodyRadius * 2 }).call(() => {
        //                 this.character.node.destroy();
        //             }).start();
        //             // this.character.scheduleOnce(() => {
        //             // }, this.character.config.corpseTime);
        //         }
        //     });
        // });
        super.initialize();
    }

    public resetAnimation(animator: Animation | dragonBones.ArmatureDisplay): void {
        this.animator?.onDestroy?.();
        this.animator = this.createAnimator(animator);
    }

    public finalize(): void {
        this.animator.onDestroy?.();
    }

    private createAnimator(animator: Animation | dragonBones.ArmatureDisplay): IAnimator {
        if (animator instanceof Animation)
            return new CAnimation(animator);
        if (animator instanceof dragonBones.ArmatureDisplay)
            return new CDragonBones(animator);
    }

    public getAnimationDuration(name: string): number {
        return this.animator.getAnimationDuration(name);
    }

    /**
     * 播放动画
     * @param animationName 动画名称
     * @param crossFadeTime 动作混入时间
     * @param onCallback 播放回调，当播放成功时，返回值为true，当被中断时，返回值为false。
     * @param onEffectEvent 特效事件回调
     * @param onDamageEvent 伤害事件回调
     */
    public play(animationName: string | CharacterAnimationType, crossFadeTime?: number, onCallback?: (result: boolean) => void, onEffectEvent?: () => void, onDamageEvent?: () => void): void {
        if (typeof animationName !== "string")
            animationName = CharacterAnimationValue[animationName];
        let useAnimationEvent = this.character.useAnimationEvent;

        let callback: (result: boolean) => void;
        if (useAnimationEvent) {
            this.character.setAnimationEffect(onEffectEvent, onDamageEvent);
            callback = onCallback;
        } else if (onCallback || onEffectEvent || onDamageEvent) {
            callback = (result: boolean) => {
                if (!useAnimationEvent && result) {
                    onEffectEvent?.();
                    onDamageEvent?.();
                }
                onCallback?.(result);
            };
        }

        this.animator.play(animationName, crossFadeTime, callback);
    }

    public stop(): void {
        this.animator.stop();
    }
}