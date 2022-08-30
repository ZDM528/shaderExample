import { Button, Component, Enum, _decorator } from "cc";
import { InstallType, playable } from "../core/Playable";
import GameConfigManager from "../gameConfig/GameConfigManager";

const { ccclass, property, requireComponent, menu, disallowMultiple } = _decorator;

enum AutoHideType {
    None,
    Hide,
    DisableInduceHide,
}

@ccclass('RetryAction')
@requireComponent(Button)
@disallowMultiple
@menu("UI/RetryAction")
export class RetryAction extends Component {
    @property({ type: Enum(AutoHideType), tooltip: "当重玩次数为0，自动隐藏本按钮。" })
    readonly hideType: AutoHideType = AutoHideType.None;

    onEnable(): void {
        let button = this.getComponent(Button);
        button.node.on(Button.EventType.CLICK, this.onButtonClick, this);
        if (playable.retryCount >= GameConfigManager.configValue.playAgain) {
            switch (this.hideType) {
                case AutoHideType.Hide:
                    this.node.active = false;
                    break;
                case AutoHideType.DisableInduceHide:
                    this.node.active = playable.isInduce;
                    break;
            }
        }
    }

    onDisable(): void {
        let button = this.getComponent(Button);
        button.node.off(Button.EventType.CLICK, this.onButtonClick, this);
    }

    private onButtonClick(): void {
        if (playable.retryCount < GameConfigManager.configValue.playAgain)
            playable.retryGame();
        else
            playable.install(InstallType.Induce);
    }
}