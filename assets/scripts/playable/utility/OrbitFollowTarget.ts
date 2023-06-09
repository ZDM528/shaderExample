import { Component, Enum, Node, Quat, Vec3, _decorator } from 'cc';
import Spherical from '../math/Spherical';
import { EDITOR_WITHOUT_RUN } from '../extenstion/CocosExtenstion';
const { ccclass, property, playOnFocus, executeInEditMode } = _decorator;

export enum OribitFollowMode {
    /** 像机从当前点位置看向目标，目标旋转时，像机不动。 */
    LookTarget,
    /** 像机方向会锁定目标的前方，目标旋转时，像机也会跟着旋转 */
    LockForward,
}

const vec3Temp1 = new Vec3();
const vec3Temp2 = new Vec3();
const quatTemp1 = new Quat();
const tempSpherical = new Spherical();

@ccclass('OrbitFollowTarget')
@executeInEditMode
@playOnFocus
export class OrbitFollowTarget extends Component {
    @property({ visible: true, serializable: false, editorOnly: true })
    private preview: boolean = false;

    @property(Node)
    public target: Node | Vec3 = null;

    @property({ type: Enum(OribitFollowMode), tooltip: "跟随模式" })
    public followMode: OribitFollowMode = OribitFollowMode.LookTarget;

    @property
    private _polarAngle: number = Math.QUARTER_PI;
    @property({ slide: true, min: 0, max: 90, tooltip: "极角，与Y轴之间的夹角" })
    public get polarAngle(): number { return this._polarAngle * Math.RADIAN_TO_DEGREE; }
    public set polarAngle(value: number) { this._polarAngle = Spherical.makeSafePhi(value * Math.DEGREE_TO_RADIAN); }

    @property
    private _azimuthAngle: number = 0;
    @property({ slide: true, min: -180, max: +180, tooltip: "方位角度，基于XZ平面的Y轴旋转" })
    public get azimuthAngle(): number { return this._azimuthAngle * Math.RADIAN_TO_DEGREE; }
    public set azimuthAngle(value: number) { this._azimuthAngle = value * Math.DEGREE_TO_RADIAN; }

    @property
    private _radialDistance: number = 15;
    @property({ min: 0, tooltip: "球面半径，可以理解为与目标的距离" })
    public get radialDistance(): number { return this._radialDistance; }
    public set radialDistance(value: number) { this._radialDistance = value; }

    @property({ tooltip: "相机视角的偏移" })
    public readonly viewOffset = new Vec3();

    @property({ slide: true, min: 0.001, max: 1, step: 0.001, tooltip: "阻尼系数，相机平滑转动的插件数据，数值越小，转动越慢，数值越大，转动越快。" })
    public dampingFactor: number = 0.1;

    /** 相机当前看向目标的坐标。 */
    public get lookatPosition(): Readonly<Vec3> { return this.lastPosition; }

    private readonly lastPosition = new Vec3();
    private readonly lastSpherical = new Spherical();

    onEnable(): void {
        this.computeLookatPosition();
    }

    lateUpdate(deltaTime: number): void {
        if (EDITOR_WITHOUT_RUN && !this.preview) return;

        if (this.target == null || this.dampingFactor <= 0) return;
        this.smoothToTarget(this.dampingFactor);
    }

    public computeLookatPosition(): void {
        const euler = this.node.eulerAngles;
        this.lastSpherical.phi = (euler.x * Math.DEGREE_TO_RADIAN + Math.HALF_PI) % Math.TWO_PI;
        this.lastSpherical.theta = euler.y * Math.DEGREE_TO_RADIAN;

        const rotation = Quat.fromEuler(quatTemp1, euler.x, euler.y, 0);
        const targetOffset = Vec3.transformQuat(vec3Temp2, this.viewOffset, rotation);

        const direction = Vec3.transformQuat(vec3Temp1, Vec3.FORWARD, rotation);

        const position = direction.multiplyScalar(this.radialDistance);
        const targetPosition = position.add(this.node.position).subtract(targetOffset);
        this.lastPosition.set(targetPosition);
    }

    public forceSettle(): void {
        if (this.target == null) return;
        this.smoothToTarget(1);
    }

    public getTargetPosition(): Readonly<Vec3> {
        return this.target instanceof Node ? this.target.worldPosition : this.target as Vec3;
    }

    private smoothToTarget(dampingFactor: number): void {
        let azimuthAngle = this._azimuthAngle;
        switch (this.followMode) {
            case OribitFollowMode.LockForward: {
                if (this.target instanceof Node) {
                    let euler = Quat.toEuler(vec3Temp1, this.target.worldRotation);
                    azimuthAngle = (azimuthAngle + (euler.y + 180) * Math.DEGREE_TO_RADIAN) % Math.TWO_PI;
                }
            } break;
        }

        const spherical = tempSpherical;

        spherical.theta = this.lastSpherical.theta = Math.lerpRadian(this.lastSpherical.theta, azimuthAngle, dampingFactor);
        spherical.phi = this.lastSpherical.phi = Math.lerp(this.lastSpherical.phi, this._polarAngle, dampingFactor);
        spherical.radius = this.lastSpherical.radius = Math.lerp(this.lastSpherical.radius, this.radialDistance, dampingFactor);

        this.node.rotation = Quat.fromEuler(quatTemp1, (spherical.phi - Math.HALF_PI) * Math.RADIAN_TO_DEGREE, spherical.theta * Math.RADIAN_TO_DEGREE, 0);

        let targetPosition = this.getTargetPosition();
        targetPosition = this.lastPosition.lerp(targetPosition, dampingFactor);
        const targetOffset = Vec3.transformQuat(vec3Temp2, this.viewOffset, this.node.rotation);
        targetPosition = targetOffset.add(targetPosition);

        let position = spherical.toCoords(vec3Temp1);
        this.node.position = position.add(targetPosition);
    }
}