import { Button, Component, Enum, _decorator } from "cc";
import { InstallType, playable } from "../core/Playable";
import { gameConfig } from "../gameConfig/GameConfigManager";

const { ccclass, property, requireComponent, menu, disallowMultiple } = _decorator;

@ccclass('RetryAction')
@requireComponent(Button)
@disallowMultiple
@menu("UI/RetryAction")
export class RetryAction extends Component {

    @property({ type: Enum(InstallType) })
    readonly installType: InstallType = InstallType.Induce;

    onLoad(): void {
        let button = this.getComponent(Button);
        button.node.on(Button.EventType.CLICK, this.onButtonClicked, this);
    }

    protected onButtonClicked(): void {
        const retryCount = gameConfig.playAgain ?? 0;
        if (playable.retryCount < retryCount)
            playable.retryGame();
        else
            playable.install(this.installType);
    }
}