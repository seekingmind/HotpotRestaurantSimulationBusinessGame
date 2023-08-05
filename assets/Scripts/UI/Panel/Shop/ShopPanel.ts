/*
 * @Author: Zhong Sheng
 * @Date: 2023-05-11 23:13:59
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-06-30 15:24:15
 * @Description: 店铺面板
 */

import { _decorator, Button, error, EventHandler, EventTouch, instantiate, Label, log, Node, Prefab, resources, Sprite, SpriteFrame } from 'cc';
import { UIBase } from '../../Framework/UIBase';
import { AudioManager } from '../../../Runtime/AudioManager';
import { ScrollViewUtilComp } from '../../Utils/ScrollViewUtilComp';
import { uiPanelCloseSound, uiShopPanelClickSound } from '../../../Util/CommonUtil';
import { ShopInfoData } from '../../../Runtime/ShopInfoData';
import { PlayerData } from '../../../Runtime/PlayerData';
import { GAME_AREA, GAME_EVENTS, HALL_ENTITY_ADD } from '../../../Enums/GameEnums';
import { UIManager } from '../../Framework/UIManager';
import { UILAYER } from '../../Framework/UIDefine';
import EventManager from '../../../Runtime/EventManager';
const { ccclass, property } = _decorator;

@ccclass('ShopPanel')
export class ShopPanel extends UIBase {
    private _defaultArea: GAME_AREA = GAME_AREA.WAIT_AREA;

    onInit(params: any): void {
        console.log("ShopPanel onInit");

        let shopInfoData = ShopInfoData.Instance.getShopInfoDatas();
        let playerShopData = PlayerData.Instance.getPlayerShopData();

        // 面板刚打开的时候，展示默认区域的店铺信息
        this.showPanel(this._defaultArea, shopInfoData, playerShopData);

        this.addButtonClick("WaitAreaTitleButton", () => {
            AudioManager.inst.playOneShot(uiShopPanelClickSound);
            this.showPanel(GAME_AREA.WAIT_AREA, shopInfoData, playerShopData);
        });

        this.addButtonClick("KitchenAreaTitleButton", () => {
            AudioManager.inst.playOneShot(uiShopPanelClickSound);
            this.showPanel(GAME_AREA.KITCHEN, shopInfoData, playerShopData);
        });

        this.addButtonClick("HallAreaTitleButton", () => {
            AudioManager.inst.playOneShot(uiShopPanelClickSound);
            this.showPanel(GAME_AREA.HALL, shopInfoData, playerShopData);
        });

        this.addButtonClick("PrivateRoomAreaTitleButton", () => {
            AudioManager.inst.playOneShot(uiShopPanelClickSound);
            this.showPanel(GAME_AREA.PRIVATE_ROOM, shopInfoData, playerShopData);
        });

        this.addButtonClick("CloseButton", () => {
            AudioManager.inst.playOneShot(uiPanelCloseSound);
            this.closeSelf();
        });
    }

    /**
     * @description: 展示面板，区域不同，面板上的内容不同
     * @param {GAME_AREA} gameArea
     * @param {any} shopInfoData
     * @param {any} playerShopData
     * @return {*}
     */
    showPanel(gameArea: GAME_AREA, shopInfoData: any, playerShopData: any) {
        if (playerShopData) {
            let onePlayerShopData = playerShopData.find((item: any) => item.area == gameArea);

            if (this.node.getChildByName("Area").getChildByName("AreaDetail").children.length > 0) {
                this.node.getChildByName("Area").getChildByName("AreaDetail").removeAllChildren();
            }

            if (!onePlayerShopData.unlocked) {
                log("玩家未解锁 ", gameArea, " 区域");

                // 区域未解锁prefab
                resources.load("Prefabs/UI/Panel/Shop/AreaLocked", Prefab, (err, prefab) => {
                    if (err) {
                        error(err);
                    }
                    let areaLocked = instantiate(prefab);
                    this.node.getChildByName("Area").getChildByName("AreaDetail").addChild(areaLocked);
                });
            } else {
                // 正常展示解锁的区域
                let areaShopInfoData = shopInfoData.find((item: any) => item.area == gameArea);
                this.showScrollView(areaShopInfoData, onePlayerShopData);
            }
        }
    }

    /**
     * @description: 实例化店铺面板的滑动列表，垂直方向的item 和 水平方向的subItem
     * @param {any} areaShopInfoData
     * @param {any} playerShopData
     * @return {*}
     */
    showScrollView(areaShopInfoData: any, playerShopData: any) {
        if (areaShopInfoData && playerShopData) {
            let playerLevelData = PlayerData.Instance.getPlayerLevelData();
            let playerLevelName = playerLevelData.levelName;

            resources.load("Prefabs/UI/Panel/Shop/ScrollViewVertical", Prefab, (err, prefab) => {
                if (err) {
                    error(err);
                }

                // 实例化垂直滑动列表
                let scrollViewVertical = instantiate(prefab);
                this.node.getChildByName("Area").getChildByName("AreaDetail").addChild(scrollViewVertical);

                let scrollViewUtilCompVertical = scrollViewVertical.getComponent(ScrollViewUtilComp);
                scrollViewUtilCompVertical.setView(playerShopData.items, (n: Node, dataItem: any, index: number) => {
                    n.getChildByName("itemTitle").getChildByName("itemTitleName").getComponent(Label).string = dataItem.itemName;

                    let area = areaShopInfoData.area;
                    let areaShopInfoDataItem = areaShopInfoData.items.find((item: any) => item.id == dataItem.itemId);

                    if (dataItem.unlocked) {
                        // 已解锁，则实例化水平滑动列表
                        resources.load("Prefabs/UI/Panel/Shop/ScrollViewHorizental", Prefab, (err, prefab) => {
                            if (err) {
                                error(err);
                            }

                            let scrollViewHorizental = instantiate(prefab);
                            n.getChildByName("itemDetail").addChild(scrollViewHorizental);
                            let scrollViewUtilCompHorizental = scrollViewHorizental.getComponent(ScrollViewUtilComp);
                            scrollViewUtilCompHorizental.setView(dataItem.subItems, (n: Node, dataSubItem: any, index: number) => {
                                let areaShopInfoDataSubItem = areaShopInfoDataItem.subItems.find((item: any) => item.id == dataSubItem.subItemId);

                                // 设置子类目
                                this.dealWithSubItem(n, areaShopInfoDataSubItem, dataSubItem);

                                // 设置子类目的点击事件
                                n.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
                                    // 打开子类目详情面板
                                    UIManager.Instance.openUI("shopSubItemPanel", [areaShopInfoDataSubItem, dataSubItem], UILAYER.E_PANEL);
                                });
                            });
                        });

                    } else {
                        // 未解锁，则实例化未解锁的prefab
                        // 这里需要根据用户当前等级，判断显示的是什么prefab
                        let itemPrecondition = areaShopInfoData.items.find((item: any) => item.itemName == dataItem.itemName).precondition;
                        let preconditionUnlock = itemPrecondition.unlock;
                        let preconditionLevel = itemPrecondition.levelTo;

                        if (preconditionLevel == playerLevelName) {
                            if (preconditionUnlock == "None") {
                                // 等级达到，没有解锁条件，则显示解锁按钮
                                resources.load("Prefabs/UI/Panel/Shop/itemUnlock", Prefab, (err, prefab) => {
                                    if (err) {
                                        error(err);
                                    }
                                    let itemUnlocked = instantiate(prefab);
                                    n.getChildByName("itemDetail").addChild(itemUnlocked);
                                    this.itemUnlockBtnClick(area, itemUnlocked, areaShopInfoDataItem);
                                });
                            } else {
                                // 等级达到，有解锁条件，先判断是否达到了解锁条件
                                // 从用户店铺数据中获取数据
                                let playerPreconditionData = playerShopData.items.find((item: any) => item.itemName == preconditionUnlock).unlocked;
                                if (playerPreconditionData) {
                                    // 解锁条件达到，则显示解锁按钮
                                    resources.load("Prefabs/UI/Panel/Shop/itemUnlock", Prefab, (err, prefab) => {
                                        if (err) {
                                            error(err);
                                        }
                                        let itemUnlocked = instantiate(prefab);
                                        n.getChildByName("itemDetail").addChild(itemUnlocked);
                                        this.itemUnlockBtnClick(area, itemUnlocked, areaShopInfoDataItem);
                                    });
                                } else {
                                    // 解锁条件未达到，则显示解锁条件
                                    resources.load("Prefabs/UI/Panel/Shop/itemPrecondition", Prefab, (err, prefab) => {
                                        if (err) {
                                            error(err);
                                        }
                                        let itemPrecondition = instantiate(prefab);
                                        let itemPreconditionStr = "解锁：" + preconditionUnlock;
                                        itemPrecondition.getChildByName("PreconditionContent")
                                            .getComponent(Label).string = itemPreconditionStr;

                                        n.getChildByName("itemDetail").addChild(itemPrecondition);
                                    });
                                }
                            }
                        } else if (preconditionLevel != playerLevelName) {
                            // 等级未达到，则显示解锁条件
                            resources.load("Prefabs/UI/Panel/Shop/itemPrecondition", Prefab, (err, prefab) => {
                                if (err) {
                                    error(err);
                                }
                                let itemPrecondition = instantiate(prefab);

                                let itemPreconditionStr = "";
                                if (preconditionUnlock != "None") {
                                    itemPreconditionStr = "解锁：" + preconditionUnlock + "\n";
                                    itemPreconditionStr += "餐厅星级达到：" + preconditionLevel;
                                } else {
                                    itemPreconditionStr = "餐厅星级达到：" + preconditionLevel;
                                }

                                itemPrecondition.getChildByName("PreconditionContent").getComponent(Label).string = itemPreconditionStr;
                                n.getChildByName("itemDetail").addChild(itemPrecondition);
                            });
                        }
                    }
                });
            });
        } else {
            error("areaShopInfoData 或 playerShopData 为空");
        }
    }

    /**
     * @description: 设置子类目
     * @param {Node} n
     * @param {any} data
     * @param {number} itemId
     * @return {*}
     */
    dealWithSubItem(n: Node, shopInfoDataSubItem: any, playerDataSubItem: any) {
        // 设置子类目名称
        n.getChildByName("subItemTitle").getComponent(Label).string = playerDataSubItem.subItemName;

        // 设置子类目图标
        let picUrlBase = "ImageAndEffect/UI/ShopPanel/SubItems/";
        let subItemPicName = shopInfoDataSubItem.subItemPicName;

        let picUrl = "";
        if (subItemPicName.startsWith("chair")) {
            picUrl = picUrlBase + "WaitingArea/Chair/" + subItemPicName + "/spriteFrame";
        } else if (subItemPicName.startsWith("parasol")) {
            picUrl = picUrlBase + "WaitingArea/Parasol/" + subItemPicName + "/spriteFrame";
        } else if (subItemPicName.startsWith("counter")) {
            picUrl = picUrlBase + "Hall/Counter/" + subItemPicName + "/spriteFrame";
        } else if (subItemPicName.startsWith("table")) {
            picUrl = picUrlBase + "Hall/Tables/" + subItemPicName + "/spriteFrame";
        } else if (subItemPicName.startsWith("cuttable")) {
            picUrl = picUrlBase + "Kitchen/CuttingTable/" + subItemPicName + "/spriteFrame";
        } else if (subItemPicName.startsWith("sidetable")) {
            picUrl = picUrlBase + "Kitchen/SideTable/" + subItemPicName + "/spriteFrame";
        } else if (subItemPicName.startsWith("sink")) {
            picUrl = picUrlBase + "Kitchen/Sink/" + subItemPicName + "/spriteFrame";
        }

        resources.load(picUrl, SpriteFrame, (err, spriteFrame) => {
            if (err) {
                error(err);
            }
            n.getChildByName("subItemIcon").getComponent(Sprite).spriteFrame = spriteFrame;

            let subItemUseStates = playerDataSubItem.stats;
            if (subItemUseStates == "LOCKED") {
                n.getChildByName("subItemUseStates").getComponent(Label).string = "未解锁";
                n.getChildByName("maskSprite").active = true;
            } else if (subItemUseStates == "UNPURCHASED") {
                n.getChildByName("subItemUseStates").active = false;
                resources.load("Prefabs/UI/Panel/Shop/subItemPurchaseInfo", Prefab, (err, prefab) => {
                    let subItemPurchaseInfo = instantiate(prefab);
                    subItemPurchaseInfo.getChildByName("moneyNum").getComponent(Label).string = shopInfoDataSubItem.subItemPrice;
                    n.addChild(subItemPurchaseInfo);
                });
            } else if (subItemUseStates == "PURCHASED") {
                n.getChildByName("subItemUseStates").getComponent(Label).string = "已购买";
            } else if (subItemUseStates == "INUSE") {
                n.getChildByName("subItemUseStates").getComponent(Label).string = "使用中";
            }
        });
    }

    /**
     * @description: 类目的解锁按钮的点击
     * @param {Node} itemUnlocked
     * @return {*}
     */
    itemUnlockBtnClick(area: string, itemUnlocked: Node, areaShopInfoDataItem: any) {
        // 设置解锁按钮的点击事件
        let unlockBtn = itemUnlocked.getChildByName("itemUnlock").getChildByName("itemUnlockButton");
        unlockBtn.on(Button.EventType.CLICK, () => {
            log("解锁按钮被点击了");
            this.closeSelf();
            this.itemUnlockBtnClickEvent(area, areaShopInfoDataItem);
        });
    }

    /**
     * @description: 类目解锁按钮的点击事件
     * @param {any} area
     * @param {any} areaShopInfoDataItem
     * @return {*}
     */    
    itemUnlockBtnClickEvent(area: any, areaShopInfoDataItem: any) {
        // 1. 比较当前解锁项的金币价格和玩家所拥有的金币价格，够的话，则解锁，不够，则打开喵喵补给站面板
        // item解锁，默认解锁了第一个子类目
        let unlockSubItemData = areaShopInfoDataItem.subItems[0];
        let unlockSubItemAttr: any = unlockSubItemData.subItemAttr;
        let unlockSubItemPrice: number = unlockSubItemData.subItemPrice;
        let playerCashNum: number = PlayerData.Instance.getCash();
        if (playerCashNum >= unlockSubItemPrice) {
            // 1.1 扣除玩家金币
            let isSuccess = PlayerData.Instance.reduceCash(unlockSubItemPrice);
            if (isSuccess) {
                // 1.2 通知cashUI更新金币数
                this.sendMsg("cashWidget", "minusPlayerCashNum", unlockSubItemPrice);
            }
            // 1.3 通知设施评分ui数值更新
            let subItemAttrFacility = unlockSubItemAttr.find((item: any) => item.attrName == "设施评分");
            let subItemAttrFacilitySymbol = subItemAttrFacility.attrSymbol;
            let subItemAttrFacilityValue = subItemAttrFacility.attrValue;
            if (subItemAttrFacilitySymbol == "+") {
                this.sendMsg("levelWidget", "upgradeScore", subItemAttrFacilityValue, "facility");
            }

            // 2. 更新玩家店铺数据
            let areaId: number = 0;
            if (area == "WaitingArea") {
                areaId = 0;
            } else if (area == "Kitchen") {
                areaId = 1;
            } else if (area == "Hall") {
                areaId = 2;
                //3: 如果是解锁的大堂区域的设施，则通知大堂，生成对应的设施在游戏场景中
                EventManager.Instance.emit(HALL_ENTITY_ADD.ADD_DESK, areaShopInfoDataItem);
            } else if (area == "PrivateRoom") {
                areaId = 3;
            }
            
            EventManager.Instance.emit(GAME_EVENTS.AREA_CHANGE, area);
            PlayerData.Instance.setPlayerShopData(areaId, areaShopInfoDataItem.id, unlockSubItemData.id);
        } else {
            // 打开喵喵补给站面板
            UIManager.Instance.openUI("meowDepotPanel", undefined, UILAYER.E_PANEL);
        }
    }
}


