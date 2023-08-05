/*
 * @Author: Zhong Sheng
 * @Date: 2023-05-16 17:27:07
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-07-31 21:17:06
 * @Description: 玩家相关数据，游戏运行时的数据。
 */

import { JsonAsset, error, log, resources } from "cc";
import Singleton from "../Base/Singleton";
import { readLocalStorage, writeLocalStorageAsync } from "../Util/CommonUtil";
import { DIPPING_SAUCE_TYPE, DISHES_TYPE, EMPLOYEE_PANEL_TYPE, EMPLOYEE_RECRUITMENT_STATES, GAME_AREA, HOTPOT_SOUP_TYPE, MENU_PANEL_TYPE, WUWEI_TYPE } from "../Enums/GameEnums";

export interface IPlayerLevelData {  // 玩家的等级数据
    levelNum: number;
    levelName: string;
    facilityScore: number;
    serveScore: number;
    foodScore: number;
}

export interface IPlayerEconomyData {  // 玩家的经济数据
    cash: number;  // 玩家的现金数量
    diamond: number;  // 玩家的钻石数量
}

export interface IPlayerStaminaData {  // 玩家的体力数据
    stamina: number;  // 玩家的体力值
    staminaGetTime: number;  // 玩家体力值获取的时间
}

export interface IPlayerWuweiResLeftCount {  // 玩家的五味资源剩余可获取的数量
    suan: number;
    tian: number;
    ku: number;
    la: number;
    xian: number;
}

export interface IGameLevelInfo {  // 游戏等级信息
    levelNum: number;
    levelName: string;
    facilityUpgradeTargetScore: number;
    serveUpgradeTargetScore: number;
    foodUpgradeTargetScore: number;
    levelAttr: IGameLevelAttr;
}

interface IGameLevelAttr {  // 等级属性
    resAttr: string;
    resCheckoutRevenue: string;
    probabilityOfVisitor: string;
}

export interface IPlayerShopData {  // 玩家的店铺相关数据
    area: string;
    items: IPlayerShopItemData[];
    unlocked: boolean;
}

export interface IPlayerShopItemData {  // 玩家的店铺类目相关数据
    itemId: number;
    itemName: string;
    subItems: IPlayerShopSubItemsData[];
    unlocked: boolean;
}

export interface IPlayerShopSubItemsData {  // 玩家的店铺子类目相关数据
    subItemId: number;
    subItemName: string;
    unlocked: boolean;
}

export interface IPlayerEmployeeData {  // 玩家的员工相关数据
    Area: string;
    Items: IPlayerEmployeeItemData[];
}

export interface IPlayerEmployeeItemData {  // 玩家的员工类目相关数据
    ItemId: number;
    ItemName: string;
    ItemType: EMPLOYEE_PANEL_TYPE;
    SubItems: IPlayerEmployeeSubItemsData[];
}

export interface IPlayerEmployeeSubItemsData {  // 玩家的员工子类目相关数据
    SubItemId: number;
    SubItemName: string;
    Status: EMPLOYEE_RECRUITMENT_STATES;
    Level: number;
}

export interface IPlayerMenuData {  // 玩家的菜单相关数据
    MenuType: MENU_PANEL_TYPE;
    MenuItems: IPlayerMenuItemData[];
}

export interface IPlayerMenuItemData {  // 玩家的菜单类目相关数据
    MenuSubType: HOTPOT_SOUP_TYPE | DISHES_TYPE;
    ItemId: number;  // 菜单项ID
    ItemName: string;  // 菜单项名称
    ItemLevel: number;  // 菜品等级
    ItemLocked: boolean;  // 菜单项是否解锁
    ItemSaleCount: number;  // 菜品销售数量
}

export interface IPlayerWareHouseCellsData {  // 玩家的仓库格子相关数据
    hasItem: boolean;  // 仓库格子是否有物品
    wuWeiItemNodeName: string;  // 物品节点名称
    wuWeiItemIndex: number;  // 物品在仓库中的索引
    wuWeiItemPosition: cellPostion; // 物品在仓库中的位置
    wuWeiItemType: WUWEI_TYPE;  // 物品类型
    wuWeiItemLevel: number;  // 物品等级
}

export interface IPlayerHotpotSynthesisResCount {  // 玩家用于研发火锅底料的五味资源数量
    suan: number;
    tian: number;
    ku: number;
    la: number;
    xian: number;
}

export interface IPlayerDishesSynthesisResCount {  // 玩家用于研发菜品的元素资源数量
    element1: number;
    element2: number;
    element3: number;
}

export interface IPlayerOtherProp {  // 玩家的其它道具相关数据
    propId: number;
    propNameCZ: string;
    propNameEN: string;
    propCount: number;
}

export type cellPostion = {
    x: number,
    y: number
}

export class PlayerData extends Singleton {
    static get Instance() {
        return super.GetInstance<PlayerData>();
    }

    private _gameLevelInfo: IGameLevelInfo[];

    private _playerLevelData: IPlayerLevelData;

    private _playerShopData: IPlayerShopData[];

    private _playerEmployeeData: IPlayerEmployeeData[];

    private _playerEconomyData: IPlayerEconomyData;

    private _playerStaminaData: IPlayerStaminaData;

    private _playerWuweiResLeftCount: IPlayerWuweiResLeftCount;

    private _playerHotpotSynthesisResCount: IPlayerHotpotSynthesisResCount;

    private _playerDishesSynthesisResCount: IPlayerDishesSynthesisResCount;

    private _playerOtherProps: IPlayerOtherProp[];

    private _playerMenuData: IPlayerMenuData[];

    private _playerPlayTimes: number;

    private _playerWareHouseCellsData: IPlayerWareHouseCellsData[];

    private _currentArea: GAME_AREA;

    constructor() {
        super();
        this.initPlayerPlayTimes();
        this.initLevelInfo();
        this.initPlayerLevelData();
        this.initPlayerShopData();
        this.initPlayerEmployeeData();
        this.initPlayerEconomyData();
        this.initPlayerStaminaData();
        this.initPlayerWuweiResLeftCount();
        this.initPlayerHotpotSynthesisResCount();
        this.initPlayerDishesSynthesisResCount();
        this.initPlayerOtherProps();
        this.initPlayerMenuData();
        this.initPlayerWareHouseCellsData();

        this._playerEconomyData = new Proxy(this._playerEconomyData, {
            set: (target, key, value) => {
                target[key] = value;
                this.savePlayerEconomyData();
                return true;
            }
        });

        this._playerLevelData = new Proxy(this._playerLevelData, {
            set: (target, key, value) => {
                target[key] = value;
                this.savePlayerLevelData();
                return true;
            }
        });

        this._playerStaminaData = new Proxy(this._playerStaminaData, {
            set: (target, key, value) => {
                target[key] = value;
                this.savePlayerStaminaData();
                return true;
            }
        });

        this._playerWuweiResLeftCount = new Proxy(this._playerWuweiResLeftCount, {
            set: (target, key, value) => {
                target[key] = value;
                this.savePlayerWuweiResLeftCount();
                return true;
            }
        });

        this._playerHotpotSynthesisResCount = new Proxy(this._playerHotpotSynthesisResCount, {
            set: (target, key, value) => {
                target[key] = value;
                this.savePlayerHotpotSynthesisResCount();
                return true;
            }
        });

        this._playerDishesSynthesisResCount = new Proxy(this._playerDishesSynthesisResCount, {
            set: (target, key, value) => {
                target[key] = value;
                this.savePlayerDishesSynthesisResCount();
                return true;
            }
        });

        // 玩家的初始区域为店外
        this._currentArea = GAME_AREA.WAIT_AREA;
    }

    /**
     * @description: 初始化玩家打开游戏的次数
     * @return {*}
     */
    initPlayerPlayTimes() {
        let playerPlayTimes = readLocalStorage("PlayerPlayTimes");
        if (playerPlayTimes) {
            this._playerPlayTimes = playerPlayTimes++;
            writeLocalStorageAsync('PlayerPlayTimes', this._playerPlayTimes)
                .then(() => {
                    log('写入本地存储成功');
                })
                .catch((error) => {
                    error('写入本地存储失败:', error);
                });
        } else {
            this._playerPlayTimes = 1;
            writeLocalStorageAsync('PlayerPlayTimes', this._playerPlayTimes)
                .then(() => {
                    log('写入本地存储成功');
                })
                .catch((error) => {
                    error('写入本地存储失败:', error);
                });
        }
    }

    /**
     * @description: 初始化游戏等级信息
     * @return {*}
     */
    private initLevelInfo(): any {
        this._gameLevelInfo = [];

        // 从本地json文件中读取游戏等级信息
        resources.load("Datas/LevelInfo", JsonAsset, (err, jsonAsset: JsonAsset) => {
            if (err) {
                error("PlayerData initLevelInfo error: ", err);
            }

            let levelInfo = jsonAsset.json;
            let levelInfoDatas = levelInfo.LevelInfo;
            for (let i = 0; i < levelInfoDatas.length; i++) {
                const oneLevelInfo = levelInfoDatas[i];
                let levelNum = oneLevelInfo.LevelNum;
                let levelName = oneLevelInfo.LevelName;
                let facilityUpgradeTargetScore = oneLevelInfo.FacilityUpgradeTarget;
                let serveUpgradeTargetScore = oneLevelInfo.ServeUpgradeTarget;
                let foodUpgradeTargetScore = oneLevelInfo.FoodUpgradeTarget;

                let gameLevelAttr: IGameLevelAttr = {
                    resAttr: oneLevelInfo.LevelAttributes.ResAttr,
                    resCheckoutRevenue: oneLevelInfo.LevelAttributes.ResCheckoutRevenue,
                    probabilityOfVisitor: oneLevelInfo.LevelAttributes.ProbabilityOfVisitor
                };

                let gameLevelInfo: IGameLevelInfo = {
                    levelNum: levelNum,
                    levelName: levelName,
                    facilityUpgradeTargetScore: facilityUpgradeTargetScore,
                    serveUpgradeTargetScore: serveUpgradeTargetScore,
                    foodUpgradeTargetScore: foodUpgradeTargetScore,
                    levelAttr: gameLevelAttr
                }

                this._gameLevelInfo.push(gameLevelInfo);
            }
        });
    }

    /**
    * @description: 初始化玩家的等级数据
    * @return {*}
    */
    private initPlayerLevelData(): any {
        // 先从本地存储中读取玩家等级数据，如果没有，则初始化第一个等级数据
        let playerLocalLevelData = readLocalStorage("PlayerLevelData");
        if (playerLocalLevelData) {
            this._playerLevelData = playerLocalLevelData;
        } else {
            this._playerLevelData = {
                levelNum: 1,
                levelName: "铁1",
                facilityScore: 0,
                serveScore: 0,
                foodScore: 0
            }

            // 异步写数据到本地，防止掉帧
            writeLocalStorageAsync('PlayerLevelData', this._playerLevelData)
                .then(() => {
                    log('写入本地存储成功');
                })
                .catch((error) => {
                    error('写入本地存储失败:', error);
                });
        }
    }

    /**
     * @description: 初始化玩家的店铺解锁相关信息
     * @return {*}
     */
    private initPlayerShopData(): any {
        let playerShopData = readLocalStorage("PlayerShopData");
        if (playerShopData) {
            this._playerShopData = playerShopData;
        } else {
            // 从资源文件中获取玩家店铺初始化数据
            resources.load("Datas/PlayerShopInitData", JsonAsset, (err, jsonAsset: JsonAsset) => {
                if (err) {
                    error("PlayerData initPlayerShopData error: ", err);
                }
                let playerShopInitJson = jsonAsset.json;
                let playerShopInitDatas = playerShopInitJson.PlayerShopInitData;
                this._playerShopData = playerShopInitDatas;

                // 异步写入到本地存储中，防止掉帧
                writeLocalStorageAsync('PlayerShopData', this._playerShopData)
                    .then(() => {
                        log('写入本地存储成功');
                    })
                    .catch((error) => {
                        error('写入本地存储失败:', error);
                    });
            });
        }
    }

    /**
     * @description: 初始化玩家的员工数据
     * @return {*}
     */
    private initPlayerEmployeeData(): any {
        let playerEmployeeData = readLocalStorage("PlayerEmployeeData");
        if (playerEmployeeData) {
            this._playerEmployeeData = playerEmployeeData;
        } else {
            // 从资源文件中获取玩家员工初始化数据
            resources.load("Datas/PlayerEmployeeInitData", JsonAsset, (err, jsonAsset: JsonAsset) => {
                if (err) {
                    error("PlayerData initPlayerEmployeeData error: ", err);
                }

                let playerEmployeeInitJson = jsonAsset.json;
                let playerEmployeeInitDatas = playerEmployeeInitJson.PlayerEmployeeInitData;
                this._playerEmployeeData = playerEmployeeInitDatas;

                // 异步写入到本地存储中，防止掉帧
                writeLocalStorageAsync('PlayerEmployeeData', this._playerEmployeeData)
                    .then(() => {
                        log('玩家的员工数据，写入本地存储成功');
                    })
                    .catch((error) => {
                        error('玩家的员工数据，写入本地存储失败:', error);
                    });
            });
        }
    }

    /**
     * @description: 初始化玩家经济数据
     * @return {*}
     */
    private initPlayerEconomyData(): any {
        let playerEconomyData = readLocalStorage("PlayerEconomyData");
        if (playerEconomyData) {
            this._playerEconomyData = playerEconomyData;
        } else {
            this._playerEconomyData = {
                cash: 0,
                diamond: 0
            }

            writeLocalStorageAsync('PlayerEconomyData', this._playerEconomyData)
                .then(() => {
                    log('写入本地存储成功');
                })
                .catch((error) => {
                    error('写入本地存储失败:', error);
                });
        }
    }

    /**
     * @description: 初始化玩家的体力数据
     * @return {*}
     */
    private initPlayerStaminaData(): any {
        let playerStaminaData = readLocalStorage("PlayerStaminaData");
        if (playerStaminaData) {
            this._playerStaminaData = playerStaminaData;
        } else {
            this._playerStaminaData = {
                stamina: 30,  // 体力的默认初始值为30
                staminaGetTime: new Date().getTime()
            }

            this.savePlayerStaminaData();
        }
    }

    /**
     * @description: 初始化玩家的五味资源剩余获取数量
     * @return {*}
     */    
    private initPlayerWuweiResLeftCount() {
        let playerWuweiResLeftCount = readLocalStorage("PlayerWuweiResLeftCount");
        if (playerWuweiResLeftCount) {
            this._playerWuweiResLeftCount = playerWuweiResLeftCount;
        } else {
            this._playerWuweiResLeftCount = {
                suan: 6,
                tian: 6,
                ku: 6,
                la: 6,
                xian: 6
            }

            writeLocalStorageAsync('PlayerWuweiResLeftCount', this._playerWuweiResLeftCount)
                .then(() => {
                    log('写入本地存储成功');
                })
                .catch((error) => {
                    error('写入本地存储失败:', error);
                });
        }
    }

    /**
     * @description: 初始化玩家研发火锅底料的五味资源数量
     * @return {*}
     */    
    private initPlayerHotpotSynthesisResCount() {
        let playerHotpotSynthesisResCount = readLocalStorage("PlayerHotpotSynthesisResCount");
        if (playerHotpotSynthesisResCount) {
            this._playerHotpotSynthesisResCount = playerHotpotSynthesisResCount;
        } else {
            this._playerHotpotSynthesisResCount = {
                suan: 0,
                tian: 0,
                ku: 0,
                la: 0,
                xian: 0
            }

            writeLocalStorageAsync('PlayerHotpotSynthesisResCount', this._playerHotpotSynthesisResCount)
                .then(() => {
                    log('写入本地存储成功');
                })
                .catch((error) => {
                    error('写入本地存储失败:', error);
                });
        }
    }

    /**
     * @description: 初始化玩家研发菜品的元素资源数量
     * @return {*}
     */    
    private initPlayerDishesSynthesisResCount() {
        let playerDishesSynthesisResCount = readLocalStorage("PlayerDishesSynthesisResCount");
        if (playerDishesSynthesisResCount) {
            this._playerDishesSynthesisResCount = playerDishesSynthesisResCount;
        } else {
            this._playerDishesSynthesisResCount = {
                element1: 0,
                element2: 0,
                element3: 0
            }

            writeLocalStorageAsync('PlayerDishesSynthesisResCount', this._playerDishesSynthesisResCount)
                .then(() => {
                    log('写入本地存储成功');
                })
                .catch((error) => {
                    error('写入本地存储失败:', error);
                });
        }
    }

    /**
     * @description: 初始化玩家的其它道具相关数据
     * @return {*}
     */    
    private initPlayerOtherProps() {
        let playerOtherProps = readLocalStorage("PlayerOtherProps");
        if (playerOtherProps) {
            this._playerOtherProps = playerOtherProps;
        } else {
            this._playerOtherProps = [
                {
                    propId: 1,
                    propNameCZ: "美味饼干",
                    propNameEN: "Delicious Biscuits",
                    propCount: 0
                },
                {
                    propId: 2,
                    propNameCZ: "四叶草",
                    propNameEN: "Four Leaf Clover",
                    propCount: 0
                },
                {
                    propId: 3,
                    propNameCZ: "培训笔记",
                    propNameEN: "Training Notes",
                    propCount: 0
                },
                {
                    propId: 4,
                    propNameCZ: "幸运积分",
                    propNameEN: "Lucky Points",
                    propCount: 0
                }
            ];

            writeLocalStorageAsync('PlayerOtherProps', this._playerOtherProps)
                .then(() => {
                    log('写入本地存储成功');
                })
                .catch((error) => {
                    error('写入本地存储失败:', error);
                });
        }
    }

    /**
     * @description: 初始化玩家的菜单数据
     * @return {*}
     */
    private initPlayerMenuData(): any {
        let playerMenuData = readLocalStorage("PlayerMenuData");
        if (playerMenuData) {
            this._playerMenuData = playerMenuData;
        } else {
            resources.load("Datas/PlayerMenuInitData", JsonAsset, (err, jsonAsset: JsonAsset) => {
                if (err) {
                    error("PlayerData initPlayerMenuData error: ", err);
                }

                let playerMenuInitJson = jsonAsset.json;
                let playerMenuInitDatas = playerMenuInitJson.PlayerMenuInitData;
                this._playerMenuData = playerMenuInitDatas;

                // 异步写入到本地存储中，防止掉帧
                writeLocalStorageAsync('PlayerMenuData', this._playerMenuData)
                    .then(() => {
                        log('写入本地存储成功');
                    })
                    .catch((error) => {
                        error('写入本地存储失败:', error);
                    });
            });
        }
    }

    /**
     * @description: 初始化玩家的仓库数据
     * @return {*}
     */    
    private initPlayerWareHouseCellsData() {
        let playerWareHouseCellsData = readLocalStorage("PlayerWareHouseCellsData");
        if (playerWareHouseCellsData) {
            this._playerWareHouseCellsData = playerWareHouseCellsData;
        } else {
            resources.load("Datas/WareHouseCellsInfo", JsonAsset, (err, jsonAsset: JsonAsset) => {
                if (err) {
                    error("Player warehouse cells info load error:", err);
                }

                let playerWhciJson = jsonAsset.json;
                let playerWhciDatas = playerWhciJson.CellsInfo;
                this._playerWareHouseCellsData = playerWhciDatas;
                writeLocalStorageAsync('PlayerWareHouseCellsData', this._playerWareHouseCellsData)
                    .then(() => {
                        log('玩家的仓库数据，初始化写入本地存储成功');
                    })
                    .catch((error) => {
                        error('玩家的仓库数据，初始化写入本地存储失败:', error);
                    });

            });
        }
    }

    /**
     * @description: 获取玩家的五味资源剩余可获取的数量
     * @return {*}
     */    
    getWuweiResLeftCount() {
        return this._playerWuweiResLeftCount;
    }

    /**
     * @description: 获取玩家的仓库数据
     * @return {*}
     */    
    getPlayerWareHouseCellsData() {
        return this._playerWareHouseCellsData;
    }

    /**
     * @description: 获取玩家当前所有的菜单数据
     * @return {*}
     */
    getPlayerMenuData() {
        return this._playerMenuData;
    }

    /**
     * @description: 根据菜单项ID获取玩家菜单数据
     * @param {number} menuItemId 菜单项ID
     * @return {*}
     */
    getPlayerMenuDataByMenuItemId(menuItemId: number) {
        for (let i = 0; i < this._playerMenuData.length; i++) {
            const onePlayerMenuData = this._playerMenuData[i];
            let findMenuItem = onePlayerMenuData.MenuItems.find((item) => { return item.ItemId == menuItemId; });
            if (findMenuItem) {
                return findMenuItem;
            }
        }
    }

    /**
     * @description: 获取某个菜单类型的菜单数据
     * @param {MENU_PANEL_TYPE} menuType 菜单类型：火锅、菜品、蘸料
     * @return {*}
     */
    getPlayerMenuDataByMenuType(menuType: MENU_PANEL_TYPE): IPlayerMenuItemData[] {
        let onePlayerMenuData = this._playerMenuData.find((onePlayerMenuData: any) => onePlayerMenuData.MenuType == menuType);
        if (onePlayerMenuData) {
            return onePlayerMenuData.MenuItems;
        }
        return null;
    }

    /**
     * @description: 获取某个菜单类型的某个菜单子类型的菜单数据
     * @param {MENU_PANEL_TYPE} menuType 菜单类型：火锅、菜品、蘸料
     * @param {HOTPOT_SOUP_TYPE} menuSubType 菜单子类型：HOTPOT_SOUP_TYPE、DISHES_TYPE、DIPPING_SAUCE_TYPE
     * @return {*}
     */
    getPlayerMenuDataByMenuTypeAndSubType(menuType: MENU_PANEL_TYPE, menuSubType: HOTPOT_SOUP_TYPE | DISHES_TYPE | DIPPING_SAUCE_TYPE): IPlayerMenuItemData[] {
        let findMenuItems = this.getPlayerMenuDataByMenuType(menuType);
        if (findMenuItems) {
            if (menuSubType === HOTPOT_SOUP_TYPE.HOTPOT_ALL || menuSubType === DISHES_TYPE.DISHES_ALL || menuSubType === DIPPING_SAUCE_TYPE.DIPPING_SAUCE_ALL) {
                return findMenuItems;
            }
            return findMenuItems.filter((item) => { return item.MenuSubType == menuSubType; });
        }
    }

    /**
     * @description: 玩家菜单项的等级增加
     * @param {MENU_PANEL_TYPE} menuType
     * @param {HOTPOT_SOUP_TYPE} menuSubType
     * @param {number} itemId
     * @return {*}
     */
    addPlayerMenuItemLevel(menuType: MENU_PANEL_TYPE, menuSubType: HOTPOT_SOUP_TYPE | DISHES_TYPE | DIPPING_SAUCE_TYPE, itemId: number) {
        let findMenuItems = this.getPlayerMenuDataByMenuTypeAndSubType(menuType, menuSubType);
        if (findMenuItems) {
            let findMenuItem = findMenuItems.find((item) => { return item.ItemId == itemId; });
            if (findMenuItem) {
                findMenuItem.ItemLevel++;

                // 异步写入到本地存储中，防止掉帧
                writeLocalStorageAsync('PlayerMenuData', this._playerMenuData)
                    .then(() => {
                        log('更新玩家菜单等级数据，写入本地存储成功');
                    })
                    .catch((error) => {
                        error('更新玩家菜单等级数据，写入本地存储失败:', error);
                    });
            }
        }
    }

    /**
     * @description: 玩家菜单项的销量增加
     * @param {MENU_PANEL_TYPE} menuType
     * @param {HOTPOT_SOUP_TYPE} menuSubType
     * @param {number} itemId
     * @return {*}
     */
    addPlayerMenuItemSaleCount(menuType: MENU_PANEL_TYPE, menuSubType: HOTPOT_SOUP_TYPE | DISHES_TYPE | DIPPING_SAUCE_TYPE, itemId: number) {
        let findMenuItems = this.getPlayerMenuDataByMenuTypeAndSubType(menuType, menuSubType);
        if (findMenuItems) {
            let findMenuItem = findMenuItems.find((item) => { return item.ItemId == itemId; });
            if (findMenuItem) {
                findMenuItem.ItemSaleCount++;

                // 异步写入到本地存储中，防止掉帧
                writeLocalStorageAsync('PlayerMenuData', this._playerMenuData)
                    .then(() => {
                        log('更新玩家菜单销售数量数据，写入本地存储成功');
                    })
                    .catch((error) => {
                        error('更新玩家菜单销售数量数据，写入本地存储失败:', error);
                    });
            }
        }
    }

    /**
     * @description: 保存玩家的体力数据到本地存储中
     * @return {*}
     */    
    savePlayerStaminaData() {
        writeLocalStorageAsync('PlayerStaminaData', this._playerStaminaData)
            .then(() => {
                log('写入本地存储成功');
            })
            .catch((error) => {
                error('写入本地存储失败:', error);
            });
    }

    /**
     * @description: 获取游戏等级信息
     * @return {*}
     */
    getGameLevelInfo() {
        return this._gameLevelInfo;
    }

    /**
     * @description: 根据等级序号获取游戏等级信息
     * @param {number} levelNum 等级序号
     * @return {*}
     */
    getGameLevelInfoByLevelNum(levelNum: number) {
        return this._gameLevelInfo[levelNum - 1];
    }

    /**
     * @description: 设置玩家当前等级数据
     * @param {IPlayerLevelData} data 玩家当前等级数据
     * @return {*}
     */
    setPlayerLevelData(data: IPlayerLevelData) {
        this._playerLevelData = data;
    }

    /**
     * @description: 增加玩家等级数据的设施评分
     * @param {number} score
     * @return {*}
     */
    addPlayerLevelFacilityScore(score: number) {
        this._playerLevelData.facilityScore += score;
    }

    /**
     * @description: 增加玩家等级数据的服务评分
     * @param {number} score
     * @return {*}
     */
    addPlayerLevelServeScore(score: number) {
        this._playerLevelData.serveScore += score;
    }

    /**
     * @description: 增加玩家等级数据的服务评分
     * @param {number} score
     * @return {*}
     */
    addPlayerLevelFoodScore(score: number) {
        this._playerLevelData.foodScore += score;
    }

    /**
     * @description: 获取玩家当前等级数据
     * @return {*}
     */
    getPlayerLevelData() {
        return this._playerLevelData;
    }

    /**
    * @description: 保存玩家当前等级数据到本地存储中
    * @return {*}
    */
    private savePlayerLevelData() {
        writeLocalStorageAsync('PlayerLevelData', this._playerLevelData)
            .then(() => {
                log('写入本地存储成功');
            })
            .catch((error) => {
                error('写入本地存储失败:', error);
            });
    }

    /**
     * @description: 获取玩家当前店铺数据
     * @return {*}
     */
    getPlayerShopData() {
        return this._playerShopData;
    }

    /**
     * @description: 设置玩家当前店铺数据
     * @param {number} areaId
     * @param {number} itemId
     * @param {number} subItemId
     * @return {*}
     */
    setPlayerShopData(areaId: number, itemId?: number, subItemId?: number) {
        if (areaId == undefined) {
            return;
        }

        if (itemId == undefined) {
            this._playerShopData[areaId].unlocked = true;
        } else if (subItemId == undefined) {
            this._playerShopData[areaId].items[itemId].unlocked = true;
        } else {
            this._playerShopData[areaId].items[itemId].unlocked = true;
            this._playerShopData[areaId].items[itemId].subItems[subItemId].unlocked = true;
        }

        this.savePlayerShopData();
    }

    /**
     * @description: 保存玩家当前店铺数据到本地存储中
     * @return {*}
     */
    private savePlayerShopData() {
        writeLocalStorageAsync('PlayerShopData', this._playerShopData)
            .then(() => {
                log('写入本地存储成功');
            })
            .catch((error) => {
                error('写入本地存储失败:', error);
            });
    }

    /**
     * @description: 获取玩家当前员工数据
     * @return {*}
     */
    getAllPlayerEmployeeData() {
        return this._playerEmployeeData;
    }

    /**
     * @description: 根据区域、员工类型、员工序号获取玩家当前员工数据
     * @param {GAME_AREA} area
     * @param {EMPLOYEE_PANEL_TYPE} itemType
     * @param {number} subItemId
     * @return {*}
     */
    getPlayerEmployeeData(area: GAME_AREA, itemType: EMPLOYEE_PANEL_TYPE, subItemId: number) {
        if (area == undefined || itemType == undefined || subItemId == undefined) {
            return;
        }

        let epOneAreaItems = this._playerEmployeeData.find((onePlayerEpData: any) => onePlayerEpData.Area == area);
        let epItem = epOneAreaItems.Items.find((item) => { return item.ItemType == itemType; });
        if (epItem) {
            let epSubItems = epItem.SubItems;
            let oneTrueEp = epSubItems.find((item) => { return item.SubItemId == subItemId; });
            if (oneTrueEp) {
                return oneTrueEp;
            } else {
                return;
            }
        }
    }

    /**
     * @description: 设置玩家员工数据的某个员工是否被雇佣
     * @param {GAME_AREA} area
     * @param {EMPLOYEE_PANEL_TYPE} itemType
     * @param {number} subItemId
     * @param {EMPLOYEE_RECRUITMENT_STATES} isHired
     * @return {*}
     */
    setPlayerEmployeeIsHired(area: GAME_AREA, itemType: EMPLOYEE_PANEL_TYPE, subItemId: number, isHired: EMPLOYEE_RECRUITMENT_STATES) {
        let findEp = this.getPlayerEmployeeData(area, itemType, subItemId);
        if (findEp) {
            findEp.Status = isHired;
            this.savePlayerEmployeeData();
        } else {
            error('设置玩家员工数据的某个员工是否被雇佣失败，未找到该员工数据');
        }
    }

    /**
     * @description: 设置玩家员工数据的某个员工等级
     * @param {GAME_AREA} area
     * @param {EMPLOYEE_PANEL_TYPE} itemType
     * @param {number} subItemId
     * @param {number} level
     * @return {*}
     */
    setPlayerEmployeeLevel(area: GAME_AREA, itemType: EMPLOYEE_PANEL_TYPE, subItemId: number, level: number) {
        let findEp = this.getPlayerEmployeeData(area, itemType, subItemId);
        if (findEp) {
            findEp.Level = level;
            this.savePlayerEmployeeData();
        } else {
            error('设置玩家员工数据的某个员工等级失败，未找到该员工数据');
        }
    }

    /**
     * @description: 保存玩家当前员工数据到本地存储中
     * @return {*}
     */
    private savePlayerEmployeeData() {
        writeLocalStorageAsync('PlayerEmployeeData', this._playerEmployeeData)
            .then(() => {
                log('玩家员工数据，写入本地存储成功');
            })
            .catch((error) => {
                error('玩家员工数据，写入本地存储失败:', error);
            });
    }

    /**
     * @description: 获取玩家当前所在的区域
     * @return {*}
     */
    getPlayerArea() {
        return this._currentArea;
    }

    /**
     * @description: 设置玩家当前所在的区域
     * @param {GAME_AREA} area
     * @return {*}
     */
    setPlayerArea(area: GAME_AREA) {
        this._currentArea = area;
    }

    /**
     * @description: 获取玩家当前的经济数据：现金、钻石
     * @return {*}
     */    
    getPlayerEconomyData() {
        return this._playerEconomyData;
    }

    /**
     * @description: 获取玩家当前的体力数据
     * @return {*}
     */    
    getPlayerStaminaData() {
        return this._playerStaminaData;
    }

    /**
     * @description: 保存玩家经济数据到本地存储中
     * @return {*}
     */
    private savePlayerEconomyData() {
        writeLocalStorageAsync('PlayerEconomyData', this._playerEconomyData)
            .then(() => {
                log('写入本地存储成功');
            })
            .catch((error) => {
                error('写入本地存储失败:', error);
            });
    }

    /**
     * @description: 保存玩家的仓库数据到本地存储中
     * @return {*}
     */    
    savePlayerWareHouseCellsData() {
        writeLocalStorageAsync('PlayerWareHouseCellsData', this._playerWareHouseCellsData)
            .then(() => {
                log('玩家的仓库数据，写入本地存储成功');
            })
            .catch((error) => {
                error('玩家的仓库数据，写入本地存储失败:', error);
            });
    }

    /**
     * @description: 保存玩家的五味资源剩余获取数量到本地存储中
     * @return {*}
     */    
    savePlayerWuweiResLeftCount() {
        writeLocalStorageAsync('PlayerWuweiResLeftCount', this._playerWuweiResLeftCount)
            .then(() => {
                log('写入本地存储成功');
            })
            .catch((error) => {
                error('写入本地存储失败:', error);
            });
    }

    /**
     * @description: 增加玩家的五味资源剩余获取数量
     * @param {number} amount
     * @param {WUWEI_TYPE} wuWeiType
     * @return {*}
     */    
    addWuweiResCount(amount: number, wuWeiType: WUWEI_TYPE) {
        switch (wuWeiType) {
            case WUWEI_TYPE.SUAN:
                this._playerWuweiResLeftCount.suan += amount;
                break;
            case WUWEI_TYPE.TIAN:
                this._playerWuweiResLeftCount.tian += amount;
                break;
            case WUWEI_TYPE.KU:
                this._playerWuweiResLeftCount.ku += amount;
                break;
            case WUWEI_TYPE.LA:
                this._playerWuweiResLeftCount.la += amount;
                break;
            case WUWEI_TYPE.XIAN:
                this._playerWuweiResLeftCount.xian += amount;
                break;
            default:
                break;
        }
    }

    /**
     * @description: 减少玩家的五味资源剩余获取数量
     * @param {number} amount
     * @param {WUWEI_TYPE} wuWeiType
     * @return {*}
     */    
    reduceWuweiResCount(amount: number, wuWeiType: WUWEI_TYPE) {
        switch (wuWeiType) {
            case WUWEI_TYPE.SUAN:
                this._playerWuweiResLeftCount.suan -= amount;
                break;
            case WUWEI_TYPE.TIAN:
                this._playerWuweiResLeftCount.tian -= amount;
                break;
            case WUWEI_TYPE.KU:
                this._playerWuweiResLeftCount.ku -= amount;
                break;
            case WUWEI_TYPE.LA:
                this._playerWuweiResLeftCount.la -= amount;
                break;
            case WUWEI_TYPE.XIAN:
                this._playerWuweiResLeftCount.xian -= amount;
                break;
            default:
                break;
        }
    }

    /**
     * @description: 增加现金数量
     * @param {number} amount
     * @return {*}
     */
    addCash(amount: number) {
        this._playerEconomyData.cash += amount;
    }

    /**
     * @description: 增加钻石数量
     * @param {number} amount
     * @return {*}
     */
    addDiamond(amount: number) {
        this._playerEconomyData.diamond += amount;
    }

    /**
     * @description: 增加体力值
     * @param {number} amount
     * @return {*}
     */
    addStamina(amount: number) {
        this._playerStaminaData.stamina += amount;
    }

    /**
     * @description: 减少现金数量
     * @param {number} amount
     * @return {*}
     */
    reduceCash(amount: number) {
        if (this._playerEconomyData.cash >= amount) {
            this._playerEconomyData.cash -= amount;
            return true;
        } else {
            return false;
        }
    }

    /**
     * @description: 减少钻石数量
     * @param {number} amount
     * @return {*}
     */
    reduceDiamond(amount: number) {
        if (this._playerEconomyData.diamond >= amount) {
            this._playerEconomyData.diamond -= amount;
            return true;
        } else {
            return false;
        }
    }

    /**
     * @description: 减少体力值
     * @param {number} amount
     * @return {*}
     */
    reduceStamina(amount: number) {
        if (this._playerStaminaData.stamina >= amount) {
            this._playerStaminaData.stamina -= amount;
            return true;
        } else {
            return false;
        }
    }

    /**
     * @description: 查询现金数量
     * @return {*}
     */
    getCash() {
        return this._playerEconomyData.cash;
    }

    /**
     * @description: 查询钻石数量
     * @return {*}
     */
    getDiamond() {
        return this._playerEconomyData.diamond;
    }

    /**
     * @description: 查询体力值
     * @return {*}
     */
    getStamina() {
        return this._playerStaminaData.stamina;
    }

    getStaminaLastTime() {
        return this._playerStaminaData.staminaGetTime;
    }

    /**
     * @description: 重置玩家的仓库格子数据
     * @param {number} cellIndex 仓库格子索引
     * @return {*}
     */    
    resetPlayerWareHouseOneCellData(cellIndex: number) {
        let oneCellData = this._playerWareHouseCellsData[cellIndex];
        oneCellData.hasItem = false;
        oneCellData.wuWeiItemIndex = cellIndex;
        oneCellData.wuWeiItemNodeName = "";
        oneCellData.wuWeiItemType = WUWEI_TYPE.NONE;
        oneCellData.wuWeiItemLevel = 1;

        this.savePlayerWareHouseCellsData();
    }

    /**
     * @description: 设置玩家的仓库格子数据，通过传入的仓库格子数据
     * @param {IPlayerWareHouseCellsData} oneCellData 仓库格子数据
     * @return {*}
     */    
    setPlayerWareHouseOneCellData(oneCellData: IPlayerWareHouseCellsData) {
        this._playerWareHouseCellsData[oneCellData.wuWeiItemIndex] = oneCellData;
        this.savePlayerWareHouseCellsData();
    }

    getPlayerHotpotSynthesisResCount() {
        return this._playerHotpotSynthesisResCount;
    }

    setPlayerHotpotSynthesisResCount(resType: WUWEI_TYPE, resCount: number) {
        switch (resType) {
            case WUWEI_TYPE.SUAN:
                this._playerHotpotSynthesisResCount.suan = resCount;
                break;
            case WUWEI_TYPE.TIAN:
                this._playerHotpotSynthesisResCount.tian = resCount;
                break;
            case WUWEI_TYPE.KU:
                this._playerHotpotSynthesisResCount.ku = resCount;
                break;
            case WUWEI_TYPE.LA:
                this._playerHotpotSynthesisResCount.la = resCount;
                break;
            case WUWEI_TYPE.XIAN:
                this._playerHotpotSynthesisResCount.xian = resCount;
                break;
            default:
                break;
        }
    }

    getPlayerDishesSynthesisResCount() {
        return this._playerDishesSynthesisResCount;
    }

    savePlayerHotpotSynthesisResCount() {
        writeLocalStorageAsync('PlayerHotpotSynthesisResCount', this._playerHotpotSynthesisResCount)
            .then(() => {
                log('写入本地存储成功');
            })
            .catch((error) => {
                error('写入本地存储失败:', error);
            });
    }

    savePlayerDishesSynthesisResCount() {
        writeLocalStorageAsync('PlayerDishesSynthesisResCount', this._playerDishesSynthesisResCount)
            .then(() => {
                log('写入本地存储成功');
            })
            .catch((error) => {
                error('写入本地存储失败:', error);
            });
    }

    getPlayerOtherProps() {
        return this._playerOtherProps;
    }
}


