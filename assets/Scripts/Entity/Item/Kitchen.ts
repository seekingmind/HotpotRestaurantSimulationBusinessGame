/*
 * @Author: Zhong Sheng
 * @Date: 2023-04-13 22:55:41
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-07-14 01:35:48
 * @Description: 厨房，桌子id 和 火锅汤底id 以及 备菜台id 都有映射关系
 */

import { _decorator, Button, Component, error, EventHandler, instantiate, Label, log, Node, Prefab, resources, Sprite, SpriteFrame } from 'cc';
import EventManager from '../../Runtime/EventManager';
import GameData from '../../Runtime/GameData';
import { EMPLOYEE_PANEL_TYPE, EMPLOYEE_TASK_STATE, EMPLOYEE_TASK_TYPE, GAME_EVENTS, HOTPOT_SOUP_TYPE, KITCHEN_STATES, MENU_FOOD_TYPE } from '../../Enums/GameEnums';
import { AudioManager } from '../../Runtime/AudioManager';
import { EmployeeData } from '../../Runtime/EmployeeData';
import { EmployeeTasks, ITask } from '../../Runtime/EmployeeTasks';
import { generateUniqueId } from '../../Util/CommonUtil';
import { Desk } from './Desk';
import { MenuInfoData } from '../../Runtime/MenuInfoData';
const { ccclass, property } = _decorator;

@ccclass('KitchenBehavior')
export class KitchenBehavior extends Component {
    @property({ type: Node })
    public servingCounter: Node = null;  // 上菜台

    @property({ type: Node })
    public choppingBoard: Node = null;  // 菜品备菜台

    // 火锅汤底和桌子id的映射关系
    private deskIdHpsidMap: Map<number, number> = new Map<number, number>();

    private _hallUIBtnClickSound = "Audio/Sound/sceneUIClick";

    private _sceneMenuPicBasePath = "ImageAndEffect/UI/MenuPanel/ItemPic";

    start() {
        log("厨房初始化");
        this.initView();
        this.initEvent();
    }

    initView() {
        for (let i = 1; i <= 4; i++) {
            const soupName = `HotpotSoup${i}`;
            const soup = this.servingCounter.getChildByName(soupName);
            soup.active = false;
        }

        this.choppingBoard.getChildByName("Board").active = false;
    }

    initEvent() {
        // 厨房开始做菜
        EventManager.Instance.addEvent(GAME_EVENTS.KITCHEN_MAKE_FOOD_START, this.askKitchenMakeFood, this);

        // 员工到达上菜台
        EventManager.Instance.addEvent(GAME_EVENTS.EMPLOYEE_IN_SERVE_PLATE, this.employeeInServePlate, this);
    }

    /**
     * @description: 厨房正式做菜过程
     * @param {*} deskRuntimeData
     * @return {*}
     */
    askKitchenMakeFood(deskRuntimeData) {
        let deskId = deskRuntimeData.id;

        let hotpotSoupNode = this.servingCounter.getChildByName("HotpotSoup" + deskId.toString());
        let boardNode = this.choppingBoard.getChildByName("Board");

        // 备菜台上展示顾客点的火锅底料图片
        let customerOrderedFoods = GameData.CustomerOrderFood.get(deskId);
        for (let i = 0; i < customerOrderedFoods.length; i++) {
            const food = customerOrderedFoods[i];
            if (food.MenuSubType == HOTPOT_SOUP_TYPE.CYHG ||
                food.MenuSubType == HOTPOT_SOUP_TYPE.BPHG ||
                food.MenuSubType == HOTPOT_SOUP_TYPE.MNHG ||
                food.MenuSubType == HOTPOT_SOUP_TYPE.JZHG ||
                food.MenuSubType == HOTPOT_SOUP_TYPE.YGHG ||
                food.MenuSubType == HOTPOT_SOUP_TYPE.QTHG) {

                this.deskIdHpsidMap.set(deskId, food.ItemId);
                resources.load(this._sceneMenuPicBasePath + '/Hotpots/Scene_Hotpots/' + food.ItemSceneImgName + "/spriteFrame",
                    SpriteFrame, (err, spriteFrame) => {
                        if (err) {
                            console.log("我是厨房，加载火锅锅底精灵图失败了：", err);
                            return;
                        }
                        hotpotSoupNode.getComponent(Sprite).spriteFrame = spriteFrame;
                    });
            }
        }

        // 火锅底料制作
        resources.load("Prefabs/UI/Scene/Hall/HotpotCountDownPop", Prefab, (err, prefab) => {
            if (err) {
                console.log("我是厨房，加载倒计时圆环进度条的预制体失败了：", err);
                return;
            }
            const countDownPopNode = instantiate(prefab);
            hotpotSoupNode.addChild(countDownPopNode);
            hotpotSoupNode.active = true;

            const countDownCircleNode = hotpotSoupNode.getChildByName("HotpotCountDownPop").getChildByName("CircleCountDown");
            const countDownTxtNode = hotpotSoupNode.getChildByName("HotpotCountDownPop").getChildByName("CountDownTxt");
            let spriteFillRange = countDownCircleNode.getComponent(Sprite).fillRange;
            if (spriteFillRange < 0.1) {
                spriteFillRange = 1;
                countDownTxtNode.getComponent(Label).string = "10";
            }

            let hotpotSoupCountDownTime = function () {
                spriteFillRange -= 0.1;
                countDownCircleNode.getComponent(Sprite).fillRange = spriteFillRange;

                let countDownText = (Math.floor(spriteFillRange * 10)).toString();
                countDownTxtNode.getComponent(Label).string = countDownText;

                if (spriteFillRange < 0.1) {
                    log("火锅底料制作完成");
                    this.unschedule(hotpotSoupCountDownTime);

                    // 移除 hotsoup 节点下的子节点
                    hotpotSoupNode.removeAllChildren();

                    // 如果有配菜员，则生成一个员工任务，让空闲员工自己领取任务去执行
                    if (EmployeeData.Instance.getOneTypeEmployeeData(EMPLOYEE_PANEL_TYPE.PANELIST).length !== 0) {
                        let epTask: ITask = {
                            id: generateUniqueId(),
                            taskType: EMPLOYEE_TASK_TYPE.SERVE_HOTPOT,
                            status: EMPLOYEE_TASK_STATE.WAITING,
                            epType: EMPLOYEE_PANEL_TYPE.PANELIST,
                            taskTargetDeskData: deskRuntimeData,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }
                        EmployeeTasks.Instance.createTask(epTask);

                        // 通知配菜员要开始检查是否空闲了
                        EventManager.Instance.emit(GAME_EVENTS.CHECK_PANELIST_IDLE);
                    } else {
                        // 没有配菜员的情况
                        // 在 HotpotSoup 节点下添加一个火锅底料制作完成的子节点
                        resources.load("Prefabs/UI/Scene/Hall/HotpotSoupFinished", Prefab, (err, prefab) => {
                            if (err) {
                                console.log("我是厨房，加载火锅底料制作完成的预制体失败了：", err);
                                return;
                            }

                            let hotpotSoupFinishedNode = instantiate(prefab);
                            hotpotSoupNode.addChild(hotpotSoupFinishedNode);

                            // 动态添加上按钮组件以及对应的点击事件
                            let soupFinishedEventHandler = new EventHandler();
                            soupFinishedEventHandler.target = this.node;
                            soupFinishedEventHandler.component = "KitchenBehavior";
                            soupFinishedEventHandler.handler = "onHotpotSoupFinishedBtnClicked";
                            soupFinishedEventHandler.customEventData = deskId;
                            hotpotSoupFinishedNode.getComponent(Button).clickEvents.push(soupFinishedEventHandler);
                        });
                    }

                }
            }.bind(this);
            this.schedule(hotpotSoupCountDownTime, 1);
        });

        // 菜品制作
        resources.load("Prefabs/UI/Scene/Hall/BoardProgressBar", Prefab, (err, prefab) => {
            if (err) {
                log("我是厨房，加载切菜台进度条的预制体失败了：", err);
                return;
            }

            let boardProgressBarNode = instantiate(prefab);
            boardNode.addChild(boardProgressBarNode);
            // 显示切菜台
            boardNode.active = true;

            const boardProgressNode = boardNode.getChildByName("BoardProgressBar");
            const boardProgress = boardProgressNode.getChildByName("BarUp");
            let boardProgressFillRange = boardProgress.getComponent(Sprite).fillRange;
            if (boardProgressFillRange > 0.9) {
                boardProgressFillRange = 0;
            }

            let boardProgressSchedule = function () {
                boardProgressFillRange += 0.1;
                boardProgress.getComponent(Sprite).fillRange = boardProgressFillRange;
                if (boardProgressFillRange > 0.9) {
                    log("切菜完成");
                    this.unschedule(boardProgressSchedule);

                    // 移除 board 节点下的子节点
                    boardNode.removeAllChildren();
                    boardNode.active = false;

                    // 在上菜台添加上完成的菜品子节点
                    let servingPlate = this.servingCounter.getChildByName("ServingPlate" + deskId.toString());

                    let customerOrderedFood = GameData.CustomerOrderFood.get(Number(deskId));
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

                        // 加载菜品的图片资源
                        resources.load(this._sceneMenuPicBasePath + '/Dishes/Scene_Dishes/' + food.ItemSceneImgName + '/spriteFrame',
                            SpriteFrame, (err, spriteFrame) => {
                                if (err) {
                                    console.error("我是厨房，加载菜品的图片资源失败了：", err);
                                }

                                let foodNode = new Node();
                                foodNode.addComponent(Sprite);
                                foodNode.getComponent(Sprite).spriteFrame = spriteFrame;
                                servingPlate.addChild(foodNode);
                            });
                    }

                    if (EmployeeData.Instance.getOneTypeEmployeeData(EMPLOYEE_PANEL_TYPE.WAITER).length === 0) {
                        // 没有服务员类型的员工，则显示上菜图标，由玩家点击按钮后，直接上菜到指定桌子
                        resources.load("Prefabs/UI/Scene/Hall/DishesFinished", Prefab, (err, prefab) => {
                            if (err) {
                                error("我是厨房，加载菜品完成提示的预制体失败了：", err);
                            }

                            let dishesFinishedNode = instantiate(prefab);
                            servingPlate.addChild(dishesFinishedNode);

                            // 添加点击事件
                            let dishesFinishedEventHandler = new EventHandler();
                            dishesFinishedEventHandler.target = this.node;
                            dishesFinishedEventHandler.component = "KitchenBehavior";
                            dishesFinishedEventHandler.handler = "onDishesFinishedBtnClicked";
                            dishesFinishedEventHandler.customEventData = deskId.toString();
                            dishesFinishedNode.getComponent(Button).clickEvents.push(dishesFinishedEventHandler);
                        });
                    } else {
                        // 有服务员类型的情况，生成一个员工任务，让空闲员工自己领取任务去执行
                        let epTask: ITask = {
                            id: generateUniqueId(),
                            taskType: EMPLOYEE_TASK_TYPE.SERVE_FOOD,
                            status: EMPLOYEE_TASK_STATE.WAITING,
                            epType: EMPLOYEE_PANEL_TYPE.WAITER,
                            taskTargetDeskData: deskRuntimeData,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }
                        EmployeeTasks.Instance.createTask(epTask);

                        // 通知服务员要开始检查是否空闲了
                        EventManager.Instance.emit(GAME_EVENTS.CHECK_WAITER_IDLE);
                    }
                }
            }.bind(this);
            this.schedule(boardProgressSchedule, 1);
        });
    }

    /**
    * @description: 当点击了火锅汤底制作完成的按钮
    * @param {*} event
    * @param {*} deskInfo
    * @return {*}
    */
    onHotpotSoupFinishedBtnClicked(event, deskId) {
        AudioManager.inst.playOneShot(this._hallUIBtnClickSound);

        const hotpotSoupId = this.deskIdHpsidMap.get(deskId);
        const menuItemData = MenuInfoData.Instance.getMenuDataByItemId(hotpotSoupId);

        // 首先隐藏掉 hotpotSoup 节点
        this.servingCounter.getChildByName("HotpotSoup" + deskId).removeAllChildren();
        this.servingCounter.getChildByName("HotpotSoup" + deskId).active = false;

        let deskNode = GameData.getDeskById(Number(deskId));

        resources.load(this._sceneMenuPicBasePath + '/Hotpots/Scene_Hotpots/' + menuItemData.ItemSceneImgName + "/spriteFrame",
            SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.log("我是厨房，加载火锅锅底精灵图失败了：", err);
                    return;
                }

                let hotpotSoupNodeInDesk = new Node(`Scene_pot_${hotpotSoupId}`);
                hotpotSoupNodeInDesk.addComponent(Sprite);
                hotpotSoupNodeInDesk.getComponent(Sprite).spriteFrame = spriteFrame;
                deskNode.addChild(hotpotSoupNodeInDesk);
                deskNode.getChildByName(`Scene_pot_${hotpotSoupId}`).setPosition(
                    deskNode.getChildByName(`Scene_pot_${hotpotSoupId}`).getPosition().x,
                    deskNode.getChildByName(`Scene_pot_${hotpotSoupId}`).getPosition().y + 50, 0);

                // 更新数据中心火锅底料已经完成并送到指定桌子上
                GameData.updateHotpotSoupFinish(Number(deskId), true);
            });
    }

    /**
     * @description: 当点击了菜品制作完成的按钮
     * @param {*} event
     * @param {*} deskId
     * @return {*}
     */
    onDishesFinishedBtnClicked(event, deskId) {
        AudioManager.inst.playOneShot(this._hallUIBtnClickSound);

        this.servingCounter.getChildByName("ServingPlate" + deskId).removeAllChildren();

        // 假装是员工服务完成了，这里避免了一些重复代码
        EventManager.Instance.emit(GAME_EVENTS.EMPLOYEE_SERVE_FINISH, Number(deskId));
    }

    /**
     * @description: 服务员到达备菜台
     * @param {any} deskId 桌子id
     * @return {*}
     */
    employeeInServePlate(deskId: any) {
        let servingPlate = this.servingCounter.getChildByName("ServingPlate" + deskId.toString());
        servingPlate.removeAllChildren();
    }
}


