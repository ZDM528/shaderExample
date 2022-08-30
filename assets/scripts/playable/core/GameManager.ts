import { Camera, Canvas, Component, instantiate, Node, Prefab, Vec3, _decorator } from "cc";
import { BUILD } from "cc/env";
import { View } from "../ui/View";
import ActionEvent from "../utility/ActionEvent";
import { playable } from "./Playable";
import { ISystem } from "./RegisterSystem";

const { ccclass, property } = _decorator;
@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager;
    public static get instance() { return GameManager._instance; }
    private static readonly systemList: ISystem[] = [];

    @property(Camera)
    mainCamera: Camera = null;
    @property(Canvas)
    readonly canvas: Canvas = null;
    @property(Node)
    readonly uiRoot: Node = null;
    @property(Prefab)
    readonly gameViewPrefab: Prefab = null;
    @property(Prefab)
    readonly endingViewPrefab: Prefab = null;
    @property({ tooltip: "重玩援关闭埋点记录" })
    readonly disableRetryActions: boolean = false;
    @property({ group: "Debug", tooltip: "关闭诱导，只在非BUILD的时候有效。" })
    readonly disableInduce: boolean = false;

    private _isLoadedComplete: boolean = false;
    /** 加载完毕标识，加脚完毕会调用gameReady */
    public get isLoadedComplete() { return this._isLoadedComplete; }
    /** 加载完毕事件通知 */
    public readonly onLoadedCompleteEvent = new ActionEvent();
    // /** 加载事件处理，如果是一个场景对象，当场景被加载时，会调用onLoad，可以onLoad里添加需要在gameReady前就处理的事件。如果@param isLoadedComplete 为true时，此功能不会被触发。 */
    // public readonly loadProgressEvent: Array<() => Promise<void>> = [];
    /** 开始游戏事件 */
    public readonly startPlayingEvent = new ActionEvent();
    
    private _gameView: View;
    public get gameView() { return this._gameView; }
    private _endingView: View;
    public get endingView() { return this._endingView; }

    __preload(): void {
        GameManager._instance = this;
        if (!BUILD) {
            // @ts-ignore
            if (this.disableInduce) { globalThis.MW_CONFIG = { disable_yd_click: true }; }
        }

        Camera.mainCamera = this.mainCamera;
        Camera.canvasCamera = this.canvas?.cameraComponent;
        this.initialize();
    }

    public initialize(): void {
        this.createGameView();

        this._endingView = this.createView(this.endingViewPrefab);
        this.endingView.node.setParent(this.uiRoot, false);
        this.endingView.node.active = false;

        // for (let loadFunc of this.loadProgressEvent) {
        //     let time = performance.now();
        //     await loadFunc();
        //     console.logColor(`Load ${loadFunc.name} use ${performance.now() - time}ms`);
        // }

        this._isLoadedComplete = true;
        this.onLoadedCompleteEvent.dispatchActionAndComplete();
        if (this.disableRetryActions)
            playable.retryEvent.addEventOnce(() => playable.enableAction = false);
    }

    public createGameView(): void {
        this._gameView = this.createView(this.gameViewPrefab);
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
        // this._endingView = await this.createView<View>(this.endingViewPath);
        // this.endingView.node.setParent(this.uiRoot, false);
        await this.endingView.intialize(...params);
        this.endingView.node.active = true;
    }

    public hideEndingView(): void {
        this.endingView.node.active = false;
    }

    public getEndingView<T extends View>(): T {
        return this.endingView as T;
    }

    public activeCanvas(active: boolean): void {
        this.canvas.node.active = active;
    }

    /**
     * 将一个UI节点坐标转为3D场景坐标，比喻做一个血条挂角色头顶上。
     * @param worldPosition 角色世界坐标
     * @param uiParent UI父节点
     * @param out 输出UI坐标
     * @returns 输出UI坐标
     */
    public convertToUINode(worldPosition: Vec3, uiParent: Node, out?: Vec3): Vec3 {
        return this.mainCamera.convertToUINode(worldPosition, uiParent, out);
    }

    public createView(prefab: Prefab): View {
        let viewNode = instantiate(prefab);
        return viewNode.getComponent(View);
    }

    public static registerSystem(system: ISystem): void {
        GameManager.systemList.push(system);
    }
}