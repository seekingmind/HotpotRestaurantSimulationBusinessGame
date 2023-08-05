/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-05-23 16:46:34
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-05-24 02:50:56
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\UI\Widget\DiamondWidget.ts
 * @Description: 钻石ui组件
 */
import { _decorator, Component, Label, log, Node } from 'cc';
import { UIBase } from '../Framework/UIBase';
import { UIManager } from '../Framework/UIManager';
import { UILAYER } from '../Framework/UIDefine';
import { uiPanelOpenSound } from '../../Util/CommonUtil';
import { AudioManager } from '../../Runtime/AudioManager';
import { PlayerData } from '../../Runtime/PlayerData';
const { ccclass, property } = _decorator;

@ccclass('DiamondWidget')
export class DiamondWidget extends UIBase {
    onInit(params: any): void {
        log("DiamondWidget onInit");

        let diamondNum = PlayerData.Instance.getDiamond();
        this.node.getChildByName("DiamondCount").getComponent(Label).string = diamondNum.toString();

        this.addButtonClick("DiamondAddButton", () => {
            AudioManager.inst.playOneShot(uiPanelOpenSound);
            UIManager.Instance.openUI("meowDepotPanel", undefined, UILAYER.E_PANEL);
        });
    }
}


