
import { Component, Vec3, _decorator } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('IKConstraint')
export class IKConstraint extends Component {
    @property({ visible: true })
    private enableLimitation: boolean = false;
    @property({ visible: true, displayName: "limitation" })
    private _limitation: Vec3 = new Vec3();
    public get limitation() { return this.enableLimitation ? this._limitation : null; }
    public set limitation(v) { this.enableLimitation = true, this._limitation.set(v); }

    @property({ visible: true })
    private enableEulerMin: boolean = false;
    @property({ visible: true, displayName: "eulerMin", min: -360, max: +360 })
    private _eulerMin: Vec3 = new Vec3();
    public get eulerMin() { return this.enableEulerMin ? this._eulerMin : null; }
    public set eulerMin(v) { this.enableEulerMin = true; this._eulerMin.set(v); }

    @property({ visible: true })
    private enableEulerMax: boolean = false;
    @property({ visible: true, displayName: "eulerMax", min: -360, max: +360 })
    private _eulerMax: Vec3 = new Vec3();
    public get eulerMax() { return this.enableEulerMax ? this._eulerMax : null; }
    public set eulerMax(v) { this.enableEulerMax = true; this._eulerMax.set(v); }
}