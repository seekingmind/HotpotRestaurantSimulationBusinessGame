/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-07-11 18:02:38
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-07-13 21:06:53
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\UI\Panel\Menu\MenuPanel.ts
 * @Description: 菜单面板
 */
import { _decorator, Color, Component, error, EventTouch, instantiate, Label, Layout, log, Node, Prefab, resources, Sprite, SpriteFrame, UITransform } from 'cc';
import { UIBase } from '../../Framework/UIBase';
import { AudioManager } from '../../../Runtime/AudioManager';
import { uiPanelCloseSound, uiShopPanelClickSound } from '../../../Util/CommonUtil';
import { DIPPING_SAUCE_TYPE, DISHES_TYPE, HOTPOT_SOUP_TYPE, MENU_PANEL_TYPE } from '../../../Enums/GameEnums';
import { IMenuInfo, IMenuItem, MenuInfoData } from '../../../Runtime/MenuInfoData';
import { PlayerData } from '../../../Runtime/PlayerData';
import { ScrollViewUtilComp } from '../../Utils/ScrollViewUtilComp';
import { UILAYER } from '../../Framework/UIDefine';
const { ccclass, property } = _decorator;

@ccclass('MenuPanel')
export class MenuPanel extends UIBase {
    // 当前所选择的菜单类型
    private _currentMenuType: MENU_PANEL_TYPE = MENU_PANEL_TYPE.HOTPOT_SOUP;
    // 当前所选择的菜单子类型
    private _currentMenuSubType: any = HOTPOT_SOUP_TYPE.HOTPOT_ALL;

    private _prefabPathBase: string = "Prefabs/UI/Panel/Menu/";
    private _mainPicPathBase: string = "ImageAndEffect/UI/MenuPanel/ItemPic/"

    private _hotpotSoupSubTypeMap: Map<HOTPOT_SOUP_TYPE, string> = new Map<HOTPOT_SOUP_TYPE, string>();
    private _dishesSubTypeMap: Map<DISHES_TYPE, string> = new Map<DISHES_TYPE, string>();

    onInit(params: any): void {
        log("MenuPanel onInit");

        // 火锅子类型按钮的名称map设置
        for (let key in HOTPOT_SOUP_TYPE) {
            switch (HOTPOT_SOUP_TYPE[key]) {
                case "CYHG":
                    this._hotpotSoupSubTypeMap.set(HOTPOT_SOUP_TYPE.CYHG, "川渝火锅");
                    break;
                case "BPHG":
                    this._hotpotSoupSubTypeMap.set(HOTPOT_SOUP_TYPE.BPHG, "北派火锅");
                    break;
                case "MNHG":
                    this._hotpotSoupSubTypeMap.set(HOTPOT_SOUP_TYPE.MNHG, "闽南火锅");
                    break;
                case "JZHG":
                    this._hotpotSoupSubTypeMap.set(HOTPOT_SOUP_TYPE.JZHG, "江浙火锅");
                    break;
                case "YGHG":
                    this._hotpotSoupSubTypeMap.set(HOTPOT_SOUP_TYPE.YGHG, "云贵火锅");
                    break;
                case "QTHG":
                    this._hotpotSoupSubTypeMap.set(HOTPOT_SOUP_TYPE.QTHG, "其他火锅");
                    break;
                case "HOTPOT_ALL":
                    break;
                default:
                    break;
            }
        }

        // 小吃子类型按钮的名称map设置
        for (let key in DISHES_TYPE) {
            switch (DISHES_TYPE[key]) {
                case "MEAT_DISHES":
                    this._dishesSubTypeMap.set(DISHES_TYPE.MEAT_DISHES, "荤菜");
                    break;
                case "VEGETABLE_DISHES":
                    this._dishesSubTypeMap.set(DISHES_TYPE.VEGETABLE_DISHES, "素菜");
                    break;
                case "SEA_FOOD_DISHES":
                    this._dishesSubTypeMap.set(DISHES_TYPE.SEA_FOOD_DISHES, "海产品");
                    break;
                case "SNACK_DISHES":
                    this._dishesSubTypeMap.set(DISHES_TYPE.SNACK_DISHES, "小吃");
                    break;
                case "DRINKS":
                    this._dishesSubTypeMap.set(DISHES_TYPE.DRINKS, "饮品");
                    break;
                case "DISHES_ALL":
                    break;
                default:
                    break;
            }
        }

        this.addButtonClick("CloseButton", () => {
            AudioManager.inst.playOneShot(uiPanelCloseSound);
            this.closeSelf();
        });

        // 初始加载的时候，默认选中的菜单类型为锅底类型
        for (let [key, button] of this.getButtonMap()) {
            if (key == "HotpotsoupButton") {
                resources.load("/ImageAndEffect/UI/EmployPanel/TypeTitle/T_UI_Personnel_book_09/spriteFrame", SpriteFrame,
                    (err, spriteFrame) => {
                        if (err) {
                            error(err);
                        }
                        button.getComponent(Sprite).spriteFrame = spriteFrame;
                    });
            }
        }

        // 默认展示
        this.showSubTypeBtns();
        this.showScrowllView();
    }

    onEnter(params: any): void {
        log("MenuPanel onEnter");
    }

    /**
     * @description: 菜单面板展示方法
     * @param {MENU_PANEL_TYPE} menuType 菜单类型，默认为 MENU_PANEL_TYPE.HOTPOT_SOUP
     * @param {any} menuSubType 菜单的子类型，默认为 HOTPOT_SOUP_TYPE.ALL
     * @return {*}
     */
    showScrowllView(menuType: MENU_PANEL_TYPE = MENU_PANEL_TYPE.HOTPOT_SOUP, menuSubType: any = HOTPOT_SOUP_TYPE.HOTPOT_ALL): void {
        let typeDetailVerticalNode = this.node.getChildByPath("MenuType/TypeDetail/TypeDetailVertical");
        if (typeDetailVerticalNode) {
            typeDetailVerticalNode.destroy();
        }

        resources.load(this._prefabPathBase + "TypeDetailVertical", Prefab, (err, typeDetailVertical: Prefab) => {
            if (err) {
                error(err);
                return;
            }

            // 配置数据和玩家数据
            let chooseConfigData = MenuInfoData.Instance.getMenuDataByMenuTypeAndMenuSubType(menuType, menuSubType);
            let choosePlayerData = PlayerData.Instance.getPlayerMenuDataByMenuTypeAndSubType(menuType, menuSubType);
            log("chooseConfigData: ", chooseConfigData);
            log("choosePlayerData: ", choosePlayerData);

            let typeDetailVerticalNode: Node = instantiate(typeDetailVertical);
            this.node.getChildByPath("MenuType/TypeDetail").addChild(typeDetailVerticalNode);

            let scrollViewVerticalUtilComp = typeDetailVerticalNode.getComponent(ScrollViewUtilComp);
            log("scrollViewVerticalUtilComp: ", scrollViewVerticalUtilComp);
            scrollViewVerticalUtilComp.setView(chooseConfigData, (n: Node, dataItem: any, index: number) => {
                log("dataItem: ", dataItem);
                log("index: ", index);
                log("n: ", n);

                // 通过配置数据，找到对应的玩家数据
                let itemId = dataItem.ItemId;
                let findPlayerMenuData = choosePlayerData.find((oneItem: any) => oneItem.ItemId == itemId);
                log("findPlayerMenuData: ", findPlayerMenuData);

                // 菜品是否解锁
                let isLocking = findPlayerMenuData.ItemLocked;

                if (!isLocking) {  // 菜品已解锁
                    // 设置菜品主图
                    let mainPicResPath = "";
                    switch (menuType) {
                        case MENU_PANEL_TYPE.HOTPOT_SOUP:
                            mainPicResPath = this._mainPicPathBase + "Hotpots/UI_Icon_Hotpots/" + dataItem.ItemUIIconImgName + "/spriteFrame";
                            break;
                        case MENU_PANEL_TYPE.DISHES:
                            mainPicResPath = this._mainPicPathBase + "Dishes/UI_Icon_Dishes/" + dataItem.ItemUIIconImgName + "/spriteFrame";
                            break;
                        case MENU_PANEL_TYPE.DIPPING_SAUCE:
                            mainPicResPath = this._mainPicPathBase + "Dipes/UI_Icon_Dips/" + dataItem.ItemUIIconImgName + "/spriteFrame";
                            break;
                    }
                    resources.load(mainPicResPath, SpriteFrame, (err, spriteFrame) => {
                        if (err) {
                            error(err);
                        }

                        if (menuSubType === DISHES_TYPE.DRINKS) {
                            // 饮料的图片需要重新设置一下大小
                            n.getChildByName("MainPic").getComponent(UITransform).setContentSize(90, 150);
                        }
                        n.getChildByName("MainPic").getComponent(Sprite).spriteFrame = spriteFrame;

                        // 给菜品主图添加点击事件
                        n.getChildByName("MainPic").on(Node.EventType.TOUCH_END, () => {
                            // 播放音效
                            AudioManager.inst.playOneShot(uiShopPanelClickSound);

                            // 打开菜单详情面板
                            this.openUI("menuDetailPanel", {
                                "dataItem": dataItem, "findPlayerMenuData": findPlayerMenuData,
                                "menuType": menuType, "menuSubType": menuSubType
                            },
                                UILAYER.E_PANEL);
                        });
                    });

                    // 设置菜品名称
                    n.getChildByName("itemTitle").getComponent(Label).string = dataItem.ItemName;

                    // 设置菜品的等级星星，根据玩家菜单数据里的当前等级来设置
                    let itemLevel = findPlayerMenuData.ItemLevel;
                    let itemLevelStarsNode = n.getChildByName("itemLevelStars");
                    for (let i = 0; i < itemLevel; i++) {
                        let oneStarNode = itemLevelStarsNode.children[i];
                        resources.load("ImageAndEffect/UI/EmployPanel/EpLevel/LevelStar/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                            if (err) {
                                error(err);
                            }
                            oneStarNode.getComponent(Sprite).spriteFrame = spriteFrame;
                        });
                    }

                    // 设置历史销量
                    n.getChildByPath("itemHistorySaleCount/saleCountValue").getComponent(Label).string =
                        findPlayerMenuData.ItemSaleCount.toString();

                    // 设置查看详情的点击事件
                    n.getChildByName("checkItemDetailBtn").on(Node.EventType.TOUCH_END, () => {
                        // 播放音效
                        AudioManager.inst.playOneShot(uiShopPanelClickSound);

                        // 打开菜单详情面板
                        this.openUI("menuDetailPanel", {
                            "dataItem": dataItem, "findPlayerMenuData": findPlayerMenuData,
                            "menuType": menuType, "menuSubType": menuSubType
                        },
                            UILAYER.E_PANEL);
                    });
                } else {  // 菜品未解锁
                    // 设置菜品主图
                    let mainPicResPath = "ImageAndEffect/UI/MenuPanel/UnkownPic/spriteFrame";
                    resources.load(mainPicResPath, SpriteFrame, (err, spriteFrame) => {
                        if (err) {
                            error(err);
                        }
                        n.getChildByName("MainPic").getComponent(UITransform).setContentSize(170, 170);
                        n.getChildByName("MainPic").getComponent(Sprite).spriteFrame = spriteFrame;
                    });

                    // 设置菜品名称
                    n.getChildByName("itemTitle").getComponent(Label).string = "？ ？ ？ ？";

                    // 将表示等级的节点隐藏
                    n.getChildByName("itemLevelStars").active = false;

                    // 将历史销量节点隐藏
                    n.getChildByName("itemHistorySaleCount").active = false;

                    // 将查看详情的按钮隐藏
                    n.getChildByName("checkItemDetailBtn").active = false;
                }

                // // 设置菜品售价
                let itemLevelPrice = dataItem.ItemPrice.find((oneItem: any) => oneItem.level == findPlayerMenuData.ItemLevel);
                n.getChildByName("itemPrice").getChildByName("priceValue").getComponent(Label).string = itemLevelPrice.price.toString();

                // 设置菜品成本
                n.getChildByPath("itemCost/costValue").getComponent(Label).string = dataItem.ItemCost.toString();

                // 设置菜品评分
                let itemLevelScore = dataItem.ItemFoodScore.find((oneItem: any) => oneItem.level == findPlayerMenuData.ItemLevel);
                n.getChildByPath("itemFoodScore/scoreValue").getComponent(Label).string = itemLevelScore.score.toString();
            });
        });
    }

    /**
     * @description: 菜单类型按钮点击事件
     * @param {EventTouch} event
     * @return {*}
     */
    onMenuTypeButtonClicked(event: EventTouch): void {
        // 播放音效
        AudioManager.inst.playOneShot(uiShopPanelClickSound);

        let currentTypeNodeName = event.currentTarget.name;
        if (currentTypeNodeName == "HotpotsoupButton") {
            this._currentMenuType = MENU_PANEL_TYPE.HOTPOT_SOUP;
            this._currentMenuSubType = HOTPOT_SOUP_TYPE.HOTPOT_ALL;
        } else if (currentTypeNodeName == "DishesButton") {
            this._currentMenuType = MENU_PANEL_TYPE.DISHES;
            this._currentMenuSubType = DISHES_TYPE.DISHES_ALL;
        } else if (currentTypeNodeName == "DippingSauceButton") {
            this._currentMenuType = MENU_PANEL_TYPE.DIPPING_SAUCE;
            this._currentMenuSubType = DIPPING_SAUCE_TYPE.DIPPING_SAUCE_ALL;
        }

        for (let [key, button] of this.getButtonMap()) {
            if (key == currentTypeNodeName) {
                resources.load("/ImageAndEffect/UI/EmployPanel/TypeTitle/T_UI_Personnel_book_09/spriteFrame", SpriteFrame,
                    (err, spriteFrame) => {
                        if (err) {
                            error(err);
                        }
                        event.currentTarget.getComponent(Sprite).spriteFrame = spriteFrame;
                    });
            } else {
                if (key == "HotpotsoupButton" || key == "DishesButton" || key == "DippingSauceButton") {
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

        this.showSubTypeBtns(this._currentMenuType);
        this.showScrowllView(this._currentMenuType, this._currentMenuSubType);
    }

    /**
     * @description: 菜单子类型按钮加载方法
     * @param {MENU_PANEL_TYPE} menuType 菜单类型，默认为 MENU_PANEL_TYPE.HOTPOT_SOUP
     * @return {*}
     */
    showSubTypeBtns(menuType: MENU_PANEL_TYPE = MENU_PANEL_TYPE.HOTPOT_SOUP): void {
        let subtypeBtnsNode = this.node.getChildByPath("MenuType/SubTypeTitle/SubTypeButtons");
        if (subtypeBtnsNode.children.length > 0) {
            subtypeBtnsNode.removeAllChildren();
        }

        resources.load(this._prefabPathBase + "SubTypeButton", Prefab, (err, subTypeButton: Prefab) => {
            if (err) {
                error(err);
                return;
            }

            // 根据传入的菜单类型，设置子类型按钮
            switch (menuType) {
                case MENU_PANEL_TYPE.HOTPOT_SOUP:
                    subtypeBtnsNode.getComponent(Layout).spacingX = 6;
                    for (let [key, value] of this._hotpotSoupSubTypeMap) {
                        if (key === "HOTPOT_ALL") {
                            continue;
                        }

                        this.setSubTypeBtnNode(subTypeButton, key, value, subtypeBtnsNode);
                    }
                    break;
                case MENU_PANEL_TYPE.DISHES:
                    subtypeBtnsNode.getComponent(Layout).spacingX = 30;
                    for (let [key, value] of this._dishesSubTypeMap) {
                        if (key === "DISHES_ALL") {
                            continue;
                        }

                        this.setSubTypeBtnNode(subTypeButton, key, value, subtypeBtnsNode);
                    }
                    break;
                case MENU_PANEL_TYPE.DIPPING_SAUCE:
                    break;
            }
        });
    }

    /**
     * @description: 设置子类型按钮
     * @param {Prefab} subTypeButton 子类型按钮预制体
     * @param {any} subTypeMapKey 子类型按钮名称key
     * @param {any} subTypeMapValue 子类型按钮名称值
     * @param {Node} subtypeBtnsNode 子类型按钮父节点
     * @return {*}
     */
    setSubTypeBtnNode(subTypeButton: Prefab, subTypeMapKey: any, subTypeMapValue: any, subtypeBtnsNode: Node) {
        let subTypeButtonNode: Node = instantiate(subTypeButton);
        subTypeButtonNode.name = subTypeMapKey;
        subTypeButtonNode.getChildByName("Label").getComponent(Label).string = subTypeMapValue;
        subtypeBtnsNode.addChild(subTypeButtonNode);
        subTypeButtonNode.on(Node.EventType.TOUCH_END, () => {
            // 播放音效
            AudioManager.inst.playOneShot(uiShopPanelClickSound);

            this._currentMenuSubType = subTypeMapKey;

            // 当前点击的子类型按钮，设置为选中状态
            subTypeButtonNode.getComponent(Sprite).color = new Color(255, 229, 94, 255);
            subTypeButtonNode.getChildByName("Label").getComponent(Label).color = new Color(99, 67, 0, 255);

            // 其他子类型按钮，设置为未选中状态
            for (let i = 0; i < subtypeBtnsNode.children.length; i++) {
                if (subtypeBtnsNode.children[i].name != subTypeButtonNode.name) {
                    subtypeBtnsNode.children[i].getComponent(Sprite).color = new Color(255, 255, 255, 255);
                    subtypeBtnsNode.children[i].getChildByName("Label").getComponent(Label).color =
                        new Color(128, 121, 49, 255);
                }
            }

            this.showScrowllView(this._currentMenuType, this._currentMenuSubType);
        });
    }
}


