/*
 * @Author: Zhong Sheng
 * @Date: 2023-04-10 21:30:23
 * @LastEditors: Zhong Sheng
 * @LastEditTime: 2023-04-10 22:23:47
 * @Description: 全局事件管理，单例模式
 */

import Singleton from "../Base/Singleton";

interface IEvent {
    func: Function;
    ctx: unknown;
}

export default class EventManager extends Singleton {
    static get Instance() {
        return super.GetInstance<EventManager>();
    }

    // 用于存放事件的字典
    eventDic: Map<string, Array<IEvent>> = new Map();

    /**
     * @description: 注册事件
     * @param {string} eventName 事件名
     * @param {Function} func 事件回调
     * @param {unknown} ctx 回调上下文
     * @return {*}
     */
    addEvent(eventName: string, func: Function, ctx?: unknown) {
        // 如果有这个事件，就往这个事件的数组里面添加事件回调，否则就创建一个新的事件
        if (this.eventDic.has(eventName)) {
            this.eventDic.get(eventName).push({ func, ctx });
        } else {
            this.eventDic.set(eventName, [{ func, ctx }]);
        }
    }

    /**
     * @description: 移除事件
     * @param {string} eventName 事件名
     * @param {Function} func 事件回调函数
     * @return {*}
     */
    removeEvent(eventName: string, func: Function) {
        if (this.eventDic.has(eventName)) {
            const eventFuncIndex = this.eventDic.get(eventName).findIndex((event) => event.func === func);
            eventFuncIndex > -1 && this.eventDic.get(eventName).splice(eventFuncIndex, 1);
        }
    }

    /**
     * @description: 订阅事件
     * @param {string} eventName 时间名
     * @param {array} args 事件回调的传参
     * @return {*}
     */
    emit(eventName: string, ...args: unknown[]) {
        if (this.eventDic.has(eventName)) {
            this.eventDic.get(eventName).forEach(({ func, ctx }) => {
                ctx ? func.apply(ctx, args) : func(args);
            });
        }
    }

    /**
     * @description: 清空所有事件
     * @return {*}
     */    
    clear() {
        this.eventDic.clear();
    }
}


