/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-07-27 02:52:26
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-08-01 00:10:21
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\UI\Panel\Warehouse\WuweiResCounter.ts
 * @Description: 
 */
import { _decorator, Component, Label, log, Node, ProgressBar } from 'cc';
import { PlayerData } from '../../../Runtime/PlayerData';
import { WUWEI_TYPE } from '../../../Enums/GameEnums';
const { ccclass, property } = _decorator;

@ccclass('WuweiResCounter')
export class WuweiResCounter extends Component {
    private _timeToRecover: number = 5;  // 恢复五味资源可获取数量所需的时间
    private _currentWuweiResLeft: number = 0;  // 当前五味资源剩余可获取数量

    @property({ type: Label })
    labelTimer: Label = null!;

    @property({ type: ProgressBar })
    progressBar: ProgressBar = null!;

    private _timer = 0;

    onLoad() {
        this._timer = 0;

        this.getWuweiResLeftCount();
        if (this._currentWuweiResLeft === 0) {
            this.node.getChildByName("Cooling").active = true;
        }
    }

    start() {

    }

    update(deltaTime: number) {
        this.getWuweiResLeftCount();

        if (this._currentWuweiResLeft === 0) {
            this.node.getChildByName("Cooling").active = true;

            let ratio = this._timer / this._timeToRecover;
            this.progressBar.progress = ratio;

            let timeLeft = Math.floor(this._timeToRecover - this._timer);
            this.labelTimer.string = Math.floor(timeLeft / 60).toString() + ":" + (timeLeft % 60 < 10 ? "0" : "") + timeLeft % 60;
            this._timer += deltaTime;
            if (this._timer >= this._timeToRecover) {
                this._timer = 0;
                this._currentWuweiResLeft += 6;
                this.addWuweiResCount(6);
                this.node.getChildByName("Cooling").active = false;
            }
        } else {
            this.node.getChildByName("Cooling").active = false;
        }
    }

    getWuweiResLeftCount() {
        let thisNodeName = this.node.name;
        if (thisNodeName === "SUAN") {
            this._currentWuweiResLeft = PlayerData.Instance.getWuweiResLeftCount().suan;
        } else if (thisNodeName === "TIAN") {
            this._currentWuweiResLeft = PlayerData.Instance.getWuweiResLeftCount().tian;
        } else if (thisNodeName === "KU") {
            this._currentWuweiResLeft = PlayerData.Instance.getWuweiResLeftCount().ku;
        } else if (thisNodeName === "LA") {
            this._currentWuweiResLeft = PlayerData.Instance.getWuweiResLeftCount().la;
        } else if (thisNodeName === "XIAN") {
            this._currentWuweiResLeft = PlayerData.Instance.getWuweiResLeftCount().xian;
        }
    }

    addWuweiResCount(amount: number) {
        let thisNodeName = this.node.name;
        if (thisNodeName === "SUAN") {
            PlayerData.Instance.addWuweiResCount(amount, WUWEI_TYPE.SUAN);
        } else if (thisNodeName === "TIAN") {
            PlayerData.Instance.addWuweiResCount(amount, WUWEI_TYPE.TIAN);
        } else if (thisNodeName === "KU") {
            PlayerData.Instance.addWuweiResCount(amount, WUWEI_TYPE.KU);
        } else if (thisNodeName === "LA") {
            PlayerData.Instance.addWuweiResCount(amount, WUWEI_TYPE.LA);
        } else if (thisNodeName === "XIAN") {
            PlayerData.Instance.addWuweiResCount(amount, WUWEI_TYPE.XIAN);
        }
    }
}


