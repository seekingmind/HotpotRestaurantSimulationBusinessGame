/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-08-03 10:25:38
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-08-03 11:37:52
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\Runtime\AnimationManager.ts
 * @Description: 动画管理器
 */
import { Node, Animation } from 'cc';
import Singleton from '../Base/Singleton';

export class AnimationManager extends Singleton {
    static get Instance() {
        return super.GetInstance<AnimationManager>();
    }

    /**
     * @description: 添加动画组件
     * @param {Node} node 节点
     * @return {*}
     */    
    addAnimationComp(node: Node) {
        node.addComponent(Animation);
    }

    /**
     * @description: 播放动画
     * @param {Animation} aniComp 动画组件
     * @param {string} aniStateName 动画状态名
     * @param {boolean} changeSmooth 是否平滑切换动画
     * @return {*}
     */    
    playAnimation(aniComp: Animation, aniStateName?: string, changeSmooth?: boolean) {
        if (changeSmooth === true) {
            if (aniStateName) {
                aniComp.crossFade(aniStateName, 0.1);
            } else {
                aniComp.crossFade(aniComp.defaultClip.name, 0.1);
            }
        } else {
            if (aniStateName) {
                aniComp.play(aniStateName);
            } else {
                aniComp.play(aniComp.defaultClip.name);
            }
        }
    }
}


