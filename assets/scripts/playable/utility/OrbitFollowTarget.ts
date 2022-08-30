import { Component, Enum, game, Mat3, Node, Quat, Vec3, _decorator } from 'cc';
import { EDITOR } from 'cc/env';
import Spherical from '../math/Spherical';
const { ccclass, property, playOnFocus, executeInEditMode } = _decorator;

export enum OribitFollowMode {
    /** 像机从当前点位置看向目标，目标旋转时，像机不动。 */
    LookTarget,
    /** 像机方向会锁定目标的前方，目标旋转时，像机也会跟着旋转 */
    LockForward,
}

const vec3Temp1 = new Vec3();
const vec3Temp2 = new Vec3();
const vec3Temp3 = new Vec3();
const quatTemp1 = new Quat();
const mat3Temp1 = new Mat3();

@ccclass('OrbitFollowTarget')
@executeInEditMode
@playOnFocus
export class OrbitFollowTarget extends Component {
    @property({ visible: true, serializable: false, editorOnly: true })
    private preview: boolean = false;

    @property(Node)
    public target: Node = null;
    @property({ type: Enum(OribitFollowMode) })
    public followMode: OribitFollowMode = OribitFollowMode.LookTarget;
    @property({ slide: true, min: 0, max: 90, tooltip: "与Y轴之间的夹角" })
    public get phi(): number { return this.spherical.phi * Math.RADIAN_TO_DEGREE; }
    public set phi(value: number) {
        this.spherical.phi = value * Math.DEGREE_TO_RADIAN;
        this.spherical.makeSafe();
    }
    @property({
        slide: true, min: -360, max: +360, tooltip: "基于XZ平面的Y轴旋转", visible: function (this: OrbitFollowTarget) {
            return this.followMode == OribitFollowMode.LookTarget;
        }
    })
    public get theta(): number { return this.spherical.theta * Math.RADIAN_TO_DEGREE; }
    public set theta(value: number) {
        this.spherical.theta = value * Math.DEGREE_TO_RADIAN;
    }
    @property({ min: 0, tooltip: "球面半径，可以理解为与目标的距离" })
    public get radius(): number { return this.spherical.radius; }
    public set radius(value: number) {
        this.spherical.radius = value;
    }
    @property({ tooltip: "相机视角的偏移" })
    public readonly viewOffset = new Vec3();

    @property
    public smoothPositionTime: number = 0.2;
    @property
    public smoothAngularTime: number = 0;

    @property({ visible: false })
    private readonly spherical = new Spherical(5, 30 * Math.DEGREE_TO_RADIAN, 0);
    private readonly currentVelocity = new Vec3();
    private readonly angularVelocity = { current: 0 };

    lateUpdate(deltaTime: number): void {
        if (EDITOR && !this.preview) return;
        if (this.target == null) return;
        this.smoothToTarget(this.smoothPositionTime, this.smoothAngularTime, deltaTime);
    }

    public forceSettle(): void {
        if (this.target == null) return;
        this.smoothToTarget(0.001, 0.001);
    }

    private smoothToTarget(smoothPositionTime: number, smoothAngularTime: number, deltaTime = game.deltaTime): void {
        switch (this.followMode) {
            case OribitFollowMode.LockForward: {
                let euler = Quat.toEuler(vec3Temp1, this.target.worldRotation);
                this.theta = euler.y + 180;
            } break;
        }

        let targetPosition = vec3Temp3.set(this.target.worldPosition);
        let position = this.spherical.toCoords(vec3Temp1);
        position = Vec3.add(vec3Temp1, position, targetPosition);

        if (this.viewOffset.x != 0) {
            let viewOffsetX = Vec3.transformQuat(vec3Temp2, vec3Temp2.set(this.viewOffset.x, 0, 0), this.node.rotation);
            targetPosition = targetPosition.add(viewOffsetX);
            position.add(viewOffsetX);
        }
        if (this.viewOffset.y != 0) {
            targetPosition.y += this.viewOffset.y;
            position.y += this.viewOffset.y;
        }
        if (this.viewOffset.z != 0) {
            let direction = Vec3.subtract(vec3Temp2, this.node.position, this.target.worldPosition);
            direction.y = 0;
            let length = direction.length();
            if (length > 0) {
                direction.multiplyScalar(this.viewOffset.z / length);
                targetPosition = targetPosition.add(direction);
                position.add(direction);
            }
        }

        this.node.position = smoothPositionTime == 0 ? position : this.node.position.smoothDamp(position, this.currentVelocity, smoothPositionTime, Infinity, deltaTime);

        let direction = Vec3.subtract(vec3Temp2, position, targetPosition).normalize();
        let rotation = Quat.fromViewUp(quatTemp1, direction, Vec3.UP);
        this.node.rotation = smoothAngularTime == 0 ? rotation : this.node.rotation.smoothDamp(rotation, this.angularVelocity, smoothAngularTime, Infinity, deltaTime);
    }
}