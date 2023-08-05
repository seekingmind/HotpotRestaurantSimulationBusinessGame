/*
 * @Author: Zhong Sheng
 * @Date: 2023-05-15 17:04:10
 * @LastEditors: Zhong Sheng
 * @LastEditTime: 2023-05-18 14:40:45
 * @Description: 店铺滑动列表水平布局
 */

import { _decorator, Component, Label, log, Node, resources, Sprite, SpriteFrame } from 'cc';
import { ScrollViewUtilComp } from '../../Utils/ScrollViewUtilComp';
import { UIBase } from '../../Framework/UIBase';
const { ccclass, property } = _decorator;

@ccclass('ItemNormalHorizental')
export class ItemNormalHorizental extends UIBase {
    public subItemData: any = null;

    private _subItemIconUrlBase: string = "ImageAndEffect/UI/ShopPanel/SubItems/";

    onInit(params: any): void {
        
    }

    loadSubItemIcon(n: Node, picUrl: string) {
        resources.load(picUrl, SpriteFrame, (err, spriteFrame) => {
            if (err) {
                log(err);
                return;
            }
            n.getChildByName("subItemIcon").getComponent(Sprite).spriteFrame = spriteFrame;
        });
    }
}


