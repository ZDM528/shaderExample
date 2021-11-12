import { CCObject, director, Director, System } from "cc";
import { XTween } from "./XTween";

let oldUpdateActions = XTween.prototype._updateActions;
XTween.prototype._updateActions = function updateActions(deltaTime: number): boolean {
    if (this.target instanceof CCObject && !this.target.isValid) return true;
    return oldUpdateActions.apply(this, deltaTime);
}

export class XTweenSystem extends System {
    static readonly ID = 'XTWEEN';

    update(dt: number) {
        XTween.updateTweens();
    }
}

director.on(Director.EVENT_INIT, () => {
    const sys = new XTweenSystem();
    director.registerSystem(XTweenSystem.ID, sys, System.Priority.MEDIUM);
});
