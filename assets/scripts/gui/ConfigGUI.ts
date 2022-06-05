import { Director, director, sys } from "cc";
import { EDITOR } from "cc/env";
import GameConfigManager from "../playable/gameConfig/GameConfigManager";

type ItemType = "switch" | "checkbox" | "radio" | "select" | "array" | "color-picker" | "slider" | "input";

interface ConfigItem {
    pl_key?: string;
    value: any;
    min?: number;
    max?: number;
    interval?: number;
    type?: ItemType;
    options?: string[];
    items?: Array<ConfigItem>;
    scene?: string;
}

interface GameConfigJson {
    playAgain: number;
    gameConfig: { [x: string]: ConfigItem };
}

export default class ConfigGUI {
    public static createConfigGUI(): ConfigGUI {
        if (sys.isMobile) return;
        return new ConfigGUI();
    }

    private constructor() {
        GameConfigManager.onInitEvent.addEvent(this.createWidgets, this);
    }

    private createWidgets(): void {
        const configJson: GameConfigJson = <GameConfigJson><unknown>GameConfigManager.configJson;
        const Guify = globalThis.guify;
        // Create the GUI
        let gui: Guify = new Guify({ align: 'right', opacity: 0.95, open: true });

        gui.Register({ type: "title", label: "GameConfig" });
        gui.Register({
            type: "button", label: "Save", action: function () {
                // console.log("save gameConfig", EDITOR, fs);
            }
        });

        let folderList: string[] = [];
        const keys = Object.keys(configJson.gameConfig);
        for (let key of keys) {
            let item = configJson.gameConfig[key];
            if (item.scene && !folderList.contains(item.scene))
                folderList.push(item.scene);
        }

        for (let folder of folderList)
            gui.Register({ type: "folder", label: folder, open: true });

        for (let key of keys) {
            let item = configJson.gameConfig[key];
            if (item.items != null) {
                for (let item2 of item.items)
                    this.addProperty(gui, item.scene, item2.pl_key, item2);
            } else {
                this.addProperty(gui, item.scene, key, item);
            }
        }
    }

    private addProperty(gui: Guify, folder: string, key: string, item: ConfigItem): void {
        if (item.type === "slider") {
            gui.Register({ type: "range", label: key, min: item.min, max: item.max, step: item.interval, folder, object: item, property: "value" });
        } else if (item.type === "input") {
            gui.Register({ type: "text", label: key, listenMode: "change", folder, object: item, property: "value" });
        } else if (item.type === "switch") {
            gui.Register({ type: "checkbox", label: key, folder, object: item, property: "value" });
        } else if (item.type === "radio") {
            gui.Register({ type: "select", label: key, options: item.options, folder, object: item, property: "value" });
        } else if (item.type === "color-picker") {
            gui.Register({ type: "color", label: key, format: "hex", folder, object: item, property: "value" });
        } else if (item.type === "checkbox") {
            this.createMultiCheckbox(gui, folder, key, item);
        }
    }

    private createMultiCheckbox(gui: Guify, folder: string, key: string, item: ConfigItem): void {
        gui.Register({ type: "folder", label: key, folder, open: true });
        let items: string[] = item.value;
        for (let op of item.options) {
            gui.Register({
                type: "checkbox", label: op, folder: key, initial: items.contains(op), onChange: (result) => {
                    console.log("result", op, result);
                    if (result) {
                        if (!items.contains(op))
                            items.push(op);
                    } else if (items.contains(op)) {
                        items.remove(op);
                    }
                }
            });
        }
    }
}

if (!EDITOR) director.on(Director.EVENT_INIT, ConfigGUI.createConfigGUI);