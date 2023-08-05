/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-06-01 01:35:47
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-06-08 00:38:42
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\Runtime\CustomerData.ts
 * @Description: 顾客运行时数据管理
 */

import { log } from "cc";
import Singleton from "../Base/Singleton";
import { CUSTOMER_STATES, GAME_AREA, WAIT_AREA } from "../Enums/GameEnums";
import { writeLocalStorageAsync } from "../Util/CommonUtil";

export interface ICustomerData {
    id: string;
    status: CUSTOMER_STATES;
    waitTime: number;
    currentArea: GAME_AREA;
    subArea: WAIT_AREA;
}

export class CustomerData extends Singleton {
    static get Instance() {
        return super.GetInstance<CustomerData>();
    }

    constructor() {
        super();
    }

    private _customerData: ICustomerData[] = [];

    /**
    * @description: 获取所有顾客运行时数据
    * @return {*}
    */
    getAllCustomerData(): ICustomerData[] {
        return this._customerData;
    }

    /**
     * @description: 根据顾客ID获取顾客运行时数据
     * @param {string} customerId 顾客ID
     * @return {*}
     */    
    getCutomerDataById(customerId: string): ICustomerData | undefined {
        return this._customerData.find((customer) => {
            return customer.id === customerId;
        });
    }

    /**
     * @description: 添加顾客到运行时队列
     * @param {ICustomerData} customerData
     * @return {*}
     */
    addCustomerData(customerData: ICustomerData): void {
        this._customerData.push(customerData);
        this.saveCustomerDataToLocal();
    }

    /**
     * @description: 根据顾客ID删除顾客运行时数据
     * @param {number} customerId 顾客ID
     * @return {*}
     */    
    deleteCustomerRuntimeData(customerId: string): void {
        let index = this._customerData.findIndex((customer) => {
            return customer.id === customerId;
        });
        if (index !== -1) {
            this._customerData.splice(index, 1);
            this.saveCustomerDataToLocal();
        }
    }

    /**
     * @description: 更新顾客运行时数据
     * @param {ICustomerData} customerData
     * @return {*}
     */    
    updateCustomerData(customerData: ICustomerData): void {
        let index = this._customerData.findIndex((customer) => {
            return customer.id === customerData.id;
        });
        if (index !== -1) {
            this._customerData[index] = customerData;
            this.saveCustomerDataToLocal();
        }
    }

    /**
     * @description: 本地存储顾客运行时数据
     * @return {*}
     */
    saveCustomerDataToLocal(): void {
        writeLocalStorageAsync('CustomerData', this._customerData)
            .then(() => {
                log('写入本地存储成功');
            })
            .catch((error) => {
                error('写入本地存储失败:', error);
            });
    }
}


