/*
 * @Author: Zhong Sheng
 * @Date: 2023-04-10 21:20:55
 * @LastEditors: Zhong Sheng
 * @LastEditTime: 2023-04-10 21:24:16
 * @Description: 单例基类
 */

export default class Singleton {
    private static _instance: any = null;

    static GetInstance<T>(): T {
        if (!this._instance) {
            this._instance = new this();
        }
        return this._instance;
    }
}
