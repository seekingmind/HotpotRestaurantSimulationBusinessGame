/*
 * @Author: Zhong Sheng
 * @Date: 2023-05-09 17:35:29
 * @LastEditors: Zhong Sheng
 * @LastEditTime: 2023-05-15 18:07:49
 * @Description: 食物评分提升提示面板
 */
import { _decorator, log } from 'cc';
import { UIBase } from '../../Framework/UIBase';
import { AudioManager } from '../../../Runtime/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('FoodTipsPanel')
export class FoodTipsPanel extends UIBase {
    private _uiPanelOpenSound = "Audio/Sound/uiPanelOpenClick";
    private _uiPanelOpenClose = "Audio/Sound/uiPanelCloseBtn";

    onInit(params: any): void {
        log("FoodTipsPanel onInit");

        this.addButtonClick("CloseButton", () => {
            AudioManager.inst.playOneShot(this._uiPanelOpenClose);
            this.closeSelf();
        });
    }
}


