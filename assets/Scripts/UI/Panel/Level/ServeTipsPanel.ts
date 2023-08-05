/*
 * @Author: Zhong Sheng
 * @Date: 2023-05-09 17:34:38
 * @LastEditors: Zhong Sheng
 * @LastEditTime: 2023-05-15 18:08:46
 * @Description: 服务评分提升提示面板
 */
import { _decorator, Component, log, Node } from 'cc';
import { UIBase } from '../../Framework/UIBase';
import { AudioManager } from '../../../Runtime/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('ServeTipsPanel')
export class ServeTipsPanel extends UIBase {
    private _uiPanelOpenSound = "Audio/Sound/uiPanelOpenClick";
    private _uiPanelOpenClose = "Audio/Sound/uiPanelCloseBtn";

    onInit(params: any): void {
        log("ServeTipsPanel onInit");

        this.addButtonClick("CloseButton", () => {
            AudioManager.inst.playOneShot(this._uiPanelOpenClose);
            this.closeSelf();
        });

        this.addButtonClick("No", () => {
            AudioManager.inst.playOneShot(this._uiPanelOpenClose);
            this.closeSelf();
        });
    }
}


