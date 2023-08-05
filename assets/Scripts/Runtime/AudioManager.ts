import { AudioClip, AudioSource, assert, clamp01, resources, warn, Node, director } from "cc";

export class AudioManager {
    private static _inst: AudioManager;
    public static get inst(): AudioManager {
        if (this._inst == null) {
            this._inst = new AudioManager();
        }
        return this._inst;
    }

    private _audioSource: AudioSource;

    constructor() {
        let audioMgr = new Node();
        audioMgr.name = '__audioMgr__';

        director.getScene().addChild(audioMgr);
        director.addPersistRootNode(audioMgr);

        this._audioSource = audioMgr.addComponent(AudioSource);
    }

    public get audioSource() {
        return this._audioSource;
    }

    playOneShot(sound: AudioClip | string, volume: number = 1.0) {
        if (sound instanceof AudioClip) {
            this._audioSource.playOneShot(sound, volume);
        }
        else {
            resources.load(sound, (err, clip: AudioClip) => {
                if (err) {
                    console.log(err);
                }
                else {
                    this._audioSource.playOneShot(clip, volume);
                }
            });
        }
    }

    play(sound: AudioClip | string, volume: number = 1.0, loop: boolean = true) {
        if (sound instanceof AudioClip) {
            this._audioSource.clip = sound;
            this._audioSource.loop = loop;
            this._audioSource.play();
            this.audioSource.volume = volume;
        }
        else {
            resources.load(sound, (err, clip: AudioClip) => {
                if (err) {
                    console.log(err);
                }
                else {
                    this._audioSource.clip = clip;
                    this._audioSource.loop = loop;
                    this._audioSource.play();
                    this.audioSource.volume = volume;
                }
            });
        }
    }

    stop() {
        this._audioSource.stop();
    }

    pause() {
        this._audioSource.pause();
    }

    resume(){
        this._audioSource.play();
    }
}


