import { _decorator, Component, Node, Sprite, MeshRenderer, EventTouch, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('circle')
export class circle extends Component {

    start() {
        let sprite=this.node.getComponent(Sprite);
        let width = sprite.spriteFrame.width;
        let height = sprite.spriteFrame.height;
        sprite.customMaterial.setProperty("circleWHRadio",width/height);
        this.node.on(Node.EventType.TOUCH_MOVE,this.touchmove,this);
    }   

    touchmove(e:EventTouch){
        let pos=e.getLocation();
        let sprite=this.node.getComponent(Sprite);
        let posVec2=new Vec2(pos.x/sprite.spriteFrame.width,(sprite.spriteFrame.height-pos.y)/sprite.spriteFrame.height);
        sprite.customMaterial.setProperty("circlePoint",posVec2);
    }

    update(deltaTime: number) {
        
    }
}

