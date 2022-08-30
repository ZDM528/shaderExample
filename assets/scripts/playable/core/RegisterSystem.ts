import { log } from "cc";
import { GameManager } from "./GameManager";

export interface ISystem {
    initialize(): void;
}

export function RegisterSystem(): Function {
    return function (target: Function) {
        // if (!Database.isPrototypeOf(target))
        //     throw new Error(`Register database can only be used on a Database class.`);
        // DatabaseManager.RegisterType(target, assetName);
        log("RegisterSystem ", target);

        // if (Object.instanceOf(target, "initialize"))
        //     GameManager.registerSystem(target);
    }
}