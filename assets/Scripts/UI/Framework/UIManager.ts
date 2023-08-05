/*
 * @Author: Zhong Sheng
 * @Date: 2023-05-06 18:08:35
 * @LastEditors: Zhong Sheng
 * @LastEditTime: 2023-05-11 22:03:30
 * @Description: UI管理器
 */

import { _decorator, error, find, instantiate, Node, Prefab, resources, tween, Vec3, warn } from 'cc';
import { UILAYER, uiPrefabsPath, UIRoot } from './UIDefine';
import { UIBase } from './UIBase';
import Singleton from '../../Base/Singleton';

export class UIManager extends Singleton {
    static get Instance() {
        let inst = super.GetInstance<UIManager>();
        inst._init();
        return inst;
    }

    // 用于存放层级节点
    private _arrLayerNode: Node[] = [];

    private _mapUI: Map<string, UIBase> = new Map();

    start() {

    }

    update(deltaTime: number) {

    }

    private _init() {
        const rootNode = find(UIRoot);
        this._arrLayerNode = rootNode.children.slice();
    }

    /**
     * @description: 查找已经加载的UIBase节点
     * @param {string} uiName UI节点名
     * @return {UIBase} 查找到的UIBase节点
     */
    getUI(uiName: string): UIBase {
        return this._mapUI.get(uiName);
    }

    /**
     * @description: 加载UI
     * @param {string} uiName UI节点名
     * @param {any} params 传递给UI的参数
     * @param {number} layer UI所在的层级
     * @param {Function} cb UI加载完成后的回调
     * @return {*}
     */
    openUI(uiName: string, params?: any, layer?: number, cb?: Function) {
        // 在配置表中查找节点名对应的UI路径
        let path = uiPrefabsPath[uiName];
        if (!path) {
            error("UIManager.openUI: uiName is not exist");
            return;
        }

        // 通过路径查找UI是否已经加载过
        let uiBase = this._mapUI.get(uiName);
        if (!uiBase) {
            // 未加载过，直接读取预制体资源
            resources.load(path, (err, asset) => {
                if (err) {
                    error("UIManager.openUI: load ui error");
                    return;
                }

                let uiNode = instantiate(<Prefab>asset);
                layer = layer || UILAYER.E_PAGE;  // 默认为页面层
                uiNode.parent = this._arrLayerNode[layer];  // 设置层级

                // 获取UIBase组件
                uiBase = uiNode.getComponent(UIBase);
                this._mapUI.set(uiName, uiBase);
                uiBase.strName = uiName;

                uiBase.init(params);
                uiBase.show(params);
                if (cb) {
                    cb();
                }
            });

            return;
        }

        uiBase.show(params);
        if (cb) {
            cb();
        }
    }

    /**
     * @description: 隐藏ui节点
     * @param {string} uiName UI节点名
     * @return {*}
     */
    closeUI(uiName: string) {
        let uiBase = this._mapUI.get(uiName);
        if (!uiBase) {
            error("UIManager.closeUI: uiName is not exist");
            return;
        }

        uiBase.hide();
    }

    /**
     * @description: 查找匹配的UI节点，调用对应的函数，可能需要在某个 UI 组件（A）内部去调用其他的 UI 组件（B）的方法，即跨模块调度
     * @param {string} uiName ui节点名
     * @param {string} msgName 调用的函数名
     * @param {array} rest 调用函数的参数
     * @return {*}
     */
    sendMsg(uiName: string, msgName: string, ...rest: any[]): void {
        // 查找UI节点
        const ui = this._mapUI.get(uiName);
        if (!ui) {
            warn('can not find ui!');
            return;
        }

        // 查找对应函数
        const func = ui[msgName] as (...args: any[]) => void;
        if (func) {
            func.apply(ui, rest); // 将参数应用到函数
        } else {
            if (typeof ui.handleMsg === 'function') {
                ui.handleMsg.apply(ui, [msgName, ...rest]); // 调用备用函数
            } else {
                warn('UI function and fallback function are not exist!');
            }
        }
    }
}
