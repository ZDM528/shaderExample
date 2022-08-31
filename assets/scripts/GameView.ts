import { Label, MeshRenderer } from "cc";
import { _decorator, Node } from "cc";
import { Ball } from "./Ball";
import { View } from "./playable/ui/View";

const { ccclass, property } = _decorator;

@ccclass('GameView')
export class GameView extends View {

    @property(Label)
    public readonly curProgressText: Label = null;

    curProgerss: number = 0;

    start() {
        // let ballMesh = Ball.instance.node.getComponent(MeshRenderer);
        // let ballMtl = ballMesh.material;
        // this.schedule(() => {
        //     this.curProgerss += 0.004;
        //     if (this.curProgerss >= 1) {
        //         this.curProgerss = 0;
        //     }
        //     this.curProgerss = Math.min(this.curProgerss, 1);
        //     ballMtl.setProperty("waterY", this.curProgerss);
        //     this.curProgressText.string = `当前进度为 ${(this.curProgerss * 100).toFixed(2)} %`
        // }, 0.003);


    }
}