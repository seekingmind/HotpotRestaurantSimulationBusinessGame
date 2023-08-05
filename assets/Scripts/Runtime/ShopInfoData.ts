/*
 * @Author: Zhong Sheng
 * @Date: 2023-05-17 17:24:01
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-05-23 17:41:54
 * @Description: 店铺信息相关的数据，由该类在游戏运行时持有
 */

import { JsonAsset, error, log, resources } from "cc";
import Singleton from "../Base/Singleton";
import { GAME_AREA } from "../Enums/GameEnums";
import { readLocalStorage, writeLocalStorageAsync } from "../Util/CommonUtil";

interface IShopInfoAreaData {
    area: GAME_AREA;
    items: IShopInfoItemData[];
}

interface IShopInfoItemData {
    id: number;
    itemName: string;
    precondition: Object;
    subItems: IShopInfoSubItemsData[];
}

interface IShopInfoSubItemsData {
    id: number;
    subItemName: string;
    subItemPicName: string;
    subItemPrecondition: Object;
    subItemPrice: number;
    subItemDescription: string;
    subItemAttr: IShopInfoSubItemAttr[];
    subItemInfo: string;
}

interface IShopInfoSubItemAttr {
    attrName: string;
    attrSymbol: string;
    attrValue: string;
}

export class ShopInfoData extends Singleton {
    static get Instance() {
        return super.GetInstance<ShopInfoData>();
    }

    private _shopInfoAreaData: IShopInfoAreaData[];

    constructor() {
        super();
    }

    /**
     * @description: 初始化店铺信息数据
     * @return {*}
     */
    initShopInfoData(): any {
        let shopInfoAreaData = readLocalStorage("ShopInfoAreaData");
        if (shopInfoAreaData) {
            this._shopInfoAreaData = shopInfoAreaData;
        } else {
            resources.load("Datas/ShopInfo", JsonAsset, (err, jsonAsset: JsonAsset) => {
                if (err) {
                    error('加载游戏店铺信息数据失败:', err);
                }

                let shopInfoDataJson = jsonAsset.json;
                let shopInfoDatas = shopInfoDataJson.ShopInfoes;
                this._shopInfoAreaData = shopInfoDatas;

                writeLocalStorageAsync('ShopInfoAreaData', this._shopInfoAreaData)
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
     * @description: 获取店铺信息数据
     * @return {*}
     */
    getShopInfoDatas() {
        return this._shopInfoAreaData;
    }

    /**
     * @description: 根据区域获取店铺信息数据
     * @param {GAME_AREA} area
     * @return {*}
     */
    getShopInfoItemByArea(area: GAME_AREA): any {
        return this._shopInfoAreaData.find((shopInfoAreaData) => shopInfoAreaData.area === area);
    }

    /**
     * @description: 根据子类目ID获取店铺子类目信息数据
     * @param {number} subItemId
     * @param {number} itemId
     * @return {*}
     */
    getShopInfoSubItemBySubItemId(itemId: number, subItemId: number): any {

    }
}


