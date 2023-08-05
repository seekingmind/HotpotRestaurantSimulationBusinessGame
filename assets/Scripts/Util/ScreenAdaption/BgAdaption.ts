/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-06-16 00:02:19
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-06-16 22:23:58
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\Util\ScreenAdaption\BgAdaption.ts
 * @Description: 背景节点屏幕适配组件
 */

import { _decorator, Component, director, log, Node, UITransform, Vec3, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BgAdaption')
export class BgAdaption extends Component {
    onLoad() {
        // 1. 先找到 SHOW_ALL 模式适配之后，本节点的实际宽高以及初始缩放值
        // A1: 画布分辨率宽 / 设计分辨率宽
        let canvasSizeW = view.getCanvasSize().width / 2;
        let designSizeW = view.getDesignResolutionSize().width;
        log("canvasSizeW：", canvasSizeW, "designSizeW：", designSizeW);
        let a1 = canvasSizeW / designSizeW;
        // A2: 画布分辨率高 / 设计分辨率高
        let canvasSizeH = view.getCanvasSize().height / 2;
        let designSizeH = view.getDesignResolutionSize().height;
        log("canvasSizeH：", canvasSizeH, "designSizeH：", designSizeH);
        let a2 = canvasSizeH / designSizeH;
        // 取 A1 和 A2 中的最小值
        let minA1A2 = Math.min(a1, a2);
        log("minA1A2：", minA1A2);

        // 设计稿在画布上的宽度
        let realWidth = view.getDesignResolutionSize().width * minA1A2;
        // 设计稿在画布上的高度
        let realHeight = view.getDesignResolutionSize().height * minA1A2;
        log("realWidth：", realWidth, "realHeight：", realHeight);

        // 2. 基于第一步的数据，再做节点宽高重置
        // 节点的设计宽高
        let nodeW = this.node.getComponent(UITransform).width;
        let nodeH = this.node.getComponent(UITransform).height;
        log("nodeW：", nodeW, "nodeH：", nodeH);
        // B1: 画布分辨率宽 / 设计稿在画布上的宽度
        let b1 = canvasSizeW / realWidth;
        // B2: 画布分辨率高 / 设计稿在画布上的高度
        let b2 = canvasSizeH / realHeight;
        log("b1：", b1, "b2：", b2);

        // 节点的宽和高
        let nodeRealW = nodeW * b1;
        let nodeRealH = nodeH * b2;
        log("nodeRealW：", nodeRealW, "nodeRealH：", nodeRealH);
        this.node.getComponent(UITransform).width = nodeRealW;
        this.node.getComponent(UITransform).height = nodeRealH;
    }
}


