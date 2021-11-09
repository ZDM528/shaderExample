import { Component, _decorator } from "cc";

interface TimerData {
    delayTime?: number;
    callback: Function;
    target?: any;
    args?: any[];
}

const { ccclass } = _decorator;
@ccclass('Timer')
export default class Timer extends Component {
    private readonly timerList: TimerData[] = [];
    private readonly timerListTemp: TimerData[] = [];
    private readonly timerUpdateList: TimerData[] = [];
    public timeScale = 1;

    public onUpdate(callback: Function, thisArgs?: any): void {
        this.timerUpdateList.push({ callback, target: thisArgs });
    }

    public offUpdate(callback: Function, thisArgs?: any): void {
        let index = this.timerUpdateList.findIndex(x => x.callback == callback && x.target == thisArgs);
        if (index != -1)
            this.timerUpdateList.removeAt(index);
    }

    public on(delayTime: number, callback: Function, thisArgs?: any, ...args: any[]): void {
        this.timerList.push({ delayTime, callback, target: thisArgs, args });
    }

    public off(callback: Function, thisArgs?: any): void {
        let index = this.timerList.findIndex(x => x.callback == callback && x.target == thisArgs);
        if (index != -1)
            this.timerList.removeAt(index);
    }

    public offAll(): void {
        this.timerList.length = 0;
        this.timerUpdateList.length = 0;
    }

    update(deltaTime: number): void {
        if (!this.node.isValid || !this.node.active) return;
        for (let i = this.timerUpdateList.length - 1; i >= 0; i--) {
            let data = this.timerUpdateList[i];
            data.callback.call(data.target);
        }

        for (let i = this.timerList.length - 1; i >= 0; i--) {
            let timer = this.timerList[i];
            timer.delayTime -= deltaTime * this.timeScale;
            if (timer.delayTime > 0) continue;
            this.timerListTemp.push(timer);
            this.timerList.removeAt(i);
        }

        for (let data of this.timerListTemp)
            data.callback.call(data.target, ...data.args);
        this.timerListTemp.length = 0;
    }
}