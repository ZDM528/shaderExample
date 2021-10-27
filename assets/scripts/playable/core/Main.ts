import { Component, director, game, Scene, SceneAsset, _decorator } from "cc";

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

    public static async reloadGameScene(): Promise<Scene> {
        return new Promise<Scene>(resolve => director.loadScene(Main.gameSceneName, (error, scene) => resolve(scene)));
    }
}