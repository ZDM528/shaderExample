import { Button } from "cc";
import { Component } from "cc";
import { Label, _decorator } from "cc";
import { InstallType, playable } from "../core/Playable";
import { gameConfig } from "../gameConfig/GameConfigManager";
import { mvPlayable } from "../MVPlatform/MVPlayable";

const { ccclass, property, requireComponent, menu, disallowMultiple } = _decorator;

@ccclass('InduceRetryAction')
@requireComponent(Button)
@disallowMultiple
@menu("UI/InduceRetryAction")
export class InduceRetryAction extends Component {
    @property
    readonly induceKeyText = "";

    onLoad(): void {
        let button = this.getComponent(Button);
        button.node.on(Button.EventType.CLICK, this.onButtonClicked, this);
    }

    onEnable(): void {
        let label = this.getComponentInChildren(Label);
        if (label == null) return;
        const retryCount = gameConfig.playAgain ?? 0;
        if (playable.retryCount >= retryCount && mvPlayable?.disable_induce_click)
            label.string = this.induceKeyText;
    }

    protected onButtonClicked(): void {
        const retryCount = gameConfig.playAgain ?? 0;
        if (playable.retryCount < retryCount)
            playable.retryGame();
        else
            playable.install(InstallType.Induce);
    }
}