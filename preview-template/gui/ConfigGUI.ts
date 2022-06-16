
declare namespace cc {
    var sys: any;
}

type ItemType = "switch" | "checkbox" | "radio" | "select" | "array" | "color-picker" | "slider" | "input" | "interval";

interface ConfigItem {
    pl_key?: string;
    title: string;
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

type ValueType = "switch" | "color-picker" | "slider" | "radio" | "input" | "interval" | "file";

interface LogicConfigPropertyDescriptor extends PropertyDescriptor {
    title?: string;
    type?: ValueType;
    min?: number,
    max?: number,
    interval?: number,
}

interface LogicConfigDescriptorMap {
    [key: string]: LogicConfigPropertyDescriptor;
}

export default class ConfigGUI {
    private gui: Guify;

    public static createConfigGUI(configJson: GameConfigJson, storageKey: string, logicConfig: Object, logicConfigDesc: LogicConfigDescriptorMap, logicConfigKey: string): ConfigGUI {
        if (cc.sys.isMobile) return;
        let configGui = new ConfigGUI();
        configGui.createGameConfig(configJson, storageKey);
        configGui.createLogicConfig(logicConfig, logicConfigDesc, logicConfigKey);
        return configGui;
    }

    private constructor() {
        // Create the GUI
        this.gui = new guify({ align: 'right', opacity: 0.95, width: "400", open: false });
    }

    private createGameConfig(configJson: GameConfigJson, storageKey: string): void {
        this.gui.Register({ type: "title", label: "GameConfig" });
        this.gui.Register({
            type: "button", label: "Save", action: function () {
                cc.sys.localStorage.setItem(storageKey, JSON.stringify(configJson));
            }
        });

        let folderList: string[] = [];
        const keys = Object.keys(configJson.gameConfig);
        for (let key of keys) {
            let item = configJson.gameConfig[key];
            if (item.scene && folderList.indexOf(item.scene) == -1)
                folderList.push(item.scene);
        }

        for (let folder of folderList)
            this.gui.Register({ type: "folder", label: folder, open: true });

        for (let key of keys) {
            let item = configJson.gameConfig[key];
            if (item.items != null) {
                for (let item2 of item.items)
                    ConfigGUI.addProperty(this.gui, item.scene, item2);
            } else {
                ConfigGUI.addProperty(this.gui, item.scene, item);
            }
        }
    }

    private createLogicConfig(logicConfig: Object, logicConfigDesc: LogicConfigDescriptorMap, logicConfigKey: string): void {
        if (logicConfig == null) return;

        this.gui.Register({ type: "title", label: "LogicConfig" });
        this.gui.Register({
            type: "button", label: "Save", action: function () {
                cc.sys.localStorage.setItem(logicConfigKey, JSON.stringify(logicConfig));
            }
        });

        let folder = "logicConfig";
        this.gui.Register({ type: "folder", label: folder, open: true });

        const keys = Object.keys(logicConfigDesc);
        for (let key of keys) {
            let desc = logicConfigDesc[key];
            desc.type = desc.type ?? this.getValueType(logicConfig[key]);
            desc.title = desc.title ?? key;
            ConfigGUI.addProperty(this.gui, folder, desc as ConfigItem, logicConfig, key);
        }
    }

    private getValueType(value: any): ValueType {
        let type = typeof value;
        switch (type) {
            case "number":
                return "slider";
            case "boolean":
                return "switch";
            case "string":
                return "input";
        }
    }

    public static addProperty(gui: Guify, folder: string, desc: ConfigItem, target?: any, property?: string): void {
        if (target == null)
            target = desc;
        if (property == null)
            property = "value";
        if (desc.type === "slider") {
            gui.Register({ type: "range", label: desc.title, min: desc.min, max: desc.max, step: desc.interval, folder, object: target, property });
        } else if (desc.type === "interval") {
            gui.Register({ type: "interval", label: desc.title, min: desc.min, max: desc.max, step: desc.interval, folder, object: target, property });
        } else if (desc.type === "input") {
            gui.Register({ type: "text", label: desc.title, listenMode: "change", folder, object: target, property });
        } else if (desc.type === "switch") {
            gui.Register({ type: "checkbox", label: desc.title, folder, object: target, property });
        } else if (desc.type === "radio") {
            gui.Register({ type: "select", label: desc.title, options: desc.options, folder, object: target, property });
        } else if (desc.type === "color-picker") {
            gui.Register({ type: "color", label: desc.title, format: "hex", folder, object: target, property });
        } else if (desc.type === "checkbox") {
            ConfigGUI.createMultiCheckbox(gui, folder, desc, target);
        } else {
            console.log("can not serialze ", folder, desc);
        }
    }

    public static createMultiCheckbox(gui: Guify, folder: string, desc: ConfigItem, target?: any): void {
        gui.Register({ type: "folder", label: desc.title, folder, open: true });
        let items: string[] = target.value;
        let index: number;
        for (let op of desc.options) {
            gui.Register({
                type: "checkbox", label: op, folder: desc.title, initial: items.indexOf(op) != -1, onChange: (result) => {
                    if (result) {
                        if (items.indexOf(op) == -1)
                            items.push(op);
                    } else if ((index = items.indexOf(op)) != -1) {
                        items.splice(index, 1);
                    }
                }
            });
        }
    }
}