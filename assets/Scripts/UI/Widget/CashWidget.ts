/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-05-23 21:57:11
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-05-26 16:54:00
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\UI\Widget\CashWidget.ts
 * @Description: 现金ui组件
 */
import { _decorator, Component, Label, log, Node } from 'cc';
import { UIBase } from '../Framework/UIBase';
import { UIManager } from '../Framework/UIManager';
import { UILAYER } from '../Framework/UIDefine';
import { uiPanelOpenSound } from '../../Util/CommonUtil';
import { AudioManager } from '../../Runtime/AudioManager';
import { PlayerData } from '../../Runtime/PlayerData';
const { ccclass, property } = _decorator;

@ccclass('CashWidget')
export class CashWidget extends UIBase {
    private _playerCashNum = PlayerData.Instance.getCash();
    private _playerCashNumObj = { cashNum: this._playerCashNum };

    onInit(params: any): void {
        log("CashWidget onInit");

        // 数据和ui组件绑定
        let cashNumLabel = this.getLabel("MoneyCount");
        cashNumLabel.string = this._playerCashNum.toString();
        this.bindComponent(this._playerCashNumObj, "cashNum", cashNumLabel);

        this.addButtonClick("MoneyAddButton", () => {
            AudioManager.inst.playOneShot(uiPanelOpenSound);
            UIManager.Instance.openUI("meowDepotPanel", undefined, UILAYER.E_PANEL);
        });
    }

    /**
     * @description: CashWidget 组件的现金增加方法，别的模块通过跨模块调用的方式调用，从而做到数据的更新
     * @param {number} cashNum
     * @return {*}
     */    
    upgradePlayerCashNum(cashNum: number) {
        this._playerCashNumObj.cashNum += cashNum;
    }

    /**
     * @description: CashWidget 组件的现金减少方法，别的模块通过跨模块调用的方式调用，从而做到数据的更新
     * @param {number} cashNum
     * @return {*}
     */    
    minusPlayerCashNum(cashNum: number) {
        this._playerCashNumObj.cashNum -= cashNum;
    }
}


