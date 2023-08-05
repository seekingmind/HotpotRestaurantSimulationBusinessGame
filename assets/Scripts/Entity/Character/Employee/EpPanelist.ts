/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-07-07 16:34:31
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-07-10 20:52:05
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\Entity\Character\Employee\EpPanelist.ts
 * @Description: 员工-配菜员
 */
import { _decorator, Component, error, JsonAsset, log, Node, resources, sp, Vec3 } from 'cc';
import { Employee } from './Employee';
import { EmployeeTasks } from '../../../Runtime/EmployeeTasks';
import { EMPLOYEE_STATES, EMPLOYEE_TASK_STATE, EMPLOYEE_TASK_TYPE, GAME_EVENTS } from '../../../Enums/GameEnums';
import { EmployeeData } from '../../../Runtime/EmployeeData';
import EventManager from '../../../Runtime/EventManager';
const { ccclass, property } = _decorator;

@ccclass('EpPanelist')
export class EpPanelist extends Employee {
    private _movePathJsonData: any = null;

    private _currentTaskId: string = "";

    start() {

    }

    update(deltaTime: number) {
        super.update(deltaTime);

        
    }

    initConfigData(data: any): void {
        super.initConfigData(data);
    }

    initRuntimeData(data: any): void {
        super.initRuntimeData(data);
    }

    initMovePath(): void {
        resources.load("Datas/EmployeeMovePath", JsonAsset, (err, pathData) => {
            if (err) {
                error("加载员工移动路径数据失败");
                return;
            }
            super.initMovePath();

            this._movePathJsonData = pathData;
            const movePathJson = this._movePathJsonData.json!;
            const movePathJsonData = movePathJson.EmployeesMovePath;
            const findPathData = movePathJsonData.find(oneMovePath => oneMovePath.employeeId == this.employeeConfigData.id);

            const toIdlePosPath = findPathData.toIdlePosPath;
            const kitchenDeskPath = findPathData.kitchenToDesk;

            if (toIdlePosPath) {
                this._bornPosToIdlePosPath = toIdlePosPath;
            }

            if (kitchenDeskPath) {
                this._moveKitchenToDeskPath = kitchenDeskPath;
            }

            super.initView();
        });
    }

    initEvent() {
        super.initEvent();
        log("我是员工-配菜员，我重写了 initEvent 方法");

        // 检查配菜员空闲状态事件
        EventManager.Instance.addEvent(GAME_EVENTS.CHECK_PANELIST_IDLE, this.checkEpIdle, this);
    }

    /**
     * @description: 配菜员端到火锅底料后，从厨房走向指定桌子
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

            if (this._currentPathIndex > kitchenToDeskPath.movePoints.length) {
                this.onPanelistTaskDone();
                
                this._isLeavingFromKitchen = false;
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
     * @description: 配菜员为指定桌子端火锅底料
     * @param {any} deskRuntimeData 指定桌子的运行时数据
     * @return {*}
     */    
    onPanelistServeHotpotSoup(deskRuntimeData: any) {
        this._targetDeskRuntimeData = deskRuntimeData;

        let targetDeskPath = this._moveKitchenToDeskPath.find(oneDesk => oneDesk.deskId === deskRuntimeData.id);
        this._targetPosition = new Vec3(targetDeskPath.movePoints[0].x, targetDeskPath.movePoints[0].y, 0);

        this._isLeavingFromKitchen = true;
        this.node.getComponent(sp.Skeleton).setAnimation(0, "move02", true);
        this.node.eulerAngles = new Vec3(0, 180, 0);
    }

    /**
     * @description: 配菜员任务完成事件回调
     * @return {*}
     */    
    onPanelistTaskDone() {
        EmployeeTasks.Instance.updateTaskStatus(this._currentTaskId, EMPLOYEE_TASK_STATE.DONE);
    }

    /**
     * @description: 配菜员从员工任务中心获取任务
     * @return {*}
     */    
    getTaskFromEpTaskCenter(): void {
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

                    let taskType = oneTask.taskType;
                    switch (taskType) {
                        case EMPLOYEE_TASK_TYPE.SERVE_HOTPOT:
                            // 配菜员状态修改为正在行走
                            this.employeeRuntimeData.status = EMPLOYEE_STATES.IS_WALKING;
                            EmployeeData.Instance.updateEmployeeStatusById(this.employeeRuntimeData.id, EMPLOYEE_STATES.IS_WALKING);
                            
                            this.onPanelistServeHotpotSoup(oneTask.taskTargetDeskData);
                            break;
                    
                        default:
                            break;
                    }
                } else {
                    continue;
                }
            }
        }
    }

    checkEpIdle(): void {
        this.schedule(this.checkPanelistIdleStatus, 1);
    }

    checkPanelistIdleStatus(): void {
        if (this.employeeRuntimeData.status === EMPLOYEE_STATES.IDLE) {
            this.unschedule(this.checkPanelistIdleStatus);
            this.getTaskFromEpTaskCenter();
        }
    }
}


