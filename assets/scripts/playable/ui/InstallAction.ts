import { Button, CCInteger, Component, Enum, _decorator } from "cc";
import { InstallType, playable } from "../core/Playable";

const { ccclass, property, requireComponent, menu, disallowMultiple } = _decorator;

@ccclass('InstallAction')
@requireComponent(Button)
@disallowMultiple
@menu("UI/InstallAction")
export class InstallAction extends Component {

    @property({ type: Enum(InstallType) })
    readonly installType: InstallType = InstallType.None;
    @property({ type: CCInteger })
    installIndex: number = 0;

    onLoad(): void {
        let button = this.getComponent(Button);
        button.node.on(Button.EventType.CLICK, () => playable.install(this.installType, this.installIndex));
    }
}