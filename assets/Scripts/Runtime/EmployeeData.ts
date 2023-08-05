/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-06-12 20:02:53
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-07-05 23:30:47
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\Runtime\EmployeeData.ts
 * @Description: 员工游戏运行时数据
 */

import { log } from 'cc';
import Singleton from '../Base/Singleton';
import { EMPLOYEE_PANEL_TYPE, EMPLOYEE_RECRUITMENT_STATES, EMPLOYEE_STATES, GAME_AREA } from '../Enums/GameEnums';
import { readLocalStorage, writeLocalStorageAsync } from '../Util/CommonUtil';

export interface IEmployeeData {
    id: number; // 员工ID
    area: GAME_AREA;  // 员工所在区域
    epType: EMPLOYEE_PANEL_TYPE; // 员工类型
    status: EMPLOYEE_STATES; // 员工状态
    recruitmentStatus: EMPLOYEE_RECRUITMENT_STATES; // 员工招聘状态
    currentTaskId?: string; // 当前任务ID，可选  
}

export class EmployeeData extends Singleton {
    static get Instance() {
        return super.GetInstance<EmployeeData>();
    }

    constructor() {
        super();
        this.initEmployeeData();
    }

    private _employeeData: IEmployeeData[] = [];

    /**
     * @description: 初始化员工游戏运行时数据
     * @return {*}
     */
    initEmployeeData(): void {
        // 从本地存储中读取员工数据
        let localEmployeeData = readLocalStorage("EmployeeData");
        if (localEmployeeData) {
            this._employeeData = localEmployeeData;
        } else {
            // 员工数据应该在员工面板招聘时初始化
            this._employeeData = [];
        }
    }

    /**
     * @description: 获取所有的员工游戏运行时数据
     * @return {*}
     */    
    getAllEmployeeData(): IEmployeeData[] {
        return this._employeeData;
    }

    /**
     * @description: 根据员工ID获取员工游戏运行时数据
     * @param {number} employeeId 员工ID
     * @return {*}
     */    
    getEmployeeDataById(employeeId: number): IEmployeeData {
        return this._employeeData.find((employee) => {
            return employee.id === employeeId;
        });
    }

    /**
     * @description: 获取某一类型的员工数据
     * @param {EMPLOYEE_PANEL_TYPE} epType 员工类型
     * @return {*}
     */    
    getOneTypeEmployeeData(epType: EMPLOYEE_PANEL_TYPE): IEmployeeData[] {
        return this._employeeData.filter((employee) => {
            return employee.epType === epType;
        });
    }

    /**
     * @description: 添加员工游戏运行时数据
     * @param {IEmployeeData} employeeData
     * @return {*}
     */    
    addEmployeeData(employeeData: IEmployeeData): void {
        if (employeeData) {
            this._employeeData.push(employeeData);
            this.saveEmployeeDataToLocal();
        }
    }

    /**
     * @description: 根据员工ID更新员工运行时状态
     * @param {number} employeeId 员工ID
     * @param {EMPLOYEE_STATES} status 员工状态
     * @return {*}
     */    
    updateEmployeeStatusById(employeeId: number, status: EMPLOYEE_STATES): void {
        let employee = this._employeeData.find((employee) => {
            return employee.id === employeeId;
        });
        if (employee) {
            employee.status = status;
            this.saveEmployeeDataToLocal();
        }
    }

    /**
     * @description: 根据员工ID删除员工运行时数据
     * @param {number} employeeId
     * @return {*}
     */    
    deleteEmployeeDataById(employeeId: number): void {
        let index = this._employeeData.findIndex((employee) => {
            return employee.id === employeeId;
        });
        if (index !== -1) {
            this._employeeData.splice(index, 1);
            this.saveEmployeeDataToLocal();
        }
    }

    /**
     * @description: 保存员工游戏运行时数据到本地存储
     * @return {*}
     */
    saveEmployeeDataToLocal(): void {
        writeLocalStorageAsync("EmployeeData", this._employeeData)
            .then(() => {
                log('员工游戏运行时数据，写入本地存储成功');
            })
            .catch((error) => {
                error('员工游戏运行时数据，写入本地存储失败:', error);
            });
    }
}


