import { _decorator, Component, Label, Node } from 'cc';
import { PlayerData } from '../../../Runtime/PlayerData';
import { UIManager } from '../../Framework/UIManager';
const { ccclass, property } = _decorator;

@ccclass('StaminaCounter')
export class StaminaCounter extends Component {
    private _timeToRecover: number = 5;  // 恢复一个体力所需的时间
    private _totalStamina: number = 30;  // 体力上限
    private _currentStamina: number = 0;  // 当前体力

    @property({ type: Label })
    labelTimer: Label = null!;

    @property({ type: Label })
    labelStaminaCount: Label = null!;

    private _timer = 0;

    onLoad() {
        this._timer = 0;

        // 从玩家数据中心去获取到玩家当前的体力值
        this._currentStamina = PlayerData.Instance.getStamina();
    }

    update(deltaTime: number) {
        this._currentStamina = PlayerData.Instance.getStamina();

        if (this._currentStamina >= this._totalStamina) {
            this.labelTimer.node.active = false;
            return;
        } else {
            this.labelTimer.node.active = true;
        }

        let timeLeft = Math.floor(this._timeToRecover - this._timer);

        this.labelStaminaCount.string = this._currentStamina.toString();
        this.labelTimer.string = Math.floor(timeLeft / 60).toString() + ":" + (timeLeft % 60 < 10 ? "0" : "") + timeLeft % 60;

        this._timer += deltaTime;
        if (this._timer >= this._timeToRecover) {
            this._timer = 0;

            if (this._currentStamina >= this._totalStamina) {
                this.labelTimer.node.active = false;
                return;
            } else {
                PlayerData.Instance.addStamina(1);

                // 通知体力值的ui更新
                UIManager.Instance.sendMsg("warehousePanel", "upgradePlayerStaminaNum", 1);
            }
        }
    }
}


