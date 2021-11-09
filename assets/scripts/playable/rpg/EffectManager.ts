import { Component, instantiate, Node, ParticleSystem, Vec3 } from "cc";
import { Prefab, resources } from "cc";
import { audioManager } from "../core/AudioManager";
import GlobalConfig from "./Configs/GlobalConfig";
import { EffectConfig } from "./Configs/SkillConfig";

/**
 * 特效管理器，负责加载，创建，销毁特效。
 */
export default class EffectManager {
    public static effectRootNode: Node;

    /**
     * 播放受击特效
     * @param assetPath 特效名称
     * @param audioName 音效名称
     * @param target 目标对象
     */
    public static async playStrikeEffect(assetPath: string, audioName: string, target: { beStrokedPoint: Node }): Promise<void> {
        assetPath = assetPath ?? GlobalConfig.defaultStrikeEffect;
        audioName = audioName ?? GlobalConfig.defaultStrikeAudio;
        if (assetPath == null) return;
        let effectPrefab = await this.loadEffect(assetPath);
        if (effectPrefab == null) return;
        let effectNode = instantiate(effectPrefab);
        effectNode.setParent(EffectManager.effectRootNode, false);
        effectNode.position = target.beStrokedPoint.position;
        // effectNode.transform.rotation = new Laya.Quaternion();
        effectNode.scale = target.beStrokedPoint.scale;
        EffectManager.playEffect(effectNode);
        if (audioName != null)
            audioManager.playEffect(audioName);
    }

    private static async loadEffect(effectName: string): Promise<Prefab> {
        return new Promise<Prefab>(resolve => resources.load<Prefab>(effectName, (error, asset) => resolve(asset)));
    }

    /**
     * 播放场景中已有的特效
     * @param effectName 特效名称
     * @param isLocal 特效绑定节点是否目标对象身上的节点，false则是绑定在场景中
     * @param bindName 目标对象节点的名称
     * @param target 目标对象
     * @returns 返回播放特效的对象
     */
    public static async playEffectByName(effectName: string, isLocal: boolean, bindName: string, target: Node): Promise<Node> {
        let effectPrefab = await this.loadEffect(effectName);
        if (effectPrefab == null) return;
        return EffectManager.playEffectByPrefab(effectPrefab, isLocal, bindName, target);
    }

    /**
     * 播放已有的特效
     * @param effectPrefab 特效对象
     * @param isLocal 特效绑定节点是否目标对象身上的节点，false则是绑定在场景中
     * @param bindName 目标对象节点的名称
     * @param target 目标对象
     * @returns 返回播放特效的对象
     */
    public static async playEffectByPrefab(effectPrefab: Prefab, isLocal: boolean, bindName: string, target: Node): Promise<Node> {
        let effectNode = await EffectManager.createEffectNode({ effectName: effectPrefab, isLocal, bindName, effectClass: null }, target);
        EffectManager.playEffect(effectNode);
        return effectNode;
    }

    /**
     * 使用配置信息播放特效
     * @param effectConfig 配置信息
     * @param target 目标对象
     * @returns 返回播放特效的对象
     */
    public static async playEffectByConfig(effectConfig: EffectConfig, target: Node): Promise<Node> {
        let effectNode = await this.createEffectNode(effectConfig, target);
        EffectManager.playEffect(effectNode);
        return effectNode;
    }

    /**
     * 根据配置信息创建特效对象
     * @param effectConfig 配置信息
     * @param target 目标对象
     * @returns 返回特效对象
     */
    public static async createEffectNode(effectConfig: EffectConfig, target: Node): Promise<Node> {
        let prefab = effectConfig.effectName instanceof Prefab ? effectConfig.effectName : await this.loadEffect(effectConfig.effectName);
        let bindPoint = effectConfig.bindName == null ? target : target.searchChild(effectConfig.bindName);
        let parent = effectConfig.isLocal ? bindPoint : EffectManager.effectRootNode;
        let effectNode: Node = instantiate(prefab);
        effectNode.setParent(parent, false);

        if (effectConfig.isLocal) {
            effectNode.position = new Vec3(0, 0, 0);
            // effectNode.transform.localRotation = new Laya.Quaternion(0, 0, 0, 1);
        } else if (bindPoint != null) {
            effectNode.worldPosition = bindPoint.worldPosition;
            // effectNode.transform.rotation = this.character.gameObject.transform.rotation;
        } else {
            effectNode.worldPosition = bindPoint.worldPosition;
        }
        effectNode.active = true;
        return effectNode;
    }

    /**
     * 播放特效
     * @param effectNode 特效对象
     * @param autoDestroy 是否自动销毁
     */
    public static playEffect(effectNode: Node): void {
        let effectTime = EffectManager.playParticles(effectNode);
        if (effectTime > 0) {
            let component = effectNode.getComponent(Component) ?? effectNode.getComponentInChildren(Component);
            component.scheduleOnce(() => {
                EffectManager.destroyEffect(effectNode)
            }, effectTime);
        }
    }

    /**
     * 递归播放所有粒子对象
     * @param particleSystem 粒子系统
     * @returns 返回粒子最大的生命时长
     */
    public static playParticles(node: Node): number {
        if (node == null) return 0;
        let particleSystem = node.getComponent(ParticleSystem);
        let maxTime = particleSystem.duration * particleSystem.startLifetime.getMax();
        particleSystem.clear();
        particleSystem.play();
        for (let child of node.children) {
            let time = EffectManager.playParticles(child);
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