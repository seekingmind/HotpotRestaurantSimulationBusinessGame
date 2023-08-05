/*
 * @Author: Zhong Sheng
 * @Date: 2023-05-06 23:29:36
 * @LastEditors: Zhong Sheng
 * @LastEditTime: 2023-05-07 00:26:17
 * @Description: 观察者模式中的观察者，用于观察数据源的变化
 */

import SubscriptionPool from "./SubscriptionPool";

export default class Observer {
    // 监听的数据对象
    private _data: Object = null;
    // 监听对象的属性名
    private _key: string = "";
    // 监听对象改变时的回调函数
    private _callback: Function = null;
    // 监听对象绑定的目标对象
    private _target: any = null;
    // 回调参数
    private _params: any = null;

    /**
     * @description: 创建数据监听
     * @param {Object} data 监听对象
     * @param {string} key 监听对象的属性名
     * @param {Function} cb 监听对象改变时的回调函数
     * @param {any} target 监听对象绑定的目标对象
     * @param {any} params 回调参数
     * @return {*}
     */    
    constructor(data: Object, key: string, cb: Function, target?: any, params?: any) {
        this._data = data;
        this._key = key;
        this._callback = cb;
        this._target = target;
        this._params = params;

        // 查找数据源订阅器，将监听者添加到订阅器中
        let subscription = SubscriptionPool.Instance.getSubscription(this._data, this._key);
        subscription.addObserve(this);
    }

    /**
     * @description: 从订阅器中移除该观察者
     * @return {*}
     */    
    removeSelf() {
        let subscription = SubscriptionPool.Instance.getSubscription(this._data, this._key);
        subscription.removeObserve(this);
    }

    /**
     * @description: 监听对象改变时触发的回调函数
     * @param {any} oldValue 旧值
     * @param {any} newValue 新值
     * @return {*}
     */    
    refresh(oldValue: any, newValue: any) {
        this._callback.call(this._target, oldValue, newValue, this._params);
    }
}


