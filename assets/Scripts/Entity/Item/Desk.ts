/*
 * @Author: Zhong Sheng
 * @Date: 2023-04-06 01:32:59
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-07-14 01:31:38
 * @Description: 桌子
 */

import { _decorator, Component, log, Node, resources, Sprite, SpriteFrame, Vec3 } from 'cc';
import EventManager from '../../Runtime/EventManager';
import GameData from '../../Runtime/GameData';
import { DESK_STATES, GAME_EVENTS, HOTPOT_SOUP_TYPE, MENU_FOOD_TYPE, SEAT_STATES } from '../../Enums/GameEnums';
import { writeLocalStorageAsync } from '../../Util/CommonUtil';
import { DeskData } from '../../Runtime/DeskData';
const { ccclass } = _decorator;

@ccclass('Desk')
export class Desk extends Component {
    public deskInfo: any = null!;

    public deskRuntimeData: any = null!;

    private checkHotpotSoupDishFinish: any = null!;

    private _sceneMenuPicBasePath = "ImageAndEffect/UI/MenuPanel/ItemPic";

    start() {
        this.initView();
        this.initEvents();
    }

    /**
     * @description: 初始化桌子配置数据
     * @param {any} configData
     * @return {*}
     */
    initConfigData(configData: any) {
        this.deskInfo = configData;
    }

    /**
     * @description: 初始化桌子运行时状态数据
     * @param {any} deskLocalData
     * @return {*}
     */
    initRuntimeData(deskLocalData: any) {
        this.deskRuntimeData = deskLocalData;
    }

    initView() {
        this.node.position = new Vec3(this.deskInfo.position[0], this.deskInfo.position[1], this.deskInfo.position[2]);
    }

    initEvents() {
        // 员工将菜送达桌子的位置
        EventManager.Instance.addEvent(GAME_EVENTS.EMPLOYEE_SERVE_FINISH, this.onEmployeeServeFinish, this);

        // 员工清理完桌子
        EventManager.Instance.addEvent(GAME_EVENTS.EMPLOYEE_CLEAN_DESK_FINISH, this.onEmployeeCleanFinish, this);
    }

    updateDeskInfo(deskId: number, status: number) {
        if (this.deskRuntimeData.id != deskId) {
            log("桌子ID不匹配");
            return;
        }
        this.deskRuntimeData.status = status;
    }

    getDeskIsFree() {
        return this.deskRuntimeData.status == 0 ? true : false;
    }

    /**
     * @description: 员工将菜送达桌子的位置后，桌子添加上顾客所点菜
     * @return {*}
     */
    onEmployeeServeFinish(deskId) {
        if (this.deskRuntimeData.id != deskId) {
            return;
        }

        let customerOrderedFood = GameData.CustomerOrderFood.get(this.deskRuntimeData.id);
        if (customerOrderedFood.length == 0) {
            return;
        }

        for (let i = 0; i < customerOrderedFood.length; i++) {
            const food = customerOrderedFood[i];
            if (food.MenuSubType == HOTPOT_SOUP_TYPE.CYHG ||
                food.MenuSubType == HOTPOT_SOUP_TYPE.BPHG ||
                food.MenuSubType == HOTPOT_SOUP_TYPE.MNHG ||
                food.MenuSubType == HOTPOT_SOUP_TYPE.JZHG ||
                food.MenuSubType == HOTPOT_SOUP_TYPE.YGHG ||
                food.MenuSubType == HOTPOT_SOUP_TYPE.QTHG) {
                continue;
            }

            resources.load(this._sceneMenuPicBasePath + '/Dishes/Scene_Dishes/' + food.ItemSceneImgName + '/spriteFrame',
                SpriteFrame, (err, spriteFrame) => {
                    if (err) {
                        console.error("我是桌子，加载菜品的图片资源失败了：", err);
                    }

                    let foodNode = new Node(`Scene_dish_${food.ItemId}`);
                    foodNode.addComponent(Sprite);
                    foodNode.getComponent(Sprite).spriteFrame = spriteFrame;
                    this.node.addChild(foodNode);
                });
        }

        // 更新数据中心菜品已经完成并送到了桌子上
        GameData.updateDishFinish(this.deskRuntimeData.id, true);

        if (GameData.hotpotSoupFinish.get(this.deskRuntimeData.id) == true && GameData.dishFinish.get(this.deskRuntimeData.id) == true) {
            // 通知顾客开始吃
            EventManager.Instance.emit(GAME_EVENTS.CUSTOMER_EAT_FOOD, this.deskRuntimeData);
        } else {
            this.checkHotpotSoupDishFinish = function () {
                if (GameData.hotpotSoupFinish.get(this.deskRuntimeData.id) == true && GameData.dishFinish.get(this.deskRuntimeData.id) == true) {
                    // 通知顾客开始吃
                    EventManager.Instance.emit(GAME_EVENTS.CUSTOMER_EAT_FOOD, this.deskRuntimeData);
                    this.unschedule(this.checkHotpotSoupDishFinish);
                } else {
                    log("我是桌子，火锅汤底和菜品还没有完成并送到桌子上，每秒检查一遍");
                }
            }
            this.schedule(this.checkHotpotSoupDishFinish, 1);
        }
    }

    /**
     * @description: 员工清理完桌子
     * @return {*}
     */
    onEmployeeCleanFinish(deskInfo: any) {
        if (deskInfo.id == this.deskInfo.id) {
            // 清理桌子上的菜品图片
            let deskAllChildren = this.node.children;
            for (let i = 0; i < deskAllChildren.length; i++) {
                const child = deskAllChildren[i];
                if (child.name.indexOf("Scene_pot") != -1 || child.name.indexOf("Scene_dish") != -1) {
                    child.destroy();
                }
            }
            GameData.updateCustomerOrderFood(deskInfo.id);

            // 更新桌子状态信息为空闲
            this.updateDeskInfo(this.deskInfo.id, DESK_STATES.EMPTY);
            deskInfo.seatsInfo.forEach(seat => {
                if (seat.seatStatus === SEAT_STATES.OCCUPIED) {
                    seat.seatStatus = SEAT_STATES.EMPTY;
                    seat.customerId = '';
                }
            });
            DeskData.Instance.updateDeskDataById(deskInfo.id, deskInfo);
        }
    }
}


