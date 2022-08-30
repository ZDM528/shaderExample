import { Label, _decorator } from "cc";
import { Action } from "../utility/ActionEvent";
import AbstractLocalizeLabel from "./AbstractLocalizeLabel";
import LocalizeManager from "./LocalizeManager";

const { ccclass, requireComponent, menu } = _decorator;
@ccclass
@requireComponent(Label)
@menu("Localize/LocalizeLabel")
export default class LocalizeLabel extends AbstractLocalizeLabel {
    private label: Label;
    private setLabelString: Action<string>;

    __preload() {
        this.label = this.getComponent(Label);
        this.setLabelString = (value: string) => {
            if (value) {
                value += '';
            } else {
                value = '';
            }
            if (this.label["_string"] === value) {
                return;
            }

            this.label["_string"] = value;
            this.label.updateRenderData();
        }
        Object.defineProperties(this.label, {
            "string": {
                get: () => { return this.label["_string"]; },
                set: (value) => { this.string = value; }
            },
            "localizeKey": {
                get: () => { return this.localizeKey; },
            }
        });
        this.label.format = (format: string, ...params: any[]): void => {
            this.format(format, ...params);
        }
        this.label.updateStyle = (key?: string): void => {
            if (key != null) this.localizeKey = key;
            LocalizeManager.updateStyle(this.label, this.localizeKey);
        }
    }

    protected onSetLabelText(text: string): void {
        this.setLabelString(text);
    }

    protected onChangedLocalize(): void {
        LocalizeManager.updateStyle(this.label, this.localizeKey);
        super.onChangedLocalize();
    }

    public getAbstractLabel(): Label {
        return this.label;
    }
}