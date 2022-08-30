import { Mat4, Quat, Vec3, Node } from "cc";

const _q = new Quat();
const _targetPos = new Vec3();
const _targetVec = new Vec3();
const _effectorPos = new Vec3();
const _effectorVec = new Vec3();
const _linkPos = new Vec3();
const _invLinkQ = new Quat();
const _linkScale = new Vec3();
const _axis = new Vec3();
const _vector = new Vec3();

export interface SkinMesh {
    bones: readonly Node[];
}

export interface IKLink {
    enabled?: boolean;
    index: number;
    limitation?: Vec3;
    eulerMin?: Vec3,
    eulerMax?: Vec3,
}

export interface IKConstraints {
    target: number;
    effector: number;
    iteration?: number;
    minAngle?: number;
    maxAngle?: number;
    links: IKLink[];
};

/**
 * CCD Algorithm
 *  - https://sites.google.com/site/auraliusproject/ccd-algorithm
 *
 * // ik parameter example
 * //
 * // target, effector, index in links are bone index in skeleton.bones.
 * // the bones relation should be
 * // <-- parent                                  child -->
 * // links[ n ], links[ n - 1 ], ..., links[ 0 ], effector
 * iks = [ {
 *	target: 1,
 *	effector: 2,
 *	links: [ { index: 5, limitation: new THREE.Vector3( 1, 0, 0 ) }, { index: 4, enabled: false }, { index : 3 } ],
 *	iteration: 10,
 *	minAngle: 0.0,
 *	maxAngle: 1.0,
 * } ];
 */
export default class CCDIKSolver {
    public readonly mesh: SkinMesh;
    public readonly iks: IKConstraints[] = [];

    /**
    * @param {THREE.SkinnedMesh} mesh
    * @param {Array<Object>} iks
    */
    public constructor(mesh: SkinMesh, iks: IKConstraints[]) {
        this.mesh = mesh;
        this.iks = iks;
        this.checkValid();
    }

    /**
     * Update all IK bones.
     *
     * @return {CCDIKSolver}
     */
    public update() {
        const iks = this.iks;
        for (let i = 0, il = iks.length; i < il; i++)
            this.updateOne(iks[i]);
        return this;
    }
    /**
     * Update one IK bone
     *
     * @param {Object} ik parameter
     * @return {CCDIKSolver}
     */
    public updateOne(ik: IKConstraints) {
        const bones: readonly Node[] = this.mesh.bones; // for reference overhead reduction in loop

        const math = Math;
        const effector = bones[ik.effector];
        const target = bones[ik.target]; // don't use getWorldPosition() here for the performance
        // because it calls updateMatrixWorld( true ) inside.

        _targetPos.set(target.worldPosition);

        const links = ik.links;
        const iteration = ik.iteration ?? 1;

        for (let i = 0; i < iteration; i++) {
            let rotated = false;
            for (let j = 0; j < links.length; j++) {
                const linkData = links[j];
                // this skip is used for MMD performance optimization.
                if (linkData.enabled === false) break;
                const limitation = linkData.limitation;
                const eulerMin = linkData.eulerMin;
                const eulerMax = linkData.eulerMax; // don't use getWorldPosition/Quaternion() here for the performance
                // because they call updateMatrixWorld( true ) inside.
                const link = bones[linkData.index]; // skip this link and following links.

                Mat4.toRTS(link.worldMatrix, _invLinkQ, _linkPos, _linkScale);
                Quat.invert(_invLinkQ, _invLinkQ);
                _effectorPos.set(effector.worldPosition); // work in link world
                Vec3.subtract(_effectorVec, _effectorPos, _linkPos);
                Vec3.transformQuat(_effectorVec, _effectorVec, _invLinkQ);
                _effectorVec.normalize();

                Vec3.subtract(_targetVec, _targetPos, _linkPos);
                Vec3.transformQuat(_targetVec, _targetVec, _invLinkQ);
                _targetVec.normalize();
                let angle = _targetVec.dot(_effectorVec);
                if (angle > 1.0)
                    angle = 1.0;
                else if (angle < - 1.0)
                    angle = - 1.0;

                angle = math.acos(angle); // skip if changing angle is too small to prevent vibration of bone
                if (angle < 1e-5) continue;

                if (ik.minAngle != null && angle < ik.minAngle)
                    angle = ik.minAngle;

                if (ik.maxAngle != null && angle > ik.maxAngle)
                    angle = ik.maxAngle;

                Vec3.cross(_axis, _effectorVec, _targetVec);
                _axis.normalize();
                Quat.fromAxisAngle(_q, _axis, angle);

                link.rotation = Quat.multiply(link.rotation, link.rotation, _q); // TODO: re-consider the limitation specification

                if (limitation != null) {
                    let c = link.rotation.w;
                    if (c > 1.0) c = 1.0;
                    const c2 = math.sqrt(1 - c * c);
                    link.rotation.set(limitation.x * c2, limitation.y * c2, limitation.z * c2, c);
                }

                if (eulerMin != null)
                    link.eulerAngles = Vec3.max(_vector, link.eulerAngles, eulerMin);

                if (eulerMax != null)
                    link.eulerAngles = Vec3.min(_vector, link.eulerAngles, eulerMax);

                rotated = true;
            }

            if (!rotated) break;
        }

        return this;
    }

    private checkValid() {
        const iks = this.iks;
        const bones = this.mesh.bones;

        for (let i = 0, il = iks.length; i < il; i++) {
            const ik = iks[i];
            const effector = bones[ik.effector];
            const links = ik.links;
            let link0 = effector;

            for (let j = 0, jl = links.length; j < jl; j++) {
                let link1 = bones[links[j].index];
                if (link0.parent !== link1)
                    console.warn('THREE.CCDIKSolver: bone ' + link0.name + ' is not the child of bone ' + link1.name, bones);
                link0 = link1;
            }
        }
    }
}
