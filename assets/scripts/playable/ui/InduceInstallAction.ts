import { Label, _decorator } from "cc";
import { InstallType, playable } from "../core/Playable";
import { InduceAction } from "./InduceAction";

const { ccclass, menu } = _decorator;

@ccclass('InduceInstallAction')
@menu("UI/InduceInstallAction")
export class InduceInstallAction extends InduceAction {

    onEnable(): void {
        super.onEnable();
        let label = this.getComponentInChildren(Label);
        if (label == null) return;

        if (globalThis.mvPlayable?.disable_induce_click)
            label.string = this.induceKeyText;
    }

    protected onButtonClicked(): void {
        let installType = globalThis.mvPlayable?.disable_induce_click ? InstallType.None : InstallType.Induce;
        playable.install(installType);
    }
}