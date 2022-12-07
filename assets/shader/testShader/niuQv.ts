import { Sprite } from 'cc';
import { _decorator, Component, Node, Material, MeshRenderer, Mat4, Quat, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('niuQv')
export class niuQv extends Component {

    @property
    private _progress: number = 0;
    @property({ slide: true, min: 0, max: 1, step: 0.01, tooltip: "进度值" })
    public get progress(): number {
        return this._progress;
    }
    public set progress(value: number) {
        this._progress = value;
        this.updateParam(value);
    }

    material: Material;
    userMat: Mat4=new Mat4();
    fitMat:  Mat4=new Mat4()
    params = []

    start() {
        this.material = this.getComponent(Sprite).customMaterial
        let userQuat = Quat.fromEuler(new Quat(), 0, 0, 0);
        let usePos = new Vec3(0, 0, 0)
        let useS = new Vec3(1, 1, 1);
        Mat4.fromRTS(this.userMat, userQuat, usePos, useS);
        this.userMat.invert();

        let fitQuat = Quat.identity(new Quat())
        let fitPos = new Vec3(0, 0, 0)
        let fitS = new Vec3(1, 1, 1);
        Mat4.fromRTS(this.fitMat, fitQuat, fitPos, fitS);
        this.fitMat.invert();

        this.material.setProperty("userMat", this.userMat);
        this.material.setProperty("fitMat", this.fitMat);

        this.params = [
            {
                key: 'u_Distort',
                startValue: 0.36,
                endValue: 0.0,
                defaultValue: 0.0,
                startTime: 0.0,
                endTime: 0.2,
                curve: function (t, b, c, d) {
                    t = t / d
                    let controls = [0.17, 0, 0.21, 1.0]
                    let tvalue = this.getBezierTfromX(controls, t)
                    let value = this.getBezierValue(controls, tvalue)
                    return b + c * value[2]
                }
            }, {
                key: 'dirBlurStep',
                startValue: 3.0,
                endValue: 0.0,
                defaultValue: 0.0,
                startTime: 0.0,
                endTime: 0.25,
                curve: function (t, b, c, d) {
                    t = t / d
                    let controls = [0.17, 0, 0.21, 1.0]
                    let tvalue = this.getBezierTfromX(controls, t)
                    let value = this.getBezierValue(controls, tvalue)
                    return b + c * value[2]
                }
            }, {
                key: 'u_TwistRotFactor',
                startValue: 350,
                endValue: 0.0,
                defaultValue: 350.0,
                startTime: 0.0,
                endTime: 0.4,
                curve: function (t, b, c, d) {
                    t = t / d
                    let controls = [0.30, 0.62, 0.47, 0.91]
                    let tvalue = this.getBezierTfromX(controls, t)
                    let value = this.getBezierValue(controls, tvalue)
                    return b + c * value[2]
                }
            }, {
                key: 'u_TwistFactor',
                startValue: 4,
                endValue: 0.1,
                defaultValue: 2.0,
                startTime: 0.0,
                endTime: 0.4,
                curve: function (t, b, c, d) {
                    t = t / d
                    let controls = [0.07, 0.76, 0.67, 0.96]
                    let tvalue = this.getBezierTfromX(controls, t)
                    let value = this.getBezierValue(controls, tvalue)
                    return b + c * value[2]
                }
            }, {
                key: 'u_ScaleFactor',
                startValue: 1.75,
                endValue: 1.03,
                defaultValue: 1.75,
                startTime: 0.0,
                endTime: 0.2,
                curve: function (t, b, c, d) {
                    t = t / d
                    let controls = [0.09, 0.74, 0.67, 0.90]
                    let tvalue = this.getBezierTfromX(controls, t)
                    let value = this.getBezierValue(controls, tvalue)
                    return b + c * value[2]
                }
            }, {
                key: 'u_TwistRotFactor',
                startValue: 0.0,
                endValue: 240.0,
                defaultValue: 240.0,
                startTime: 0.4,
                endTime: 1.0,
                curve: function (t, b, c, d) {
                    t = t / d
                    let controls = [0.68, -0.06, 0.83, 0.22]
                    let tvalue = this.getBezierTfromX(controls, t)
                    let value = this.getBezierValue(controls, tvalue)
                    return b + c * value[2]
                }
            }, {
                key: 'u_TwistFactor',
                startValue: 0.1,
                endValue: 1,
                defaultValue: 0.45,
                startTime: 0.0,
                endTime: 1.0,
                curve: function (t, b, c, d) {
                    t = t / d
                    let controls = [0.33, 0.10, 0.84, 0.12]
                    let tvalue = this.getBezierTfromX(controls, t)
                    let value = this.getBezierValue(controls, tvalue)
                    return b + c * value[2]
                }
            }, {
                key: 'u_ScaleFactor',
                startValue: 1.03,
                endValue: 0.001,
                defaultValue: 1.03,
                startTime: 0.4,
                endTime: 1.0,
                curve: function (t, b, c, d) {
                    t = t / d
                    let controls = [0.09, 0.74, 0.67, 0.90]
                    let tvalue = this.getBezierTfromX(controls, t)
                    let value = this.getBezierValue(controls, tvalue)
                    return b + c * value[2]
                }
            }, {
                key: 'scaleBlurStep',
                startValue: 0.0,
                endValue: 0.25,
                defaultValue: 0.0,
                startTime: 0.4,
                endTime: 1.0,
                curve: function (t, b, c, d) {
                    t = t / d
                    let controls = [0.38, 0.13, 0.84, 0.12]
                    let tvalue = this.getBezierTfromX(controls, t)
                    let value = this.getBezierValue(controls, tvalue)
                    return b + c * value[2]
                }
            }
        ]
    }

    update() {
        this.progress += 0.001;
        if(this.progress>=1){
            this.progress=1;
        }
    }

    updateParam(progressV: number) {
        for (let i = 0; i < this.params.length; i++) {
            let obj = this.params[i];
            let value = Math.lerp(obj.startValue, obj.endValue, progressV);
            this.material.setProperty(obj.key, value);
        }
    }

    getBezierValue(controls, t) {
        let ret = {}
        let xc1 = controls[1]
        let yc1 = controls[2]
        let xc2 = controls[3]
        let yc2 = controls[4]
        ret[1] = 3 * xc1 * (1 - t) * (1 - t) * t + 3 * xc2 * (1 - t) * t * t + t * t * t
        ret[2] = 3 * yc1 * (1 - t) * (1 - t) * t + 3 * yc2 * (1 - t) * t * t + t * t * t
        return ret
    }


    getBezierDerivative(controls, t) {
        let ret = {}
        let xc1 = controls[1]
        let yc1 = controls[2]
        let xc2 = controls[3]
        let yc2 = controls[4]
        ret[1] = 3 * xc1 * (1 - t) * (1 - 3 * t) + 3 * xc2 * (2 - 3 * t) * t + 3 * t * t
        ret[2] = 3 * yc1 * (1 - t) * (1 - 3 * t) + 3 * yc2 * (2 - 3 * t) * t + 3 * t * t
        return ret
    }


    getBezierTfromX(controls, x) {
        let ts = 0
        let te = 1
        let tm = (ts + te) / 2
        let value = this.getBezierValue(controls, tm)
        if (value[1] > x) {
            te = tm
        } else {
            ts = tm
        }
        return (te + ts) / 2
    }
}
