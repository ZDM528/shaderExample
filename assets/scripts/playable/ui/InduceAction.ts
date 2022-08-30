import { _decorator, Component } from "cc";
import { Button } from "cc";

const { ccclass, property, requireComponent, disallowMultiple } = _decorator;

@ccclass('InduceAction')
@requireComponent(Button)
@disallowMultiple
export abstract class InduceAction extends Component {
    @property
    readonly induceKeyText = "";

    onEnable(): void {
        let button = this.getComponent(Button);
        button.node.on(Button.EventType.CLICK, this.onButtonClicked, this);
    }
    
    onDisable(): void {
        let button = this.getComponent(Button);
        button.node.off(Button.EventType.CLICK, this.onButtonClicked, this);
    }

    protected abstract onButtonClicked(): void;
}