/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-06-13 17:59:01
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-07-03 23:43:18
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\UI\Panel\Employee\EmployeePanel.ts
 * @Description: 员工面板
 */
import { _decorator, Button, Color, error, EventTouch, instantiate, Label, log, Node, Prefab, resources, Sprite, SpriteFrame } from 'cc';
import { UIBase } from '../../Framework/UIBase';
import { AudioManager } from '../../../Runtime/AudioManager';
import { uiPanelCloseSound, uiShopPanelClickSound } from '../../../Util/CommonUtil';
import { EmployeeInfoData } from '../../../Runtime/EmployeeInfoData';
import { EMPLOYEE_PANEL_TYPE, EMPLOYEE_RECRUITMENT_STATES, GAME_AREA } from '../../../Enums/GameEnums';
import { PlayerData } from '../../../Runtime/PlayerData';
import { ScrollViewUtilComp } from '../../Utils/ScrollViewUtilComp';
import { UILAYER } from '../../Framework/UIDefine';
const { ccclass, property } = _decorator;

@ccclass('EmployPanel')
export class EmployPanel extends UIBase {
    private _baseAvatarResPath: string = "ImageAndEffect/UI/EmployPanel/Avatar";
    private _baseSkeletonResPath: string = "/Skele/Employee";
    private _baseFigurePictureResPath: string = "/ImageAndEffect/UI/EmployPanel/FigurePicture";

    private _currentChooseArea: GAME_AREA = GAME_AREA.HALL;
    private _currentChooseEpType: EMPLOYEE_PANEL_TYPE = EMPLOYEE_PANEL_TYPE.WAITER;

    private _allEpConfigData: any = null;
    private _allPlayerEpData: any = null;

    onInit(params: any): void {
        log("EmployPanel onInit");

        // 添加关闭按钮的点击事件
        this.addButtonClick("CloseBtn", () => {
            AudioManager.inst.playOneShot(uiPanelCloseSound);
            this.closeSelf();
        });

        // 刚开始加载面板的时候，服务员类型按钮默认选中，餐厅区域按钮默认选中
        for (let [key, button] of this.getButtonMap()) {
            if (key == "WaiterBg") {
                resources.load("/ImageAndEffect/UI/EmployPanel/TypeTitle/T_UI_Personnel_book_09/spriteFrame", SpriteFrame,
                    (err, spriteFrame) => {
                        if (err) {
                            error(err);
                        }
                        button.getComponent(Sprite).spriteFrame = spriteFrame;
                    });
            }

            if (key == "DiningRoomBg") {
                resources.load("/ImageAndEffect/UI/EmployPanel/AreaTitle/T_UI_Personnel_book_03/spriteFrame", SpriteFrame,
                    (err, spriteFrame) => {
                        if (err) {
                            error(err);
                        }
                        button.getComponent(Sprite).spriteFrame = spriteFrame;
                    });
                button.node.parent.getChildByName("Text").getComponent(Label).color = new Color(95, 83, 36);
            }
        }

        // 拿到所有员工的配置数据
        this._allEpConfigData = EmployeeInfoData.Instance.getAllEmployeeInfoData();
        // 拿到玩家的员工数据，包括玩家是否解锁员工、玩家解锁的员工等级相关数据等等
        this._allPlayerEpData = PlayerData.Instance.getAllPlayerEmployeeData();

        this.showScrowllView(this._allEpConfigData, this._allPlayerEpData);
    }

    onEnter(params: any): void {
        this.showScrowllView(this._allEpConfigData, this._allPlayerEpData);
    }

    /**
     * @description: 显示滚动视图
     * @param {any} oneAreaEpConfigData
     * @param {any} oneAreaPlayerEpData
     * @return {*}
     */
    showScrowllView(allEpConfigData: any, allPlayerEpData: any): void {
        // 检查是否已经有 ScrollViewVertical 节点，如果有，就先删除
        let scrollViewVerticalNode = this.node.getChildByName("EmployeeDetail").getChildByName("ScrowllViewVertical");
        if (scrollViewVerticalNode) {
            scrollViewVerticalNode.destroy();
        }

        resources.load("Prefabs/UI/Panel/Employee/ScrowllViewVertical", Prefab, (err, itemVertical) => {
            if (err) {
                error(err);
            }

            // 获取当前区域的员工配置数据
            let currentChooseAreaEpConfig = allEpConfigData.find((oneItem: any) => oneItem.Area === this._currentChooseArea);
            // 获取当前选择的员工类型的员工配置数据
            let currentChooseEpConfig = currentChooseAreaEpConfig.Items.find((oneItem: any) => oneItem.Type === this._currentChooseEpType);

            // 获取当前选择的员工类型的玩家员工运行时数据
            let currentChooseAreaEpRuntimeData = allPlayerEpData.find((oneItem: any) => oneItem.Area === this._currentChooseArea);
            let currentChooseEpRuntimeData = currentChooseAreaEpRuntimeData.Items.find((oneItem: any) => oneItem.ItemType === this._currentChooseEpType);

            let scrollViewVertical = instantiate(itemVertical);
            this.node.getChildByName("EmployeeDetail").addChild(scrollViewVertical);

            let scrollViewVerticalUtilComp = scrollViewVertical.getComponent(ScrollViewUtilComp);
            scrollViewVerticalUtilComp.setView(currentChooseEpConfig.Employees, (n: Node, dataItem: any, index: number) => {
                // 设置员工头像
                let avatarNode = n.getChildByName("Avatar").getChildByName("AvatarPic");
                if (avatarNode) {
                    let avatarPath = this._baseAvatarResPath + "/" + dataItem.avatarResName + "/spriteFrame";
                    resources.load(avatarPath, SpriteFrame, (err, avatarPic) => {
                        if (err) {
                            error(err);
                        }
                        avatarNode.getComponent(Sprite).spriteFrame = avatarPic;
                    });

                    // 添加头像点击事件
                    avatarNode.on(Node.EventType.TOUCH_START, () => {
                        log("avatarNode click");
                        AudioManager.inst.playOneShot(uiShopPanelClickSound);
                        this.openUI("employeePersonalPanel", [dataItem, this._currentChooseEpType], UILAYER.E_PANEL);
                    });
                }

                // 设置员工名字
                let nameNode = n.getChildByName("DetailContent").getChildByName("NameContent").getChildByName("NameText");
                nameNode.getComponent(Label).string = dataItem.name;

                // 设置员工的招聘状态
                let recruitStateNode = n.getChildByPath("DetailContent/EmployeeStatus");
                let currentEpRuntimeData = currentChooseEpRuntimeData.SubItems.find((oneItem: any) => oneItem.SubItemId === dataItem.id);
                if (currentEpRuntimeData) {
                    let epCurrentRecState = currentEpRuntimeData.Status;
                    if (epCurrentRecState === EMPLOYEE_RECRUITMENT_STATES.RECRUITED) {
                        recruitStateNode.active = false;

                        // 获取员工当前等级，设置等级标志
                        let epCurrentLevel = currentEpRuntimeData.Level;
                        let epLevelNode = n.getChildByPath("DetailContent/EmployeeLevel");
                        epLevelNode.active = true;

                        resources.load("ImageAndEffect/UI/EmployPanel/EpLevel/LevelStar/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                            if (err) {
                                error(err);
                            }

                            if (epCurrentLevel == 1) {
                                epLevelNode.getChildByName("levelStar_1").getComponent(Sprite).spriteFrame = spriteFrame;
                            } else if (epCurrentLevel == 2) {
                                epLevelNode.getChildByName("levelStar_1").getComponent(Sprite).spriteFrame = spriteFrame;
                                epLevelNode.getChildByName("levelStar_2").getComponent(Sprite).spriteFrame = spriteFrame;
                            } else if (epCurrentLevel == 3) {
                                epLevelNode.getChildByName("levelStar_1").getComponent(Sprite).spriteFrame = spriteFrame;
                                epLevelNode.getChildByName("levelStar_2").getComponent(Sprite).spriteFrame = spriteFrame;
                                epLevelNode.getChildByName("levelStar_3").getComponent(Sprite).spriteFrame = spriteFrame;
                            }
                        });
                    } else {
                        recruitStateNode.active = true;
                    }
                }

                // 设置员工描述
                let descNode = n.getChildByName("DetailContent").getChildByName("Description").getChildByName("JobContentDesc")
                    .getChildByName("DescValue");
                descNode.getComponent(Label).string = dataItem.workContent;

                // 设置 serviceScore
                let serviceScoreNode = n.getChildByName("DetailContent").getChildByName("Description").getChildByName("ServeScoreDesc")
                    .getChildByName("DescValue");
                serviceScoreNode.getComponent(Label).string = dataItem.serviceScore.toString();

                // 设置员工标签文本
                let areaTagTextNode = n.getChildByName("DetailContent").getChildByName("Description").getChildByName("OtherDesc")
                    .getChildByName("AreaDesc").getChildByName("AreaText");
                let epTypeTagTextNode = n.getChildByName("DetailContent").getChildByName("Description").getChildByName("OtherDesc")
                    .getChildByName("EmployTypeDesc").getChildByName("TypeText");
                let tagText = dataItem.tag;
                let tagTextArr = tagText.split(",");
                areaTagTextNode.getComponent(Label).string = tagTextArr[0];
                epTypeTagTextNode.getComponent(Label).string = tagTextArr[1];
            });
        });
    }

    /**
     * @description: 点击员工类型标题事件
     * @param {*} event
     * @return {*}
     */
    onTypeTitleClick(event: EventTouch): void {
        // 播放音效
        AudioManager.inst.playOneShot(uiShopPanelClickSound);

        let currentTypeTitleName = event.currentTarget.name;
        if (currentTypeTitleName == "WaiterBg") {
            this._currentChooseEpType = EMPLOYEE_PANEL_TYPE.WAITER;
        } else if (currentTypeTitleName == "CashierBg") {
            this._currentChooseEpType = EMPLOYEE_PANEL_TYPE.CASHIER;
        } else if (currentTypeTitleName == "PanelistBg") {
            this._currentChooseEpType = EMPLOYEE_PANEL_TYPE.PANELIST;
        } else if (currentTypeTitleName == "ChefBg") {
            this._currentChooseEpType = EMPLOYEE_PANEL_TYPE.CHEF;
        } else {
            this._currentChooseEpType = EMPLOYEE_PANEL_TYPE.WELCOMESTAFF;
        }

        // 修改类型标题的精灵图片
        for (let [key, button] of this.getButtonMap()) {
            if (key == currentTypeTitleName) {
                resources.load("/ImageAndEffect/UI/EmployPanel/TypeTitle/T_UI_Personnel_book_09/spriteFrame", SpriteFrame,
                    (err, spriteFrame) => {
                        if (err) {
                            error(err);
                        }
                        event.currentTarget.getComponent(Sprite).spriteFrame = spriteFrame;
                    });
            } else {
                if (key == "WaiterBg" || key == "CashierBg" || key == "PanelistBg" || key == "ChefBg" || key == "MeetingBg") {
                    resources.load("/ImageAndEffect/UI/EmployPanel/TypeTitle/T_UI_Personnel_book_08/spriteFrame", SpriteFrame,
                        (err, spriteFrame) => {
                            if (err) {
                                error(err);
                            }
                            button.getComponent(Sprite).spriteFrame = spriteFrame;
                        });
                }
            }
        }

        this.showScrowllView(this._allEpConfigData, this._allPlayerEpData);
    }

    /**
     * @description: 点击区域选择按钮事件
     * @param {EventTouch} event
     * @return {*}
     */
    onAreaChooseBtnClick(event: EventTouch): void {
        let currentAreaChooseBtnName = event.currentTarget.name;
        if (currentAreaChooseBtnName == "DiningRoomBg") {
            this._currentChooseArea = GAME_AREA.HALL;
        } else if (currentAreaChooseBtnName == "SelfServiceHallBg") {
            this._currentChooseArea = GAME_AREA.SELF_SERVICE;
        } else if (currentAreaChooseBtnName == "ActorBg") {
            this._currentChooseArea = GAME_AREA.HALL;
        }

        // 修改区域选择按钮的精灵图片
        for (let [key, button] of this.getButtonMap()) {
            if (key == currentAreaChooseBtnName) {
                resources.load("/ImageAndEffect/UI/EmployPanel/AreaTitle/T_UI_Personnel_book_03/spriteFrame", SpriteFrame,
                    (err, spriteFrame) => {
                        if (err) {
                            error(err);
                        }
                        event.currentTarget.getComponent(Sprite).spriteFrame = spriteFrame;
                    });

                // 字体颜色需要进行修改
                button.node.parent.getChildByName("Text").getComponent(Label).color = new Color(95, 83, 36);
            } else {
                if (key == "DiningRoomBg") {
                    this.notChooseArea("T_UI_Personnel_book_02b", button);
                } else if (key == "SelfServiceHallBg") {
                    this.notChooseArea("T_UI_Personnel_book_02a", button);
                } else if (key == "ActorBg") {
                    this.notChooseArea("T_UI_Personnel_book_02", button);
                }
            }
        }

        this.showScrowllView(this._allEpConfigData, this._allPlayerEpData);
    }

    notChooseArea(spirteFrameName: string, button: Button): void {
        resources.load("/ImageAndEffect/UI/EmployPanel/AreaTitle/" + spirteFrameName + "/spriteFrame", SpriteFrame,
            (err, spriteFrame) => {
                if (err) {
                    error(err);
                }
                button.getComponent(Sprite).spriteFrame = spriteFrame;
            });
        button.node.parent.getChildByName("Text").getComponent(Label).color = new Color(255, 255, 255);
    }
}


