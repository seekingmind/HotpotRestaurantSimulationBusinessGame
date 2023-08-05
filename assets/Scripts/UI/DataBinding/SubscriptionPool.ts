/*
 * @Author: Zhong Sheng
 * @Date: 2023-05-06 22:59:56
 * @LastEditors: Zhong Sheng
 * @LastEditTime: 2023-05-07 00:20:41
 * @Description: 数据绑定的订阅池
 */

import Singleton from "../../Base/Singleton";
import Observer from "./Observer";
import Subscription from "./Subscription";

export default class SubscriptionPool extends Singleton {
    static get Instance() {
        return super.GetInstance<SubscriptionPool>();
    }

    // 订阅器列表
    private _arrSubscription: Subscription[] = [];

    /**
     * @description: 查找订阅器
     * @param {Object} data 数据源
     * @param {string} key 订阅器的键名
     * @return {Subscription} 订阅器
     */    
    getSubscription(data: Object, key: string): Subscription {
        if (!data || !key) {
            return;
        }
    
        let subscription = this._arrSubscription.find(item => item.data === data && item.key === key);
    
        if (!subscription) {
            subscription = new Subscription(data, key);
            this._arrSubscription.push(subscription);
        }

        return subscription;
    }
    
    /**
     * @description: 移除订阅器
     * @param {Object} data 订阅器数据源
     * @param {string} key 订阅器的键名
     * @return {*}
     */    
    removeSubscription(data: Object, key: string) {
        if (!data || !key) {
            return;
        }
    
        let index = this._arrSubscription.findIndex(item => item.data === data && item.key === key);
        if (index !== -1) {
            this._arrSubscription.splice(index, 1);
        }
    }
}
