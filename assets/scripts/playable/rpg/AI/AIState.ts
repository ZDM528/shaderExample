import { Action } from "../../utility/ActionEvent";
import BaseObject from "../BaseObject";
import CampManager from "../Camp/CampManager";
import BaseCharacter from "../BaseCharacter";
import { CharacterAnimationType as ActionType } from "../CharacterAnimationType";
import CharacterAnimator from "../CharacterAnimator";
import AIController from "./AIController";
import { assert } from "cc";
import Timer from "../../extenstion/Timer";

/**
 * AI状态图的变量名
 */
export enum VariableNames {
    target = "target",
    skill = "skill"
}

/**
 * AI状态
 */
export class AIState<T extends BaseObject = BaseObject> {
    private _aiController: AIController;
    /** AI控制器 */
    public get aiController() { return this._aiController; }
    /** 所属的角色 */
    public get character() { return this._aiController.character as T; }
    /** 所属的节点 */
    public get node() { return this.character.node; }
    /** 状态进入回调 */
    protected onEnter(): void { }
    /** 状态退出回调 */
    protected onExit(): void { }
    /** 状态更新回调 */
    public onUpdate(deltaTime: number): void { }

    private timerFuncList: { callback: Action, thisArgs: any }[] = [];

    /**
     * 初始化状态节点
     * @param aiController AI控制器
     */
    public initialize(aiController: AIController): void {
        this._aiController = aiController;
    }

    /**
     * 结束AI状态，并给出结果。
     * @param result 代表成功或者失败, number表示其它节点的数组索引，从0开始。
     */
    protected finish(result: boolean | number): void {
        assert(this.aiController != null);
        this.aiController.onStateFinished(this, result);
    }

    protected callDelay(delayTime: number, callback: Action, thisArgs: any): void {
        Timer.instance.once(delayTime, callback, thisArgs);
        this.timerFuncList.push({ callback, thisArgs });
    }

    public enter(): void {
        this.onEnter();
    }

    public exit(): void {
        if (this.timerFuncList.length > 0) {
            for (let timerFunc of this.timerFuncList)
                Timer.instance.remove(timerFunc.callback, timerFunc.thisArgs);
            this.timerFuncList.length = 0;
        }
        this.onExit();
    }

    /** 打断AI状态 */
    public interrupt(): void {
        this.finish(false);
    }

    /** 完成AI状态，返回true */
    public complete(): void {
        this.finish(true);
    }
}

export class CharacterAIState extends AIState<BaseCharacter> {
}

/**
 * 待机状态节点
 */
export class IdleState extends CharacterAIState {

    onEnter(): void {
        let animator = this.character.getCharacterComponent(CharacterAnimator);
        animator?.play(ActionType.Idle);
    }

    onExit(): void {
    }
}

/**
 * 查找目标敌人状态节点
 */
export class SearchState extends CharacterAIState {
    onEnter(): void {
        let target: BaseCharacter = this.aiController.getVariable(VariableNames.target);
        if (target == null || target.isDeath) {
            target = CampManager.instance.searchNearlyEnemy(this.character);
            this.aiController.setVariable(VariableNames.target, target);
        }
        this.finish(target != null);
    }
}