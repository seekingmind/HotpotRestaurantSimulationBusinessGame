/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-05-25 14:47:06
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-07-14 00:48:20
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\Runtime\BillData.ts
 * @Description: 游戏订单数据
 */

import { error, log } from "cc";
import Singleton from "../Base/Singleton";
import { readLocalStorage, writeLocalStorageAsync } from "../Util/CommonUtil";
import { IMenuItem } from "./MenuInfoData";

export interface IBill {
    // 账单ID
    id: number;
    // 点了什么菜
    billDetails: IBillDetail[];
    // 台号
    deskId: number;
    // 合计
    totalPrice: number;
    // 结账时间
    orderTime: string;
}

export interface IBillDetail {
    // 具体点的什么菜
    orderFood: IMenuItem;
    // 数量
    orderCount: number;
}

export class BillData extends Singleton {
    static get Instance() {
        return super.GetInstance<BillData>();
    }

    private billData: Array<IBill> = [];

    constructor() {
        super();
        this.initBillData();
    }

    /**
     * @description: 初始化订单数据，从本地存储中读取，有的话就读取，没有的话就创建
     * @return {*}
     */
    private initBillData(): any {
        let billData = readLocalStorage("BillData");
        if (billData) {
            this.billData = billData;
        } else {
            this.billData = [];

            writeLocalStorageAsync("BillData", this.billData)
                .then(() => {
                    log("订单数据初始化成功");
                })
                .catch((err) => {
                    error("订单数据初始化失败", err);
                });
        }
    }

    /**
     * @description: 获取所有订单数据
     * @return {*}
     */    
    public getBillData(): Array<IBill> {
        if (this.billData.length === 0) {
            return null;
        }
        return this.billData;
    }

    /**
     * @description: 添加订单数据
     * @param {IBill} bill
     * @return {*}
     */    
    public addBillData(bill: IBill): void {
        this.billData.push(bill);
        writeLocalStorageAsync("BillData", this.billData)
            .then(() => {
                log("订单数据添加成功");
            })
            .catch((err) => {
                error("订单数据添加失败", err);
            });
    }

    /**
     * @description: 根据订单ID获取订单数据
     * @param {number} id
     * @return {*}
     */    
    public getBillDataById(id: number): IBill {
        if (this.billData.length === 0) {
            return null;
        }
         
        let bill = this.billData.find((bill) => {
            return bill.id === id;
        });
        return bill;
    }

    /**
     * @description: 获取最后一个订单数据
     * @return {*}
     */    
    public getLastOneBillData(): IBill {
        if (this.billData.length === 0) {
            return null;
        }

        return this.billData[this.billData.length - 1];
    }
}


