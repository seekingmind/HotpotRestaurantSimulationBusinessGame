/*
 * @Author: Zhong Sheng
 * @Date: 2023-05-06 03:50:32
 * @LastEditors: Zhong Sheng
 * @LastEditTime: 2023-05-06 17:51:48
 * @Description: 面板的ui容器，用于存放和搜索一个面板中的节点和各种组件
 */

import { Button, Component, Label, Node, Sprite } from "cc";
import { COMPTYPE } from "./UIDefine";

export default class UIContainer {
    // 不同类型的节点map
    private _mapNode: Map<string, Node> = new Map();
    private _mapButton: Map<string, Button> = new Map();
    private _mapLabel: Map<string, Label> = new Map();
    private _mapSprite: Map<string, Sprite> = new Map();

    // 组件类型数组
    private _compTypeArr: any[] = [Button, Label, Sprite];
    // 组件类型对应的map
    private _compTypeMap: any[] = [this._mapButton, this._mapLabel, this._mapSprite];

    /**
     * @description: 加载需要被管理的UI节点
     * @param {Node} rootNode
     * @return {*}
     */    
    public load(rootNode: Node) {
        const childrenNodes = rootNode.children;
    
        for (const childNode of childrenNodes) {
            this._mapNode.set(childNode.name, childNode);
    
            // 判断当前子节点属于什么类型的组件
            this._compTypeArr.forEach((compType, index) => {
                const comp = childNode.getComponent(compType);
                if (comp) {
                    this._compTypeMap[index].set(childNode.name, comp);
                }
            });

            this.load(childNode);
        }
    }

    /**
     * @description: 根据节点名查找节点
     * @param {string} key 要查找的节点名称
     * @return {Node | null} 找到的节点
     */    
    getNode(key: string): Node | null {
        if (!key) {
            return null;
        }
        return this._mapNode.get(key) ?? null;
    }

    /**
     * @description: 查找组件
     * @param {COMPTYPE} type 组件类型
     * @param {string} key 组件挂载的节点名
     * @return {Component | null} 查找的结果
     */    
    getComponent(type: COMPTYPE, key: string): Component | null {
        const mapData = this._compTypeMap[type];
        if (!mapData) {
            return null;
        }
        return mapData.get(key) ?? null;
    }
    
    /**
     * @description: 查找button节点
     * @param {string} key 节点名
     * @return {Button | null} 找到的button节点
     */    
    getButton(key: string): Button | null {
        return this._mapButton.get(key) ?? null;
    }

    /**
     * @description: 获取所有button节点
     * @return {*}
     */    
    getButtonMap(): Map<string, Button> {
        return this._mapButton;
    }

    /**
     * @description: 查找label节点
     * @param {string} key 节点名
     * @return {Label | null} 找到的label节点
     */    
    getLabel(key: string): Label | null {
        return this._mapLabel.get(key) ?? null;
    }

    /**
     * @description: 查找sprite节点
     * @param {string} key 节点名
     * @return {Sprite | null} 找到的sprite节点
     */
    getSprite(key: string): Sprite | null {
        return this._mapSprite.get(key) ?? null;
    }
}


