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
    protected localizeKey: string = "";
    protected values: any[] = null;

    public get string() { return this.abstractLabel.string; }

    public set string(text: string) {
        if (this.localizeKey == text) return;
        this.localizeKey = text;
        this.values = null;
        if (this.abstractLabel != null) this.onSetText();
    }

    public format(format: string, ...params: any[]): void {
        if (this.localizeKey != format) this.localizeKey = format;
        this.values = params;
        if (this.abstractLabel != null) this.onFormatText(this.values);
    }

    onLoad(): void {
        this.abstractLabel = this.getAbstractLabel();
        this.localizeKey = String.isEmptyOrNull(this.localizeKey) ? this.abstractLabel.string : this.localizeKey;
        LocalizeManager.onChangedLocalizeEvent.AddEvent(this.onChangedLocalize, this);
        this.onChangedLocalize();
    }

    onDestroy(): void {
        LocalizeManager.onChangedLocalizeEvent.RemoveEvent(this.onChangedLocalize, this);
    }

    protected onChangedLocalize(): void {
        this.values != null ? this.onFormatText(this.values) : this.onSetText();
    }

    protected onSetText(): void {
        this.onSetLabelText(this.getTranslateKey());
    }

    protected onFormatText(values: any[]): void {
        let formatTranslate = this.getTranslateKey();
        let valuesTranslate: any[] = [];
        for (let value of values) {
            if (typeof value == 'string') value = LocalizeManager.getCurLocalizeValue(value)?.value ?? value;
            valuesTranslate.push(value);
        }

        this.onSetLabelText(LocalizeManager.format(formatTranslate, ...valuesTranslate));
    }

    protected getTranslateKey(): string {
        return LocalizeManager.getCurLocalizeValue(this.localizeKey)?.value ?? this.localizeKey;
    }

    protected onSetLabelText(text: string): void {
        this.abstractLabel.string = text;
    }
}