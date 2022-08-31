import { sys } from "cc";
import { DEV } from "cc/env";
import { EDITOR_WITHOUT_RUN } from "../extenstion/CocosExtenstion";
import GameConfigManager from "./GameConfigManager";

type ValueType = "switch" | "color-picker" | "slider" | "radio" | "input" | "interval" | "file";

interface LogicConfigPropertyDescriptor extends PropertyDescriptor {
    type?: ValueType;
    min?: number,
    max?: number,
    interval?: number,
    step?: number,
    title?: string;
}

interface LogicConfigDescriptorMap {
    [key: PropertyKey]: LogicConfigPropertyDescriptor;
}

type GetPropertyDescriptorType<T extends PropertyDescriptor> = T["get"] extends (...args: any) => infer R ? R : T["value"];
type DefineType<T extends LogicConfigDescriptorMap> = { [k in keyof T]: GetPropertyDescriptorType<T[k]> };

export default class LogicConfigManager {
    public static create<T extends LogicConfigDescriptorMap>(prototypies: T): DefineType<T> {
        for (let key of Object.keys(prototypies)) {
            let value = prototypies[key];
            value.interval = value.interval ?? value.step;
            value.writable = true;
            value.enumerable = true;
            value.configurable = true;
        }
        let result = Object.defineProperties({}, prototypies) as any;
        if (DEV && !EDITOR_WITHOUT_RUN) {
            globalThis.logicConfig = result;
            globalThis.logicConfig.getPropertyDescriptor = function () { return prototypies; }
            globalThis.logicConfig.getStorageKey = function () { return `${globalThis.CC_PROJECTNAME}#logicConfig`; }
            GameConfigManager.onInitEvent.addEvent(()=> LogicConfigManager.mergeStorageData(result));
        }
        return result;
    }

    private static mergeStorageData(result: Object): void {
        let key = globalThis.logicConfig.getStorageKey();
        let storageConfig = sys.localStorage.getItem(key);
        if (storageConfig != null) {
            try {
                let newData = JSON.parse(storageConfig);
                result = Object.assign(result, newData);
            } catch (error) {
                console.warn(error);
            }
        }
    }
}