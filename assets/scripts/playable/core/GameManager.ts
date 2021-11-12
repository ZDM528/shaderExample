import { Canvas, Component, instantiate, Prefab, Node, resources, _decorator, CCString } from "cc";
import { View } from "../ui/View";
import ActionEvent from "../utility/ActionEvent";
import { ISystem } from "./RegisterSystem";

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager;
    public static get instance() { return GameManager._instance; }
    private static readonly systemList: ISystem[] = [];
    public static onLoadedCompleteEvent = new ActionEvent();
    private static _isLoadedComplete: boolean = false;
    public static get isLoadedComplete() { return GameManager._isLoadedComplete; }

    @property(Canvas)
    readonly canvas: Canvas = null;
    @property(Node)
    readonly uiRoot: Node = null;
    @property
    readonly gameViewPath: string = "prefabs/gameView";
    @property
    readonly endingViewPath: string = "prefabs/endingView";
    @property([CCString])
    readonly preloadAssets: string[] = [];
    @property([CCString])
    readonly preloadDirAssets: string[] = [];

    #gameView: View;
    public get gameView() { return this.#gameView; }
    #endingView: View;
    public get endingView() { return this.#endingView; }

    __preload(): void {
        GameManager._instance = this;
    }

    public async initialize(): Promise<void> {
        await new Promise<void>(resolve => resources.preload([this.endingViewPath, ...this.preloadAssets], () => resolve()));
        if (this.preloadDirAssets.length > 0)
            await new Promise<void>(resolve => resources.preload(this.preloadDirAssets, () => resolve()));
        await this.createGameView();
        GameManager._isLoadedComplete = true;
        GameManager.onLoadedCompleteEvent.DispatchAction();
    }

    public async createGameView(): Promise<void> {
        this.#gameView = await this.createView<View>(this.gameViewPath);
        this.gameView.node.setParent(this.uiRoot, false);
        return this.gameView.intialize();
    }

    public hideGameView(): void {
        this.gameView.node.active = false;
    }

    public getGameView<T extends View>(): T {
        return this.gameView as T;
    }

    public async createEndingView<T extends View>(...params: Parameters<T["intialize"]>): Promise<void> {
        this.#endingView = await this.createView<View>(this.endingViewPath);
        this.endingView.node.setParent(this.uiRoot, false);
        this.endingView.intialize(...params);
    }

    public hideEndingView(): void {
        this.endingView.node.active = false;
    }

    public getEndingView<T extends View>(): T {
        return this.endingView as T;
    }

    public async createView<T extends View>(path: string): Promise<View> {
        let prefab = await new Promise<Prefab>(resolve => resources.load(path, Prefab, (error, data) => resolve(data)));
        let viewNode = instantiate(prefab);
        return viewNode.getComponent(View);
    }

    public static registerSystem(system: ISystem): void {
        GameManager.systemList.push(system);
    }
}