import { AIState } from "./AIState";

interface StateGraphNode {
    successed: AIState;
    failed: AIState;
    others: AIState[];
}

/**
 * AI状态图，此图包含所有AI状态的跳转，相当于一张无向图。
 */
export default class AIStateGraph {
    private stateMap = new Map<AIState, StateGraphNode>();
    #defaultState: AIState;
    public get defaultState() { return this.#defaultState; }

    /**
     * 添加一个AI图节点，每个节点都有一个成功或者失败输出
     * @param state 节点包含的AI状态
     * @param successed 当节点AI状态执行成功时，转到此AI状态
     * @param failed 当节点AI状态执行失败时，转到此AI状态
     * @param others 其它自定义节点，通过index来索引
     */
    public addNode(state: AIState, successed?: AIState, failed?: AIState, others?: AIState[]): void {
        this.stateMap.set(state, { successed, failed, others });
    }

    /**
     * 迭代所有状态
     * @returns 返回迭代器
     */
    public iterableAIStates(): IterableIterator<AIState> {
        return this.stateMap.keys();
    }

    /**
     * 设置默认状态，这是必须设置的，并且此状态必须调用AddNode添到图中去。
     * @param state 默认启动的状态
     */
    public setDefaultState(state: AIState): void {
        this.#defaultState = state;
    }

    /**
     * 获得状态的成功分支
     * @param state 节点状态
     * @returns 成功分支状态
     */
    public getNodeSuccessed(state: AIState): AIState {
        let graph = this.stateMap.get(state);
        return graph.successed;
    }

    /**
     * 获得状态的失败分支
     * @param state 节点状态
     * @returns 失败分支状态
     */
    public getNodeFailed(state: AIState): AIState {
        let graph = this.stateMap.get(state);
        return graph.failed;
    }

    /**
     * 获得节点结果的自定义分支
     * @param state 节点状态
     * @param index 其它节点的索引
     * @returns 其它分支状态
     */
    public getNodeOther(state: AIState, index: number): AIState {
        let graph = this.stateMap.get(state);
        if (graph.others == null) return null;
        return graph.others[index];
    }

    /**
     * 获得节点的结果分支
     * @param state 节点的状态
     * @param result 是否成功
     * @returns 返回分支状态
     */
    public getNodeResult(state: AIState, result: boolean | number): AIState {
        if (typeof result === "number") return this.getNodeOther(state, result);
        return result ? this.getNodeSuccessed(state) : this.getNodeFailed(state);
    }
}