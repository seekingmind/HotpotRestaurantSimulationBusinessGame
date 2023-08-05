/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-07-20 21:47:53
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-07-31 23:40:02
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\UI\Panel\Warehouse\WuweiItem.ts
 * @Description: 五味资源组件
 */

import { _decorator, Component, error, EventTouch, Intersection2D, Node, resources, Sprite, SpriteFrame, Vec2, Vec3 } from 'cc';
import { IPlayerWareHouseCellsData, PlayerData } from '../../../Runtime/PlayerData';
import { GAME_EVENTS, WUWEI_TYPE } from '../../../Enums/GameEnums';
import { AudioManager } from '../../../Runtime/AudioManager';
import { synthesisSuccessSound } from '../../../Util/CommonUtil';
import EventManager from '../../../Runtime/EventManager';
const { ccclass, property } = _decorator;

@ccclass('WuweiItem')
export class WuweiItem extends Component {
    public startPos: Vec3 = new Vec3(0, 0, 0);

    // 背景图片的位置
    private _bgLeftUpPos: Vec2 = new Vec2(-285, 350);
    private _bgRightUpPos: Vec2 = new Vec2(285, 350);
    private _bgLeftDownPos: Vec2 = new Vec2(-285, -350);
    private _bgRightDownPos: Vec2 = new Vec2(285, -350);

    // 单个格子的宽高
    private _oneCellWidth: number = 95;
    private _oneCellHeight: number = 87.5;
    // 背景格子图的四个顶点位置
    private _bgPolygonPos: Vec2[] = [this._bgLeftUpPos, this._bgRightUpPos, this._bgRightDownPos, this._bgLeftDownPos];

    // 五味资源所在的单元格位置
    private _wuWeiCellLeftUpPos: Vec2;
    private _wuWeiCellLeftDownPos: Vec2;
    private _wuWeiCellRightUpPos: Vec2;
    private _wuWeiCellRightDownPos: Vec2;
    // 五味资源所在的单元格四个顶点位置
    private _wuWeiPolygonPos: Vec2[];

    // 五味资源，当前所在的玩家数据中心的索引值
    private _cellCurrWuWeiPlayerDataIndex: number = -1;
    // 五味资源，当前的玩家数据中心的数据
    private _cellCurrWuWeiPlayerData: IPlayerWareHouseCellsData = null;

    // 五味资源的精灵图路径
    private _wuweiResSpriteBasePath: string = "ImageAndEffect/UI/WareHousePanel/SynthesisItem";

    start() {
        // 获取当前五味资源的初始位置
        this.startPos = this.node.position.clone();
        this.updateSomePosByStartPos();

        // 给当前生成的资源节点，添加触摸事件
        this.node.on(Node.EventType.TOUCH_START, this.onWuweiItemTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onWuweiItemTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onWuweiItemTouchEnd, this);

        // 根据当前五味资源的位置，设置当前五味资源所在的玩家数据中心的索引值
        this._cellCurrWuWeiPlayerDataIndex = PlayerData.Instance.getPlayerWareHouseCellsData().findIndex((item) => {
            return item.wuWeiItemPosition.x == this.startPos.x && item.wuWeiItemPosition.y == this.startPos.y;
        });
        this._cellCurrWuWeiPlayerData = PlayerData.Instance.getPlayerWareHouseCellsData()[this._cellCurrWuWeiPlayerDataIndex];
    }

    /**
     * @description: 五味资源的触摸开始回调，这里测试一下，触摸开始的时候，让当前的五味资源的透明度变低
     * @param {EventTouch} touchEvent
     * @return {*}
     */
    onWuweiItemTouchStart(touchEvent: EventTouch) {
        let target = touchEvent.target as Node;
        target.setSiblingIndex(100);
    }

    /**
     * @description: 五味资源的触摸移动过程回调
     * @param {EventTouch} touchEvent
     * @return {*}
     */
    onWuweiItemTouchMove(touchEvent: EventTouch) {
        let target = touchEvent.target as Node;
        let delta = touchEvent.getDelta();
        let position = target.position.add(new Vec3(delta.x * 2, delta.y * 2, 0));  // x2 让目标移动的快一点
        target.setPosition(position);
    }

    /**
     * @description: 五味资源的触摸结束回调，这里测试一下，触摸结束的时候，让当前的五味资源的透明度变高
     * @param {EventTouch} touchEvent
     * @return {*}
     */
    onWuweiItemTouchEnd(touchEvent: EventTouch) {
        let target = touchEvent.target as Node;

        let isInsideBg = Intersection2D.pointInPolygon(new Vec2(target.position.x, target.position.y), this._bgPolygonPos);
        if (isInsideBg) {
            let isInsideWuweiCell = Intersection2D.pointInPolygon(new Vec2(target.position.x, target.position.y), this._wuWeiPolygonPos);
            if (isInsideWuweiCell) {
                target.position = this.startPos;
            } else {
                let nearestCellIndex = this.calculateNearestCell(target.position);
                if (nearestCellIndex != -1) {
                    let nearestCellData = PlayerData.Instance.getPlayerWareHouseCellsData()[nearestCellIndex];

                    if (!nearestCellData.hasItem) {
                        let tempCellDataIndex = this._cellCurrWuWeiPlayerDataIndex;
                        let tempCellDataPosition = this._cellCurrWuWeiPlayerData.wuWeiItemPosition;
                        let tempCellData: IPlayerWareHouseCellsData = {
                            hasItem: false,
                            wuWeiItemNodeName: "",
                            wuWeiItemIndex: tempCellDataIndex,
                            wuWeiItemPosition: tempCellDataPosition,
                            wuWeiItemType: WUWEI_TYPE.NONE,
                            wuWeiItemLevel: 1
                        }

                        target.position = new Vec3(nearestCellData.wuWeiItemPosition.x, nearestCellData.wuWeiItemPosition.y, 0);
                        this.startPos = target.position.clone();
                        this.updateSomePosByStartPos();

                        this._cellCurrWuWeiPlayerDataIndex = nearestCellIndex;
                        this._cellCurrWuWeiPlayerData.wuWeiItemIndex = nearestCellIndex;
                        this._cellCurrWuWeiPlayerData.wuWeiItemPosition = nearestCellData.wuWeiItemPosition;

                        PlayerData.Instance.setPlayerWareHouseOneCellData(tempCellData);
                        PlayerData.Instance.setPlayerWareHouseOneCellData(this._cellCurrWuWeiPlayerData);
                    } else {
                        let nearestCellWuweiType = nearestCellData.wuWeiItemType;
                        let nearestCellWuweiLevel = nearestCellData.wuWeiItemLevel;
                        let currCellWuweiType = this._cellCurrWuWeiPlayerData.wuWeiItemType;
                        let currCellWuweiLevel = this._cellCurrWuWeiPlayerData.wuWeiItemLevel;
                        if (nearestCellWuweiType == currCellWuweiType && nearestCellWuweiLevel == currCellWuweiLevel) {
                            let allCellContNodes = this.node.parent.children;
                            let findCellContNodesByName = allCellContNodes.filter((item) => {
                                return item.name == nearestCellData.wuWeiItemNodeName;
                            });
                            let findCellContNodeByPos = findCellContNodesByName.find((item) => {
                                return item.position.x == nearestCellData.wuWeiItemPosition.x
                                    && item.position.y == nearestCellData.wuWeiItemPosition.y;
                            });

                            if (currCellWuweiLevel != 5) {
                                let tempPos = findCellContNodeByPos.position.clone();
                                findCellContNodeByPos.position = this.startPos;
                                target.position = tempPos;
                                this.startPos = target.position.clone();
                                this.updateSomePosByStartPos();
                                findCellContNodeByPos.destroy();
    
                                let resetTargetCellData: IPlayerWareHouseCellsData = {
                                    hasItem: false,
                                    wuWeiItemNodeName: "",
                                    wuWeiItemIndex: this._cellCurrWuWeiPlayerDataIndex,
                                    wuWeiItemPosition: this._cellCurrWuWeiPlayerData.wuWeiItemPosition,
                                    wuWeiItemType: WUWEI_TYPE.NONE,
                                    wuWeiItemLevel: 1
                                }
                                PlayerData.Instance.setPlayerWareHouseOneCellData(resetTargetCellData);
    
                                let resetFindCellData: IPlayerWareHouseCellsData = {
                                    hasItem: true,
                                    wuWeiItemNodeName: "",
                                    wuWeiItemIndex: nearestCellIndex,
                                    wuWeiItemPosition: nearestCellData.wuWeiItemPosition,
                                    wuWeiItemType: this._cellCurrWuWeiPlayerData.wuWeiItemType,
                                    wuWeiItemLevel: this._cellCurrWuWeiPlayerData.wuWeiItemLevel
                                }
                                this.loadFindWuweiItemRes(resetFindCellData);
                            } else {
                                // 五级五味资源合成，最终会生成一个对应类型的研发资源
                                findCellContNodeByPos.destroy();
                                let resetFindCellData: IPlayerWareHouseCellsData = {
                                    hasItem: false,
                                    wuWeiItemNodeName: "",
                                    wuWeiItemIndex: nearestCellIndex,
                                    wuWeiItemPosition: nearestCellData.wuWeiItemPosition,
                                    wuWeiItemType: WUWEI_TYPE.NONE,
                                    wuWeiItemLevel: 1
                                }
                                PlayerData.Instance.setPlayerWareHouseOneCellData(resetFindCellData);

                                let resetCurrTargetCellData: IPlayerWareHouseCellsData = {
                                    hasItem: false,
                                    wuWeiItemNodeName: "",
                                    wuWeiItemIndex: this._cellCurrWuWeiPlayerDataIndex,
                                    wuWeiItemPosition: this._cellCurrWuWeiPlayerData.wuWeiItemPosition,
                                    wuWeiItemType: WUWEI_TYPE.NONE,
                                    wuWeiItemLevel: 1
                                }
                                PlayerData.Instance.setPlayerWareHouseOneCellData(resetCurrTargetCellData);

                                this.genHotpotResData(this._cellCurrWuWeiPlayerData.wuWeiItemType, this.node);
                            }
                        } else {
                            let allCellContNodes = this.node.parent.children;
                            let findCellContNodesByName = allCellContNodes.filter((item) => {
                                return item.name == nearestCellData.wuWeiItemNodeName;
                            });
                            let findCellContNodeByPos = findCellContNodesByName.find((item) => {
                                return item.position.x == nearestCellData.wuWeiItemPosition.x
                                    && item.position.y == nearestCellData.wuWeiItemPosition.y;
                            });
                            let tempPos = findCellContNodeByPos.position.clone();
                            findCellContNodeByPos.position = this.startPos;
                            target.position = tempPos;
                            this.startPos = target.position.clone();
                            this.updateSomePosByStartPos();

                            findCellContNodeByPos.getComponent(WuweiItem).startPos = findCellContNodeByPos.position.clone();
                            this.updateTheOtherSomePosByStartPos(findCellContNodeByPos);

                            this._cellCurrWuWeiPlayerData.wuWeiItemPosition = this.startPos;
                            findCellContNodeByPos.getComponent(WuweiItem)._cellCurrWuWeiPlayerData.wuWeiItemPosition = findCellContNodeByPos.position.clone();

                            let tempIndex = findCellContNodeByPos.getComponent(WuweiItem)._cellCurrWuWeiPlayerData.wuWeiItemIndex;
                            findCellContNodeByPos.getComponent(WuweiItem)._cellCurrWuWeiPlayerData.wuWeiItemIndex = this._cellCurrWuWeiPlayerData.wuWeiItemIndex;
                            this._cellCurrWuWeiPlayerData.wuWeiItemIndex = tempIndex;

                            PlayerData.Instance.setPlayerWareHouseOneCellData(findCellContNodeByPos.getComponent(WuweiItem)._cellCurrWuWeiPlayerData);
                            PlayerData.Instance.setPlayerWareHouseOneCellData(this._cellCurrWuWeiPlayerData);
                        }
                    }
                }
            }
        } else {
            target.position = this.startPos;
        }
    }

    /**
     * @description: 计算当前五味资源，距离哪个单元格最近
     * @param {Vec3} targetPos
     * @return {*}
     */
    calculateNearestCell(targetPos: Vec3) {
        let playerCellsData: IPlayerWareHouseCellsData[] = PlayerData.Instance.getPlayerWareHouseCellsData();
        let targetPosVec2: Vec2 = new Vec2(targetPos.x, targetPos.y);
        let minDistanc = Number.MAX_VALUE;
        let nearestCellIndex = -1;

        for (let i = 0; i < playerCellsData.length; i++) {
            let oneCellData = playerCellsData[i];
            let oneCellPos = new Vec2(oneCellData.wuWeiItemPosition.x, oneCellData.wuWeiItemPosition.y);

            let distance = Math.sqrt(Math.pow((targetPosVec2.x - oneCellPos.x), 2) + Math.pow((targetPosVec2.y - oneCellPos.y), 2));
            if (distance < minDistanc) {
                minDistanc = distance;
                nearestCellIndex = i;
            }
        }

        return nearestCellIndex;
    }

    /**
     * @description: 根据当前五味资源的初始位置，更新一些位置信息
     * @return {*}
     */
    updateSomePosByStartPos() {
        this._wuWeiCellLeftUpPos = new Vec2(this.startPos.x - this._oneCellWidth / 2, this.startPos.y + this._oneCellHeight / 2);
        this._wuWeiCellRightUpPos = new Vec2(this.startPos.x + this._oneCellWidth / 2, this.startPos.y + this._oneCellHeight / 2);
        this._wuWeiCellRightDownPos = new Vec2(this.startPos.x + this._oneCellWidth / 2, this.startPos.y - this._oneCellHeight / 2);
        this._wuWeiCellLeftDownPos = new Vec2(this.startPos.x - this._oneCellWidth / 2, this.startPos.y - this._oneCellHeight / 2);
        this._wuWeiPolygonPos = [this._wuWeiCellLeftUpPos, this._wuWeiCellRightUpPos,
        this._wuWeiCellRightDownPos, this._wuWeiCellLeftDownPos];
    }

    updateTheOtherSomePosByStartPos(theOther: Node) {
        let theOtherWuweiItemComp = theOther.getComponent(WuweiItem);
        let theOtherStartPos = theOtherWuweiItemComp.startPos;
        theOtherWuweiItemComp._wuWeiCellLeftUpPos = new Vec2(theOtherStartPos.x - this._oneCellWidth / 2,
            theOtherStartPos.y + this._oneCellHeight / 2);
        theOtherWuweiItemComp._wuWeiCellRightUpPos = new Vec2(theOtherStartPos.x + this._oneCellWidth / 2,
            theOtherStartPos.y + this._oneCellHeight / 2);
        theOtherWuweiItemComp._wuWeiCellRightDownPos = new Vec2(theOtherStartPos.x + this._oneCellWidth / 2,
            theOtherStartPos.y - this._oneCellHeight / 2);
        theOtherWuweiItemComp._wuWeiCellLeftDownPos = new Vec2(theOtherStartPos.x - this._oneCellWidth / 2,
            theOtherStartPos.y - this._oneCellHeight / 2);
        theOther.getComponent(WuweiItem)._wuWeiPolygonPos = [theOtherWuweiItemComp._wuWeiCellLeftUpPos, theOtherWuweiItemComp._wuWeiCellRightUpPos,
        theOtherWuweiItemComp._wuWeiCellRightDownPos, theOtherWuweiItemComp._wuWeiCellLeftDownPos];
    }

    loadFindWuweiItemRes(newCellData: IPlayerWareHouseCellsData) {
        let wuWeiCellType = newCellData.wuWeiItemType;

        let wuWeiCellLevel = newCellData.wuWeiItemLevel;
        if (wuWeiCellLevel === 5) {
            wuWeiCellLevel = 5;
        } else {
            wuWeiCellLevel += 1;
        }

        let spriteFullPath = this._wuweiResSpriteBasePath + "/" + wuWeiCellType + "/" + wuWeiCellLevel + "/spriteFrame";
        resources.load(spriteFullPath, SpriteFrame, (err, spriteFrame) => {
            if (err) {
                error(err);
                return;
            }

            AudioManager.inst.playOneShot(synthesisSuccessSound);
            this.node.getComponent(Sprite).spriteFrame = spriteFrame;
            this.node.name = "WuweiItem" + "_" + wuWeiCellType + "_LV" + wuWeiCellLevel;

            newCellData.wuWeiItemNodeName =  this.node.name;
            newCellData.wuWeiItemLevel = wuWeiCellLevel;
            PlayerData.Instance.setPlayerWareHouseOneCellData(newCellData);

            this._cellCurrWuWeiPlayerData = newCellData;
            this._cellCurrWuWeiPlayerDataIndex = newCellData.wuWeiItemIndex;
        });
    }

    /**
     * @description: 根据五味资源的类型，生成对应的研发资源
     * @param {WUWEI_TYPE} wuweiType
     * @param {Node} thisNode
     * @return {*}
     */    
    genHotpotResData(wuweiType: WUWEI_TYPE, thisNode: Node) {
        EventManager.Instance.emit(GAME_EVENTS.GEN_HOTPOT_RES, wuweiType, thisNode);
    }
}


