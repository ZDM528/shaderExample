export default class ConfigGUI {
    constructor() {
        // Create the GUI
        this.gui = new guify({ align: 'right', opacity: 0.95, width: "400", open: false });
    }
    static createConfigGUI(configJson, storageKey, logicConfig) {
        if (cc.sys.isMobile)
            return;
        let configGui = new ConfigGUI();
        configGui.createGameConfig(configJson, storageKey);
        if (logicConfig != null)
            configGui.createLogicConfig(logicConfig, logicConfig.getPropertyDescriptor?.(), logicConfig.getStorageKey?.());
        return configGui;
    }
    createGameConfig(configJson, storageKey) {
        if (configJson == null || storageKey == null)
            return;
        this.gui.Register({ type: "title", label: "GameConfig" });
        this.gui.Register({
            type: "button", label: "Save", action: function () {
                cc.sys.localStorage.setItem(storageKey, JSON.stringify(configJson));
            }
        });
        let folderList = [];
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
            }
            else {
                ConfigGUI.addProperty(this.gui, item.scene, item);
            }
        }
    }
    createLogicConfig(logicConfig, logicConfigDesc, logicConfigKey) {
        if (logicConfig == null || logicConfigDesc || logicConfigKey)
            return;
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
            ConfigGUI.addProperty(this.gui, folder, desc, logicConfig, key);
        }
    }
    getValueType(value) {
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
    static addProperty(gui, folder, desc, target, property) {
        if (target == null)
            target = desc;
        if (property == null)
            property = "value";
        if (desc.type === "slider") {
            gui.Register({ type: "range", label: desc.title, min: desc.min, max: desc.max, step: desc.interval, folder, object: target, property });
        }
        else if (desc.type === "interval") {
            gui.Register({ type: "interval", label: desc.title, min: desc.min, max: desc.max, step: desc.interval, folder, object: target, property });
        }
        else if (desc.type === "input") {
            gui.Register({ type: "text", label: desc.title, listenMode: "change", folder, object: target, property });
        }
        else if (desc.type === "switch") {
            gui.Register({ type: "checkbox", label: desc.title, folder, object: target, property });
        }
        else if (desc.type === "radio") {
            gui.Register({ type: "select", label: desc.title, options: desc.options, folder, object: target, property });
        }
        else if (desc.type === "color-picker") {
            gui.Register({ type: "color", label: desc.title, format: "hex", folder, object: target, property });
        }
        else if (desc.type === "checkbox") {
            ConfigGUI.createMultiCheckbox(gui, folder, desc, target);
        }
        else {
            console.log("can not serialze ", folder, desc);
        }
    }
    static createMultiCheckbox(gui, folder, desc, target) {
        gui.Register({ type: "folder", label: desc.title, folder, open: true });
        let items = target.value;
        let index;
        for (let op of desc.options) {
            gui.Register({
                type: "checkbox", label: op, folder: desc.title, initial: items.indexOf(op) != -1, onChange: (result) => {
                    if (result) {
                        if (items.indexOf(op) == -1)
                            items.push(op);
                    }
                    else if ((index = items.indexOf(op)) != -1) {
                        items.splice(index, 1);
                    }
                }
            });
        }
    }
}
