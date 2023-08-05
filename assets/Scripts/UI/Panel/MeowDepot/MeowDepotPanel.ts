/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-05-24 01:19:33
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-07-19 01:44:25
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\UI\Panel\MeowDepot\MeowDepotPanel.ts
 * @Description: 喵喵补给站面板
 */
import { _decorator, Component, log, Node } from 'cc';
import { UIBase } from '../../Framework/UIBase';
import { AudioManager } from '../../../Runtime/AudioManager';
import { uiPanelCloseSound } from '../../../Util/CommonUtil';
import { PlayerData } from '../../../Runtime/PlayerData';
const { ccclass, property } = _decorator;

@ccclass('MeowDepotPanel')
export class MeowDepotPanel extends UIBase {
    onInit(params: any): void {
        log("MeowDepotPanel onInit");

        this.addButtonClick("CloseBtn", () => {
            AudioManager.inst.playOneShot(uiPanelCloseSound);
            this.closeSelf();
        });

        //TODO: 补给站需要对接广告，这里先测试按钮点击
        this.addButtonClick("GetCashBtn", () => {
            log("GetCashBtn");
            // 添加现金
            PlayerData.Instance.addCash(100);
        });

        this.addButtonClick("GetStaminaBtn", () => {
            log("GetStaminaBtn");
            // 添加体力
            PlayerData.Instance.addStamina(10);
        });

        this.addButtonClick("GetDiamondBtn", () => {
            log("GetDiamondBtn");
            // 添加钻石
            PlayerData.Instance.addDiamond(20);
        });
    }
}


