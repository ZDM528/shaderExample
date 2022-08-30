import { assetManager, AudioClip, resources } from "cc";
import { BUILD, DEV } from "cc/env";

type AudioID = {};

function onGestureClicked(callback?: () => void): void {
    const canvas = (document.getElementById("GameCanvas") as HTMLCanvasElement) ?? document;
    if (canvas == null) console.error("Can not find document or canvas in your browser");
    const onGesture = () => {
        canvas.removeEventListener("touchstart", onGesture);
        canvas.removeEventListener("touchend", onGesture);
        canvas.removeEventListener("mousedown", onGesture);
        callback?.();
    };
    canvas.addEventListener("touchstart", onGesture, { once: true });
    canvas.addEventListener("touchend", onGesture, { once: true });
    canvas.addEventListener("mousedown", onGesture, { once: true });
}

/**
 * 音频组合器
 * 使用示例
 * ``` ts
    let audioAssembler = new AudioAssembler(audioContext, audioBuffer);
    var analyser = audioAssembler.addAudioNode(audioContext.createAnalyser());
    var analyser2 = audioAssembler.addAudioNode(audioContext.createAnalyser());
    var gain = audioAssembler.addAudioNode(audioContext.createGain());

    analyser.fftSize = 128;
    analyser2.fftSize = 2048;
    analyser2.smoothingTimeConstant = 1;
    gain.gain.linearRampToValueAtTime(1, 3);
    audioAssembler.play(true, 1);
 * ```
 */
export class AudioAssembler {
    private readonly assemblerList: AudioNode[] = [];
    private audioSourceNode: AudioBufferSourceNode;
    private startedAt: number;
    private pausedAt: number;

    public constructor(public readonly audioContext: AudioContext, public readonly audioBuffer: AudioBuffer, readonly onCompleted?: () => void) { }

    private createBufferSource(): void {
        this.audioSourceNode = this.audioContext.createBufferSource();
        this.audioSourceNode.buffer = this.audioBuffer;
        this.audioSourceNode.onended = () => {
            if (this.pausedAt == null)
                this.startedAt = null;
            this.onCompleted?.();
        }
    }

    public addAudioNode<T extends AudioNode>(audioNode: T): T {
        this.assemblerList.push(audioNode);
        return audioNode;
    }

    public getAudioNode<T extends AudioNode>(classType: new (...args: any[]) => T): T {
        for (let assembler of this.assemblerList) {
            if (assembler instanceof classType)
                return assembler;
        }
    }

    public removeAudioNode(audioNode: AudioNode): void {
        let index = this.assemblerList.indexOf(audioNode);
        if (index != -1) this.assemblerList.splice(index, 1);
    }

    public play(loop: boolean = false, playbackRate: number = 1, startOffset: number = 0): void {
        if (this.startedAt != null) return;
        this.createBufferSource();
        let lastAudioNode: AudioNode = this.audioSourceNode;
        for (let audioNode of this.assemblerList)
            lastAudioNode = lastAudioNode.connect(audioNode);
        lastAudioNode.connect(this.audioSourceNode.context.destination);
        this.audioSourceNode.loop = loop;
        this.audioSourceNode.playbackRate.value = playbackRate;
        this.audioSourceNode.start(0, startOffset);

        this.startedAt = this.audioContext.currentTime - startOffset;
    }

    public pause(): void {
        if (this.startedAt == null || this.pausedAt != null) return;
        this.pausedAt = this.audioContext.currentTime;
        this.audioSourceNode.disconnect();
        this.audioSourceNode.stop();
    }

    public resume(): void {
        if (this.pausedAt == null || this.audioBuffer == null) return;
        let lastDuration = this.pausedAt - this.startedAt;
        this.startedAt = this.pausedAt = null;
        this.play(this.audioSourceNode.loop, this.audioSourceNode.playbackRate.value, lastDuration % this.audioBuffer.duration);
    }

    public stop(): void {
        if (this.startedAt == null && this.pausedAt == null) return;
        for (let audioNode of this.assemblerList)
            audioNode.disconnect();
        this.audioSourceNode.disconnect();
        this.audioSourceNode.stop();
        this.startedAt = this.pausedAt = null;
    }
}

class AudioManager {
    public readonly version = "v1.1.0";
    private audioAssets = new Map<string, AudioBuffer | Promise<AudioBuffer>>();
    private audioRootPath: string;
    private _audioContext: AudioContext;
    public get audioContext() { return this._audioContext; }
    private _music: AudioBufferSourceNode;
    public get music(): AudioBufferSourceNode { return this._music; }
    private _musicGain: GainNode;
    public get musicGain(): GainNode { return this._musicGain; }
    private _musicAudioBuffer: AudioBuffer;
    public get musicAudioBuffer(): AudioBuffer { return this._musicAudioBuffer; }
    private musicStartedAt: number;
    private musicPausedAt: number;
    private _effectGain: GainNode;
    public get effectGain(): GainNode { return this._effectGain; }
    private _musicVolume: number = 1;
    private _effectVolume: number = 1;
    private _enableSounds: boolean = true;

    /** 音乐的音量 */
    public get musicVolume(): number { return this._musicVolume; }
    public set musicVolume(value) {
        this._musicVolume = value;
        this.setVolume(this.musicGain, value);
    }
    /** 音效的音量 */
    public get effectVolume(): number { return this._effectVolume; }
    public set effectVolume(value) {
        this._effectVolume = value;
        this.setVolume(this.effectGain, value);
    }

    /** 开关所有声音 @deprecated 此接口名可能会改 */
    public get enableSounds() { return this._enableSounds; }
    public set enableSounds(value) {
        if (this._enableSounds == value) return;
        this._enableSounds = value;

        this.setVolume(this.musicGain, value ? this.musicVolume : 0);
        this.setVolume(this.effectGain, value ? this.effectVolume : 0);
    }

    public initialize(audioRootPath: string = "audio/"): void {
        this.audioRootPath = audioRootPath;

        try {
            this._audioContext = new (globalThis.AudioContext || globalThis.webkitAudioContext || globalThis.mozAudioContext)();
        } catch (error) {
            console.error("Your browser does not support AudioContext", error);
        }

        this._musicGain = this.audioContext.createGain();
        this.musicGain.connect(this.audioContext.destination);

        this._effectGain = this.audioContext.createGain();
        this.effectGain.connect(this.audioContext.destination);

        if (!BUILD) {
            assetManager.downloader.register(".mp3", (url, options, onComplete) => {
                options.xhrResponseType = 'arraybuffer';
                assetManager.downloader.downloadFile(url, options, options.onFileProgress, onComplete);
            });
        }

        this.checkVisibilitychange((hidden) => {
            if (hidden) {
                this.audioContext.suspend();
            } else {
                // IOS14 resume is bad, has not callback immediately
                let resume = () => {
                    let handle = setTimeout(resume, 50);
                    this.audioContext.resume().then(() => clearTimeout(handle));
                };
                resume();
            }
        });
    }

    private checkVisibilitychange(callback: (hidden: boolean) => void): void {
        function onChange() { callback(document.hidden ?? document["mozHidden"] ?? document["webkitHidden"] ?? document["msHidden"]); }
        // Standards:
        if ("hidden" in document)
            document.addEventListener("visibilitychange", onChange);
        else if ("mozHidden" in document)
            document.addEventListener("mozvisibilitychange", onChange);
        else if ("webkitHidden" in document)
            document.addEventListener("webkitvisibilitychange", onChange);
        else if ("msHidden" in document)
            document.addEventListener("msvisibilitychange", onChange);
        // IE 9 and lower:
        else if ("onfocusin" in document)
            document["onfocusin"] = document["onfocusout"] = onChange;
        // All others:
        else
            window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onChange;
    }

    /**
     * 等待context可运行
     * @returns 
     */
    public runContext(): Promise<void> {
        return new Promise((resolve) => {
            const context = this.audioContext;
            if (!context.resume)
                return resolve();

            if (context.state === 'running')
                return resolve();

            context.resume().catch((e) => console.warn("runContext resume", e));
            if (<string>context.state !== 'running') {
                // promise rejection cannot be caught, need to check running state again
                onGestureClicked(() => {
                    context.resume().then(resolve).catch((e) => console.warn("runContext onGesture", e));
                });
            }
        });
    }

    /**
     * 设置声音音量
     * @param gain 声音gain对象
     * @param volume 音量（范围0~1）
     */
    public setVolume(gain: GainNode, volume: number): void {
        if (gain.gain.setTargetAtTime) {
            try {
                gain.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0);
            } catch (e) {
                // Some unknown browsers may crash if timeConstant is 0
                gain.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0.01);
            }
        } else {
            gain.gain.value = volume;
        }
    }

    /**
     * 播放音乐，音乐默认是循环播放。音乐永远只有一个，如果重复调用，会停止旧的音乐。
     * @param audioPath 
     * @param onCompleted 
     * @returns 返回音频ID
     */
    public async playMusic(audioPath: string, onCompleted?: () => void): Promise<AudioID> {
        this.stopMusic();
        try {
            this._musicAudioBuffer = await this.loadAudioBuffer(audioPath);
        } catch (error) {
            if (DEV) console.warn(error);
            return null;
        }
        await this.runContext();
        return this.playMusicByAudioBuffer(this.musicAudioBuffer, 0, onCompleted);
    }

    /**
     * 播放背景音乐
     * @param audioBuffer audioBuffer
     * @param startOffset 
     * @param onCompleted 
     * @returns 
     */
    public playMusicByAudioBuffer(audioBuffer: AudioBuffer, startOffset: number, onCompleted?: () => void): AudioBufferSourceNode {
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.musicGain);
        source.loop = true;
        if (onCompleted) source.onended = () => onCompleted();
        source.start(0, startOffset);

        this.musicStartedAt = this.audioContext.currentTime - startOffset;
        this._music = source;
        return source;
    }

    /**
     * 停止音乐
     */
    public stopMusic(): void {
        if (this.music == null) return;
        this.music.disconnect();
        this.music.stop();
        this._music = null;
        this.musicPausedAt = null;
    }

    /**
     * 暂停背景音乐
     */
    public pauseMusic(): void {
        this.stopMusic();
        this.musicPausedAt = this.audioContext.currentTime;
    }

    /**
     * 恢复音乐
     */
    public async resumeMusic(): Promise<AudioID> {
        if (this.musicPausedAt == null || this.musicAudioBuffer == null) return;
        await this.runContext();
        let lastDuration = this.musicPausedAt - this.musicStartedAt;
        let result = this.playMusicByAudioBuffer(this.musicAudioBuffer, this.musicAudioBuffer != null ? lastDuration % this.musicAudioBuffer.duration : lastDuration);
        this.musicPausedAt = null;
        return result;
    }

    /**
     * 播放音效
     * @param audioPath 音频路径
     * @param repeatTimes 重复次数，重复次数必须 > 0，如果是loop的话，填true。
     * @param onCompleted 完成回调
     * @returns 返回音频ID
     */
    public async playEffect(audioPath: string, repeatTimes: number | boolean = false, onCompleted?: () => void): Promise<AudioID> {
        try {
            var audioBuffer = await this.loadAudioBuffer(audioPath);
        } catch (error) {
            if (DEV) console.warn(error);
            return null;
        }
        await this.runContext();
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.effectGain);
        source.loop = repeatTimes !== false;
        source.start(this.audioContext.currentTime);
        if (typeof repeatTimes === `number`)
            source.stop(this.audioContext.currentTime + audioBuffer.duration * repeatTimes);
        if (onCompleted) source.onended = () => onCompleted();
        return source;
    }

    /**
     * 停止播放音频
     * @param audioID 音频ID
     */
    public async stopAudio(audioID: AudioID | Promise<AudioID>) {
        if (audioID instanceof Promise)
            audioID = await audioID;
        const source = audioID as AudioBufferSourceNode;
        if (source == null) return;
        source.disconnect();
        source.stop();
    }

    /**
     * 设置音频循环
     * @param audioID 音频ID
     * @param loop 是否循环
     */
    public setAudioLoop(audioID: AudioID, loop: boolean): void {
        const source = audioID as AudioBufferSourceNode;
        if (source != null)
            source.loop = loop;
    }

    /**
     * 获得音频时长
     * @param audioID 音频ID
     * @returns 音频时长
     */
    public getAudioDuration(audioID: AudioID): number {
        const source = audioID as AudioBufferSourceNode;
        return source?.buffer.duration;
    }

    /**
     * 加载一个声音
     * @param audioName 声音名称
     * @returns 
     */
    public async loadAudioBuffer(audioName: string): Promise<AudioBuffer> {
        let path = this.audioRootPath + audioName;
        let audioBuffer = this.audioAssets.get(path);
        if (audioBuffer != null) return audioBuffer;

        let loadPromise = new Promise<AudioBuffer>((resolve, reject) => {
            resources.load(path, AudioClip, (error, asset) => {
                if (error) return reject('load audio failed:' + audioName + error);
                this.decodeAudioData(asset._nativeAsset as any).then((audioBuffer) => {
                    if (audioBuffer == null) return reject('decoding error:' + path);
                    this.audioAssets.set(path, audioBuffer);
                    resolve(audioBuffer);
                });
            });
        });
        this.audioAssets.set(path, loadPromise);
        return loadPromise;
    }

    public decodeAudioData(audioData: ArrayBuffer): Promise<AudioBuffer> {
        return new Promise((resolve) => {
            const promise = this.audioContext.decodeAudioData(audioData, resolve, (err) => {
                console.warn('failed to load Web Audio', err);
            })
            promise?.catch((reason) => console.warn('failed to load Web Audio', reason, audioData));
        });
    }
}

/** 声音管理器 */
export const audioManager = new AudioManager();