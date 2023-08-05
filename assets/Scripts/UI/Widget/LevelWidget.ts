/*
 * @Author: Zhong Sheng
 * @Date: 2023-05-06 20:23:55
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-06-13 19:33:21
 * @Description: 等级挂件UI
 */

import { _decorator, log } from 'cc';
import { UIBase } from '../Framework/UIBase';
import { AudioManager } from '../../Runtime/AudioManager';
import { UIManager } from '../Framework/UIManager';
import { UILAYER } from '../Framework/UIDefine';
import { PlayerData } from '../../Runtime/PlayerData';
import { uiPanelOpenSound } from '../../Util/CommonUtil';
const { ccclass, property } = _decorator;

@ccclass('LevelWidget')
export class LevelWidget extends UIBase {
    private _playerLevelData = PlayerData.Instance.getPlayerLevelData();

    private _facilityScoreObj = { facilityScore: this._playerLevelData.facilityScore };
    private _serveScoreObj = { serveScore: this._playerLevelData.serveScore };
    private _foodScoreObj = { foodScore: this._playerLevelData.foodScore };

    onInit(params: any): void {
        log("LevelWidget onInit");

        let facilityScoreLabel = this.getLabel("FacilityScore");
        facilityScoreLabel.string = this._playerLevelData.facilityScore.toString();
        this.bindComponent(this._facilityScoreObj, "facilityScore", facilityScoreLabel);

        let serveScoreLabel = this.getLabel("ServeScore");
        serveScoreLabel.string = this._playerLevelData.serveScore.toString();
        this.bindComponent(this._serveScoreObj, "serveScore", serveScoreLabel);

        let foodScoreLabel = this.getLabel("FoodScore");
        foodScoreLabel.string = this._playerLevelData.foodScore.toString();
        this.bindComponent(this._foodScoreObj, "foodScore", foodScoreLabel);

        // 点击level图标，弹出等级面板
        this.addButtonClick("LevelIcon", () => {
            AudioManager.inst.playOneShot(uiPanelOpenSound);

            log("LevelWidget LevelIcon click");
            UIManager.Instance.openUI("levelPanel", this._playerLevelData, UILAYER.E_PANEL);
        });

        // 点击设施评分图标，弹出店铺面板
        this.addButtonClick("FacilityScoreIcon", () => {
            AudioManager.inst.playOneShot(uiPanelOpenSound);

            log("LevelWidget FacilityScoreIcon click");
            UIManager.Instance.openUI("shopPanel", undefined, UILAYER.E_PANEL);
        });

        // 点击服务评分图标，弹出员工面板
        this.addButtonClick("ServeScoreIcon", () => {
            AudioManager.inst.playOneShot(uiPanelOpenSound);

            log("LevelWidget ServeScoreIcon click");
            UIManager.Instance.openUI("employeePanel", undefined, UILAYER.E_PANEL);
        });
    }

    /**
     * @description: LevelWidget 组件的分数增加方法，别的模块通过跨模块调用的方式调用，从而做到数据的更新
     * @param {number} scoreCount
     * @param {string} scoreType
     * @return {*}
     */
    upgradeScore(scoreCount: number, scoreType: string) {
        switch (scoreType) {
            case "facility":
                this._facilityScoreObj.facilityScore += scoreCount;
                this._playerLevelData.facilityScore += scoreCount;
                break;
            case "serve":
                this._serveScoreObj.serveScore += scoreCount;
                this._playerLevelData.serveScore += scoreCount;
                break;
            case "food":
                this._foodScoreObj.foodScore += scoreCount;
                this._playerLevelData.foodScore += scoreCount;
                break;
            default:
                break;
        }
    }
}
