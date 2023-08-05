/*
 * @Author: Zhong Sheng
 * @Date: 2023-04-21 17:23:26
 * @LastEditors: Zhong Sheng
 * @LastEditTime: 2023-04-23 18:47:26
 * @Description: 角色状态基类，不同角色的不同状态实现都要继承该类
 */

export abstract class CharacterStateBase<T> {
    protected _character: T | null = null;

    constructor(character: T) {
        this._character = character;
    }

    // 进入状态后的行为
    abstract onEnter(): void;

    // 在某个状态下的行为
    abstract execute(): void;

    // 离开状态后的行为
    abstract onExit(): void;
}


