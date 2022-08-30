import { _decorator, Component } from "cc";
import { ParticleSystem } from "cc";

const { ccclass, property } = _decorator;
@ccclass("ParticleAutoDestroy")
export default class ParticleAutoDestroy extends Component {
    onEnable(): void {
        let particles = this.getComponentsInChildren(ParticleSystem);

        let maxTime: number = 0;
        for (let particle of particles) {
            let liveTime = particle.duration + particle.startLifetime.getMax();
            if (liveTime > maxTime)
                maxTime = liveTime;
        }
        this.scheduleOnce(() => this.node.destroy(), maxTime);
    }
}