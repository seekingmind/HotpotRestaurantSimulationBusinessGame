/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-05-25 14:47:24
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-07-14 01:36:48
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\Runtime\MenuInfoData.ts
 * @Description: 菜单配置数据
 */

import { JsonAsset, resources } from "cc";
import Singleton from "../Base/Singleton";
import { DIPPING_SAUCE_TYPE, DISHES_TYPE, HOTPOT_SOUP_TYPE, MENU_PANEL_TYPE } from "../Enums/GameEnums";

export interface IMenuInfo {
    MenuType: MENU_PANEL_TYPE;  // 菜单类型
    MenuName: string;  // 菜单名称
    MenuTypeId: number;  // 菜单类型ID
    MenuItems: Array<IMenuItem>;  // 菜单项
}

export interface IMenuItem {
    MenuSubType: HOTPOT_SOUP_TYPE | DISHES_TYPE;  // 菜单子类型
    ItemId: number;  // 菜单项ID
    ItemName: string;  // 菜单项名称
    ItemPrice: Array<ItemPrice>;  // 菜单项价格
    ItemCost: number;  // 菜单项成本
    ItemSceneImgName: string;  // 菜单项场景图片名称
    ItemUIIconImgName: string;  // 菜单项UI图标图片名称
    ItemFoodScore: Array<ItemFoodScore>; // 菜单项食物评分
    ItemDesc: string;  // 菜单项描述
}

type ItemPrice = {
    level: number;  // 等级
    price: number;  // 价格
}

type ItemFoodScore = {
    level: number;  // 等级
    score: number;  // 评分
}

export class MenuInfoData extends Singleton {
    static get Instance() {
        return super.GetInstance<MenuInfoData>();
    }

    private menuData: Array<IMenuInfo> = [];

    /**
     * @description: 初始化菜单数据，游戏运行时，从本地存储读取到内存中
     * @return {*}
     */
    public initMenuData(): any {
        resources.load("Datas/MenuInfo", JsonAsset, (err, jsonAsset: JsonAsset) => {
            if (err) {
                console.error(err);
                return;
            }
            let menuDataJson = jsonAsset.json;
            this.menuData = menuDataJson.MenuInfos;
        });
    }

    /**
     * @description: 获取所有菜单数据
     * @return {Array<IDish>}
     */
    public getMenuData(): Array<IMenuInfo> {
        return this.menuData;
    }

    /**
     * @description: 根据菜单项ID获取菜单数据
     * @param {number} itemId
     * @return {*}
     */    
    public getMenuDataByItemId(itemId: number): IMenuItem {
        let menuItem: IMenuItem = null!;
        for (let menuInfo of this.menuData) {
            menuItem = menuInfo.MenuItems.find((oneMenuItem) => oneMenuItem.ItemId === itemId);
            if (menuItem) {
                break;
            }
        }
        return menuItem;
    }

    /**
     * @description: 根据菜品面板类型获取菜单数据
     * @param {MENU_PANEL_TYPE} menuType 菜单面板类型
     * @return {*}
     */
    public getMenuDataByMenuType(menuType: MENU_PANEL_TYPE): IMenuInfo {
        return this.menuData.find((oneMenuData) => oneMenuData.MenuType === menuType);
    }

    /**
     * @description: 根据菜品面板类型和菜品子类型获取菜单数据
     * @param {MENU_PANEL_TYPE} menuType 菜单面板类型
     * @param {HOTPOT_SOUP_TYPE | DISHES_TYPE | DIPPING_SAUCE_TYPE} menuSubType 菜单子类型
     * @return {Array<IMenuItem>} 符合类型的菜单项
     */
    public getMenuDataByMenuTypeAndMenuSubType(menuType: MENU_PANEL_TYPE, menuSubType: HOTPOT_SOUP_TYPE | DISHES_TYPE | DIPPING_SAUCE_TYPE): Array<IMenuItem> {
        let menuData = this.getMenuDataByMenuType(menuType);

        // 区分一下 menuSubType 类型中的 ALL
        if (menuSubType === HOTPOT_SOUP_TYPE.HOTPOT_ALL || menuSubType === DISHES_TYPE.DISHES_ALL || menuSubType === DIPPING_SAUCE_TYPE.DIPPING_SAUCE_ALL) {
            return menuData.MenuItems;
        }

        let menuItems = menuData.MenuItems.filter((oneMenuItem) => oneMenuItem.MenuSubType === menuSubType);
        return menuItems;
    }

    /**
     * @description: 随机获取一种菜单类型
     * @return {*}
     */
    getRandomMenuType(): MENU_PANEL_TYPE {
        let menuTypes = [];
        for (let key in MENU_PANEL_TYPE) {
            if (MENU_PANEL_TYPE.hasOwnProperty(key) && MENU_PANEL_TYPE[key] !== HOTPOT_SOUP_TYPE) {
                menuTypes.push(MENU_PANEL_TYPE[key]);
            }
        }
        let randomIndex = Math.floor(Math.random() * menuTypes.length);
        return menuTypes[randomIndex];
    }
}


