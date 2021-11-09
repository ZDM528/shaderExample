import { assetManager, AudioClip, Game, game, resources } from "cc";
import { BUILD } from "cc/env";

type AudioID = {};

class AudioManager {
    private audioAssets = new Map<string, AudioBuffer | Promise<AudioBuffer>>();
    private audioRootPath: string;
    private audioContext: AudioContext;
    private music: AudioBufferSourceNode;
    private musicGain: GainNode;
    private effectGain: GainNode;
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
            this.audioContext = new (globalThis.AudioContext || globalThis.webkitAudioContext || globalThis.mozAudioContext)();
        } catch (error) {
            console.error("Your browser does not support AudioContext", error);
        }

        this.musicGain = this.audioContext.createGain();
        this.musicGain.connect(this.audioContext.destination);

        this.effectGain = this.audioContext.createGain();
        this.effectGain.connect(this.audioContext.destination);

        if (!BUILD) {
            assetManager.downloader.register(".mp3", (url, options, onComplete) => {
                options.xhrResponseType = 'arraybuffer';
                assetManager.downloader.downloadFile(url, options, options.onFileProgress, onComplete);
            });
        }

        game.on(Game.EVENT_SHOW, this.onShow, this);
        game.on(Game.EVENT_HIDE, this.onHide, this);
    }

    private onShow(): void {
        this.audioContext?.resume();
    }

    private onHide(): void {
        this.audioContext?.suspend();
    }

    private runContext(): Promise<void> {
        return new Promise((resolve) => {
            const context = this.audioContext;
            if (!context.resume) {
                return resolve();
            }
            if (context.state === 'running') {
                return resolve();
            }
            context.resume().catch((e) => { });
            // promise rejection cannot be caught, need to check running state again
            if (<string>context.state !== 'running') {
                const canvas = document.getElementById('GameCanvas') as HTMLCanvasElement;
                const onGesture = () => {
                    canvas.removeEventListener("touchstart", onGesture);
                    canvas.removeEventListener("touchend", onGesture);
                    canvas.removeEventListener("mousedown", onGesture);
                    context.resume().then(resolve).catch((e) => { });
                };
                canvas?.addEventListener('touchstart', onGesture, { once: true });
                canvas?.addEventListener('touchend', onGesture, { once: true });
                canvas?.addEventListener('mousedown', onGesture, { once: true });
            }
            return null;
        });
    }

    private setVolume(gain: GainNode, volume: number): void {
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
        let audioBuffer = await this.loadAudioBuffer(audioPath);
        await this.runContext();
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.musicGain);
        source.loop = true;
        if (onCompleted) source.onended = () => onCompleted();
        source.start(0, this.audioContext.currentTime);
        this.music = source;
        return source;
    }

    /**
     * 停止音乐
     */
    public stopMusic(): void {
        this.music?.stop();
    }

    /**
     * 恢复音乐
     */
    public resumeMusic(): void {
        this.music?.start();
    }

    /**
     * 播放音效，音效默认  
     * @param audioPath 
     * @param loop 
     * @param onCompleted 
     * @returns 返回音频ID
     */
    public async playEffect(audioPath: string, loop: boolean = false, onCompleted?: () => void): Promise<AudioID> {
        let audioBuffer = await this.loadAudioBuffer(audioPath);
        await this.runContext();
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.effectGain);
        source.loop = loop;
        if (onCompleted) source.onended = () => onCompleted();
        source.start();
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
        source?.stop();
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

    private async loadAudioBuffer(audioPath: string) {
        let path = this.audioRootPath + audioPath;
        let audioBuffer = this.audioAssets.get(path);
        if (audioBuffer != null) return audioBuffer;

        let loadPromise = new Promise<AudioBuffer>((resolve, reject) => {
            resources.load(path, AudioClip, (error, asset) => {
                if (error) return reject('load audio failed:' + audioPath + error);
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

    private decodeAudioData(audioData: ArrayBuffer): Promise<AudioBuffer> {
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