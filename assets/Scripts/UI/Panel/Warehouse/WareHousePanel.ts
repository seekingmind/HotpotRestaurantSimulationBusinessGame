/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-07-14 22:14:13
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-08-01 04:11:36
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\UI\Panel\Warehouse\WareHousePanel.ts
 * @Description: 仓库面板
 */
import { _decorator, BoxCollider2D, Collider2D, Component, Contact2DType, EPhysics2DDrawFlags, error, EventTouch, instantiate, IPhysics2DContact, Label, log, Node, PhysicsSystem2D, Prefab, resources, Sprite, SpriteFrame, tween, UIOpacity, UITransform, Vec3 } from 'cc';
import { UIBase } from '../../Framework/UIBase';
import { AudioManager } from '../../../Runtime/AudioManager';
import { sceneUIClickSound, uiDiamondFlySound, uiPanelCloseSound, uiPanelOpenSound, uiShopPanelClickSound } from '../../../Util/CommonUtil';
import { cellPostion, IPlayerWareHouseCellsData, IPlayerWuweiResLeftCount, PlayerData } from '../../../Runtime/PlayerData';
import { UIManager } from '../../Framework/UIManager';
import { UILAYER } from '../../Framework/UIDefine';
import EventManager from '../../../Runtime/EventManager';
import { COLLISION_GROUP, DISCOVER_TYPE, GAME_EVENTS, WUWEI_TYPE } from '../../../Enums/GameEnums';
const { ccclass, property } = _decorator;

@ccclass('WareHousePanel')
export class WareHousePanel extends UIBase {
    @property({ type: Node })
    public wuWeiItemParentNode: Node = null;

    private _playerEconomyData = PlayerData.Instance.getPlayerEconomyData();
    private _playerStaminaData = PlayerData.Instance.getPlayerStaminaData();
    private _playerCashObj = { cashNum: this._playerEconomyData.cash };
    private _playerDiomandObj = { diamondNum: this._playerEconomyData.diamond };
    private _playerStaminaObj = { staminaNum: this._playerStaminaData.stamina };

    private _playerWuweiResLeftData: IPlayerWuweiResLeftCount = null;

    // 五味资源的预制体路径
    private _wuweiPrefabPath: string = "Prefabs/UI/Panel/WareHouse/WuweiItem";

    // 五味资源的精灵图路径
    private _wuweiResSpriteBasePath: string = "ImageAndEffect/UI/WareHousePanel/SynthesisItem";

    // 合成火锅底料的五味元素的精灵图路径
    private _hotpotSynthesisResSpriteBasePath: string = "ImageAndEffect/UI/WareHousePanel/HotpotSynthesisElements";

    update(dt: number) {

    }

    onLoad() {
        EventManager.Instance.addEvent(GAME_EVENTS.GEN_HOTPOT_RES, this.onGenHotpotRes, this);
    }

    onInit(params: any): void {
        log("WareHousePanel onInit");

        // 数据中心的玩家钻石数量和当前面板的钻石数量Label绑定
        let diamondNumLabel = this.getLabel("DiamondCount");
        diamondNumLabel.string = PlayerData.Instance.getDiamond().toString();
        this.bindComponent(this._playerDiomandObj, "diamondNum", diamondNumLabel);

        // 数据中心的玩家现金数量与当前面板的现金数量Label绑定
        let cashNumLabel = this.getLabel("CashCount");
        cashNumLabel.string = PlayerData.Instance.getCash().toString();
        this.bindComponent(this._playerCashObj, "cashNum", cashNumLabel);

        // 数据中心的玩家体力值与当前面板的体力值Label绑定
        let staminaNumLabel = this.getLabel("StaminaCount");
        staminaNumLabel.string = PlayerData.Instance.getStamina().toString();
        this.bindComponent(this._playerStaminaObj, "staminaNum", staminaNumLabel);

        // 面板关闭按钮点击事件
        this.addButtonClick("CloseBtn", () => {
            AudioManager.inst.playOneShot(uiPanelCloseSound);
            this.closeSelf();
        });

        // 玩家资源增加的按钮点击事件
        this.addButtonClick("addStamina", () => {
            AudioManager.inst.playOneShot(uiPanelOpenSound);
            UIManager.Instance.openUI("meowDepotPanel", undefined, UILAYER.E_PANEL);
        });
        this.addButtonClick("addDiamond", () => {
            AudioManager.inst.playOneShot(uiPanelOpenSound);
            UIManager.Instance.openUI("meowDepotPanel", undefined, UILAYER.E_PANEL);
        });
        this.addButtonClick("addCash", () => {
            AudioManager.inst.playOneShot(uiPanelOpenSound);
            UIManager.Instance.openUI("meowDepotPanel", undefined, UILAYER.E_PANEL);
        });

        // 火锅底料研发按钮点击事件
        this.addButtonClick("HotpotDevelopBtn", () => {
            AudioManager.inst.playOneShot(uiShopPanelClickSound);
            this.openUI("foodDiscoverPanel", DISCOVER_TYPE.HOTPOT_SOUP, UILAYER.E_PANEL);
        });

        // 菜品研发按钮点击事件
        this.addButtonClick("DishesDevelopBtn", () => {
            AudioManager.inst.playOneShot(uiShopPanelClickSound);
            this.openUI("foodDiscoverPanel", DISCOVER_TYPE.DISHES, UILAYER.E_PANEL);
        });

        // 五味资源点击事件
        this.node.getChildByPath("ResourcesProduce/SUAN/MainPic").on(Node.EventType.TOUCH_START, this.onWuweiMainPicClick, this);
        this.node.getChildByPath("ResourcesProduce/TIAN/MainPic").on(Node.EventType.TOUCH_START, this.onWuweiMainPicClick, this);
        this.node.getChildByPath("ResourcesProduce/KU/MainPic").on(Node.EventType.TOUCH_START, this.onWuweiMainPicClick, this);
        this.node.getChildByPath("ResourcesProduce/LA/MainPic").on(Node.EventType.TOUCH_START, this.onWuweiMainPicClick, this);
        this.node.getChildByPath("ResourcesProduce/XIAN/MainPic").on(Node.EventType.TOUCH_START, this.onWuweiMainPicClick, this);

        // 火锅底料研发侧边栏按钮点击事件
        this.addButtonClick("HotpotResourcesBtn", () => {
            let hotpotSynthesisSideBar = this.node.getChildByPath("LeftSideButton/HotpotSynthesisDetail");
            hotpotSynthesisSideBar.active = true;
            
            // 侧边栏从左往右缓动70px
            tween(hotpotSynthesisSideBar)
                .to(0.5, { position: new Vec3(0, -70, 0) })
                .start();
            
            // 给mask节点添加点击事件，点击之后，侧边栏缓动回去
            let maskNode = this.node.getChildByPath("LeftSideButton/HotpotSynthesisDetail/Mask");
            maskNode.on(Node.EventType.TOUCH_START, () => {
                tween(hotpotSynthesisSideBar)
                    .to(0.5, { position: new Vec3(-70, -70, 0) })
                    .call(() => {
                        hotpotSynthesisSideBar.active = false;
                    })
                    .start();
            });
        });

        // 菜品研发侧边栏按钮点击事件
        this.addButtonClick("DishesResourcesBtn", () => {
            let dishesSynthesisSideBar = this.node.getChildByPath("LeftSideButton/DishesSynthesisDetail");
            dishesSynthesisSideBar.active = true;

            // 侧边栏从左往右缓动70px
            tween(dishesSynthesisSideBar)
                .to(0.5, { position: new Vec3(0, 0, 0) })
                .start();

            // 给mask节点添加点击事件，点击之后，侧边栏缓动回去
            let maskNode = this.node.getChildByPath("LeftSideButton/DishesSynthesisDetail/Mask");
            maskNode.on(Node.EventType.TOUCH_START, () => {
                tween(dishesSynthesisSideBar)
                    .to(0.5, { position: new Vec3(-70, 0, 0) })
                    .call(() => {
                        dishesSynthesisSideBar.active = false;
                    })
                    .start();
            });
        });

        // 五味资源可获取的剩余数量
        this._playerWuweiResLeftData = PlayerData.Instance.getWuweiResLeftCount();

        // 在面板初始化的时候，将信息提示节点隐藏掉，只有在玩家点击了之后才显示对应的内容
        this.node.getChildByName("ItemInfoTips").active = false;

        // 首次打开仓库，加载仓库资源
        this.loadPlayerWareHouseRes();
    }

    onEnter(params: any): void {
        log("WareHousePanel onEnter");

        // 玩家资源获取
        // 获取玩家的钻石数量
        this.node.getChildByPath("PlayerResources/Diamond/DiamondCount").getComponent(Label).string =
            PlayerData.Instance.getDiamond().toString();

        // 获取玩家的金币数量
        this.node.getChildByPath("PlayerResources/Cash/CashCount").getComponent(Label).string =
            PlayerData.Instance.getCash().toString();

        // 获取玩家的体力值
        this.node.getChildByPath("PlayerResources/Stamina/StaminaCount").getComponent(Label).string =
            PlayerData.Instance.getStamina().toString();

        // 玩家用于研发火锅底料的五味资源数量
        let playerHotpotSynResCount = PlayerData.Instance.getPlayerHotpotSynthesisResCount();
        let hotpotSynResNodes = this.node.getChildByPath("LeftSideButton/HotpotSynthesisDetail").children;
        for (let i = 0; i < hotpotSynResNodes.length; i++) {
            const oneNode = hotpotSynResNodes[i];
            if (oneNode.name == "suan") {
                oneNode.getChildByName("count").getComponent(Label).string = playerHotpotSynResCount.suan.toString();
            }else if (oneNode.name == "tian") {
                oneNode.getChildByName("count").getComponent(Label).string = playerHotpotSynResCount.tian.toString();
            }else if (oneNode.name == "ku") {
                oneNode.getChildByName("count").getComponent(Label).string = playerHotpotSynResCount.ku.toString();
            }else if (oneNode.name == "la") {
                oneNode.getChildByName("count").getComponent(Label).string = playerHotpotSynResCount.la.toString();
            }else if (oneNode.name == "xian") {
                oneNode.getChildByName("count").getComponent(Label).string = playerHotpotSynResCount.xian.toString();
            }
        }

        // 玩家用于研发菜品的五味资源数量
        let playerDishesSynResCount = PlayerData.Instance.getPlayerDishesSynthesisResCount();
        let dishesSynResNodes = this.node.getChildByPath("LeftSideButton/DishesSynthesisDetail").children;
        for (let i = 0; i < dishesSynResNodes.length; i++) {
            const oneNode = dishesSynResNodes[i];
            if (oneNode.name == "Element1") {
                oneNode.getChildByName("count").getComponent(Label).string = playerDishesSynResCount.element1.toString();
            } else if (oneNode.name == "Element2") {
                oneNode.getChildByName("count").getComponent(Label).string = playerDishesSynResCount.element2.toString();
            } else if (oneNode.name == "Element3") {
                oneNode.getChildByName("count").getComponent(Label).string = playerDishesSynResCount.element3.toString();
            }
        }
    }

    /**
     * @description: 加载玩家仓库的资源
     * @return {*}
     */
    loadPlayerWareHouseRes() {
        let playerWareHouseCellsData = PlayerData.Instance.getPlayerWareHouseCellsData();
        for (let i = 0; i < playerWareHouseCellsData.length; i++) {
            if (playerWareHouseCellsData[i].hasItem) {
                log("对应的格子有物品！加载中...");
                // 有物品，加载对应的物品
                resources.load(this._wuweiPrefabPath, Prefab, (err, prefab) => {
                    if (err) {
                        error(err);
                        return;
                    }

                    // 根据类型和等级，找到对应的精灵图资源
                    this.loadWuweiRes(playerWareHouseCellsData[i], prefab);
                });
            }
        }
    }

    /**
     * @description: 加载五味资源
     * @param {IPlayerWareHouseCellsData} cellData 仓库格子数据
     * @param {Prefab} wuWeiprefab 五味资源的预制体
     * @param {boolean} isNewWuweiItem 是否是新的五味资源
     * @param {WUWEI_TYPE} wuWeiItemType 五味资源的类型
     * @return {*}
     */
    loadWuweiRes(cellData: IPlayerWareHouseCellsData, wuWeiprefab: Prefab, isNewWuweiItem?: boolean, wuWeiItemType?: WUWEI_TYPE) {
        let wuWeiType = cellData.wuWeiItemType;
        if (isNewWuweiItem) {
            wuWeiType = wuWeiItemType;
        }

        let wuWeiLevel = cellData.wuWeiItemLevel;
        let wuWeiItemPos = cellData.wuWeiItemPosition;

        let spriteFullPath = this._wuweiResSpriteBasePath + "/" + wuWeiType + "/" + wuWeiLevel + "/spriteFrame";
        resources.load(spriteFullPath, SpriteFrame, (err, spriteFrame) => {
            if (err) {
                error(err);
                return;
            }

            let wuWeiItem = instantiate(wuWeiprefab);
            if (!isNewWuweiItem) {
                wuWeiItem.name = cellData.wuWeiItemNodeName;
            }
            wuWeiItem.getComponent(Sprite).spriteFrame = spriteFrame;
            wuWeiItem.position.set(wuWeiItemPos.x, wuWeiItemPos.y, 0);
            this.wuWeiItemParentNode.addChild(wuWeiItem);

            if (isNewWuweiItem) {
                // 将当前的格子设置为已经有物品
                cellData.hasItem = true;
                cellData.wuWeiItemNodeName = wuWeiItem.name + "_" + wuWeiType + "_LV1";
                cellData.wuWeiItemType = wuWeiType;

                wuWeiItem.name = wuWeiItem.name + "_" + wuWeiType + "_LV1";

                // 保存到本地存储中
                PlayerData.Instance.savePlayerWareHouseCellsData();
            }
        });
    }

    /**
     * @description: 五味资源的点击事件
     * @param {any} event
     * @return {*}
     */
    onWuweiMainPicClick(event: EventTouch) {
        if (PlayerData.Instance.getPlayerStaminaData().stamina === 0) {
            EventManager.Instance.emit(GAME_EVENTS.WAREHOUSE_EVENTS_TIP, "体力不足");

            // 打开喵喵补给站
            UIManager.Instance.openUI("meowDepotPanel", undefined, UILAYER.E_PANEL);

            return;
        }

        // 获取当前点击的五味资源的名称
        let wuWeiName: string = event.target.parent.name;

        switch (wuWeiName) {
            // 仓库格子里，添加上对应的五味资源
            case WUWEI_TYPE.SUAN:
                if (this._playerWuweiResLeftData.suan === 0) {
                    EventManager.Instance.emit(GAME_EVENTS.WAREHOUSE_EVENTS_TIP, "资源冷却中");
                    AudioManager.inst.playOneShot(sceneUIClickSound);
                } else if (this._playerWuweiResLeftData.suan > 0 && this._playerWuweiResLeftData.suan <= 6) {
                    let addSuccess = this.addWuweiItem(WUWEI_TYPE.SUAN);
                    if (addSuccess) {
                        PlayerData.Instance.reduceStamina(1);
                        this._playerStaminaObj.staminaNum--;
                        this._playerWuweiResLeftData.suan--;
                    }
                }
                break;
            case WUWEI_TYPE.TIAN:
                if (this._playerWuweiResLeftData.tian === 0) {
                    EventManager.Instance.emit(GAME_EVENTS.WAREHOUSE_EVENTS_TIP, "资源冷却中");
                    AudioManager.inst.playOneShot(sceneUIClickSound);
                } else if (this._playerWuweiResLeftData.tian > 0 && this._playerWuweiResLeftData.tian <= 6) {
                    let addSuccess = this.addWuweiItem(WUWEI_TYPE.TIAN);
                    if (addSuccess) {
                        PlayerData.Instance.reduceStamina(1);
                        this._playerStaminaObj.staminaNum--;
                        this._playerWuweiResLeftData.tian--;
                    }
                }
                break;
            case WUWEI_TYPE.KU:
                if (this._playerWuweiResLeftData.ku === 0) {
                    EventManager.Instance.emit(GAME_EVENTS.WAREHOUSE_EVENTS_TIP, "资源冷却中");
                    AudioManager.inst.playOneShot(sceneUIClickSound);
                } else if (this._playerWuweiResLeftData.ku > 0 && this._playerWuweiResLeftData.ku <= 6) {
                    let addSuccess = this.addWuweiItem(WUWEI_TYPE.KU);
                    if (addSuccess) {
                        PlayerData.Instance.reduceStamina(1);
                        this._playerStaminaObj.staminaNum--;
                        this._playerWuweiResLeftData.ku--;
                    }
                }
                break;
            case WUWEI_TYPE.LA:
                if (this._playerWuweiResLeftData.la === 0) {
                    EventManager.Instance.emit(GAME_EVENTS.WAREHOUSE_EVENTS_TIP, "资源冷却中");
                    AudioManager.inst.playOneShot(sceneUIClickSound);
                } else if (this._playerWuweiResLeftData.la > 0 && this._playerWuweiResLeftData.la <= 6) {
                    let addSuccess = this.addWuweiItem(WUWEI_TYPE.LA);
                    if (addSuccess) {
                        PlayerData.Instance.reduceStamina(1);
                        this._playerStaminaObj.staminaNum--;
                        this._playerWuweiResLeftData.la--;
                    }
                }
                break;
            case WUWEI_TYPE.XIAN:
                if (this._playerWuweiResLeftData.xian === 0) {
                    EventManager.Instance.emit(GAME_EVENTS.WAREHOUSE_EVENTS_TIP, "资源冷却中");
                    AudioManager.inst.playOneShot(sceneUIClickSound);
                } else if (this._playerWuweiResLeftData.xian > 0 && this._playerWuweiResLeftData.xian <= 6) {
                    let addSuccess = this.addWuweiItem(WUWEI_TYPE.XIAN);
                    if (addSuccess) {
                        PlayerData.Instance.reduceStamina(1);
                        this._playerStaminaObj.staminaNum--;
                        this._playerWuweiResLeftData.xian--;
                    }
                }
                break;
            default:
                break;

        }
    }

    /**
     * @description: 添加五味对应的1级产物
     * @param {WUWEI_TYPE} wuWeiType 五味类型
     * @return {*}
     */
    addWuweiItem(wuWeiType: WUWEI_TYPE): boolean {
        // 1、先获取空闲的格子
        let freeCell: IPlayerWareHouseCellsData | null = this.getFreeCell();
        if (freeCell === null) {
            EventManager.Instance.emit(GAME_EVENTS.WAREHOUSE_EVENTS_TIP, "仓库已满");
            AudioManager.inst.playOneShot(sceneUIClickSound);
            return false;
        }
        // 2、添加对应的五味资源到对应的格子里
        resources.load(this._wuweiPrefabPath, Prefab, (err, prefab) => {
            if (err) {
                error(err);
                return;
            }

            // 根据类型和等级，找到对应的精灵图资源
            this.loadWuweiRes(freeCell, prefab, true, wuWeiType);
            AudioManager.inst.playOneShot(uiDiamondFlySound);
        });

        return true;
    }

    /**
     * @description: 检查仓库格子的空闲状态
     * @return {*}
     */
    getFreeCell(): IPlayerWareHouseCellsData | null {
        let freeCell: IPlayerWareHouseCellsData = null;
        let playerWareHouseCellsData = PlayerData.Instance.getPlayerWareHouseCellsData();
        for (let i = 0; i < playerWareHouseCellsData.length; i++) {
            if (!playerWareHouseCellsData[i].hasItem) {
                return playerWareHouseCellsData[i];
            }
        }
        return freeCell;
    }

    /**
     * @description: 玩家的体力资源增加
     * @param {number} staminaNum
     * @return {*}
     */
    upgradePlayerStaminaNum(staminaNum: number) {
        this._playerStaminaObj.staminaNum += staminaNum;
    }

    /**
     * @description: 玩家的体力资源减少
     * @param {number} staminaNum
     * @return {*}
     */
    minusPlayerStaminaNum(staminaNum: number) {
        this._playerStaminaObj.staminaNum -= staminaNum;
    }

    /**
     * @description: 生成火锅底料研发的资源
     * @param {WUWEI_TYPE} wuWeiType
     * @return {*}
     */    
    onGenHotpotRes(wuWeiType: WUWEI_TYPE, wuWeiItemNode: Node) {
        // 将当前节点的图片替换成对应类型的合成材料的图片
        let spriteFullPath = this._hotpotSynthesisResSpriteBasePath + "/" + wuWeiType + "/spriteFrame";
        resources.load(spriteFullPath, SpriteFrame, (err, spriteFrame) => {
            if (err) {
                error(err);
                return;
            }

            wuWeiItemNode.getComponent(Sprite).spriteFrame = spriteFrame;

            let hotpotSynthesisSideBar = this.node.getChildByPath("LeftSideButton/HotpotSynthesisDetail");
            hotpotSynthesisSideBar.active = true;
            tween(hotpotSynthesisSideBar)
                .to(0.5, { position: new Vec3(0, -70, 0) })
                .call(() => {
                    wuWeiItemNode.setScale(0.5, 0.5, 0.5);
                    tween(wuWeiItemNode)
                    .to(0.5, { position: new Vec3(-290, 0, 0) })
                    .call(() => {
                        wuWeiItemNode.destroy();
    
                        let hotpotSynResNodes = this.node.getChildByPath("LeftSideButton/HotpotSynthesisDetail").children;
                        for (let i = 0; i < hotpotSynResNodes.length; i++) {
                            let hotpotSynResNodeNameUp = hotpotSynResNodes[i].name.toUpperCase();
                            if (hotpotSynResNodeNameUp == wuWeiType) {
                                let hotpotSynResNode = hotpotSynResNodes[i];
                                let countNode = hotpotSynResNode.getChildByName("count");
                                let addCount = parseInt(countNode.getComponent(Label).string) + 1;
                                countNode.getComponent(Label).string = addCount.toString();
                                PlayerData.Instance.setPlayerHotpotSynthesisResCount(wuWeiType, addCount);
                            }
                        }
                    })
                    .start();
                })
                .to(2, { position: new Vec3(-70, -70, 0) })
                .call(() => {
                    hotpotSynthesisSideBar.active = false;
                })
                .start();
        });
    }
}


