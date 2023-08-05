/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-06-29 17:18:29
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-07-04 00:37:44
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\UI\Panel\Employee\EmployeePersonalPanel.ts
 * @Description: 
 */
import { _decorator, Color, error, instantiate, Label, log, Node, Prefab, resources, Sprite, SpriteFrame, tween, UIOpacity, Vec3 } from 'cc';
import { UIBase } from '../../Framework/UIBase';
import { AudioManager } from '../../../Runtime/AudioManager';
import { uiPanelCloseSound, uiPanelUnlockSound } from '../../../Util/CommonUtil';
import { PlayerData } from '../../../Runtime/PlayerData';
import { EMPLOYEE_RECRUITMENT_STATES, GAME_AREA, GAME_EVENTS, HALL_ENTITY_ADD } from '../../../Enums/GameEnums';
import EventManager from '../../../Runtime/EventManager';
const { ccclass, property } = _decorator;

@ccclass('EmployeePersonalPanel')
export class EmployeePersonalPanel extends UIBase {
    private _epFigureBasePath: string = "/ImageAndEffect/UI/EmployPanel/FigurePicture/";

    onInit(params: any) {
        log("EmployeePersonalPanel onInit");

        // 添加关闭按钮的点击事件
        this.addButtonClick("CloseBtn", () => {
            AudioManager.inst.playOneShot(uiPanelCloseSound);
            this.closeSelf();
        });
    }

    onEnter(params: any): void {
        log("EmployeePersonalPanel onEnter");
        log(params);

        // 设置员工形象图片
        this.setEpFigure(params[0].figurePicture);

        // 设置员工基本信息
        this.setEpBaseInfo(params[0]);

        // 设置员工管理相关信息，根据玩家员工运行时数据进行判断
        this.setEpManageInfo(params);
    }

    /**
     * @description: 员工形象图片路径
     * @param {string} figurePicture
     * @return {*}
     */
    setEpFigure(figurePicture: string) {
        resources.load(this._epFigureBasePath + figurePicture + "/spriteFrame", SpriteFrame, (err, res) => {
            if (err) {
                error(err);
                return;
            }

            let figurePicNode = this.node.getChildByPath("BaseInfo/FigurePicture");
            figurePicNode.getComponent(Sprite).spriteFrame = res;
        });
    }

    /**
     * @description: 设置员工基础信息数据
     * @param {any} params
     * @return {*}
     */
    setEpBaseInfo(params: any) {
        // 设置员工姓名
        let epNameStr = params.name;
        let epNameTextNode = this.node.getChildByPath("BaseInfo/NameInfo/NameText");
        epNameTextNode.getComponent(Label).string = epNameStr;

        // 设置员工人物描述
        let epDescStr = params.description;
        let epDescTextNode = this.node.getChildByPath("BaseInfo/IntroText");
        epDescTextNode.getComponent(Label).string = epDescStr;

        // 设置员工工作内容
        let epWorkContent = params.workContent;
        let epWorkContentNode = this.node.getChildByPath("WorkContent/ContentDetail");
        epWorkContentNode.getComponent(Label).string = epWorkContent;

        // 设置员工服务评分和下一等级评分
        let epServiceScore = params.serviceScore;
        let epNextServiceScore = params.serviceScoreNextLevel;
        let epServiceScoreTxtNode = this.node.getChildByPath("EmployeeAttribute/ServiceScoreInfo/ServiceScoreValue");
        let epServiceScoreNextTxtNode = this.node.getChildByPath("EmployeeAttribute/ServiceScoreNextLevelInfo/NextValue");
        epServiceScoreTxtNode.getComponent(Label).string = epServiceScore;
        epServiceScoreNextTxtNode.getComponent(Label).string = epNextServiceScore;

        // 设置员工相关属性
        let epWorkEfficiency = params.attr.workEfficiency;
        let epWalkSpeed = params.attr.walkSpeed;
        let epSpecialSkill = params.attr.specialSkill;
        let epWorkEfficiencyTxtNode = this.node.getChildByPath("EmployeeAttribute/AttributeDetail/WorkEfficiencyValue");
        let epWalkSpeedTxtNode = this.node.getChildByPath("EmployeeAttribute/AttributeDetail/WalkSpeedValue");
        let epSpecialSkillTxtNode = this.node.getChildByPath("EmployeeAttribute/AttributeDetail/SpecialSkillValue");
        epWorkEfficiencyTxtNode.getComponent(Label).string = epWorkEfficiency;
        epWalkSpeedTxtNode.getComponent(Label).string = epWalkSpeed;
        epSpecialSkillTxtNode.getComponent(Label).string = epSpecialSkill;
    }

    /**
     * @description: 设置员工管理相关信息，demo版本这里暂时不判断所选的区域，只设置了餐厅区域的员工
     * @param {any} params
     * @return {*}
     */
    setEpManageInfo(params: any) {
        log("setEpManageInfo");
        log(params);

        let hallPlayerEpData = PlayerData.Instance.getAllPlayerEmployeeData()
            .find((oneAreaEpData: any) => oneAreaEpData.Area === GAME_AREA.HALL);

        let epItemsData = hallPlayerEpData.Items.find((oneEpItemData: any) => oneEpItemData.ItemType === params[1]);
        let epSubItemData = epItemsData.SubItems.find((oneEpSubItemData: any) => oneEpSubItemData.SubItemId === params[0].id);
        let epStatus = epSubItemData.Status;
        if (epStatus === EMPLOYEE_RECRUITMENT_STATES.UNRECRUITED) {
            // 员工的等级节点隐藏
            let epPersonalPanelLevelNode = this.node.getChildByPath("EmployeeAttribute/EmployeeLevel");
            epPersonalPanelLevelNode.active = false;

            let hireEpPrice = params[0].hireCost;
            let hireEpLevel = params[0].hireLevel;

            // 员工未招聘的情况，显示招聘按钮，关闭培训按钮
            let epManagerNode = this.node.getChildByName("EmployeeManage");
            let hireEpNode = epManagerNode.getChildByName("HireEmployee");
            let epTrainNode = epManagerNode.getChildByName("EmployeeTraining");
            epTrainNode.active = false;

            this.setHireEpInfo(hireEpNode, hireEpPrice);
            hireEpNode.active = true;
            
            this.onHireEpButtonClicked(hireEpNode, hireEpPrice, hireEpLevel, params[0], params[1]);
        } else if (epStatus === EMPLOYEE_RECRUITMENT_STATES.RECRUITED) {
            // 员工的等级节点显示，并根据等级，设置等级相关的标志
            let epPersonalPanelLevelNode = this.node.getChildByPath("EmployeeAttribute/EmployeeLevel");
            let epLevel = epSubItemData.Level;
            epPersonalPanelLevelNode.active = true;

            // 员工已招聘的情况，显示培训按钮，关闭招聘按钮
            let epManagerNode = this.node.getChildByName("EmployeeManage");
            let hireEpNode = epManagerNode.getChildByName("HireEmployee");
            let epTrainNode = epManagerNode.getChildByName("EmployeeTraining");
            epTrainNode.active = true;
            hireEpNode.active = false;

            resources.load("ImageAndEffect/UI/EmployPanel/EpLevel/LevelStar/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    error(err);
                }

                if (epLevel == 1) {
                    epPersonalPanelLevelNode.getChildByName("LevelStar1").getComponent(Sprite).spriteFrame = spriteFrame;
                } else if (epLevel == 2) {
                    epPersonalPanelLevelNode.getChildByName("LevelStar1").getComponent(Sprite).spriteFrame = spriteFrame;
                    epPersonalPanelLevelNode.getChildByName("LevelStar2").getComponent(Sprite).spriteFrame = spriteFrame;
                } else if (epLevel == 3) {
                    epPersonalPanelLevelNode.getChildByName("LevelStar1").getComponent(Sprite).spriteFrame = spriteFrame;
                    epPersonalPanelLevelNode.getChildByName("LevelStar2").getComponent(Sprite).spriteFrame = spriteFrame;
                    epPersonalPanelLevelNode.getChildByName("LevelStar3").getComponent(Sprite).spriteFrame = spriteFrame;
                }
            });

            //TODO: 培训按钮点击事件
            this.onTrainEpButtonClicked();
        }
    }

    /**
     * @description: 招聘按钮点击事件
     * @param {Node} hireEpNode 招聘按钮节点
     * @param {number} hireEpPrice 招聘价格
     * @param {number} hireEpLevel 招聘等级
     * @param {any} epConfigData 员工配置数据
     * @param {any} epItemType 员工类型
     * @return {*}
     */
    onHireEpButtonClicked(hireEpNode: Node, hireEpPrice: number, hireEpLevel: number, epConfigData: any, epItemType: any) {
        hireEpNode.getChildByName("HireButton").on(Node.EventType.TOUCH_START, () => {
            // 玩家等级不够，无法招聘
            let playerLevel = PlayerData.Instance.getPlayerLevelData();
            if (playerLevel.levelNum < hireEpLevel) {
                this.showHireTips("等级不足，无法招聘");
                return;
            } else if (playerLevel.levelNum == hireEpLevel) {
                // 判断玩家当前金币是否足够招聘，不够的话，弹出提示
                let playerCash = PlayerData.Instance.getCash();
                if (playerCash < hireEpPrice) {
                    this.showHireTips("金币不足，无法招聘");
                    return;
                } else {
                    // 玩家等级和金币都满足条件，可以招聘
                    // 修改玩家员工数据里招聘了的员工招聘状态
                    PlayerData.Instance.setPlayerEmployeeIsHired(GAME_AREA.HALL, epItemType, epConfigData.id, 
                        EMPLOYEE_RECRUITMENT_STATES.RECRUITED);
                    
                    // 关闭面板
                    this.closeUI("employeePersonalPanel");
                    this.closeUI("employeePanel");
                    // 服务分数值增加
                    this.sendMsg("levelWidget", "upgradeScore", epConfigData.serviceScore, "serve");
                    AudioManager.inst.playOneShot(uiPanelUnlockSound);
                    
                    // 通知相关提示发生
                    EventManager.Instance.emit(GAME_EVENTS.SERVICE_SCORE_UP, epConfigData.serviceScore);
                    // 通知大厅生成员工
                    EventManager.Instance.emit(HALL_ENTITY_ADD.ADD_EP, epConfigData, epItemType);
                }
            }
        });
    }

    /**
     * @description: 员工培训的事件
     * @return {*}
     */    
    onTrainEpButtonClicked() {

    }

    /**
     * @description: 设置招聘员工的相关信息
     * @param {Node} hireEpNode
     * @param {any} hireEpPrice
     * @return {*}
     */
    setHireEpInfo(hireEpNode: Node, hireEpPrice: any) {
        let hireEpPriceTxtNode = hireEpNode.getChildByPath("HireCostInfo/CostNum");

        // 判断玩家当前金币是否足够招聘，不够的话，显示红色字体
        let playerCash = PlayerData.Instance.getCash();
        if (playerCash < hireEpPrice) {
            hireEpPriceTxtNode.getComponent(Label).color = Color.RED;
        }

        hireEpPriceTxtNode.getComponent(Label).string = hireEpPrice;
    }

    /**
     * @description: 显示招聘相关提示
     * @param {string} tipStr
     * @return {*}
     */
    showHireTips(tipStr: string) {
        resources.load("Prefabs/UI/Tips/HireEpTips", Prefab, (err, tipsPrefab) => {
            if (err) {
                error(err);
                return;
            }

            let tipsNode = instantiate(tipsPrefab);
            tipsNode.getChildByName("TipsContent").getComponent(Label).string = tipStr;
            this.node.parent.parent.getChildByName("GameTips").addChild(tipsNode);
            tween(tipsNode)
                .to(0.5, { position: new Vec3(0, 0, 0) })
                .delay(0.5)
                .call(() => {
                    tipsNode.destroy();
                })
                .start();
        });
    }
}


