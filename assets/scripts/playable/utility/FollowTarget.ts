
import { Component, Enum, game, Node, Quat, Vec3, _decorator } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

export enum FollowMode {
    /** 像机从当前点位置看向目标，目标旋转时，像机不动，注意：像机不能与目标位置重叠。 */
    LookTarget,
    /** 像机方向会锁定目标的前方，目标旋转时，像机也会跟着旋转 */
    LockForward,
    /** 像机方向会锁定目标的后方，目标旋转时，像机也会跟着旋转 */
    LockFlipForward,
}

@ccclass('FollowTarget')
// @executeInEditMode
export class FollowTarget extends Component {
    @property(Node)
    public target: Node = null;
    @property({ type: Enum(FollowMode) })
    public followMode: FollowMode = FollowMode.LookTarget;
    @property({ radian: true })
    public lockTargetAngle: number = 0;
    @property
    public distance: number = 5;
    @property
    public height: number = 5;
    @property
    public smoothPositionTime: number = 0.5;
    @property
    public smoothAngularTime: number = 0.5;
    @property
    public useWorldUp: boolean = true;

    private currentVelocity = new Vec3();
    private angularVelocity = { current: 0 };
    private directionTemplate = new Vec3();
    private upTemplate = new Vec3();
    private rotationTemplate = new Quat();

    private getTargetUp(): Vec3 {
        return this.useWorldUp ? Vec3.UP : this.target.up;
    }

    update(deltaTime: number): void {
        if (this.target == null) return;
        this.smoothToTarget(this.smoothPositionTime, this.smoothAngularTime, deltaTime);
    }

    public forceSettle(): void {
        if (this.target == null) return;
        this.smoothToTarget(0.001, 0.001);
    }

    private smoothToTarget(smoothPositionTime: number, smoothAngularTime: number, deltaTime = game.deltaTime): void {
        let direction = this.calculateDirection();
        let targetPosition = direction.add(this.target.worldPosition);
        this.node.worldPosition = this.node.worldPosition.smoothDamp(targetPosition, this.currentVelocity, smoothPositionTime, Infinity, deltaTime);

        direction = Vec3.subtract(direction, this.node.worldPosition, this.target.worldPosition);

        let newRotation = Quat.fromViewUp(this.rotationTemplate, direction.normalize(), this.getTargetUp());
        this.node.rotation = this.node.rotation.smoothDamp(newRotation, this.angularVelocity, smoothAngularTime, Infinity, deltaTime);
    }

    private calculateDirection(): Vec3 {
        let direction: Vec3;
        let targetUp = this.getTargetUp();
        switch (this.followMode) {
            case FollowMode.LookTarget: {
                direction = this.directionTemplate.set(0, this.height, this.distance);
                let lockRotation = Quat.fromAxisAngle(this.rotationTemplate, targetUp, this.lockTargetAngle);
                direction = Vec3.transformQuat(this.directionTemplate, direction, lockRotation);
            } break;
            case FollowMode.LockForward: {
                direction = this.directionTemplate.set(this.target.forward);

                direction.y = 0;
                direction = direction.multiplyScalar(this.distance / direction.length());
                let up = Vec3.multiplyScalar(this.upTemplate, targetUp, this.height);
                direction = up.add(direction);
            } break;
            case FollowMode.LockFlipForward: {
                let forward = this.target.forward;
                direction = this.directionTemplate.set(-forward.x, -forward.y, -forward.z);

                direction.y = 0;
                direction = direction.multiplyScalar(this.distance / direction.length());
                let up = Vec3.multiplyScalar(this.upTemplate, targetUp, this.height);
                direction = up.add(direction);
            } break;
        }
        return direction;
    }
}