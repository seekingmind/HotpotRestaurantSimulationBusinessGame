/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-05-23 12:33:17
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-05-23 16:18:32
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\UI\Panel\Shop\ShopSubItemPanel.ts
 * @Description: 店铺子项面板
 */
import { _decorator, Component, error, instantiate, Label, log, Node, Prefab, resources, Sprite, SpriteFrame } from 'cc';
import { UIBase } from '../../Framework/UIBase';
import { AudioManager } from '../../../Runtime/AudioManager';
import { uiPanelCloseSound } from '../../../Util/CommonUtil';
const { ccclass, property } = _decorator;

@ccclass('ShopSubItemPanel')
export class ShopSubItemPanel extends UIBase {
    onInit(params: any): void {
        log("ShopSubItemPanel onInit");

        this.addButtonClick("CloseButton", () => {
            AudioManager.inst.playOneShot(uiPanelCloseSound);
            this.closeSelf();
        });
    }

    onEnter(params: any): void {
        this.setParams(params);
    }

    setParams(params: any): void {
        log("ShopSubItemPanel setParams");
        log(params);

        let shopInfoDataSubItem = params[0];
        let playerDataSubItem = params[1];
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
            this.getNode("SubItemPic").getChildByName("SubPic").getComponent(Sprite).spriteFrame = spriteFrame;
        });

        // 设置子项名称
        this.getLabel("NameText").string = shopInfoDataSubItem.subItemName;
        // 设置子项描述
        this.getLabel("SubDesc").string = shopInfoDataSubItem.subItemDescription;

        // 设置子项属性的设施属性名和属性值还有属性的符号（+ 或者 -）
        let subItemAttrs = shopInfoDataSubItem.subItemAttr;
        this.getLabel("AttrFacilityName").string = subItemAttrs[0].attrName;
        this.getLabel("AttrFacilityValueSymbol").string = subItemAttrs[0].attrSymbol;
        this.getLabel("AttrFacilityValue").string = subItemAttrs[0].attrValue;

        // 设置子项属性的其它属性值
        if (subItemAttrs.length > 1) {
            this.getNode("AttrDetailOther").active = true;
            
            this.getLabel("AttrDetailOtherName").string = subItemAttrs[1].attrName;
            this.getLabel("AttrDetailOtherValueSymbol").string = subItemAttrs[1].attrSymbol;

            let otherAttrValue = "";
            let attValue = subItemAttrs[1].attrValue;
            if (attValue > 0 && attValue < 1) {
                otherAttrValue = (attValue * 100).toString() + "%";
            } else {
                otherAttrValue = attValue.toString();
            }
            this.getLabel("AttrDetailOtherValue").string = otherAttrValue;
        } else if (subItemAttrs.length == 1) {
            this.getNode("AttrDetailOther").active = false;
        }

        // 设置子项的信息，判断 playerDataSubItem 中的 stats 值
        let infoDetail = this.getNode("SubItemInfo").getChildByName("InfoDetail");
        let subItemStats = playerDataSubItem.stats;
        if (infoDetail.children.length > 0) {
            infoDetail.removeAllChildren();
        }
        if (subItemStats == "INUSE") {
            // 使用中
            resources.load("Prefabs/UI/Panel/Shop/SubItem/SubItemInUseInfo", Prefab, (err, prefab) => {
                if (err) {
                    error(err);
                }
                let subItemInUseInfo = instantiate(prefab);
                infoDetail.addChild(subItemInUseInfo);
            });
        } else if (subItemStats == "UNPURCHASED") {
            // 已解锁，未购买
            resources.load("Prefabs/UI/Panel/Shop/SubItem/SubItemUnpurchasedInfo", Prefab, (err, prefab) => {
                if (err) {
                    error(err);
                }
                let subItemUnPurchasedInfo = instantiate(prefab);
                subItemUnPurchasedInfo.getChildByName("PurchaseMoneyNum").getComponent(Label).string = shopInfoDataSubItem.subItemPrice.toString();
                infoDetail.addChild(subItemUnPurchasedInfo);
            });
        } else if (subItemStats == "PURCHASED") {
            // 已购买，未使用
            resources.load("Prefabs/UI/Panel/Shop/SubItem/SubItemPurchasedInfo", Prefab, (err, prefab) => {
                if (err) {
                    error(err);
                }
                let subItemPurchasedInfo = instantiate(prefab);
                infoDetail.addChild(subItemPurchasedInfo);
            });
        } else if (subItemStats == "LOCKED") {
            // 未解锁
            resources.load("Prefabs/UI/Panel/Shop/SubItem/SubItemLockedInfo", Prefab, (err, prefab) => {
                if (err) {
                    error(err);
                }
                let subItemLockedInfo = instantiate(prefab);
                subItemLockedInfo.getComponent(Label).string = "解锁条件：解锁 " + shopInfoDataSubItem.subItemPrecondition.unlock;
                infoDetail.addChild(subItemLockedInfo);
            });
        }
    }
}


