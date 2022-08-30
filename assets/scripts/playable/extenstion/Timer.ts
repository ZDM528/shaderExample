import { director, Director, System } from "cc";

abstract class EventBase {
    private args: any[];
    public isVaild: boolean = true;
    constructor(readonly callback: Function, readonly thisArgs?: any, ...args: any[]) {
        this.args = args;
    }

    public onUpdate(deltaTime: number): boolean { return true; }
    public onPostUpdate(deltaTime: number): boolean { return true; }

    public callFuction(): void {
        this.callback.call(this.thisArgs, ...this.args);
    }
}

type EventBaseCP = ConstructorParameters<typeof EventBase>;

class Once extends EventBase {
    private elapse: number = 0;
    constructor(readonly delayTime: number, ...args: EventBaseCP) {
        super(...args);
    }

    onUpdate(deltaTime: number): boolean {
        this.elapse += deltaTime;
        let isFinish = this.elapse >= this.delayTime;
        if (isFinish)
            this.callFuction();
        return !isFinish;
    }
}

class Loop extends EventBase {
    private elapse: number = 0;
    constructor(readonly interval: number, ...args: EventBaseCP) {
        super(...args);
    }

    public onUpdate(deltaTime: number): boolean {
        this.elapse += deltaTime;
        let isFinish = this.elapse >= this.interval;
        if (isFinish) {
            this.elapse -= this.interval;
            this.callFuction();
        }
        return true;
    }
}

class FrameOnce extends EventBase {
    public onUpdate(deltaTime: number): boolean {
        this.callFuction();
        return false;
    }
}

class FrameLoop extends EventBase {
    public onUpdate(deltaTime: number): boolean {
        this.callFuction();
        return true;
    }
}

class FrameLateLoop extends EventBase {
    public onPostUpdate(deltaTime: number): boolean {
        this.callFuction();
        return true;
    }
}

class FrameLate extends EventBase {
    public onPostUpdate(deltaTime: number): boolean {
        this.callFuction();
        return false;
    }
}

export default class Timer extends System {
    public static readonly ID = 'Timer';
    private static _instance: Timer;
    public static get instance() { return Timer._instance; }
    private readonly eventList: EventBase[] = [];
    public timeScale = 1;

    public once(delay: number, callback: Function, thisArgs?: any, ...args: any[]): void {
        this.eventList.push(new Once(delay, callback, thisArgs, ...args));
    }

    public loop(interval: number, callback: Function, thisArgs?: any, ...args: any[]): void {
        this.eventList.push(new Loop(interval, callback, thisArgs, ...args));
    }

    public frameOnce(callback: Function, thisArgs?: any, ...args: any[]): void {
        this.eventList.push(new FrameOnce(callback, thisArgs, ...args));
    }

    public frameLoop(callback: Function, thisArgs?: any, ...args: any[]): void {
        this.eventList.push(new FrameLoop(callback, thisArgs, ...args));
    }

    public frameLateLoop(callback: Function, thisArgs?: any, ...args: any[]): void {
        this.eventList.push(new FrameLateLoop(callback, thisArgs, ...args));
    }

    public callLater(callback: Function, thisArgs?: any, ...args: any[]): void {
        this.eventList.push(new FrameLate(callback, thisArgs, ...args));
    }

    public contains(callback: Function, thisArgs?: any): boolean {
        let index = this.eventList.findIndex(x => x.isVaild && x.callback == callback && x.thisArgs == thisArgs);
        return index != -1;
    }

    public containCount(callback: Function, thisArgs?: any): number {
        let count = 0;
        for (let i = this.eventList.length - 1; i >= 0; i--) {
            let event = this.eventList[i];
            if (event.isVaild && event.callback == callback && event.thisArgs == thisArgs)
                count++;
        }
        return count;
    }

    public remove(callback: Function, thisArgs?: any): boolean {
        let index = this.eventList.findIndex(x => x.isVaild && x.callback == callback && x.thisArgs == thisArgs);
        if (index != -1)
            this.eventList[index].isVaild = false;
        return index != -1;
    }

    public removeTargetFunctions(callback: Function, thisArgs?: any): void {
        for (let i = this.eventList.length - 1; i >= 0; i--) {
            let event = this.eventList[i];
            if (event.isVaild && event.callback == callback && event.thisArgs == thisArgs)
                this.eventList[i].isVaild = false;
        }
    }

    public removeTarget(thisArgs: any): void {
        for (let event of this.eventList) {
            if (event.isVaild && event.thisArgs == thisArgs)
                event.isVaild = false;
        }
    }

    public removeAll(): void {
        this.eventList.clear();
    }

    init(): void {
        Timer._instance = this;
    }

    update(deltaTime: number): void {
        this.updateEvents(deltaTime, "onUpdate");
    }

    postUpdate(deltaTime: number): void {
        this.updateEvents(deltaTime, "onPostUpdate");
    }

    private updateEvents<T extends EventBase, F extends ObjectFunctions<T>>(deltaTime: number, functionName: F): void {
        deltaTime *= this.timeScale;
        for (let i = this.eventList.length - 1; i >= 0; i--) {
            let event = this.eventList[i];
            if (!event.isVaild) this.eventList.removeAt(i);
        }

        for (let i = this.eventList.length - 1; i >= 0; i--) {
            let event = this.eventList[i];
            // @ts-ignore
            let result: boolean = event[functionName](deltaTime);
            if (event.isVaild)
                event.isVaild = result;
        }
    }
}

// director.on(Director.EVENT_INIT, () => {
//     console.log("Timer Director.EVENT_INIT", director.isPaused());
const timerSys = new Timer();
director.registerSystem(Timer.ID, timerSys, System.Priority.SCHEDULER);
// });
// console.log("Timer Director.on", director.isPaused());