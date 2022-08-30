import { Component, _decorator } from "cc";
import LocalizeManager from "./LocalizeManager";

interface Label {
    string: string;
}

const { property } = _decorator;
export default abstract class AbstractLocalizeLabel extends Component {
    public abstract getAbstractLabel(): Label;

    private abstractLabel: Label;
    @property // 这里为了保证节点被克隆后，还能保留原始key的信息。
    protected _localizeKey: string = "";
    @property
    public get localizeKey() { return this._localizeKey; }
    public set localizeKey(v) { if (this._localizeKey == v) return; this._localizeKey = v; }
    protected text: string;
    protected values: any[] = null;

    public get string() { return this.abstractLabel.string; }
    public set string(text: string) {
        this.text = text;
        this.values = null;
        if (this.abstractLabel != null) this.onSetText(text);
    }

    public format(format: string, ...params: any[]): void {
        this.text = format;
        this.values = params;
        if (this.abstractLabel != null) this.onFormatText(format, this.values);
    }

    onLoad(): void {
        this.abstractLabel = this.getAbstractLabel();
        if (this.text == null)
            this.text = this.localizeKey;
        this.localizeKey = String.isEmptyOrNull(this.localizeKey) ? this.abstractLabel.string : this.localizeKey;
        LocalizeManager.onChangedLocalizeEvent.addEvent(this.onChangedLocalize, this);
        this.onChangedLocalize();
    }

    onDestroy(): void {
        LocalizeManager.onChangedLocalizeEvent.removeEvent(this.onChangedLocalize, this);
    }

    protected onChangedLocalize(): void {
        this.values != null ? this.onFormatText(this.text, this.values) : this.onSetText(this.text);
    }

    protected onSetText(text: string): void {
        this.onSetLabelText(this.getTranslateKey(text));
    }

    protected onFormatText(format: string, values: any[]): void {
        let formatTranslate = this.getTranslateKey(format);
        let valuesTranslate: any[] = [];
        for (let value of values) {
            if (typeof value == 'string') value = LocalizeManager.getCurLocalizeValue(value)?.value ?? value;
            valuesTranslate.push(value);
        }

        this.onSetLabelText(LocalizeManager.format(formatTranslate, ...valuesTranslate));
    }

    protected getTranslateKey(text: string): string {
        return LocalizeManager.getCurLocalizeValue(text)?.value ?? text;
    }

    protected onSetLabelText(text: string): void {
        this.abstractLabel.string = text;
    }
}