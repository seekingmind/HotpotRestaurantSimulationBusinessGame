/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-06-12 19:46:31
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-07-07 18:41:37
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\Runtime\EmployeeTasks.ts
 * @Description: 员工游戏运行时任务类，由本任务中心统一管理员工的任务，任务中心主动分配任务给员工。不做本地存储了
 */

import { Scheduler, log } from 'cc';
import Singleton from '../Base/Singleton';
import { EMPLOYEE_PANEL_TYPE, EMPLOYEE_STATES, EMPLOYEE_TASK_STATE, EMPLOYEE_TASK_TYPE } from '../Enums/GameEnums';
import { EmployeeData } from './EmployeeData';
import EventManager from './EventManager';

export interface ITask {
    id: string; // 任务ID
    taskType: EMPLOYEE_TASK_TYPE; // 任务类型
    status: EMPLOYEE_TASK_STATE; // 任务的状态
    epType: EMPLOYEE_PANEL_TYPE; // 执行此任务的员工的类型
    createdAt: Date; // 任务创建时间
    taskTargetDeskData?: any; // 任务目标桌子的数据
    epId?: number;  // 执行此任务的员工的ID
    updatedAt?: Date; // 任务最后更新时间
}


export class EmployeeTasks extends Singleton {
    static get Instance() {
        return super.GetInstance<EmployeeTasks>();
    }

    // 任务列表
    private _tasks: ITask[];

    constructor() {
        super();
        this._tasks = [];
    }

    /**
     * @description: 获取所有的任务列表
     * @return {*}
     */
    public getAllTasks(): ITask[] {
        return this._tasks;
    }

    /**
     * @description: 根据任务id，获取任务
     * @param {string} taskId 任务id
     * @return {*}
     */    
    public getTaskByTaskId(taskId: string): ITask | undefined {
        return this._tasks.find((task) => task.id === taskId);
    }

    /**
     * @description: 创建任务
     * @param {ITask} task
     * @return {*}
     */
    public createTask(task: ITask): void {
        this._tasks.push(task);
    }

    /**
     * @description: 根据任务id，设置任务的执行员工id
     * @param {string} taskId 任务id
     * @param {number} epId 员工id
     * @return {*}
     */    
    public setTaskExcuteEpId(taskId: string, epId: number): void {
        const task = this.findTaskById(taskId);
        if (task) {
            task.epId = epId;
        }
    }

    /**
     * @description: 获取指定员工类型的任务列表
     * @param {EMPLOYEE_PANEL_TYPE} epType 员工类型
     * @return {*}
     */    
    public getTasksByEpType(epType: EMPLOYEE_PANEL_TYPE): ITask[] {
        return this._tasks.filter((task) => task.epType === epType);
    }

    /**
     * @description: 根据任务ID，更新任务的状态
     * @param {number} taskId 任务id
     * @param {EMPLOYEE_TASK_STATE} status 任务状态
     * @return {*}
     */
    public updateTaskStatus(taskId: string, status: EMPLOYEE_TASK_STATE): void {
        const task = this.findTaskById(taskId);
        if (task) {
            task.status = status;
            task.updatedAt = new Date();
        }
    }

    /**
     * @description: 删除任务
     * @param {number} taskId 任务id
     * @return {*}
     */
    public deleteTask(taskId: string): void {
        const taskIndex = this.findTaskIndexById(taskId);
        if (taskIndex !== -1) {
            this._tasks.splice(taskIndex, 1);
        }
    }

    /**
     * @description: 删除已完成的任务
     * @return {*}
     */    
    public deleteDoneTasks(): void {
        const doneTasks = this.findTasksByTaskState(EMPLOYEE_TASK_STATE.DONE);
        doneTasks.forEach((task) => {
            this.deleteTask(task.id);
        });
    }

    /**
     * @description: 根据任务id查找任务
     * @param {number} taskId 任务id
     * @return {*}
     */
    private findTaskById(taskId: string): ITask | undefined {
        return this._tasks.find((task) => task.id === taskId);
    }

    /**
     * @description: 通过任务id，查找任务在列表中的下标索引
     * @param {number} taskId 任务id
     * @return {*}
     */
    private findTaskIndexById(taskId: string): number {
        return this._tasks.findIndex((task) => task.id === taskId);
    }

    /**
     * @description: 通过任务状态，查找任务列表
     * @param {EMPLOYEE_TASK_STATE} taskState 任务类型
     * @return {*}
     */    
    private findTasksByTaskState(taskState: EMPLOYEE_TASK_STATE): ITask[] {
        return this._tasks.filter((task) => task.status === taskState);
    }
}


