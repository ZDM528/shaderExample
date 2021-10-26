import { Color, Label, LabelOutline, LabelShadow, sys, UIOpacity, Vec2 } from "cc";
import { TextStyleConfig } from "./TextStyleConfig";

export default class TextStyle {
    public updateStyle(label: Label, style: TextStyleConfig): void {
        if (style.font) label.fontFamily = style.font;
        if (style.fontSize) label.fontSize = style.fontSize;
        if (style.color) label.color = this.parseColor(style.color);
        label.isBold = style.bold;
        label.isItalic = style.italic;

        let opacity = label.getComponent(UIOpacity);
        if (style.alpha) {
            if (opacity == null)
                opacity = label.addComponent(UIOpacity);
            opacity.opacity = Math.trunc(style.alpha * 255);
        } else {
            if (opacity) opacity.destroy();
        }
        let outline = label.getComponent(LabelOutline);
        if (style.stroke > 0) {
            if (outline == null)
                outline = label.addComponent(LabelOutline);
            outline.width = style.stroke;
            if (style.strokeColor) outline.color = this.parseColor(style.strokeColor);
        } else {
            if (outline) outline.destroy();
        }
        let shadow = label.getComponent(LabelShadow);
        if (style.enableShadow) {
            if (shadow == null) shadow = label.addComponent(LabelShadow);
            if (style.shadowColor) shadow.color = this.parseColor(style.shadowColor);
            if (style.shadowOffsetX && style.shadowOffsetY) shadow.offset = new Vec2(style.shadowOffsetX, style.shadowOffsetY);
            else if (style.shadowOffsetX) shadow.offset = new Vec2(style.shadowOffsetX, 0);
            else if (style.shadowOffsetY) shadow.offset = new Vec2(0, style.shadowOffsetY);
            if (style.shadowBlur) shadow.blur = style.shadowBlur;
        } else {
            if (shadow) shadow.destroy();
        }
    }

    public parseColor(color: string | number[]): Color {
        return typeof color === "string" ? new Color(color) : new Color(...color);
    }
}