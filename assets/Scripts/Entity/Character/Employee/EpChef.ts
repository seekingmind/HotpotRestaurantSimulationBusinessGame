/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-07-05 00:26:52
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-07-05 16:51:38
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\Entity\Character\Employee\EpChef.ts
 * @Description: 员工-厨师
 */
import { _decorator, Component, error, JsonAsset, log, Node, resources } from 'cc';
import { Employee } from './Employee';
const { ccclass, property } = _decorator;

@ccclass('EpChef')
export class EpChef extends Employee {
    private _movePathJsonData: any = null;

    public initConfigData(data: any): void {
        super.initConfigData(data);
    }

    public initRuntimeData(data: any): void {
        super.initRuntimeData(data);
    }

    protected initMovePath(): void {
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
}


