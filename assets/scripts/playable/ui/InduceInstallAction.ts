import { Button, Component, Label, _decorator } from "cc";
import { InstallType, playable } from "../core/Playable";
import { mvPlayable } from "../MVPlatform/MVPlayable";

const { ccclass, property, requireComponent, menu,disallowMultiple } = _decorator;

@ccclass('InduceInstallAction')
@requireComponent(Button)
@disallowMultiple
@menu("UI/InduceInstallAction")
export class InduceInstallAction extends Component {
    @property
    readonly induceKeyText = "";

    onLoad(): void {
        let button = this.getComponent(Button);
        button.node.on(Button.EventType.CLICK, this.onButtonClicked, this);
    }

    onEnable(): void {
        let label = this.getComponentInChildren(Label);
        if (label == null) return;
        if (mvPlayable?.disable_induce_click)
            label.string = this.induceKeyText;
    }

    protected onButtonClicked(): void {
        let installType = mvPlayable?.disable_induce_click ? InstallType.None : InstallType.Induce;
        playable.install(installType);
    }
}