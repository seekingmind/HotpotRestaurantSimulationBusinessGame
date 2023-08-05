import { _decorator, Component, Label, Node, Prefab } from 'cc';
import { PlayerData } from '../../../Runtime/PlayerData';
const { ccclass, property } = _decorator;

@ccclass('CountDownTime')
export class CountDownTime extends Component {
    @property(Prefab)
    public countDownTime: Prefab = null;

    private _staminaReturnTime: number = 5;  // 体力回复时间3分钟

    private _staminaTime: number = 0;

    private _staminaCount: number = 0;  // 当前体力值

    private _maxStamina: number = 30;  // 最大体力值 30

    private _timeron: boolean = false;

    private _staminaCountLabel: Label = null;

    onLoad() {
        this.setStamina();
    }

    start() {
        // 获取体力值的label
        this._staminaCountLabel = this.node.getChildByPath("PlayerResources/Stamina/StaminaCount").getComponent(Label);

        // 定时器创建
        let timmer = function () {
            if (this._timeron) {
                this.setStaminaTime();
            }
        }

        this.schedule(timmer, 1);
    }

    update(deltaTime: number) {
        
    }

    /**
     * @description: 从本地存储中，获取玩家的体力数据
     * @return {*}
     */    
    getStamina() {
        return PlayerData.Instance.getStamina();
    }

    /**
     * @description: 体力数据设置的主逻辑
     * @return {*}
     */    
    setStamina() {
        let stamina: number = this.getStamina();
        this._staminaCount = stamina;
        let staminaTime = new Date(PlayerData.Instance.getStaminaLastTime()).getTime();
        let nowTime = new Date().getTime();

        // 计算出需要恢复多少体力
        let staminaCount = parseInt(((nowTime - staminaTime) / 1000 / this._staminaReturnTime).toString());
        
        this._staminaTime = this._staminaReturnTime - parseInt(((nowTime - staminaTime) / 1000 % this._staminaReturnTime).toString());

        this.setStaminaTime();
        this._timeron = true;
    }

    setStaminaTime() {
        if (this._staminaCount < 0) {
            this._staminaCount = 0;
            this._staminaCountLabel.string = this._staminaCount.toString();
        }

        if (this._staminaTime) {
            
        }
    }
}


