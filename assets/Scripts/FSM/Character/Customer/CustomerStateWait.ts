/*
 * @Author: Zhong Sheng
 * @Date: 2023-04-22 18:36:57
 * @LastEditors: Zhong Sheng
 * @LastEditTime: 2023-04-23 19:43:55
 * @Description: 顾客在等待区等待状态
 */

import { log, sp } from "cc";
import { CharacterStateBase } from "../CharacterStateBase";
import { Customer } from "../../../Entity/Character/Customer";
import { writeLocalStorage, writeLocalStorageAsync } from "../../../Util/CommonUtil";
import GameData from "../../../Runtime/GameData";
import { Desk } from "../../../Entity/Item/Desk";
import { DESK_STATES } from "../../../Enums/GameEnums";


export class CustomerStateWait extends CharacterStateBase<Customer> {
    private _customer: Customer | null = null;

    onEnter() {
        log("顾客在等待区，当前处于等待状态");
        this._customer = this._character;

        // 保存一次顾客数据到本地存储
        writeLocalStorageAsync("CUSTOMER_" + this._customer.customerInfo.customerId, this._customer.customerInfo);
    }

    execute(): void {
        // 执行idle动画
    }

    onExit(): void {}
}


