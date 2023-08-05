/*
 * @Author: Zhong Sheng
 * @Date: 2023-05-06 23:48:57
 * @LastEditors: Zhong Sheng
 * @LastEditTime: 2023-05-07 01:09:26
 * @Description: 订阅器，做数据绑定
 */

import Observer from "./Observer";

export default class Subscription {
    // 观察的数据对象
    public data: Object = null;

    // 观察对象的属性名
    public key: string = "";

    // 观察者列表
    private _arrObserver: Observer[] = [];

    /**
     * @description: 创建订阅
     * @param {Object} data 订阅的对象
     * @param {string} key 订阅的对象的属性名
     * @return {*}
     */    
    constructor(data: Object, key: string) {
        this.data = data;
        this.key = key;
        this._defineProperty();
    }

    /**
     * @description: 添加观察者
     * @param {Observer} observer 观察者对象
     * @return {*}
     */    
    addObserve(observer: Observer) {
        if (!observer) {
            return;
        }
    
        if (this._arrObserver.indexOf(observer) === -1) {
            this._arrObserver.push(observer);
        }
    }

    /**
     * @description: 移除一个观察者
     * @param {Observer} observer 观察者对象
     * @return {*}
     */    
    removeObserve(observer: Observer) {
        if (!observer) {
            return;
        }
    
        let index = this._arrObserver.indexOf(observer);
        if (index !== -1) {
            this._arrObserver.splice(index, 1);
        }
    }

    /**
     * @description: 通知观察者更新数据
     * @param {any} oldValue 旧值
     * @param {any} newValue 新值
     * @return {*}
     */    
    private _notify(oldValue: any, newValue: any) {
        this._arrObserver.forEach((observer) => {
            observer.refresh(oldValue, newValue);
        });
    }

    /**
     * @description: 创建数据绑定
     * @return {*}
     */    
    private _defineProperty() {
        let value = this.data[this.key];
        
        Object.defineProperty(this.data, this.key, {
            set: (newValue) => {
                if (value === newValue) {
                    return;
                }
                this._notify(value, newValue);
                value = newValue;
            },
            get: () => {
                return value;
            }
        });
    }
}
