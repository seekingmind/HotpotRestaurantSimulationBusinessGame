/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-07-13 16:37:07
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-07-13 23:29:36
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\UI\Panel\Menu\MenuDetailPanel.ts
 * @Description: 菜单详情面板
 */
import { _decorator, Component, error, EventTouch, instantiate, Label, log, Node, Prefab, resources, Sprite, SpriteFrame, tween, UITransform, Vec3 } from 'cc';
import { UIBase } from '../../Framework/UIBase';
import { AudioManager } from '../../../Runtime/AudioManager';
import { uiPanelCloseSound, uiPanelUnlockSound } from '../../../Util/CommonUtil';
import { DISHES_TYPE, GAME_EVENTS, MENU_PANEL_TYPE } from '../../../Enums/GameEnums';
import { PlayerData } from '../../../Runtime/PlayerData';
import EventManager from '../../../Runtime/EventManager';
const { ccclass, property } = _decorator;

@ccclass('MenuDetailPanel')
export class MenuDetailPanel extends UIBase {
    private _mainPicPathBase: string = "ImageAndEffect/UI/MenuPanel/ItemPic/"

    private _currentMenuConfigData: any = null;  // 当前菜单的配置数据
    private _currentPlayerMenuData: any = null;  // 当前玩家的菜单数据
    private _currentMenuType: any = null;  // 当前菜单的类型
    private _currentMenuSubType: any = null;  // 当前菜单的子类型

    onInit(params: any): void {
        log("MenuDetailPanel onInit");

        this.addButtonClick("CloseBtn", () => {
            AudioManager.inst.playOneShot(uiPanelCloseSound);
            this.closeSelf();
        });
    }

    onEnter(params: any): void {
        log("MenuDetailPanel onEnter");
        log(params);

        this._currentMenuConfigData = params.dataItem;
        this._currentPlayerMenuData = params.findPlayerMenuData;
        this._currentMenuType = params.menuType;
        this._currentMenuSubType = params.menuSubType;

        this.setParams(params);
    }

    /**
     * @description: 将透传过来的数据进行赋值等处理
     * @param {any} params 要处理的数据
     * @return {*}
     */
    setParams(params: any): void {
        // 设置菜单名称
        this.node.getChildByPath("BaseInfo/NameInfo/NameText").getComponent(Label).string = this._currentMenuConfigData.ItemName;

        // 设置菜单的描述
        this.node.getChildByPath("BaseInfo/Descript").getComponent(Label).string = this._currentMenuConfigData.ItemDesc;

        // 设置菜单的头像图片
        this.setMainPic(this._currentMenuConfigData.ItemUIIconImgName, this._currentMenuType, this._currentMenuSubType);

        // 设置菜单的属性
        this.setMenuProperty(this._currentMenuConfigData, this._currentPlayerMenuData);
    }

    /**
     * @description: 设置菜单的头像图片
     * @param {string} picName
     * @param {any} menuType
     * @param {any} menuSubType
     * @return {*}
     */
    setMainPic(picName: string, menuType: any, menuSubType: any): void {
        let mainPicResPath = "";
        switch (menuType) {
            case MENU_PANEL_TYPE.HOTPOT_SOUP:
                mainPicResPath = this._mainPicPathBase + "Hotpots/UI_Icon_Hotpots/" + picName + "/spriteFrame";
                break;
            case MENU_PANEL_TYPE.DISHES:
                mainPicResPath = this._mainPicPathBase + "Dishes/UI_Icon_Dishes/" + picName + "/spriteFrame";
                break;
            case MENU_PANEL_TYPE.DIPPING_SAUCE:
                mainPicResPath = this._mainPicPathBase + "Dipes/UI_Icon_Dips/" + picName + "/spriteFrame";
                break;
        }
        resources.load(mainPicResPath, SpriteFrame, (err, spriteFrame) => {
            if (err) {
                error(err);
            }

            // if (menuSubType === DISHES_TYPE.DRINKS) {
            //     // 饮料的图片需要重新设置一下大小
            //     this.node.getChildByPath("BaseInfo/DetailMainPic/MainPic").getComponent(UITransform).setContentSize(90, 150);
            // }
            this.node.getChildByPath("BaseInfo/DetailMainPic/MainPic").getComponent(Sprite).spriteFrame = spriteFrame;
        });
    }

    /**
     * @description: 设置菜单的属性
     * @param {any} menuConfigData 菜单配置数据
     * @param {any} playerMenuData 玩家菜单数据
     * @return {*}
     */
    setMenuProperty(menuConfigData: any, playerMenuData: any): void {
        let menuCurrentLevel = playerMenuData.ItemLevel;

        // 根据当前菜品等级，设置菜品详情页面的菜品等级星星的显示
        let scoreStarsNode: Node = this.node.getChildByPath("MenuAttributes/MenuFoodScore/ScoreStars");
        for (let i = 0; i < menuCurrentLevel; i++) {
            let oneStarNode = scoreStarsNode.children[i];
            resources.load("ImageAndEffect/UI/EmployPanel/EpLevel/LevelStar/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    error(err);
                }
                oneStarNode.getComponent(Sprite).spriteFrame = spriteFrame;
            });
        }

        // 设置菜品成本
        this.node.getChildByPath("MenuAttributes/MenuCost/CostValue").getComponent(Label).string = menuConfigData.ItemCost;

        // 设置销量
        this.node.getChildByPath("MenuAttributes/SaleCount/SaleCountValue").getComponent(Label).string = playerMenuData.ItemSaleCount + "份";

        // 设置售价
        let menuCurrentPrice = menuConfigData.ItemPrice.find((oneItem: any) => oneItem.level == menuCurrentLevel).price;
        let menuNextPrice = 0;
        this.node.getChildByPath("MenuAttributes/SalePrice/PriceValueNow").getComponent(Label).string = menuCurrentPrice.toString();
        if (menuCurrentLevel == menuConfigData.ItemPrice.length) {
            // 如果当前菜品等级已经是最高等级了，那么下一级的价格就是当前价格
            menuNextPrice = menuCurrentPrice;
            this.node.getChildByPath("MenuAttributes/SalePrice/PriceValueNext").getComponent(Label).string = menuCurrentPrice.toString();
        } else {
            menuNextPrice = menuConfigData.ItemPrice.find((oneItem: any) => oneItem.level == menuCurrentLevel + 1).price;
            this.node.getChildByPath("MenuAttributes/SalePrice/PriceValueNext").getComponent(Label).string = menuNextPrice.toString();
        }

        // 设置菜品评分
        let menuCurrentScore = menuConfigData.ItemFoodScore.find((oneItem: any) => oneItem.level == menuCurrentLevel).score;
        let menuNextScore = 0;
        this.node.getChildByPath("MenuAttributes/MenuScore/ScoreValueNow").getComponent(Label).string = menuCurrentScore.toString();
        if (menuCurrentLevel == menuConfigData.ItemFoodScore.length) {
            // 如果当前菜品等级已经是最高等级了，那么下一级的评分就是当前评分
            menuNextScore = menuCurrentScore;
            this.node.getChildByPath("MenuAttributes/MenuScore/ScoreValueNext").getComponent(Label).string = menuCurrentScore.toString();
        } else {
            menuNextScore = menuConfigData.ItemFoodScore.find((oneItem: any) => oneItem.level == menuCurrentLevel + 1).score;
            this.node.getChildByPath("MenuAttributes/MenuScore/ScoreValueNext").getComponent(Label).string = menuNextScore.toString();
        }

        // 设置升级所需的金币数
        let menuUpgradeNeedGold = 0;
        if (menuCurrentLevel == menuConfigData.ItemUpgradeCost.length) {
            // 已经是最高等级了，不用显示升级按钮
            this.node.getChildByPath("MenuUpgrade/UpgradeButton").active = false;
        } else {
            menuUpgradeNeedGold = menuConfigData.ItemUpgradeCost.find((oneItem: any) => oneItem.level == menuCurrentLevel + 1).cost;
        }
        this.node.getChildByPath("MenuUpgrade/UpgradeButton/UpgradeCostValue").getComponent(Label).string = menuUpgradeNeedGold.toString();
    }

    /**
     * @description: 点击升级按钮
     * @param {EventTouch} event 点击事件
     * @return {*}
     */
    onUpgradeButtonClick(event: EventTouch): void {
        log("onUpgradeButtonClick");

        let playerLevel = PlayerData.Instance.getPlayerLevelData();
        let playerCash = PlayerData.Instance.getCash();

        // 玩家等级是否达到了升级条件
        let playerMenuCurrentLevel = this._currentPlayerMenuData.ItemLevel;
        let menuUpgradeReq = this._currentMenuConfigData.ItemUpgradeRequirement.find((oneItem: any) =>
            oneItem.level == playerMenuCurrentLevel + 1).requirement;
        let upReqLevelNum = menuUpgradeReq.playerLevel;
        if (playerLevel != upReqLevelNum) {
            this.showUpgradeTips("玩家等级不够，不能升级菜品");
            return;
        }

        // 玩家金币是否足够
        let menuUpgradeCost = this._currentMenuConfigData.ItemUpgradeCost.find((oneItem: any) =>
            oneItem.level == playerMenuCurrentLevel + 1).cost;
        if (playerCash < menuUpgradeCost) {
            this.showUpgradeTips("玩家金币不够，不能升级菜品");
            return;
        }

        // 玩家等级和金币都满足条件，可以升级菜品
        // 1. 更新玩家菜品数据里的菜品等级
        PlayerData.Instance.addPlayerMenuItemLevel(this._currentMenuType, this._currentMenuSubType, this._currentPlayerMenuData.ItemId);
        // 2. 玩家的金币数量更新
        // 2.1 数据修改
        PlayerData.Instance.addCash(-menuUpgradeCost);
        // 2.2 ui修改
        this.sendMsg("cashWidget", "minusPlayerCashNum", menuUpgradeCost);
        // 3. 关闭当前面板和父面板
        this.closeSelf();
        this.closeUI("menuPanel");
        // 4. 食品评分更新
        // 4.1 数据修改
        // 下一等级的食品评分数据 - 当前等级的食品评分数据 = 食品评分增加的数据
        let menuNextScore = this._currentMenuConfigData.ItemFoodScore.find((oneItem: any) =>
            oneItem.level == playerMenuCurrentLevel + 1).score;
        let menuCurrentScore = this._currentMenuConfigData.ItemFoodScore.find((oneItem: any) =>
            oneItem.level == playerMenuCurrentLevel).score;
        let menuAddScore = menuNextScore - menuCurrentScore;
        PlayerData.Instance.addPlayerLevelFoodScore(menuAddScore);
        // 4.2 ui修改
        this.sendMsg("levelWidget", "upgradeScore", menuAddScore, "food");
        // 5. 播放关闭面板的音效
        AudioManager.inst.playOneShot(uiPanelUnlockSound);
        // 6. 通知相关提示发生
        EventManager.Instance.emit(GAME_EVENTS.FOOD_SCORE_UP, menuAddScore);
    }

    /**
     * @description: 弹出提示框
     * @param {string} tipStr
     * @return {*}
     */
    showUpgradeTips(tipStr: string) {
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


