/*
 * @Author: Zhong Sheng
 * @Date: 2023-04-21 17:41:57
 * @LastEditors: Zhong Sheng
 * @LastEditTime: 2023-04-23 20:44:54
 * @Description: 角色状态机基类，不同角色继承该类
 */

import { error, log } from "cc";
import { CharacterStateBase } from "./CharacterStateBase";

export class CharacterStateMachine<T> {
    protected _mapStates: Map<number, CharacterStateBase<T>> = new Map();
    protected _currentState: CharacterStateBase<T> | null = null;

    /**
     * @description: 注册状态
     * @param {string} key 状态名
     * @param {CharacterStateBase} state 状态实例
     * @return {*}
     */
    registeState(key: number, state: CharacterStateBase<T>): void {
        if (key === null) {
            error("注册的状态名不能为空");
            return;
        }

        if (state === null) {
            error("注册的状态不能为空");
            return;
        }

        if (this._mapStates.has(key)) {
            return;
        }

        this._mapStates.set(key, state);
    }

    /**
     * @description: 删除一个状态
     * @param {string} key 状态名
     * @return {*}
     */
    deleteState(key: number): void {
        if (key === null) {
            error("删除的状态名不能为空");
            return;
        }

        if (!this._mapStates.has(key)) {
            log(`不存在状态${key}`);
            return;
        }

        this._mapStates.delete(key);
    }

    /**
     * @description: 切换状态
     * @param {string} key 状态名
     * @return {*}
     */
    switchState(key: number) {
        if (key === null) {
            error("切换的状态名不能为空");
            return;
        }

        // if (this._currentState) {
        //     if (this._currentState == this._mapStates.get(key)) {
        //         return;
        //     }
        //     this._currentState.onExit();
        // }

        this._currentState = this._mapStates.get(key);
        if (this._currentState) {
            this._currentState.onEnter();
        } else {
            error(`状态${key}不存在`);
        }
    }

    /**
     * @description: 获取状态机内所有的状态
     * @return {*}
     */
    getAllStates(): Map<number, CharacterStateBase<T>> {
        return this._mapStates;
    }

    /**
     * @description: 获取当前状态
     * @return {*}
     */
    getCurrentState(): CharacterStateBase<T> {
        return this._currentState;
    }
}


