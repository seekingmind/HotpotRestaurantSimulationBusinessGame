/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-07-05 16:36:22
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-07-14 00:54:14
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\Entity\Character\Employee\EpCashier.ts
 * @Description: 员工-收银员
 */

import { _decorator, Component, error, JsonAsset, log, misc, Node, resources, sp, Vec3 } from 'cc';
import { Employee } from './Employee';
import EventManager from '../../../Runtime/EventManager';
import { EMPLOYEE_PANEL_TYPE, EMPLOYEE_STATES, EMPLOYEE_TASK_STATE, EMPLOYEE_TASK_TYPE, GAME_EVENTS, UI_EVENTS } from '../../../Enums/GameEnums';
import { EmployeeData } from '../../../Runtime/EmployeeData';
import { EmployeeTasks, ITask } from '../../../Runtime/EmployeeTasks';
import { BillData, IBillDetail } from '../../../Runtime/BillData';
import { generateUniqueId, nowTimeString } from '../../../Util/CommonUtil';
import GameData from '../../../Runtime/GameData';
import { IPlayerMenuItemData, PlayerData } from '../../../Runtime/PlayerData';
import { UIManager } from '../../../UI/Framework/UIManager';
import { IMenuItem } from '../../../Runtime/MenuInfoData';
const { ccclass, property } = _decorator;

@ccclass('EpCashier')
export class EpCashier extends Employee {
    private _movePathJsonData: any = null;

    private _currentTaskId: string = "";

    /**
     * @description: 收银员的update方法
     * @param {number} dt
     * @return {*}
     */
    update(dt: number): void {
        super.update(dt);

        if (this._moveToDeskPath != null && this._targetDeskRuntimeData != null) {
            this.moveToDesk(dt);
            this.leftFromDesk(dt);
        }

        if (this._bornPosToIdlePosPath != null) {
            this.moveToIdlePos(dt);
        }
    }

    public initConfigData(data: any): void {
        super.initConfigData(data);
    }

    public initRuntimeData(data: any): void {
        super.initRuntimeData(data);
    }

    /**
     * @description: 收银员的路径初始化
     * @return {*}
     */
    initMovePath(): void {
        resources.load("Datas/EmployeeMovePath", JsonAsset, (err, data) => {
            if (err) {
                error("加载员工移动路径数据失败");
                return;
            }

            super.initMovePath();

            this._movePathJsonData = data;
            const movePathJson = this._movePathJsonData.json!;
            const movePathJsonData = movePathJson.EmployeeMovePath;
            const findPathData = movePathJsonData.find(oneMovePath => oneMovePath.employeeId == this.employeeConfigData.id);

            const toIdlePosPath = findPathData.toIdlePos;
            const toDeskMovePath = findPathData.toDesk;

            if (toIdlePosPath) {
                this._bornPosToIdlePosPath = toIdlePosPath;
            }

            if (toDeskMovePath) {
                this._moveToDeskPath = toDeskMovePath;
            }

            super.initView();
        });
    }

    protected initEvent(): void {
        super.initEvent();
        log("我是员工-收银员，我重写了 initEvent 方法");

        // 收银员检查是否空闲事件
        EventManager.Instance.addEvent(GAME_EVENTS.CHECK_CASHIER_IDLE, this.checkEpIdle, this);

        // 结账事件
        EventManager.Instance.addEvent(GAME_EVENTS.CASHIER_CHECKOUT, this.onCashierCheckout, this);
    }

    moveToIdlePos(dt: number): void {
        if (!this._isMovingToIdlePos) {
            return;
        }

        const distance = Vec3.distance(this._currentPosition, this._targetPosition);
        if (distance < 0.1) {
            this._currentPathIndex++;
            if (this._currentPathIndex >= this._bornPosToIdlePosPath.movePoints.length) {
                this._isMovingToIdlePos = false;
                this.node.eulerAngles = new Vec3(0, 0, 0);
                this.node.getComponent(sp.Skeleton).setAnimation(0, "idle", true);
                this.employeeRuntimeData.status = EMPLOYEE_STATES.IDLE;
                EmployeeData.Instance.updateEmployeeStatusById(this.employeeRuntimeData.id, EMPLOYEE_STATES.IDLE);

                this._currentPathIndex = 0;

                // 员工到达空闲点后，从任务中心获取一遍任务，检查是否有符合要求的任务
                let findEpTasks = EmployeeTasks.Instance.getTasksByEpType(this.employeeRuntimeData.epType);
                if (findEpTasks) {
                    // 通知该类型的员工检查空闲状态，然后去执行任务
                    if (this.employeeRuntimeData.epType === EMPLOYEE_PANEL_TYPE.CASHIER) {
                        EventManager.Instance.emit(GAME_EVENTS.CHECK_CASHIER_IDLE);
                    }
                }

                return;
            }

            this._currentPosition.set(this.node.position);
            this._targetPosition.set(this._bornPosToIdlePosPath.movePoints[this._currentPathIndex].x,
                this._bornPosToIdlePosPath.movePoints[this._currentPathIndex].y, 0);
        } else {
            const ratio = Math.min(1, this._speed * dt / distance);
            this._currentPosition.lerp(this._targetPosition, ratio);
            this.node.position = this._currentPosition;
        }
    }

    /**
     * @description: 收银员向桌子移动
     * @param {number} dt
     * @return {*}
     */
    moveToDesk(dt: number): void {
        super.moveToDesk(dt);

        if (!this._isMovingToDesk) {
            return;
        }

        const distance = Vec3.distance(this._currentPosition, this._targetPosition);
        this.changeOrientation(this._currentPosition, this._targetPosition);
        if (distance < 0.1) {
            this._currentPathIndex++;

            let deskPath = this._moveToDeskPath.find(oneDeskPath => oneDeskPath.deskId === this._targetDeskRuntimeData.id);
            if (this._currentPathIndex >= deskPath.movePoints.length) {
                this._isMovingToDesk = false;

                // 根据收银员目前的状态，设置后续操作
                if (this.employeeRuntimeData.status === EMPLOYEE_STATES.CHECKOUT) {
                    this.node.getComponent(sp.Skeleton).setAnimation(0, "work", true);

                    // 桌子上的结账UI取消
                    EventManager.Instance.emit(UI_EVENTS.CANCLE_CHECKOUT_UI, this._targetDeskRuntimeData.id);

                    // 生成一份订单，保存到本地存储中
                    let genBillData = this.genBillData();
                    BillData.Instance.addBillData(genBillData);

                    // 收银员结账持续5秒时间
                    this.scheduleOnce(() => {
                        log("收银员结账完成");
                        this.node.eulerAngles = new Vec3(0, 180, 0);
                        this.node.getComponent(sp.Skeleton).setAnimation(0, "move", true);
                        this._isLeavingFromDesk = true;

                        this.onCashierTaskDone();
                    }, 5);
                }
            }

            this._currentPosition.set(this.node.position);
            if (this._currentPathIndex >= deskPath.movePoints.length) {
                this._currentPathIndex = deskPath.movePoints.length - 1;
            }
            this._targetPosition.set(new Vec3(deskPath.movePoints[this._currentPathIndex].x,
                deskPath.movePoints[this._currentPathIndex].y, 0));
        } else {
            const ratio = Math.min(1, this._speed * dt / distance);
            this._currentPosition.lerp(this._targetPosition, ratio);
            this.node.position = this._currentPosition;
        }
    }

    /**
     * @description: 收银员离开桌子
     * @param {number} dt
     * @return {*}
     */
    leftFromDesk(dt: number): void {
        super.leftFromDesk(dt);

        if (!this._isLeavingFromDesk) {
            return;
        }

        const distance = Vec3.distance(this._currentPosition, this._targetPosition);
        this.changeOrientation(this._currentPosition, this._targetPosition);
        if (distance < 0.1) {
            this._currentPathIndex--;

            if (this._currentPathIndex < 0) {
                this._currentPathIndex = 0;
                this._isLeavingFromDesk = false;
                this.node.eulerAngles = new Vec3(0, 0, 0);
                this.node.getComponent(sp.Skeleton).setAnimation(0, "rest", true);
                this.employeeRuntimeData.status = EMPLOYEE_STATES.IDLE;
                EmployeeData.Instance.updateEmployeeStatusById(this.employeeRuntimeData.id, EMPLOYEE_STATES.IDLE);
                return;
            }

            let deskPath = this._moveToDeskPath.find(oneDeskPath => oneDeskPath.deskId === this._targetDeskRuntimeData.id);
            this._currentPosition.set(this.node.position);
            this._targetPosition.set(new Vec3(deskPath.movePoints[this._currentPathIndex].x,
                deskPath.movePoints[this._currentPathIndex].y, 0));
        } else {
            const ratio = Math.min(1, this._speed * dt / distance);
            this._currentPosition.lerp(this._targetPosition, ratio);
            this.node.position = this._currentPosition;
        }
    }

    /**
     * @description: 收银员结账
     * @param {any} deskRuntimeData 桌子运行时数据
     * @return {*}
     */
    private onCashierCheckout(deskRuntimeData: any): void {
        this._targetDeskRuntimeData = deskRuntimeData;
        this.employeeRuntimeData.status = EMPLOYEE_STATES.CHECKOUT;
        EmployeeData.Instance.updateEmployeeStatusById(this.employeeRuntimeData.id, EMPLOYEE_STATES.CHECKOUT);

        // 目标桌子路径设置
        let targetDeskPath = this._moveToDeskPath.find(oneDesk => oneDesk.deskId === deskRuntimeData.id);
        this._targetPosition = new Vec3(targetDeskPath.movePoints[0].x, targetDeskPath.movePoints[0].y, 0);

        this._isMovingToDesk = true;
        this.node.getComponent(sp.Skeleton).setAnimation(0, "move", true);
    }

    /**
     * @description: 收银员任务完成事件回调
     * @return {*}
     */
    onCashierTaskDone() {
        // 将当前收银员执行的任务状态置为已完成
        EmployeeTasks.Instance.updateTaskStatus(this._currentTaskId, EMPLOYEE_TASK_STATE.DONE);

        // 收银员结账结束后，通知顾客离开
        EventManager.Instance.emit(GAME_EVENTS.CUSTOMER_LEAVE, this._targetDeskRuntimeData);

        if (EmployeeData.Instance.getOneTypeEmployeeData(EMPLOYEE_PANEL_TYPE.WAITER).length != 0) {
            let epCleanUpDeskTask: ITask = {
                id: generateUniqueId(),
                taskType: EMPLOYEE_TASK_TYPE.CLEAN_DESK,
                status: EMPLOYEE_TASK_STATE.WAITING,
                epType: EMPLOYEE_PANEL_TYPE.WAITER,
                createdAt: new Date(),
                taskTargetDeskData: this._targetDeskRuntimeData,
            }
            EmployeeTasks.Instance.createTask(epCleanUpDeskTask);

            // 通知服务员要开始检查是否空闲了
            EventManager.Instance.emit(GAME_EVENTS.CHECK_WAITER_IDLE);
        }

        GameData.CustomerInMovingCountMap.set(this._targetDeskRuntimeData.id, 0);
        GameData.CustomerInDeskCountMap.set(this._targetDeskRuntimeData.id, 0);
        GameData.CustomerFinishOrderFoodCount.set(this._targetDeskRuntimeData.id, 0);
        GameData.updateHotpotSoupFinish(this._targetDeskRuntimeData.id, false);
        GameData.updateDishFinish(this._targetDeskRuntimeData.id, false);

        // 显示清洁桌子ui
        EventManager.Instance.emit(UI_EVENTS.SHOW_CLEAN_UP_DESK_UI, this._targetDeskRuntimeData);
    }

    /**
     * @description: 收银员从任务中心获取任务
     * @return {*}
     */
    getTaskFromEpTaskCenter(): void {
        let epType = this.employeeRuntimeData.epType;
        let epTasksByEpType = EmployeeTasks.Instance.getTasksByEpType(epType);
        if (epTasksByEpType.length > 0) {
            for (let i = 0; i < epTasksByEpType.length; i++) {
                const oneTask = epTasksByEpType[i];
                let taskStatus = oneTask.status;
                if (taskStatus === EMPLOYEE_TASK_STATE.DOING) {
                    continue;
                } else if (taskStatus === EMPLOYEE_TASK_STATE.DONE) {
                    continue;
                } else {
                    // 有对应类型的任务，且任务状态为未开始
                    oneTask.epId = this.employeeRuntimeData.id;
                    EmployeeTasks.Instance.setTaskExcuteEpId(oneTask.id, this.employeeRuntimeData.id);
                    EmployeeTasks.Instance.updateTaskStatus(oneTask.id, EMPLOYEE_TASK_STATE.DOING);
                    this._currentTaskId = oneTask.id;

                    let taskType = oneTask.taskType;
                    switch (taskType) {
                        case EMPLOYEE_TASK_TYPE.CHECKOUT:
                            // 收银员给桌子结账
                            // 收银员移动到桌子，执行结账过程
                            this.onCashierCheckout(oneTask.taskTargetDeskData);
                            break;
                    }
                }
            }
        }
    }

    /**
     * @description: 生成一份订单数据并存储到本地
     * @return {*}
     */
    genBillData() {
        // 本地存储中，最后一份订单的数据
        const lastOneBillData = BillData.Instance.getLastOneBillData();
        let nowBillId = 0;
        if (lastOneBillData) {
            nowBillId = lastOneBillData.id + 1;
        }

        // 订单时间
        let orderTime = nowTimeString();

        // 当前服务的桌子id
        let currentDeskId = this._targetDeskRuntimeData.id;

        // 当前桌子顾客点的菜品
        let customerOrderedFoods = GameData.CustomerOrderFood.get(currentDeskId);

        // 成本和收入计算
        let totalPrice = 0;
        let totalCost = 0;
        for (let i = 0; i < customerOrderedFoods.length; i++) {
            let playerMenuData = PlayerData.Instance.getPlayerMenuDataByMenuItemId(customerOrderedFoods[i].ItemId);
            let currentMenuLevel = playerMenuData.ItemLevel;
            let currentMenuPrice = customerOrderedFoods[i].ItemPrice.find(onePrice => onePrice.level === currentMenuLevel).price;
            totalPrice += currentMenuPrice;
            totalCost += customerOrderedFoods[i].ItemCost;
        }

        // 利润，保存到本地存储中
        let profit = totalPrice - totalCost;
        PlayerData.Instance.addCash(profit);

        // 通知UI更新现金
        // EventManager.Instance.emit(UI_EVENTS.CASH_ADD_UI, profit);
        UIManager.Instance.sendMsg("cashWidget", "upgradePlayerCashNum", profit)

        // 订单详情数据
        const [dishCountMap, uniqueFood] = this.statisticOrderedFood(customerOrderedFoods);
        let billDetails: IBillDetail[] = [];
        for (let i = 0; i < uniqueFood.length; i++) {
            let aFood: IMenuItem = uniqueFood[i];
            let aFoodCount = dishCountMap.get(aFood.ItemId);
            let aFoodBillDetail: IBillDetail = { orderFood: aFood, orderCount: aFoodCount };
            billDetails.push(aFoodBillDetail);
        }

        // 构建订单数据
        let billData = {
            id: nowBillId,
            billDetails: billDetails,
            deskId: currentDeskId,
            totalPrice: totalPrice,
            orderTime: orderTime,
        };

        return billData;
    }

    checkEpIdle(): void {
        this.schedule(this.checkEpIdleStatus, 1);
    }

    checkEpIdleStatus(): void {
        if (this.employeeRuntimeData.status === EMPLOYEE_STATES.IDLE) {
            this.unschedule(this.checkEpIdleStatus);
            this.getTaskFromEpTaskCenter();
        }
    }

    /**
     * @description: 对当前桌子顾客点的菜品进行统计
     * @param {any} customerOrderedFoods
     * @return {*}
     */
    statisticOrderedFood(customerOrderedFoods: any) {
        // 统计每个菜品点的数量，结果类似：{ 0 => 1, 1 => 1, 2 => 1 }
        const dishCountMap = customerOrderedFoods.reduce((countMap, dish) => {
            const dishId = dish.dishId;
            if (countMap.has(dishId)) {
                countMap.set(dishId, countMap.get(dishId) + 1);
            } else {
                countMap.set(dishId, 1);
            }
            return countMap;
        }, new Map<number, number>());

        const uniqueFood = customerOrderedFoods.filter((obj, index, self) => {
            return index === self.findIndex((o) => o.dishId === obj.dishId);
        });

        return [dishCountMap, uniqueFood];
    }

    changeOrientation(currentPos: Vec3, targetPos: Vec3) {
        let useTargetPos = targetPos.clone();
        let customerDir = useTargetPos.subtract3f(currentPos.x, currentPos.y, currentPos.z).normalize();
        let angle = Math.atan2(customerDir.y, customerDir.x);
        let degress = misc.radiansToDegrees(angle);
        if (Math.abs(degress) < 90) {
            // 朝右边
            this.node.eulerAngles = new Vec3(0, 0, 0);
        } else {
            // 朝左边
            this.node.eulerAngles = new Vec3(0, 180, 0);
        }
    }
}


