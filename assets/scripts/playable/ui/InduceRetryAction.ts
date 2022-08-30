import { Label, _decorator } from "cc";
import { InstallType, playable } from "../core/Playable";
import GameConfigManager from "../gameConfig/GameConfigManager";
import { InduceAction } from "./InduceAction";

const { ccclass, property, menu } = _decorator;
@ccclass('InduceRetryAction')
@menu("UI/InduceRetryAction")
export class InduceRetryAction extends InduceAction {

    onEnable(): void {
        super.onEnable();
        const retryCount = GameConfigManager.configValue.playAgain;
        if (retryCount != -1 && playable.retryCount >= retryCount && mvPlayable?.disable_induce_click) {
            let label = this.getComponentInChildren(Label);
            if (label != null && !String.isEmptyOrNull(this.induceKeyText)) {
                label.string = this.induceKeyText;
                label.updateStyle();
            }
        }
    }

    protected onButtonClicked(): void {
        const retryCount = GameConfigManager.configValue.playAgain;
        if (playable.retryCount < retryCount)
            playable.retryGame();
        else {
            playable.install(mvPlayable?.disable_induce_click && String.isEmptyOrNull(this.induceKeyText) ? InstallType.None : InstallType.Induce);
        }
    }
}