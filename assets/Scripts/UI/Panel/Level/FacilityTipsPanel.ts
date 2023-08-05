/*
 * @Author: Zhong Sheng
 * @Date: 2023-05-09 13:56:18
 * @LastEditors: Zhong Sheng
 * @LastEditTime: 2023-05-15 18:06:56
 * @Description: 设施评分提升提示面板
 */
import { _decorator, log } from 'cc';
import { UIBase } from '../../Framework/UIBase';
import { UIManager } from '../../Framework/UIManager';
import { UILAYER } from '../../Framework/UIDefine';
import { AudioManager } from '../../../Runtime/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('FacilityTipsPanel')
export class FacilityTipsPanel extends UIBase {
    private _uiPanelOpenSound = "Audio/Sound/uiPanelOpenClick";
    private _uiPanelCloseSound = "Audio/Sound/uiPanelCloseBtn";

    onInit(params: any): void {
        log("FacilityTipsPanel onInit");

        this.addButtonClick("CloseButton", () => {
            AudioManager.inst.playOneShot(this._uiPanelCloseSound);
            this.closeSelf();
        });

        this.addButtonClick("No", () => {
            AudioManager.inst.playOneShot(this._uiPanelCloseSound);
            this.closeSelf();
        });

        // 点击确定按钮，关闭当前面板，打开店铺面板
        this.addButtonClick("Yes", ()=>{
            AudioManager.inst.playOneShot(this._uiPanelOpenSound);

            this.closeSelf();
            UIManager.Instance.closeUI("levelPanel");

            UIManager.Instance.openUI("shopPanel", undefined, UILAYER.E_PANEL);
        });
    }
}


