/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-07-04 17:40:35
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-07-11 15:49:10
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\Entity\Character\Employee\EpWaiter.ts
 * @Description: 员工-服务员
 */
import { _decorator, Component, JsonAsset, log, Node, resources, sp, Vec3 } from 'cc';
import { Employee } from './Employee';
import EventManager from '../../../Runtime/EventManager';
import { EMPLOYEE_PANEL_TYPE, EMPLOYEE_STATES, EMPLOYEE_TASK_STATE, EMPLOYEE_TASK_TYPE, GAME_EVENTS, UI_EVENTS } from '../../../Enums/GameEnums';
import { EmployeeData } from '../../../Runtime/EmployeeData';
import { EmployeeTasks } from '../../../Runtime/EmployeeTasks';
import { AudioManager } from '../../../Runtime/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('EpWaiter')
export class EpWaiter extends Employee {
    private _movePathJsonData: any = null;

    private _currentTaskId: string = "";

    private _employeeCleanTableSound = "Audio/Sound/employeeCleanTable";

    /**
     * @description: 服务员的update方法
     * @param {number} dt
     * @return {*}
     */
    update(dt: number): void {
        super.update(dt);

        if (this._moveToDeskPath != null && this._targetDeskRuntimeData != null) {
            this.moveToDesk(dt);
            this.leftFromDesk(dt);
        }

        if (this._moveToKitchenPath != null) {
            this.moveToKitchen(dt);
        }

        if (this._moveKitchenToDeskPath != null) {
            this.leftFromKitchenToDesk(dt);
        }

        if (this._bornPosToIdlePosPath != null) {
            this.moveToIdlePos(dt);
        }

        return;
    }

    public initConfigData(data: any): void {
        super.initConfigData(data);
    }

    public initRuntimeData(data: any): void {
        super.initRuntimeData(data);
    }

    initMovePath(): void {
        resources.load("Datas/EmployeeMovePath", JsonAsset, (err, data) => {
            if (err) {
                log("加载员工移动路径数据失败");
                return;
            }

            super.initMovePath();

            this._movePathJsonData = data;
            const movePathJson = this._movePathJsonData.json!;
            const movePathJsonData = movePathJson.EmployeeMovePath;
            const findPathData = movePathJsonData.find(oneMovePath => oneMovePath.employeeId == this.employeeConfigData.id);

            const toIdlePosPath = findPathData.toIdlePos;
            const toDeskMovePath = findPathData.toDesk;
            const toKitchenMovePath = findPathData.toKitchen;
            const kitchenDeskPath = findPathData.kitchenToDesk;

            if (toIdlePosPath) {
                this._bornPosToIdlePosPath = toIdlePosPath;
            }

            if (toDeskMovePath) {
                this._moveToDeskPath = toDeskMovePath;
            }

            if (toKitchenMovePath) {
                this._moveToKitchenPath = toKitchenMovePath;
            }

            if (kitchenDeskPath) {
                this._moveKitchenToDeskPath = kitchenDeskPath;
            }

            super.initView();
        });
    }

    initEvent() {
        super.initEvent();
        log("我是员工-服务员类，我重写了 initEvent 方法");

        // 顾客点餐完成事件
        EventManager.Instance.addEvent(GAME_EVENTS.CUSTOMER_ORDER_FOOD_FINISHED, this.onCustomerOrderFoodFinished, this);

        // 员工收拾餐桌事件
        EventManager.Instance.addEvent(GAME_EVENTS.EMPLOYEE_CLEAN_DESK, this.onEmployeeCleanDesk, this);

        // 服务员检查是否空闲事件
        EventManager.Instance.addEvent(GAME_EVENTS.CHECK_WAITER_IDLE, this.checkEpIdle, this);

        // 服务员的任务完成事件
        EventManager.Instance.addEvent(GAME_EVENTS.WAITER_TASK_DONE, this.onWaiterTaskDone, this);
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
                    if (this.employeeRuntimeData.epType === EMPLOYEE_PANEL_TYPE.WAITER) {
                        EventManager.Instance.emit(GAME_EVENTS.CHECK_WAITER_IDLE);
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
     * @description: 服务员移动到指定桌子
     * @param {number} dt
     * @return {*}
     */
    moveToDesk(dt: number): void {
        super.moveToDesk(dt);

        if (!this._isMovingToDesk) {
            return;
        }

        const distance = Vec3.distance(this._currentPosition, this._targetPosition);

        if (distance < 0.1) {
            this._currentPathIndex++;

            let deskPath = this._moveToDeskPath.find(oneDeskPath => oneDeskPath.deskId === this._targetDeskRuntimeData.id);

            if (this._currentPathIndex >= deskPath.movePoints.length) {
                this._isMovingToDesk = false;

                // 根据服务员接受的任务类型，进行不同的处理
                let currentWaiterTask = EmployeeTasks.Instance.getTaskByTaskId(this._currentTaskId);
                if (currentWaiterTask) {
                    if (currentWaiterTask.taskType === EMPLOYEE_TASK_TYPE.ORDER_FOOD) {
                        // 服务员当前的状态修改为点菜状态
                        this.employeeRuntimeData.status = EMPLOYEE_STATES.ORDER_FOOD;
                        EmployeeData.Instance.updateEmployeeStatusById(this.employeeRuntimeData.id, EMPLOYEE_STATES.ORDER_FOOD);

                        // 修改服务员当前的动画为点菜动画
                        this.node.getComponent(sp.Skeleton).setAnimation(0, "diancai", true);
                        EventManager.Instance.emit(GAME_EVENTS.EMPLOYEE_IN_DESK, this._targetDeskRuntimeData);
                        return;
                    } else if (currentWaiterTask.taskType === EMPLOYEE_TASK_TYPE.CLEAN_DESK) {
                        this.node.getComponent(sp.Skeleton).setAnimation(0, "shoushi", true);
                        AudioManager.inst.playOneShot(this._employeeCleanTableSound);
                        this.scheduleOnce(() => {
                            log("清理桌面完成");
                            this.node.eulerAngles = new Vec3(0, 180, 0);
                            this.node.getComponent(sp.Skeleton).setAnimation(0, "move", true);
                            this._isLeavingFromDesk = true;
                            EventManager.Instance.emit(GAME_EVENTS.EMPLOYEE_CLEAN_DESK_FINISH, this._targetDeskRuntimeData);

                            // 服务员上菜任务完成，更新任务状态
                            this.onWaiterTaskDone();
                        }, 5);
                    }
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
     * @description: 服务员离开桌子
     * @param {number} dt
     * @return {*}
     */
    leftFromDesk(dt: number): void {
        super.leftFromDesk(dt);

        if (!this._isLeavingFromDesk) {
            return;
        }

        const distance = Vec3.distance(this._currentPosition, this._targetPosition);
        if (distance < 0.1) {
            this._currentPathIndex--;

            if (this._currentPathIndex < 0) {
                this._currentPathIndex = 0;
                this._isLeavingFromDesk = false;
                this.node.eulerAngles = new Vec3(0, 0, 0);
                this.node.getComponent(sp.Skeleton).setAnimation(0, "idle", true);
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
     * @description: 服务员前往厨房端做好的菜品
     * @param {number} dt
     * @return {*}
     */
    moveToKitchen(dt: number): void {
        super.moveToKitchen(dt);

        if (!this._isMovingToKitchen) {
            return;
        }

        const distance = Vec3.distance(this._currentPosition, this._targetPosition);
        if (distance < 0.1) {
            this._currentPathIndex++;

            if (this._currentPathIndex >= this._moveToKitchenPath.movePoints.length) {
                // 服务员的状态修改为上菜状态
                this.employeeRuntimeData.status = EMPLOYEE_STATES.SERVE_FOOD;
                EmployeeData.Instance.updateEmployeeStatusById(this.employeeRuntimeData.id, EMPLOYEE_STATES.SERVE_FOOD);

                this._isMovingToKitchen = false;

                EventManager.Instance.emit(GAME_EVENTS.EMPLOYEE_IN_SERVE_PLATE, this._targetDeskRuntimeData.id);
                this.node.eulerAngles = new Vec3(0, 0, 0);
                this.node.getComponent(sp.Skeleton).setAnimation(0, "idle_duancai", true);
                this.node.getComponent(sp.Skeleton).setAnimation(0, "move_duancai", true);

                // 员工端菜离开厨房的相关设置
                let kitchenToDeskPath = this._moveKitchenToDeskPath.find(oneDesk => oneDesk.deskId === this._targetDeskRuntimeData.id);
                this._targetPosition.set(new Vec3(kitchenToDeskPath.movePoints[0].x, kitchenToDeskPath.movePoints[0].y, 0));
                this._currentPathIndex = 0;
                this._isLeavingFromKitchen = true;

                return;
            }

            this._currentPosition.set(this.node.position);
            this._targetPosition.set(new Vec3(this._moveToKitchenPath.movePoints[this._currentPathIndex].x,
                this._moveToKitchenPath.movePoints[this._currentPathIndex].y, 0));
        } else {
            const ratio = Math.min(1, this._speed * dt / distance);
            this._currentPosition.lerp(this._targetPosition, ratio);
            this.node.position = this._currentPosition;
        }
    }

    /**
     * @description: 服务员端到菜后，从厨房离开，走向指定的桌子
     * @param {number} dt
     * @return {*}
     */
    leftFromKitchenToDesk(dt: number): void {
        super.leftFromKitchenToDesk(dt);

        if (!this._isLeavingFromKitchen) {
            return;
        }

        const distance = Vec3.distance(this._currentPosition, this._targetPosition);
        if (distance < 0.1) {
            this._currentPathIndex++;

            let kitchenToDeskPath = this._moveKitchenToDeskPath.find(oneDesk => oneDesk.deskId === this._targetDeskRuntimeData.id);

            if (this._currentPathIndex >= kitchenToDeskPath.movePoints.length) {
                this._isLeavingFromKitchen = false;

                this.node.getComponent(sp.Skeleton).setAnimation(0, "idle_duancai", true);
                EventManager.Instance.emit(GAME_EVENTS.EMPLOYEE_SERVE_FINISH, this._targetDeskRuntimeData.id);

                // 服务员上菜任务完成，更新任务状态
                this.onWaiterTaskDone();

                this.node.getComponent(sp.Skeleton).setAnimation(0, "move", true);
                this.node.eulerAngles = new Vec3(0, 180, 0);
                this._isLeavingFromDesk = true;

                return;
            }

            this._currentPosition.set(this.node.position);
            this._targetPosition.set(new Vec3(kitchenToDeskPath.movePoints[this._currentPathIndex].x,
                kitchenToDeskPath.movePoints[this._currentPathIndex].y, 0));
        } else {
            const ratio = Math.min(1, this._speed * dt / distance);
            this._currentPosition.lerp(this._targetPosition, ratio);
            this.node.position = this._currentPosition;
        }
    }

    /**
     * @description: 服务员任务完成事件回调
     * @return {*}
     */
    onWaiterTaskDone() {
        // 将当前服务员执行的任务状态置为已完成
        EmployeeTasks.Instance.updateTaskStatus(this._currentTaskId, EMPLOYEE_TASK_STATE.DONE);
    }

    /**
     * @description: 当顾客全部落座时，服务员移动到顾客所在桌子，并切换动画到点菜动画
     * @param {any} deskRuntimeData 要服务的桌子的数据
     * @return {*}
     */
    onWaiterOrderFood(deskRuntimeData: any) {
        this._targetDeskRuntimeData = deskRuntimeData;

        let targetDeskPath = this._moveToDeskPath.find(oneDesk => oneDesk.deskId === deskRuntimeData.id);
        this._targetPosition = new Vec3(targetDeskPath.movePoints[0].x, targetDeskPath.movePoints[0].y, 0);

        this._isMovingToDesk = true;
        this.node.getComponent(sp.Skeleton).setAnimation(0, "move", true);
    }

    /**
     * @description: 顾客点单结束，服务员原路返回
     * @return {*}
     */
    onCustomerOrderFoodFinished(deskRuntimeData: any) {
        if (this._targetDeskRuntimeData == null) {
            this._targetDeskRuntimeData = deskRuntimeData;
            log("服务员当前没有服务的桌子，服务员当前服务的桌子为：", this._targetDeskRuntimeData);
        }
        // 考虑一种情况：玩家在桌面上显示出了点单UI按钮后，在员工面板添加了服务员，刚添加的服务员还在行走到站桩点位置的路上，此时玩家点击了点单UI按钮
        // 服务员没有正常进入到当前流程
        // 这里通过判断服务员当前位置是否和站桩点位置一样，如果一样，则执行返回
        if (this.node.position.x == this._bornPosToIdlePosPath.movePoints[this._bornPosToIdlePosPath.movePoints.length - 1].x &&
            this.node.position.y == this._bornPosToIdlePosPath.movePoints[this._bornPosToIdlePosPath.movePoints.length - 1].y) {
            return;
        }

        this.node.getComponent(sp.Skeleton).setAnimation(0, "move", true);
        this.node.eulerAngles = new Vec3(0, 180, 0);
        this.employeeRuntimeData.status = EMPLOYEE_STATES.IS_WALKING;
        EmployeeData.Instance.updateEmployeeStatusById(this.employeeRuntimeData.id, EMPLOYEE_STATES.IS_WALKING);

        this._isLeavingFromDesk = true;

        // 将当前服务员执行的任务状态置为已完成
        this.onWaiterTaskDone();
    }

    /**
     * @description: 服务员上菜的过程
     * @param {*} servePlatePosition
     * @param {*} deskId
     * @return {*}
     */
    employeeToKitchen() {
        this.node.eulerAngles = new Vec3(0, 180, 0);
        this.node.getComponent(sp.Skeleton).setAnimation(0, "move", true);

        this._targetPosition = new Vec3(this._moveToKitchenPath.movePoints[0].x, this._moveToKitchenPath.movePoints[0].y, 0);
        this._isMovingToKitchen = true;
    }

    /**
     * @description: 服务员清理桌子事件回调
     * @param {any} deskInfo
     * @return {*}
     */
    onEmployeeCleanDesk(deskInfo: any) {
        // 员工切换到移动动画
        this.node.getComponent(sp.Skeleton).setAnimation(0, "move", true);

        this.employeeRuntimeData.status = EMPLOYEE_STATES.CLEAN_DESK;
        EmployeeData.Instance.updateEmployeeStatusById(this.employeeRuntimeData.id, EMPLOYEE_STATES.CLEAN_DESK);

        this._isMovingToDesk = true;
    }

    /**
     * @description: 服务员从员工任务中心获取任务
     * @return {*}
     */
    getTaskFromEpTaskCenter() {
        let epType = this.employeeRuntimeData.epType;
        let epTasksByEpType = EmployeeTasks.Instance.getTasksByEpType(epType);
        if (epTasksByEpType.length > 0) {
            for (let i = 0; i < epTasksByEpType.length; i++) {
                const oneTask = epTasksByEpType[i];
                let taskStatus = oneTask.status;
                if (taskStatus === EMPLOYEE_TASK_STATE.WAITING) {
                    oneTask.epId = this.employeeRuntimeData.id;
                    EmployeeTasks.Instance.setTaskExcuteEpId(oneTask.id, this.employeeRuntimeData.id);
                    EmployeeTasks.Instance.updateTaskStatus(oneTask.id, EMPLOYEE_TASK_STATE.DOING);

                    this._currentTaskId = oneTask.id;

                    // 根据任务类型，让员工做对应类型的事情
                    let taskType = oneTask.taskType;
                    switch (taskType) {
                        case EMPLOYEE_TASK_TYPE.ORDER_FOOD: // 服务员给顾客点餐的任务
                            // 服务员状态修改为正在行走
                            this.employeeRuntimeData.status = EMPLOYEE_STATES.IS_WALKING;
                            EmployeeData.Instance.updateEmployeeStatusById(this.employeeRuntimeData.id, EMPLOYEE_STATES.IS_WALKING);

                            this.onWaiterOrderFood(oneTask.taskTargetDeskData);
                            break;
                        case EMPLOYEE_TASK_TYPE.SERVE_FOOD:
                            // 服务员状态修改为正在行走
                            this.employeeRuntimeData.status = EMPLOYEE_STATES.IS_WALKING;
                            EmployeeData.Instance.updateEmployeeStatusById(this.employeeRuntimeData.id, EMPLOYEE_STATES.IS_WALKING);
                            
                            // 厨房做好菜后，服务员上菜的任务
                            this.employeeToKitchen();
                            break;
                        case EMPLOYEE_TASK_TYPE.CLEAN_DESK:
                            // 服务员清理桌子的任务
                            EventManager.Instance.emit(UI_EVENTS.CANCLE_CLEAN_UP_DESK_UI, oneTask.taskTargetDeskData);
                            this.onEmployeeCleanDesk(oneTask.taskTargetDeskData);
                            break;
                    }
                } else {
                    continue;
                }
            }
        }
    }

    checkEpIdle(): void {
        this.schedule(this.checkWaiterIdleStatus, 1);
    }

    checkWaiterIdleStatus(): void {
        if (this.employeeRuntimeData.status === EMPLOYEE_STATES.IDLE) {
            this.unschedule(this.checkWaiterIdleStatus);
            this.getTaskFromEpTaskCenter();
        }
    }
}


