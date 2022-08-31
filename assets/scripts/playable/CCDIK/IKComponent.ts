
import { assert, Component, Node, Quat, _decorator } from 'cc';
import { EDITOR_WITHOUT_RUN } from '../extenstion/CocosExtenstion';
import { Action } from '../utility/ActionEvent';
import CCDIKSolver, { IKLink } from './CCDIKSolver';
import { IKConstraint } from './IKConstraint';
const { ccclass, property, executeInEditMode } = _decorator;

interface BoneReset {
    node: Node;
    rotation: Quat;
}

@ccclass('IKComponent')
@executeInEditMode
export class IKComponent extends Component {
    @property({ visible: true, serializable: false, editorOnly: true })
    private preview: boolean = false;
    @property(Node)
    readonly effector: Node = null;
    @property(Node)
    readonly target: Node = null;
    @property
    readonly enableBoneReset: boolean = false;

    private _ikSolver: CCDIKSolver;
    public get ikSolver() { return this._ikSolver; }
    public readonly boneDataList: BoneReset[] = [];

    onLoad() {
        this.initIKSolver();
    }

    public initIKSolver(): void {
        if (this.ikSolver != null) return;

        let bones: Node[] = [];
        this.getBones(this.node, bones);

        let links: IKLink[] = [];
        for (let i = bones.length - 1; i >= 0; i--) {
            let linkData: IKLink = { index: i };
            let constraint = bones[i].getComponent(IKConstraint);
            if (constraint != null) {
                linkData.enabled = constraint.enabled;
                linkData.limitation = constraint.limitation;
                linkData.eulerMin = constraint.eulerMin;
                linkData.eulerMax = constraint.eulerMax;
            }
            links.push(linkData);
        }

        assert(!bones.contains(this.effector));
        if (this.effector != null)
            bones.push(this.effector);

        assert(!bones.contains(this.target));
        if (this.target != null)
            bones.push(this.target);

        this._ikSolver = new CCDIKSolver({ bones }, [{
            target: bones.length - 1,
            effector: bones.length - 2,
            // minAngle: -45 * Math.DEGREE_TO_RADIAN,
            // maxAngle: 45 * Math.DEGREE_TO_RADIAN,
            links: links
        }]);

        for (let boneNode of bones)
            this.boneDataList.push({ node: boneNode, rotation: boneNode.rotation.clone() });

        // //@ts-ignore
        // console.log("CCDID", this.node.name, this.ikSolver.mesh.bones, this.ikSolver.iks);
    }

    private getBones(parent: Node, bones: Node[]): void {
        if (parent == this.effector || !parent.active) return;
        bones.push(parent);
        let child = parent.children[0];
        this.getBones(child, bones);
    }

    private resetBones(callback: Action, thisArg: any): void {
        // IK前还原动画在上一次IK的旋转信息
        for (let boneReset of this.boneDataList)
            boneReset.node.rotation = boneReset.rotation;
        callback.call(thisArg);
        // // IK后记录当前旋转信息
        for (let boneReset of this.boneDataList)
            boneReset.rotation.set(boneReset.node.rotation);
    }

    public lateUpdate(): void {
        if (EDITOR_WITHOUT_RUN) {
            if (!this.preview)
                return;
            if (this.ikSolver == null)
                this.initIKSolver();
        }

        if (this.enableBoneReset)
            this.resetBones(this.updateIKSolver, this);
        else
            this.updateIKSolver();
    }

    public updateIKSolver(): void {
        this.ikSolver?.update();
    }
}

