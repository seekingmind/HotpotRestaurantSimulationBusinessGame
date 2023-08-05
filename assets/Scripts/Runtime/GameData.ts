/*
 * @Author: Zhong Sheng
 * @Date: 2023-04-07 00:51:14
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-07-14 00:13:52
 * @Description: 游戏数据中心，用于记录有多少张桌子，每张桌子的位置，在场的顾客的状态，员工的状态等数据
 */

import { Vec3, Node } from "cc";
import { Desk } from "../Entity/Item/Desk";
import Singleton from "../Base/Singleton";
import { IMenuItem } from "./MenuInfoData";

type SeatInfo = {
    seatId: number;
    seatStatus: number;
    customerId: string;
}

class GameData extends Singleton {
    static getInstance() {
        return super.GetInstance<GameData>();
    }

    // 在等待区的顾客节点
    public CustomerInWaitArr: Node[] = [];
    // 等待顾客移动到等待区目标位置的数量
    public CustomerInWaitPositionCount: number = 0;
    // 等待区的每个等待位置的坐标
    public WaitPositions: Array<Vec3> = [];

    // 顾客在移动中的数量：桌子编号 -> 数量
    public CustomerInMovingCountMap: Map<number, number> = new Map();
    // 顾客抵达桌子的数量：桌子编号 -> 数量
    public CustomerInDeskCountMap: Map<number, number> = new Map();
    // 顾客结束点菜的数量：桌子编号 -> 数量
    public CustomerFinishOrderFoodCount: Map<number, number> = new Map();


    // 所有桌子节点
    public Desks: Node[] = [];
    // 桌子编号 -> 座位信息
    public SeatsInfo: Map<number, Array<SeatInfo>> = new Map();

    /**
     * @description: 往所有桌子节点数组中添加一个桌子节点
     * @param {Node} node
     * @return {*}
     */    
    updateDesks(node: Node) {
        this.Desks.push(node);
    }

    /**
     * @description: 更新桌子的座位信息
     * @param {number} deskId
     * @param {any} seatsInfo
     * @return {*}
     */    
    updateSeatsInfo(deskId: number, seatsInfo: any) {
        this.SeatsInfo.set(deskId, seatsInfo);
    }

    /**
     * @description: 根据桌子编号，获取桌子节点
     * @param {number} id
     * @return {*}
     */    
    getDeskById(id: number) {
        if (id < 0) {
            return null;
        } else {
            for (let i = 0; i < this.Desks.length; i++) {
                if (this.Desks[i].getComponent(Desk).deskInfo.id == id) {
                    return this.Desks[i];
                }
            }
        }
    }

    // 所有员工节点
    public Employees: Node[] = [];

    /**
     * @description: 往所有员工节点数组中添加一个员工节点
     * @param {Node} node
     * @return {*}
     */    
    updateEmployees(node: Node) {
        this.Employees.push(node);
    }

    // 顾客点菜相关数据
    // 桌子编号 -> 点了什么菜的数组
    public CustomerOrderFood: Map<number, Array<IMenuItem>> = new Map();

    updateCustomerOrderFood(deskId) {
        this.CustomerOrderFood.set(deskId, []);
    }

    // 桌子编号 -> 是否火锅汤底已经做好并送到桌上
    public hotpotSoupFinish: Map<number, boolean> = new Map();
    updateHotpotSoupFinish(deskId: number, isFinish: boolean) {
        this.hotpotSoupFinish.set(deskId, isFinish);
    }

    // 桌子编号 -> 是否菜品已经做好并送到桌上
    public dishFinish: Map<number, boolean> = new Map();
    updateDishFinish(deskId: number, isFinish: boolean) {
        this.dishFinish.set(deskId, isFinish);
    }
}

export default GameData.getInstance();