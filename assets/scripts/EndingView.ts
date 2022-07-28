import { _decorator, Node } from "cc";
import { View } from "./playable/ui/View";

const { ccclass, property } = _decorator;

@ccclass('EndingView')
export class EndingView extends View {

    public intialize(result: boolean = true): void {
    }
}