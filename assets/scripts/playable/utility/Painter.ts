
import { CCString, Component, EventHandler, EventTouch, Graphics, IVec2, Mask, Node, ParticleSystem2D, UITransform, Vec2, Vec3, _decorator } from 'cc';
import { audioManager } from '../core/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('Painter')
export class Painter extends Component {
    @property
    readonly radius: number = 20;
    @property(UITransform)
    readonly graphicsTransform: UITransform = null;
    @property(Node)
    readonly eventNode: Node = null;
    // @property(ParticleSystem2D)
    readonly paintingEffect: ParticleSystem2D = null;
    @property([UITransform])
    readonly areaNodes: UITransform[] = [];
    @property([EventHandler])
    readonly paintStartEventHandler: EventHandler[] = [];
    @property([EventHandler])
    readonly paintEndEventHandler: EventHandler[] = [];
    @property([EventHandler])
    readonly paintMoveEventHandler: EventHandler[] = [];
    @property(CCString)
    readonly paintingAudioName: string = "";

    private graphics: Graphics;
    private areaGrids: boolean[][][] = [];
    private paintGridCount: number = 0;

    private tempV3 = new Vec3();
    private tempV32 = new Vec3();
    private tempV2 = new Vec2();

    private get areaGridSize() { return this.radius * 2; }
    public get areaProgress() { return this.paintGridCount / this.totalGrids; }
    private totalGrids: number = 0;
    private isPlayingAudio: boolean = false;

    private poisitionToCoord(areaNode: UITransform, worldPosition: Vec3): IVec2 {
        let position = areaNode.convertToNodeSpaceAR(worldPosition, this.tempV3);
        let x = (position.x + areaNode.width * areaNode.anchorX) / this.areaGridSize;
        let y = (position.y + areaNode.height * areaNode.anchorY) / this.areaGridSize;
        return this.tempV2.set(Math.trunc(x), Math.trunc(y));
    }

    private fillArea(worldPosition: Vec3): void {
        for (let i = 0; i < this.areaNodes.length; i++) {
            let areaNode = this.areaNodes[i];
            let grids = this.areaGrids[i];
            let coord = this.poisitionToCoord(areaNode, worldPosition);
            let gridList = grids[coord.y];
            if (gridList == null || gridList[coord.x] !== false) continue;
            gridList[coord.x] = true;
            this.paintGridCount++;
        }
    }

    public reset(): void {
        this.paintGridCount = 0;
        for (let i = 0; i < this.areaNodes.length; i++) {
            let grids = this.areaGrids[i];
            for (let r = 0; r < grids.length; r++) {
                for (let c = 0; c < grids.length; c++)
                    grids[r][c] = false;
            }
        }
        this.graphics.clear();
    }

    start(): void {
        this.graphics = this.graphicsTransform.getComponent(Graphics);
        if (this.graphics == null) {
            let mask = this.graphicsTransform.getComponent(Mask);
            this.graphics = mask.graphics;
        }

        for (let i = 0; i < this.areaNodes.length; i++) {
            const size = this.areaNodes[i].contentSize;
            let colCount = Math.trunc(size.width / this.areaGridSize) + Math.sign(size.width % this.areaGridSize);
            let rowCount = Math.trunc(size.height / this.areaGridSize) + Math.sign(size.height % this.areaGridSize);
            this.totalGrids += colCount * rowCount;
            let grids = this.areaGrids[i] = [];
            for (let r = 0; r < rowCount; r++) {
                grids[r] = [];
                for (let c = 0; c < colCount; c++)
                    grids[r][c] = false;
            }
        }
    }

    onEnable(): void {
        this.eventNode.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.eventNode.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.eventNode.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onDisable(): void {
        this.eventNode.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.eventNode.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.eventNode.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);

        this.graphics?.clear();
        if (this.paintingEffect)
            this.paintingEffect.stopSystem();
    }

    private onTouchStart(event: EventTouch): void {
        if (this.paintingEffect) {
            this.paintingEffect.resetSystem();

            let location = event.getUILocation();
            let worldPosition = this.tempV32.set(location.x, location.y);
            this.paintingEffect.node.position = this.paintingEffect.node.parent.getComponent(UITransform).convertToNodeSpaceAR(worldPosition, this.tempV32);
        }

        this.paint(event);
        EventHandler.emitEvents(this.paintStartEventHandler, this.areaProgress);
    }

    private onTouchMove(event: EventTouch): void {
        if (this.paintingEffect) {
            let location = event.getUILocation();
            let worldPosition = this.tempV32.set(location.x, location.y);
            this.paintingEffect.node.position = this.paintingEffect.node.parent.getComponent(UITransform).convertToNodeSpaceAR(worldPosition, this.tempV32);
        }

        this.paint(event);
        EventHandler.emitEvents(this.paintMoveEventHandler, this.areaProgress);
    }

    private paint(event: EventTouch): void {
        let location = event.getUILocation();
        let worldPosition = this.tempV32.set(location.x, location.y);
        this.fillArea(worldPosition);
        let position = this.graphicsTransform.convertToNodeSpaceAR(worldPosition, this.tempV32);
        this.graphics.circle(position.x, position.y, this.radius);
        this.graphics.fill();

        if (!this.isPlayingAudio && !String.isEmptyOrNull(this.paintingAudioName)) {
            this.isPlayingAudio = true;
            audioManager.playEffect(this.paintingAudioName, false, () => this.isPlayingAudio = false);
        }

    }

    private onTouchEnd(event: EventTouch) {
        EventHandler.emitEvents(this.paintEndEventHandler, this.areaProgress);

        if (this.paintingEffect)
            this.paintingEffect.stopSystem();
    }
}
