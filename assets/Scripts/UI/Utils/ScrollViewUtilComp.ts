/*
 * @Author: Zhong Sheng
 * @Date: 2023-05-12 01:08:10
 * @LastEditors: Zhong Sheng
 * @LastEditTime: 2023-05-12 17:05:26
 * @Description: 滚动视图组件工具
 */
import { NodeEventType, Tween, UITransform, Vec3, instantiate, isValid, tween } from 'cc';
import { _decorator, Component, Enum, Layout, Node, Prefab, ScrollView } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScrollViewUtilComp')
export class ScrollViewUtilComp extends Component {
    @property({ type: Enum({ 节点: 0, 预制体: 1 }), displayName: "item类型" })
    private type: number = 0;

    @property({ type: Node, visible() { return this.type === 0; }, displayName: "item节点" })
    private itemNode: Node = null!;

    @property({ type: Prefab, visible() { return this.type === 1; }, displayName: "item预制体" })
    private itemPrefab: Prefab = null!;

    private _comScrollView: ScrollView;
    private _content: Node;
    private _layout: Layout;
    private _item: Node;
    private _nodePool: Array<Node>;
    private _interval: number;
    private _currShowDatas: Array<ScrollViewProData> = [];
    private _allDatas: Array<[number, any]> = [];
    private _func: Function;
    private _key: string;

    onLoad() {
        this._comScrollView = this.node.getComponent(ScrollView)!;
        if (null == this._comScrollView) return;

        this._content = this._comScrollView.content!;
        if (null == this._content) return;

        this._layout = this._content.getComponent(Layout)!;
        if (null == this._layout) return;
        this._layout.enabled = false;

        this.node.on("scrolling", this.onScrolling, this);
        this.node.on(NodeEventType.SIZE_CHANGED, this.onSizeChanged, this);

        this._nodePool = [];
        for (let i: number = this._content.children.length - 1; i >= 0; i--) {
            this._nodePool.push(this._content.children[i]);
            this._content.children[i].setPosition(Number.MAX_VALUE, Number.MAX_VALUE);
        }

        this.updateContentSize();
        this.updateListView();
    }

    onDestroy(): void {
        this.node.off("scrolling", this.onScrolling, this);
        this.node.off(NodeEventType.SIZE_CHANGED, this.onSizeChanged, this);
        clearInterval(this._interval);
    }

    private get item(): Node {
        if (null == this._item) {
            if (0 == this.type && null != this.itemNode) {
                this._item = instantiate(this.itemNode);
            } else if (1 == this.type && null != this.itemPrefab) {
                this._item = instantiate(this.itemPrefab);
            }
        }

        return this._item;
    }

    /**
     * @description: 设置视图，外部调用
     * @param {Array} datas 用户数据
     * @param {Function} func 回调
     * @param {string} key 根据key查询两次数据是否一样
     * @return {*}
    */
    public setView(datas: Array<any>, func: (n: Node, data: any, index: number) => void, key?: string): void {
        this.updateAllDatas(datas);
        this._func = func, this._key = key;
        this.updateContentSize();
        this.updateListView(true);
    }

    /**
     * @description: 更新所有数据
     * @param {Array} datas
     * @return {*}
     */    
    private updateAllDatas(datas: Array<any>): void {
        this._allDatas = [];
        for (let i: number = 0; i < datas.length; i++) {
            this._allDatas.push([i, datas[i]]);
        }
    }

    private onScrolling() {
        this.updateListView();
    }

    private onSizeChanged() {
        this.updateListView();
    }

    /**
     * @description: 更新content尺寸
     * @return {*}
     */
    private updateContentSize(): void {
        if (null == this._content || null == this._layout) return;

        switch (this._layout.type) {
            case Layout.Type.VERTICAL:
                this._content.getComponent(UITransform).height = this._layout.paddingTop + this._layout.paddingBottom +
                    this._allDatas.length * (this._layout.spacingY + this.item.getComponent(UITransform).height * this.item.scale.y) -
                    this._layout.spacingY;
                break;
            case Layout.Type.HORIZONTAL:
                this._content.getComponent(UITransform).width = this._layout.paddingLeft + this._layout.paddingRight +
                    this._allDatas.length * (this._layout.spacingX + this.item.getComponent(UITransform).width * this.item.scale.x) -
                    this._layout.spacingX;
                break;
            default:
                break;
        }
    }

    /**
     * @description: 滚动视图更新
     * @param {boolean} executeAllCallback
     * @return {*}
     */
    private updateListView(executeAllCallback: boolean = false): void {
        let datasNeedShow = this.getDatasNeedShow();

        // 优化item的显示
        for (let i: number = this._currShowDatas.length - 1; i >= 0; i--) {
            if (this._key == null) {
                for (var j = 0; j < datasNeedShow.length; j++) {
                    if (datasNeedShow[j][1] == this._currShowDatas[i].userData) {
                        break;
                    }
                }
            } else {
                for (var j = 0; j < datasNeedShow.length; j++) {
                    if (datasNeedShow[j][1][this._key] == this._currShowDatas[i].userData[this._key]) {
                        break;
                    }
                }
            }

            if (j >= datasNeedShow.length) {
                this._nodePool.push(this._currShowDatas[i].n);
                this._currShowDatas[i].n.setPosition(Number.MAX_VALUE, Number.MAX_VALUE);
                this._currShowDatas.splice(i, 1);
            }
        }

        let dataNeedInstantiate: Array<Array<any>> = [];
        let index: number = 0;
        for (let i: number = 0; i < datasNeedShow.length; i++) {
            if (this._key == null) {
                for (var j: number = 0; j < this._currShowDatas.length; j++) {
                    if (this._currShowDatas[j].userData == datasNeedShow[i][1]) {
                        break;
                    }
                }
            } else {
                for (var j: number = 0; j < this._currShowDatas.length; j++) {
                    if (this._currShowDatas[j].userData[this._key] == datasNeedShow[i][1][this._key]) {
                        break;
                    }
                }
            }

            if (j < this._currShowDatas.length) {
                let currShowData = this._currShowDatas[j];
                if (currShowData.index != datasNeedShow[i][0]) {
                    currShowData.index = datasNeedShow[i][0];
                    let targetPos: Vec3 = this.getItemPosByIdx(currShowData.index);
                    Tween.stopAllByTarget(currShowData.n);
                    tween(currShowData.n)
                        .to(0.1, { position: targetPos })
                        .start();

                    // 如果 executeAllCallback 是真，并且 this._func 是有效的，那么就调用 this._func
                    true == executeAllCallback && true == isValid(this._func) && this._func(currShowData.n, currShowData.userData, currShowData.index);
                }
            } else {
                let newData = new ScrollViewProData(datasNeedShow[i][0], datasNeedShow[i][1]);
                newData.n = this._nodePool.pop();
                if (null == newData.n) {
                    dataNeedInstantiate.push([i, newData]);
                } else {
                    newData.n.setPosition(this.getItemPosByIdx(newData.index));
                    this._currShowDatas.splice(i, 0, newData);
                    true == isValid(this._func) && this._func(newData.n, newData.userData, newData.index);
                }
            }
        }

        // 分帧添加
        clearInterval(this._interval);
        this._interval = setInterval(() => {
            if (index >= dataNeedInstantiate.length) {
                clearInterval(this._interval);
                return;
            }

            let newData = dataNeedInstantiate[index][1];
            let pos = dataNeedInstantiate[index][0];
            newData.n = instantiate(this.item);
            this._content.addChild(newData.n);

            newData.n.setPosition(this.getItemPosByIdx(newData.index));
            this._currShowDatas.splice(pos, 0, newData);
            true == isValid(this._func) && this._func(newData.n, newData.userData, newData.index);

            index++;
        });
    }

    /**
     * @description: 获取需要展示的数据
     * @return {Array<[number, any]>}
     */
    private getDatasNeedShow(): Array<[number, any]> {
        if (null == this._content || null == this._layout) {
            return [];
        }

        let contentAnchorX: number = this._content.getComponent(UITransform).anchorX;
        let contentAnchorY: number = this._content.getComponent(UITransform).anchorY;
        let contentPosX: number = this._content.position.x;
        let contentPosY: number = this._content.position.y;
        let contentHeight: number = this._content.getComponent(UITransform).height;
        let contentWidth: number = this._content.getComponent(UITransform).width;

        let thisNodeAnchorY: number = this.node.getComponent(UITransform).anchorY;
        let thisNodeHeight: number = this.node.getComponent(UITransform).height;
        let thisNodeAnchorX: number = this.node.getComponent(UITransform).anchorX;
        let thisNodeWidth: number = this.node.getComponent(UITransform).width;

        let thisItemHeight: number = this.item.getComponent(UITransform).height;
        let thisItemWidth: number = this.item.getComponent(UITransform).width;

        switch (this._layout.type) {
            case Layout.Type.VERTICAL:
                // 垂直布局
                var contentHead: number = contentPosY + (1 - contentAnchorY) * contentHeight - (1 - thisNodeAnchorY) * thisNodeHeight;
                if (contentHead < 0) contentHead = 0;
                var contentTail: number = thisNodeHeight + contentPosY;
                if (contentTail < contentHead) contentTail = contentHead;

                if (contentHeight - this._layout.paddingBottom < contentTail) {
                    contentTail = contentHeight - this._layout.paddingBottom;
                }

                var startIndex = Math.floor((contentHead - this._layout.paddingTop) / (thisItemHeight + this._layout.spacingY));
                if (this._allDatas.length <= startIndex) startIndex = this._allDatas.length - 1;
                if (startIndex < 0) startIndex = 0;

                var endIndex = Math.ceil((contentTail - this._layout.paddingTop) / (thisItemHeight + this._layout.spacingY));
                if (this._allDatas.length <= endIndex) endIndex = this._allDatas.length - 1;
                if (endIndex < startIndex) endIndex = startIndex;
                break;
            case Layout.Type.HORIZONTAL:
                // 水平布局
                var contentHead: number = -(contentPosX - contentAnchorX * contentWidth) + thisNodeAnchorX * thisNodeWidth;
                if (0 > contentHead) contentHead = 0;
                var contendTail: number = thisNodeWidth - contentPosX;
                if (contendTail < contentHead) contendTail = contentHead;
                if (contentWidth - this._layout.paddingRight < contendTail) contendTail = contentWidth - this._layout.paddingRight;

                var startIndex = Math.floor((contentHead - this._layout.paddingLeft) / (thisItemWidth + this._layout.spacingX));
                if (this._allDatas.length <= startIndex) startIndex = this._allDatas.length - 1;
                if (0 > startIndex) startIndex = 0;

                var endIndex = Math.ceil((contendTail - this._layout.paddingLeft) / (thisItemWidth + this._layout.spacingX));
                if (this._allDatas.length <= endIndex) endIndex = this._allDatas.length - 1;
                if (endIndex < startIndex) endIndex = startIndex;
                break;
            default:
                break;
        }

        let datasNeedShow: Array<[number, any]> = [];
        for (let i: number = startIndex; i < Math.min(this._allDatas.length, endIndex + 1); i++) {
            datasNeedShow.push(this._allDatas[i]);
        }
        return datasNeedShow;
    }

    /**
     * @description: 根据节点下标获取节点应该处于什么位置
     * @param {number} index 节点下标
     * @return {Vec3} 节点应该处于的位置
     */
    private getItemPosByIdx(index: number): Vec3 {
        if (this._content == null || this._layout == null) {
            return new Vec3();
        }

        switch (this._layout.type) {
            case Layout.Type.VERTICAL:
                // 垂直布局
                var deltaY = this._layout.paddingTop
                    + (1 - this._content.getComponent(UITransform).anchorY) * this._content.getComponent(UITransform).height
                    + (1 - this.item.getComponent(UITransform).anchorY) * this.item.getComponent(UITransform).height * this.item.scale.y
                    + index * (this.item.getComponent(UITransform).height * this.item.scale.y + this._layout.spacingY);
                return new Vec3(0, -deltaY, 0);
            case Layout.Type.HORIZONTAL:
                // 水平布局
                var deltaX = this._layout.paddingLeft
                    - this._content.getComponent(UITransform).anchorX * this._content.getComponent(UITransform).width
                    + (this.item.getComponent(UITransform).anchorX) * this.item.getComponent(UITransform).width * this.item.scale.x
                    + index * (this.item.getComponent(UITransform).width * this.item.scale.x + this._layout.spacingX);
                return new Vec3(deltaX, 0, 0);
            default:
                return new Vec3();
        }
    }
}

class ScrollViewProData {
    n: Node;
    /**用户数据 */
    userData: any;
    /**节点在数据中的下标，根据index调整节点在content中的位置 */
    index: number;

    constructor(index: number, userData: any) {
        this.index = index;
        this.userData = userData;
    }
}


