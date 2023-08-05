/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-06-09 20:58:00
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-08-01 02:34:29
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\UI\Widget\GameFunctionWidget.ts
 * @Description: 游戏功能模块UI挂件
 */
import { _decorator, Component, log, Node } from 'cc';
import { UIBase } from '../Framework/UIBase';
import { AudioManager } from '../../Runtime/AudioManager';
import { uiShopPanelClickSound } from '../../Util/CommonUtil';
import { UIManager } from '../Framework/UIManager';
import { UILAYER } from '../Framework/UIDefine';
import { DISCOVER_TYPE } from '../../Enums/GameEnums';
const { ccclass, property } = _decorator;

@ccclass('GameFunctionWidget')
export class GameFunctionWidget extends UIBase {
    onInit(params: any): void {
        log("GameFunctionWidget onInit");

        // 店铺按钮点击事件
        this.addButtonClick("Istore", () => {
            log("GameFunctionWidget ShopBtn click");
            AudioManager.inst.playOneShot(uiShopPanelClickSound);
            UIManager.Instance.openUI("shopPanel", undefined, UILAYER.E_PANEL);
        });

        // 员工按钮点击事件
        this.addButtonClick("Employee", () => {
            log("GameFunctionWidget EmployeeBtn click");
            AudioManager.inst.playOneShot(uiShopPanelClickSound);
            UIManager.Instance.openUI("employeePanel", undefined, UILAYER.E_PANEL);
        });

        // 菜单面板点击事件
        this.addButtonClick("Menu", () => {
            log("GameFunctionWidget MenuBtn click");
            AudioManager.inst.playOneShot(uiShopPanelClickSound);
            UIManager.Instance.openUI("menuPanel", undefined, UILAYER.E_PANEL);
        });

        // 仓库面板点击事件
        this.addButtonClick("Warehouse", () => {
            log("GameFunctionWidget WarehouseBtn click");
            AudioManager.inst.playOneShot(uiShopPanelClickSound);
            UIManager.Instance.openUI("warehousePanel", undefined, UILAYER.E_PANEL);
        });

        // 研发面板点击事件
        this.addButtonClick("Development", () => {
            log("GameFunctionWidget DevelopmentBtn click");
            AudioManager.inst.playOneShot(uiShopPanelClickSound);
            UIManager.Instance.openUI("foodDiscoverPanel", DISCOVER_TYPE.NONE, UILAYER.E_PANEL);
        });
    }
}


