import { error, JsonAsset } from "cc";
import { Component, director, game, Scene, SceneAsset, _decorator } from "cc";

const { ccclass, property } = _decorator;
@ccclass('Main')
export class Main extends Component {
    public static readonly gameSceneName = "gameScene";
    @property
    readonly audioPath: string = "common/audio/";
    @property(JsonAsset)
    readonly gameConfig: JsonAsset = null;
    @property(JsonAsset)
    readonly langConfig: JsonAsset = null;

    public static onLoadedGameScene: (audioPath: string, gameConfig: JsonAsset, langConfig: JsonAsset) => void;

    async onLoad() {
        game.addPersistRootNode(this.node);
        director.preloadScene(Main.gameSceneName, this.onLoadedScene.bind(this));
    }

    private onLoadedScene(err: null | Error, scene?: SceneAsset): void {
        if (err) error(err);
        if (Main.onLoadedGameScene) Main.onLoadedGameScene(this.audioPath, this.gameConfig, this.langConfig);
    }

    public static async reloadGameScene(): Promise<Scene> {
        return new Promise<Scene>(resolve => director.loadScene(Main.gameSceneName, (error, scene) => resolve(scene)));
    }
}