/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-07-03 16:37:14
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-08-03 22:10:28
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\UI\Tips\GameTips.ts
 * @Description: 
 */
import { _decorator, Component, error, instantiate, Label, Node, Prefab, resources, tween, Vec3 } from 'cc';
import EventManager from '../../Runtime/EventManager';
import { GAME_EVENTS } from '../../Enums/GameEnums';
import { UIBase } from '../Framework/UIBase';
import { AudioManager } from '../../Runtime/AudioManager';
import { uiPanelUnlockSound } from '../../Util/CommonUtil';
const { ccclass, property } = _decorator;

@ccclass('GameTips')
export class GameTips extends UIBase {
    onLoad() {
        EventManager.Instance.addEvent(GAME_EVENTS.FACILITY_SOCRE_UP, this.onFacilityScoreUp, this);
        EventManager.Instance.addEvent(GAME_EVENTS.SERVICE_SCORE_UP, this.onServiceScoreUp, this);
        EventManager.Instance.addEvent(GAME_EVENTS.FOOD_SCORE_UP, this.onFoodScoreUp, this);
        EventManager.Instance.addEvent(GAME_EVENTS.WAREHOUSE_EVENTS_TIP, this.onWareHouseEventTips, this);
        EventManager.Instance.addEvent(GAME_EVENTS.FOOD_DISCOVER_TIP, this.onFoodDiscoverFail, this);
    }

    start() {

    }

    /**
     * @description: 设施评分提升的提示事件回调
     * @return {*}
     */
    onFacilityScoreUp() {

    }

    /**
     * @description: 服务评分提升的提示事件回调
     * @return {*}
     */
    onServiceScoreUp(serviceUpScore: number) {
        let serviceScoreUpTipsNode = this.node.getChildByName("ServiceScoreUpTips");
        let serviceScoreUpTipsNodeBeforePos = serviceScoreUpTipsNode.position;

        serviceScoreUpTipsNode.getChildByName("ServiceScoreValueTxt").getComponent(Label).string = serviceUpScore.toString();
        serviceScoreUpTipsNode.active = true;

        tween(serviceScoreUpTipsNode)
            .to(0.5, { position: new Vec3(-176, 456, 0) })
            .delay(1)
            .call(() => {
                serviceScoreUpTipsNode.active = false;
                serviceScoreUpTipsNode.position = serviceScoreUpTipsNodeBeforePos;
            })
            .start();
    }

    /**
     * @description: 食物评分提升的提示事件回调
     * @return {*}
     */
    onFoodScoreUp(foodUpScore: number) {
        let serviceScoreUpTipsNode = this.node.getChildByName("FoodScoreUpTips");
        let serviceScoreUpTipsNodeBeforePos = serviceScoreUpTipsNode.position;

        serviceScoreUpTipsNode.getChildByName("FoodScoreValueTxt").getComponent(Label).string = foodUpScore.toString();
        serviceScoreUpTipsNode.active = true;

        tween(serviceScoreUpTipsNode)
            .to(0.5, { position: new Vec3(-176, 456, 0) })
            .delay(1)
            .call(() => {
                serviceScoreUpTipsNode.active = false;
                serviceScoreUpTipsNode.position = serviceScoreUpTipsNodeBeforePos;
            })
            .start();
    }

    /**
     * @description: 仓库格子已满的提示事件回调
     * @return {*}
     */    
    onWareHouseEventTips(tipStr: string) {
        let wareHouseCellIsFullTipsNode = this.node.getChildByName("WareHouseEventTips");
        wareHouseCellIsFullTipsNode.getChildByName("TipsContent").getComponent(Label).string = tipStr;

        let wareHouseCellIsFullTipsNodeBeforePos = wareHouseCellIsFullTipsNode.position;

        wareHouseCellIsFullTipsNode.active = true;

        tween(wareHouseCellIsFullTipsNode)
            .to(0.5, { position: new Vec3(0, 0, 0) })
            .delay(0.5)
            .call(() => {
                wareHouseCellIsFullTipsNode.active = false;
                wareHouseCellIsFullTipsNode.position = wareHouseCellIsFullTipsNodeBeforePos;
            })
            .start();
    }

    /**
     * @description: 研发食物失败的提示事件回调
     * @param {string} tipStr 提示内容
     * @return {*}
     */    
    onFoodDiscoverFail(tipStr: string) {
        let foodDiscoverFailTipsNode = this.node.getChildByName("FoodDiscoverTips");
        foodDiscoverFailTipsNode.getChildByName("TipsContent").getComponent(Label).string = tipStr;

        let foodDiscoverFailTipsNodeBeforePos = foodDiscoverFailTipsNode.position;
        foodDiscoverFailTipsNode.active = true;

        tween(foodDiscoverFailTipsNode)
            .to(0.5, { position: new Vec3(0, 0, 0) })
            .delay(0.5)
            .call(() => {
                foodDiscoverFailTipsNode.active = false;
                foodDiscoverFailTipsNode.position = foodDiscoverFailTipsNodeBeforePos;
            })
            .start();
    }
}


