import { _decorator, RichText } from "cc";
import AbstractLocalizeLabel from "./AbstractLocalizeLabel";

const { ccclass, requireComponent, menu } = _decorator;
@ccclass
@requireComponent(RichText)
@menu("Localize/LocalizeRichLabel")
export default class LocalizeRichLabel extends AbstractLocalizeLabel {
    public getAbstractLabel(): { string: string; } {
        return this.getComponent(RichText);
    }
}