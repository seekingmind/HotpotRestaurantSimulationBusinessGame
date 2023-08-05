import { _decorator, Component, Node } from 'cc';
import { AudioManager } from './AudioManager';
const { ccclass, property } = _decorator;

@ccclass('GameRoot')
export class GameRoot extends Component {
    private backgroundMusicPath = "Audio/Music/background"

    onLoad() {
        AudioManager.inst.play(this.backgroundMusicPath);
    }

    onEnable() {
        AudioManager.inst.play(this.backgroundMusicPath);
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}


