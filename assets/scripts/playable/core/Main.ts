import { Component, director, game, SceneAsset, _decorator } from "cc";

const { ccclass } = _decorator;
@ccclass('Main')
export class Main extends Component {
    public static readonly gameSceneName = "gameScene";

    public static onLoadedGameScene: () => void;

    async onLoad() {
        game.addPersistRootNode(this.node);
        director.preloadScene(Main.gameSceneName, Main.onLoadedScene);
    }

    private static onLoadedScene(error: null | Error, scene?: SceneAsset): void {
        if (error) console.error(error);
        if (Main.onLoadedGameScene) Main.onLoadedGameScene();
    }

    public static reloadGameScene(): void {
        director.loadScene(Main.gameSceneName);
    }
}