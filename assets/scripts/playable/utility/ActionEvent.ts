
type Never = { readonly s: unique symbol }
type ActionArgs<P1, P2, P3, P4, P5, P6, P7, P8, P9> =
    P1 extends Never ? [] :
    P2 extends Never ? [P1] :
    P3 extends Never ? [P1, P2] :
    P4 extends Never ? [P1, P2, P3] :
    P5 extends Never ? [P1, P2, P3, P4] :
    P6 extends Never ? [P1, P2, P3, P4, P5] :
    P7 extends Never ? [P1, P2, P3, P4, P5, P6] :
    P8 extends Never ? [P1, P2, P3, P4, P5, P6, P7] :
    P9 extends Never ? [P1, P2, P3, P4, P5, P6, P7, P8] :
    [P1, P2, P3, P4, P5, P6, P7, P8, P9];

export type Action<P1 = Never, P2 = Never, P3 = Never, P4 = Never, P5 = Never, P6 = Never, P7 = Never, P8 = Never, P9 = Never> = {
    (...args: ActionArgs<P1, P2, P3, P4, P5, P6, P7, P8, P9>): void;
}

export type Func<R = void, P1 = Never, P2 = Never, P3 = Never, P4 = Never, P5 = Never, P6 = Never, P7 = Never, P8 = Never, P9 = Never> = {
    (...args: ActionArgs<P1, P2, P3, P4, P5, P6, P7, P8, P9>): R;
}

interface ActionData<P1, P2, P3, P4, P5, P6, P7, P8, P9> {
    event: Action<P1, P2, P3, P4, P5, P6, P7, P8, P9>;
    target?: any;
    once?: boolean;
}

/**
 * 这是一个事件派发器，提供了Action的泛型推导功能。
 * @example 
 * let event = new ActionEvent<number, string>();
 * let action1:Action<number, string>;
 * // 添加事件
 * event.addEvent(action1);
 * // 删除事件
 * event.removeEvent(action1);
 * // 派发事件
 * event.dispatchAction(1, "t");
 * @author hubluesky
 * @see Action
 * @todo If have any questions, just call me.
 */
export default class ActionEvent<P1 = Never, P2 = Never, P3 = Never, P4 = Never, P5 = Never, P6 = Never, P7 = Never, P8 = Never, P9 = Never> {
    protected completeArgs: any[];
    protected eventList: ActionData<P1, P2, P3, P4, P5, P6, P7, P8, P9>[] = [];
    public get isEmpty() { return this.eventList.length == 0; }
    public get length() { return this.eventList.length; }

    public addEvent(event: Action<P1, P2, P3, P4, P5, P6, P7, P8, P9>, target?: any): void {
        this.eventList.push({ event, target });
        if (this.completeArgs != null)
            event.call(target, ...this.completeArgs);
    }

    public addEventOnce(event: Action<P1, P2, P3, P4, P5, P6, P7, P8, P9>, target?: any): void {
        if (this.completeArgs != null)
            event.call(target, ...this.completeArgs);
        else
            this.eventList.push({ event, target, once: true });
    }

    public contains(event: Action<P1, P2, P3, P4, P5, P6, P7, P8, P9>, target?: any): boolean {
        return this.eventList.find(x => x.event == event && x.target == target) != null;
    }

    public removeEvent(event: Action<P1, P2, P3, P4, P5, P6, P7, P8, P9>, target?: any): void {
        let index = this.eventList.findIndex(x => x.event == event && x.target == target);
        if (index != -1) this.eventList.splice(index, 1);
    }

    public clearEvents(): void {
        this.eventList.length = 0;
    }

    public dispatchAction(...args: ActionArgs<P1, P2, P3, P4, P5, P6, P7, P8, P9>): void {
        for (let i = this.eventList.length - 1; i >= 0; i--) {
            let action = this.eventList[i];
            action.event.call(action.target, ...args);
            if (action.once) this.eventList.splice(i, 1);
        }
    }

    public dispatchActionAndComplete(...args: ActionArgs<P1, P2, P3, P4, P5, P6, P7, P8, P9>): void {
        this.completeArgs = args;
        this.dispatchAction(...args);
    }
}