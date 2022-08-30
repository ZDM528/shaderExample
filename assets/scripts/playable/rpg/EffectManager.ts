import { Color, Component, director, game, instantiate, IVec3, Node, ParticleSystem, Vec3 } from "cc";
import { Prefab, resources } from "cc";
import { audioManager } from "../core/AudioManager";
import { Action } from "../utility/ActionEvent";
import GlobalConfig from "./Configs/GlobalConfig";
import { IEffectConfig } from "./Configs/SkillConfig";

/**
 * 特效管理器，负责加载，创建，销毁特效。
 */
export default class EffectManager {

    public static motifyParticlesColor(node: Node, color: Color): void {
        if (node == null) return;
        let particleSystem = node.getComponent(ParticleSystem);
        if (particleSystem != null)
            particleSystem.startColor.color = color;
        for (let child of node.children) {
            EffectManager.motifyParticlesColor(child, color);
        }
    }

    /**
     * 播放受击特效
     * @param assetPath 特效名称
     * @param audioName 音效名称
     * @param target 目标对象
     */
    public static async playStrikeEffect(assetPath: string | Node | Prefab, audioName: string, target: { beStrokedPoint: Node }): Promise<void> {
        let effectNode = await EffectManager.createEffectNode(assetPath, target.beStrokedPoint, false);
        if (effectNode == null) return;
        EffectManager.playParticles(effectNode);
        audioName = audioName ?? GlobalConfig.defaultStrikeAudio;
        if (audioName != null)
            audioManager.playEffect(audioName);
    }

    public static async playEffect(assetPath: string | Node | Prefab, point: Node | Readonly<Vec3>, isForward: boolean = false, autoDestroy: boolean | Action<Node> = true): Promise<Node> {
        let effectNode = await EffectManager.createEffectNode(assetPath, point, isForward);
        if (effectNode == null) return;
        EffectManager.playParticles(effectNode, autoDestroy);
        return effectNode;
    }

    private static async loadEffect(effectName: string): Promise<Prefab> {
        return new Promise<Prefab>(resolve => resources.load<Prefab>(effectName, (error, asset) => resolve(asset)));
    }

    /**
     * 使用配置信息播放特效
     * @param effectConfig 配置信息
     * @param target 目标对象
     * @returns 返回播放特效的对象
     */
    public static async playEffectByConfig(effectConfig: IEffectConfig, target: Node): Promise<Node> {
        let effectNode = await this.createEffectNodeByConfig(effectConfig, target);
        EffectManager.playParticles(effectNode);
        return effectNode;
    }

    /**
     * 根据配置信息创建特效对象
     * @param effectConfig 配置信息
     * @param target 目标对象
     * @returns 返回特效对象
     */
    public static async createEffectNodeByConfig(effectConfig: IEffectConfig, target: Node): Promise<Node> {
        let bindPoint = effectConfig.bindPoint == null ? target : (effectConfig.bindPoint instanceof Node ? effectConfig.bindPoint : target.searchChild(effectConfig.bindPoint));
        // let prefab = typeof effectConfig.effectAsset == "string" ? await this.loadEffect(effectConfig.effectAsset) : effectConfig.effectAsset;
        // let parent = effectConfig.isLocal ? bindPoint : EffectManager.effectRootNode;
        // let effectNode: Node = prefab instanceof Prefab ? instantiate(prefab) : instantiate<Node>(prefab);
        // effectNode.setParent(parent, false);

        // if (effectConfig.isLocal) {
        //     effectNode.position = new Vec3(0, 0, 0);
        //     // effectNode.transform.localRotation = new Laya.Quaternion(0, 0, 0, 1);
        // } else if (bindPoint != null) {
        //     effectNode.worldPosition = bindPoint.worldPosition;
        //     // effectNode.worldRotation = bindPoint.worldRotation;
        // } else {
        //     // effectNode.worldPosition = bindPoint.worldPosition;
        // }
        // effectNode.active = true;

        return await EffectManager.createEffectNode(effectConfig.effectAsset, effectConfig.isLocal ? bindPoint : bindPoint.worldPosition, effectConfig.isForward);
    }

    public static async createEffectNode(assetPath: string | Node | Prefab, point: Node | Readonly<Vec3>, isForward: boolean = false): Promise<Node> {
        assetPath = assetPath ?? GlobalConfig.defaultStrikeEffect;
        if (assetPath == null) {
            console.warn("create Effect Node falied, assetPath is null");
            return;
        }
        let effectPrefab: Node | Prefab;
        if (typeof assetPath == "string") {
            effectPrefab = await EffectManager.loadEffect(assetPath);
            if (effectPrefab == null) return;
        } else {
            effectPrefab = assetPath;
        }
        let effectNode = effectPrefab instanceof Prefab ? instantiate(effectPrefab) : instantiate<Node>(effectPrefab);
        if (point instanceof Node) {
            effectNode.setParent(point, false);
            effectNode.position = Vec3.ZERO;
            // effectNode.transform.rotation = new Laya.Quaternion();
            // effectNode.scale = target.beStrokedPoint.scale;
            if (isForward)
                effectNode.forward = point.forward;
        } else {
            director.getScene().addChild(effectNode);
            effectNode.worldPosition = point;
        }
        effectNode.active = true;
        return effectNode;
    }

    /**
     * 播放特效
     * @param effectNode 特效对象
     * @param autoDestroy 是否自动销毁
     */
    public static playParticles(effectNode: Node, autoDestroy: boolean | Action<Node> = true): number {
        let particlesTime = EffectManager.playParticlesRecursion(effectNode);
        effectNode.active = true;
        if (particlesTime > 0) {
            let component = effectNode.getComponent(Component) ?? effectNode.getComponentInChildren(Component);
            component.scheduleOnce(() => {
                if (autoDestroy instanceof Function) autoDestroy(effectNode);
                else if (autoDestroy == true) EffectManager.destroyEffect(effectNode);
                else effectNode.active = false;
            }, particlesTime);
        }
        return particlesTime;
    }

    /**
     * 递归播放所有粒子对象
     * @param node 粒子系统根节点
     * @returns 返回粒子最大的生命时长
     */
    public static playParticlesRecursion(node: Node): number {
        if (node == null) return 0;
        let particleSystem = node.getComponent(ParticleSystem);
        let maxTime = 0;
        if (particleSystem != null) {
            maxTime = particleSystem.duration + particleSystem.startLifetime.getMax();
            // particleSystem.clear();
            particleSystem.play();
        }
        for (let child of node.children) {
            let time = EffectManager.playParticlesRecursion(child);
            maxTime = Math.max(maxTime, time);
        }
        return maxTime;
    }

    /**
     * 停止播放特效
     * @param effectNode 特效对象
     * @param autoDestroy 是否自动销毁
     * @returns 
     */
    public static stopParticles(effectNode: Node, autoDestroy: boolean | Action<Node> = true): number {
        if (effectNode == null) return;
        let particlesTime = EffectManager.stopParticlesRecursion(effectNode);
        if (particlesTime > 0) {
            let component = effectNode.getComponent(Component) ?? effectNode.getComponentInChildren(Component);
            component.scheduleOnce(() => {
                if (autoDestroy instanceof Function) autoDestroy(effectNode);
                else if (autoDestroy == true) EffectManager.destroyEffect(effectNode);
                else effectNode.active = false;
            }, particlesTime);
        }
        return particlesTime;
    }

    /**
     * 递归停止播放所有粒子对象
     * @param node 粒子系统根节点
     */
    public static stopParticlesRecursion(node: Node): number {
        if (node == null) return;

        let maxTime = 0;
        let particleSystem = node.getComponent(ParticleSystem);
        if (particleSystem != null) {
            maxTime = particleSystem.duration + particleSystem.startLifetime.getMax();
            particleSystem.stop();
        }

        for (let child of node.children) {
            let time = EffectManager.stopParticlesRecursion(child);
            maxTime = Math.max(maxTime, time);
        }
        return maxTime;
    }

    /**
     * 销毁特效对象
     * @param effectNode 特效对象
     */
    public static destroyEffect(effectNode: Node): void {
        effectNode.destroy();
    }
}