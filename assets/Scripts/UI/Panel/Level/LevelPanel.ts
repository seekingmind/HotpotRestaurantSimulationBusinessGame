/*
 * @Author: Zhong Sheng
 * @Date: 2023-05-08 23:00:07
 * @LastEditors: Zhong Sheng
 * @LastEditTime: 2023-05-17 16:25:48
 * @Description: Level面板(Level弹窗)
 */

import { _decorator, instantiate, Label, log, Prefab, resources } from 'cc';
import { UIBase } from '../../Framework/UIBase';
import { AudioManager } from '../../../Runtime/AudioManager';
import { UIManager } from '../../Framework/UIManager';
import { UILAYER } from '../../Framework/UIDefine';
import { PlayerData } from '../../../Runtime/PlayerData';
import { uiPanelCloseSound, uiPanelOpenSound } from '../../../Util/CommonUtil';
const { ccclass, property } = _decorator;

@ccclass('LevelPanel')
export class LevelPanel extends UIBase {

    onInit(params: any): void {
        log("LevelPanel onInit");
        log("LevelPanel params: ", params);

        // 赋值加载好的等级信息到面板上
        this.assignmentLevelInfo(params);

        this.addButtonClick("CloseButton", () => {
            AudioManager.inst.playOneShot(uiPanelCloseSound);
            this.closeSelf();
        });

        this.addButtonClick("FacilityIncreaseButton", () => {
            AudioManager.inst.playOneShot(uiPanelOpenSound);
            UIManager.Instance.openUI("increaseFacilityTipsPanel", undefined, UILAYER.E_PANEL);
        });

        this.addButtonClick("ServeIncreaseButton", () => {
            AudioManager.inst.playOneShot(uiPanelOpenSound);
            UIManager.Instance.openUI("increaseServeTipsPanel", undefined, UILAYER.E_PANEL);
        });

        this.addButtonClick("FoodIncreaseButton", () => {
            AudioManager.inst.playOneShot(uiPanelOpenSound);
            UIManager.Instance.openUI("increaseFoodTipsPanel", undefined, UILAYER.E_PANEL);
        });
    }

    /**
     * @description: 赋值加载好的等级信息到面板上
     * @return {*}
     */
    assignmentLevelInfo(levelData: any) {
        log("LevelPanel assignmentLevelInfo");

        let levelName = levelData.levelName;

        let gameLevelInfo = PlayerData.Instance.getGameLevelInfoByLevelNum(levelData.levelNum);
        let facilityUpgradeTarget = gameLevelInfo.facilityUpgradeTargetScore;
        let serveUpgradeTarget = gameLevelInfo.serveUpgradeTargetScore;
        let foodUpgradeTarget = gameLevelInfo.foodUpgradeTargetScore;
        let levelAttr = gameLevelInfo.levelAttr;

        let levelNameLabel = this.getLabel("LevelName");
        levelNameLabel.string = levelName;

        let facilityScoreNow = this.getLabel("FacilityScoreNow");
        facilityScoreNow.string = levelData.facilityScore.toString() + "/";
        let facilityScoreTarget = this.getLabel("FacilityScoreTarget");
        facilityScoreTarget.string = facilityUpgradeTarget.toString().trim();

        let serveScoreNow = this.getLabel("ServeScoreNow");
        serveScoreNow.string = levelData.serveScore.toString() + "/";
        let serveScoreTarget = this.getLabel("ServeScoreTarget");
        serveScoreTarget.string = serveUpgradeTarget.toString().trim();

        let foodScoreNow = this.getLabel("FoodScoreNow");
        foodScoreNow.string = levelData.foodScore.toString() + "/";
        let foodScoreTarget = this.getLabel("FoodScoreTarget");
        foodScoreTarget.string = foodUpgradeTarget.toString().trim();

        let resAttr = levelAttr.resAttr;
        let resCheckoutRevenue = levelAttr.resCheckoutRevenue;
        let probabilityOfVisitor = levelAttr.probabilityOfVisitor;
        let levelAttrs: any[] = [resAttr, resCheckoutRevenue, probabilityOfVisitor];
        levelAttrs.forEach((oneAttr: any, index: number) => {
            if (oneAttr == "None") {
                log("LevelPanel assignmentLevelInfo levelAttr is None");
                return;
            }
            
            resources.load("Prefabs/UI/Panel/Level/LevelAttributeBar", Prefab, (err, prefab) => {
                if (err) {
                    log("LevelPanel assignmentLevelInfo load prefab err: ", err);
                    return;
                }

                let levelAttrNode = instantiate(prefab);
                let hallAttrCont = levelAttrNode.getChildByName("HallAttributeContent");
                hallAttrCont.getComponent(Label).string = oneAttr;

                if (index > 0) {
                    levelAttrNode.position.set(0, levelAttrNode.position.y - 68, 0);
                }
                this.node.addChild(levelAttrNode);
            });
        });
    }
}


