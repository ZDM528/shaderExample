import { _decorator, Sprite, SpriteFrame, resources, Component, assetManager } from "cc";
import LocalizeManager from "./LocalizeManager";

const { ccclass, requireComponent, menu } = _decorator;
@ccclass
@requireComponent(Sprite)
@menu("Localize/LocalizeSprite")
export default class LocalizeSprite extends Component {
    private sprite: Sprite;

    __preload() {
        this.sprite = this.getComponent(Sprite);
        Object.defineProperty(this.sprite, "spriteFrame", {
            get: () => { return this.sprite["_spriteFrame"]; },
            set: (value) => { this.translateSpriteFrame(value) }
        });
        LocalizeManager.onChangedLocalizeEvent.AddEvent(this.onChangedLocalize, this);
        this.onChangedLocalize();
    }

    onDestroy(): void {
        LocalizeManager.onChangedLocalizeEvent.RemoveEvent(this.onChangedLocalize, this);
    }

    private onChangedLocalize(): void {
        this.translateSpriteFrame(this.sprite.spriteFrame);
    }

    private async translateSpriteFrame(value: SpriteFrame) {
        let assetInfo = assetManager.resources.getAssetInfo(this.sprite.spriteFrame._uuid);
        let imagePath: string = assetInfo["path"];
        if (imagePath == null) return;
        let filename = value.name.slice(0, value.name.indexOf('-'));
        let newImagePath = imagePath.replace(`${value.name}`, `${filename + '-' + LocalizeManager.curLocalizeName}`);
        let newValue = await this.loadImage(newImagePath);
        if (newValue == null) {
            newImagePath = imagePath.replace(`${value.name}`, `${filename + '-' + LocalizeManager.defaultLanguage}`);
            newValue = await this.loadImage(newImagePath);
        }
        if (newValue) this.setSpriteFrame(newValue);
    }

    private async loadImage(imagePath: string): Promise<SpriteFrame> {
        return new Promise(resolve => resources.load<SpriteFrame>(imagePath, (error, data) => resolve(data)));
    }

    private setSpriteFrame(value: SpriteFrame): void {
        let lastSprite = this.sprite["_spriteFrame"];
        if (lastSprite === value) return;
        this.sprite["_spriteFrame"] = value;
        this.sprite["markForUpdateRenderData"](false);
        this.sprite["_applySpriteFrame"](lastSprite);
    }
}