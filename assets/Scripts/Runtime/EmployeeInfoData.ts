/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-06-14 23:49:12
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-06-21 16:52:17
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\Runtime\EmployeeInfoData.ts
 * @Description: 员工面板的员工信息数据
 */

import { JsonAsset, error, log, resources } from "cc";
import Singleton from "../Base/Singleton";
import { EMPLOYEE_PANEL_TYPE, EMPLOYEE_STATES, GAME_AREA } from "../Enums/GameEnums";
import { readLocalStorage, writeLocalStorageAsync } from "../Util/CommonUtil";

interface IEmployeeInfoAreaData {
    Area: GAME_AREA;
    Items: IEmployeeInfoItemData[];
}

interface IEmployeeInfoItemData {
    Type: EMPLOYEE_PANEL_TYPE;
    Employees: IEmployeeConfigData[];
}

interface IEmployeeConfigData {
    id: number;
    name: string;
    description: string;
    startPosition: Array<number>;
    status: EMPLOYEE_STATES;
    skeletonResName: string;
    avatarResName: string;
    figurePicture: string;
    workContent: string;
    serviceScore: number;
    serviceScoreNextLevel: number;
    tag: string;
    attr: Object;
}

export class EmployeeInfoData extends Singleton {
    static get Instance() {
        return super.GetInstance<EmployeeInfoData>();
    }

    private _employeeShopInfoData: IEmployeeInfoAreaData[];

    constructor() {
        super();
    }

    /**
     * @description: 初始化员工面板的员工数据
     * @return {*}
     */    
    initEmployeeInfoData(): any {
        let employeeShopInfoData = readLocalStorage("EmployeeShopInfoData");
        if (employeeShopInfoData) {
            this._employeeShopInfoData = employeeShopInfoData;
            return;
        }
        resources.load("Datas/EmployeeInfo", JsonAsset, (err, jsonAsset: JsonAsset) => {
            if (err) {
                error(err);
                return;
            }

            let employeeInfoJson = jsonAsset.json;
            let employInfoDatas = employeeInfoJson.EmployeeData;
            this._employeeShopInfoData = employInfoDatas;

            writeLocalStorageAsync("EmployeeShopInfoData", this._employeeShopInfoData)
                .then(() => {
                    log('写入本地存储成功');
                })
                .catch((error) => {
                    error('写入本地存储失败:', error);
                });
        });
    }

    /**
     * @description: 获取所有的员工面板信息数据
     * @return {*}
     */    
    getAllEmployeeInfoData(): IEmployeeInfoAreaData[] {
        return this._employeeShopInfoData;
    }

    /**
     * @description: 根据区域获取员工面板信息数据
     * @param {GAME_AREA} area
     * @return {*}
     */    
    getEmployeeInfoDataByArea(area: GAME_AREA): IEmployeeInfoAreaData {
        return this._employeeShopInfoData.find((item) => {
            return item.Area === area;
        });
    }

    /**
     * @description: 根据区域和员工类型获取员工面板信息数据
     * @param {GAME_AREA} area 员工区域
     * @param {EMPLOYEE_PANEL_TYPE} employeeType 员工类型
     * @return {*}
     */    
    getEmployeeInfoDataByAreaAndType(area: GAME_AREA, employeeType: EMPLOYEE_PANEL_TYPE): IEmployeeInfoItemData {
        let employeeInfoAreaData = this.getEmployeeInfoDataByArea(area);
        return employeeInfoAreaData.Items.find((item) => {
            return item.Type === employeeType;
        });
    }

    /**
     * @description: 根据区域和员工类型和员工id获取员工面板信息数据（员工配置数据）
     * @param {GAME_AREA} area
     * @param {EMPLOYEE_PANEL_TYPE} epType
     * @param {number} epId
     * @return {*}
     */    
    getEpInfoDataByAreaAndTypeAndId(area: GAME_AREA, epType: EMPLOYEE_PANEL_TYPE, epId: number): IEmployeeConfigData {
        let epInfoData = this.getEmployeeInfoDataByAreaAndType(area, epType);
        return epInfoData.Employees.find((item) => {
            return item.id === epId;
        });
    }
}


