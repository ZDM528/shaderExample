import { Action } from "../../utility/ActionEvent";
import BaseCharacter from "../BaseCharacter";
import CampManager from "../Camp/CampManager";
import Character from "../Character";
import { CharacterAnimationType as ActionType } from "../CharacterAnimationType";
import CharacterAnimator from "../CharacterAnimator";
import AIController from "./AIController";

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
export class AIState<T extends BaseCharacter = BaseCharacter> {
    #aiController: AIController;
    /** AI控制器 */
    public get aiController() { return this.#aiController; }
    /** 所属的角色 */
    public get character() { return this.#aiController.character as T; }
    /** 状态进入回调 */
    protected onEnter(): void { }
    /** 状态退出回调 */
    protected onExit(): void { }
    /** 状态更新回调 */
    public onUpdate(): void { }

    private timerFuncList: { callback: Action, thisArgs: any }[] = [];

    /**
     * 初始化状态节点
     * @param aiController AI控制器
     */
    public initialize(aiController: AIController): void {
        this.#aiController = aiController;
    }

    /**
     * 结束AI状态，并给出结果。
     * @param result 代表成功或者失败, number表示其它节点的数组索引，从0开始。
     */
    protected finish(result: boolean | number): void {
        this.aiController.onStateFinished(this, result);
    }

    protected callDelay(delayTime: number, callback: Action, thisArgs: any): void {
        this.aiController.timer.on(delayTime, callback, thisArgs);
        this.timerFuncList.push({ callback, thisArgs });
    }

    public enter(): void {
        this.onEnter();
    }

    public exit(): void {
        if (this.timerFuncList.length > 0) {
            for (let timerFunc of this.timerFuncList)
                this.aiController.timer.off(timerFunc.callback, timerFunc.thisArgs);
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

export class CharacterAIState extends AIState<Character> {
}

/**
 * 待机状态节点
 */
export class IdleState extends CharacterAIState {

    onEnter(): void {
        let animator = this.character.getCharaterComponent(CharacterAnimator);
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
        let target: Character = this.aiController.getVariable(VariableNames.target);
        if (target == null || target.isDeath) {
            target = CampManager.instance.searchNearlyEnemy(this.character);
            this.aiController.setVariable(VariableNames.target, target);
        }
        this.finish(target != null);
    }
}