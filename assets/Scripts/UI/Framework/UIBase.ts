import { _decorator, Button, Component, Label, Node, Sprite } from 'cc';
import UIContainer from './UIContainer';
import { UIManager } from './UIManager';
import Observer from '../DataBinding/Observer';
import UIUtils from '../Utils/UIUtils';
const { ccclass, property } = _decorator;

@ccclass('UIBase')
export class UIBase extends Component {

    // ui标识名称
    public strName: string = '';
    
    // ui节点容器
    protected ui: UIContainer = new UIContainer();

    private _arrObserver: Observer[] = [];

    /**
     * @description: 初始化，将当前挂载的节点加载到ui容器中
     * @param {any} params
     * @return {*}
     */    
    init(params: any) {
        this.ui.load(this.node);
        this.onInit(params);
    }

    /**
     * @description: 初次加载时调用
     * @param {any} params
     * @return {*}
     */    
    onInit(params: any) {

    }

    /**
     * @description: 显示时调用
     * @param {any} params
     * @return {*}
     */    
    onEnter(params: any) {

    }

    /**
     * @description: 隐藏时调用
     * @return {*}
     */    
    onExit() {

    }

    onDestroy() {
        this._arrObserver.forEach((observer) => {
            observer.removeSelf();
        });
    }

    /**
     * @description: 显示ui
     * @param {any} params
     * @return {*}
     */    
    show(params: any) {
        this.node.active = true;
        this.onEnter(params);
    }

    /**
     * @description: 隐藏ui
     * @return {*}
     */    
    hide() {
        this.node.active = false;
        this.onExit();
    }

    /**
     * @description: 添加按钮点击事件
     * @param {string} buttonName 按钮节点名称
     * @param {Function} callback 回调函数
     * @return {*}
     */    
    addButtonClick(buttonName: string, callback: Function) {
        let btn = this.getNode(buttonName);
        if (!btn) {
            return;
        }
        btn.on(Node.EventType.TOUCH_START, callback);
    }

    /**
     * @description: 对 UIContainer 类中的 getNode 方法进行封装
     * @param {string} key 要查找的节点名称
     * @return {Node | null} 找到的节点
     */    
    getNode(key:string): Node | null {
        return this.ui.getNode(key);
    }

    /**
     * @description: 对 UIContainer 类中的 getButton 方法进行封装
     * @param {string} key 要查找的按钮节点名称
     * @return {Button | null} 找到的按钮节点
     */    
    getButton(key: string): Button | null {
        return this.ui.getButton(key);
    }

    /**
     * @description: 对 UIContainer 类中的 getButtonMap 方法进行封装
     * @return {*}
     */    
    getButtonMap(): Map<string, Button> | null {
        return this.ui.getButtonMap();
    }

    /**
     * @description: 对 UIContainer 类中的 getLabel 方法进行封装
     * @param {string} key 要查找的标签节点名称
     * @return {Label | null} 找到的标签节点
     */    
    getLabel(key: string): Label | null {
        return this.ui.getLabel(key);
    }

    /**
     * @description: 对 UIContainer 类中的 getSprite 方法进行封装
     * @param {string} key 要查找的精灵节点名称
     * @return {Sprite | null} 找到的精灵节点
     */    
    getSprite(key: string): Sprite | null {
        return this.ui.getSprite(key);
    }

    /**
     * @description: 对 UIManager 类中的 openUI 方法进行封装
     * @param {string} uiName 要打开的ui名称
     * @param {any} params  传递给ui的参数
     * @param {number} layer ui层级
     * @param {Function} cb ui打开后的回调函数
     * @return {*}
     */    
    openUI(uiName: string, params?: any, layer?: number, cb?: Function) {
        UIManager.Instance.openUI(uiName, params, layer, cb);
    }

    /**
     * @description: 对 UIManager 类中的 closeUI 方法进行封装
     * @param {string} uiName 要关闭的ui名称
     * @return {*}
     */    
    closeUI(uiName: string) {
        UIManager.Instance.closeUI(uiName);
    }
    
    /**
     * @description: 关闭自身
     * @return {*}
     */    
    closeSelf() {
        UIManager.Instance.closeUI(this.strName);
    }

    /**
     * @description: 发送跨模块调用请求
     * @param {string} uiName 要查找的ui名
     * @param {string} msgName 调用的函数名
     * @param {array} reset 传递的参数
     * @return {*}
     */    
    sendMsg(uiName: string, msgName: string, ...reset: any[]) {
        UIManager.Instance.sendMsg(uiName, msgName, ...reset);
    }

    /**
     * @description: 接收备用的调用请求
     * @param {string} msgName 调用的函数名
     * @param {string} param1
     * @param {string} param2
     * @return {*}
     */    
    handleMsg(msgName: string, param1: string, param2: string): void {
        // 判断消息名称，做不同处理
        switch (msgName) {
            case 'modifyName':
                // let lbUserName = this.getLabel('_userName');
                // lbUserName.string = name;
                break;
            case 'addCoin':
                // ...
                break;
            default:
                console.warn(`handleMsg: Unknown message '${msgName}'`);
                break;
        }
    }
    
    /**
     * @description: 数据绑定
     * @param {Object} data 绑定的对象
     * @param {string} key 绑定对象的属性
     * @param {Function} cb 绑定对象的回调函数
     * @param {any} target 目标对象
     * @return {*}
     */    
    bind(data: Object, key: string, cb: Function, target?: any) {
        target = target || this;
        let obeserver = new Observer(data, key, cb, target);
        this._arrObserver.push(obeserver);
    }

    /**
     * @description: 数据绑定组件
     * @param {any} data 绑定的对象
     * @param {string} key 绑定对象的属性
     * @param {Component} comp 目标组件
     * @return {*}
     */    
    bindComponent(data: any, key: string, comp: Component) {
        let obeserver = new Observer(data, key, UIUtils.refreshComponent, this, comp);
        this._arrObserver.push(obeserver);
    }
}
