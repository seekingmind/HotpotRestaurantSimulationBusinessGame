/*
 * @Author: Zhong Sheng
 * @Date: 2023-05-10 03:23:25
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-06-17 01:16:34
 * @Description: 场景滑动
 */

import { _decorator, Canvas, Component, EventTouch, log, Node, NodeEventType, tween, UITransform, Vec3, Vec2, misc } from 'cc';
import { PlayerData } from '../Runtime/PlayerData';
import { GAME_AREA, GAME_EVENTS } from '../Enums/GameEnums';
import EventManager from '../Runtime/EventManager';
const { ccclass, property } = _decorator;

@ccclass('BgUtil')
export class BgUtil extends Component {
    // 开始触摸位置
    private _startTouchPos: Vec2 = null!;

    private _canvasSizeW: number = 0;

    private _canvasSizeH: number = 0;

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);

        EventManager.Instance.addEvent(GAME_EVENTS.AREA_CHANGE, this.onChangeArea, this);
    }

    start() {
        this._canvasSizeW = this.node.getComponent(UITransform).width;
        // this._canvasSizeH = this.node.getComponent(UITransform).height;
        this._canvasSizeH = 1350;

        // 根据玩家数据中玩家所在区域，设置场景的位置
        let playerCurrentArea = PlayerData.Instance.getPlayerArea();
        switch (playerCurrentArea) {
            case GAME_AREA.HALL:
                this.node.getChildByName("UIRoot").getChildByName("GameScene").active = true;
                this.node.getChildByName("AllArea").setPosition(0, 213, 0);
                break;
            case GAME_AREA.KITCHEN:
                this.node.getChildByName("UIRoot").getChildByName("GameScene").active = false;
                this.node.getChildByName("AllArea").setPosition(this._canvasSizeW, 213, 0);
                this.node.getChildByName("UIRoot").getChildByName("GameScene").setPosition(this._canvasSizeW, 0, 0);
                break;
            case GAME_AREA.WAIT_AREA:
                this.node.getChildByName("UIRoot").getChildByName("GameScene").active = false;
                this.node.getChildByName("AllArea").setPosition(0, -this._canvasSizeH, 0);
                break;
            case GAME_AREA.PRIVATE_ROOM:
                this.node.getChildByName("UIRoot").getChildByName("GameScene").active = false;
                this.node.getChildByName("AllArea").setPosition(-this._canvasSizeW, 213, 0);
        }
    }

    /**
     * @description: 玩家所在区域改变的事件回调
     * @param {GAME_AREA} area
     * @return {*}
     */
    onChangeArea(area: GAME_AREA) {
        // 在进行区域切换前，需要判断玩家当前所在区域是哪里
        let playerCurrentArea = PlayerData.Instance.getPlayerArea();
        switch (playerCurrentArea) {
            case GAME_AREA.HALL:
                if (area == GAME_AREA.HALL) {
                    // 不用切换
                    return;
                } else if (area == GAME_AREA.KITCHEN) {
                    // 从大厅切换到厨房
                    PlayerData.Instance.setPlayerArea(GAME_AREA.KITCHEN);
                    this.node.getChildByName("AllArea").setPosition(this._canvasSizeW, 213, 0);
                    this.node.getChildByName("UIRoot").getChildByName("GameScene").setPosition(this._canvasSizeW, 0, 0);
                } else if (area == GAME_AREA.PRIVATE_ROOM) {
                    // 从大厅切换到包间
                    PlayerData.Instance.setPlayerArea(GAME_AREA.PRIVATE_ROOM);
                    this.node.getChildByName("AllArea").setPosition(-this._canvasSizeW, 213, 0);
                    this.node.getChildByName("UIRoot").getChildByName("GameScene").active = false;
                } else if (area == GAME_AREA.WAIT_AREA) {
                    // 从大厅切换到等待区
                    PlayerData.Instance.setPlayerArea(GAME_AREA.WAIT_AREA);
                    this.node.getChildByName("AllArea").setPosition(0, -this._canvasSizeH, 0);
                    this.node.getChildByName("UIRoot").getChildByName("GameScene").active = false;
                }
                break;
            case GAME_AREA.KITCHEN:
                if (area == GAME_AREA.HALL) {
                    // 从厨房切换到大厅
                    PlayerData.Instance.setPlayerArea(GAME_AREA.HALL);
                    this.node.getChildByName("AllArea").setPosition(0, 213, 0);
                    this.node.getChildByName("UIRoot").getChildByName("GameScene").setPosition(0, 0, 0);
                    this.node.getChildByName("UIRoot").getChildByName("GameScene").active = true;
                } else if (area == GAME_AREA.KITCHEN) {
                    // 不用切换
                    return;
                } else if (area == GAME_AREA.PRIVATE_ROOM) {
                    // 从厨房切换到包间
                    PlayerData.Instance.setPlayerArea(GAME_AREA.PRIVATE_ROOM);
                    this.node.getChildByName("AllArea").setPosition(-this._canvasSizeW, 213, 0);
                    this.node.getChildByName("UIRoot").getChildByName("GameScene").active = false;
                } else if (area == GAME_AREA.WAIT_AREA) {
                    // 从厨房切换到等待区
                    PlayerData.Instance.setPlayerArea(GAME_AREA.WAIT_AREA);
                    this.node.getChildByName("AllArea").setPosition(0, -this._canvasSizeH, 0);
                    this.node.getChildByName("UIRoot").getChildByName("GameScene").active = false;
                }
                break;
            case GAME_AREA.PRIVATE_ROOM:
                if (area == GAME_AREA.HALL) {
                    // 从包间切换到大厅
                    PlayerData.Instance.setPlayerArea(GAME_AREA.HALL);
                    this.node.getChildByName("AllArea").setPosition(0, 213, 0);
                    this.node.getChildByName("UIRoot").getChildByName("GameScene").setPosition(0, 0, 0);
                    this.node.getChildByName("UIRoot").getChildByName("GameScene").active = true;
                } else if (area == GAME_AREA.KITCHEN) {
                    // 从包间切换到厨房
                    PlayerData.Instance.setPlayerArea(GAME_AREA.KITCHEN);
                    this.node.getChildByName("AllArea").setPosition(this._canvasSizeW, 213, 0);
                    this.node.getChildByName("UIRoot").getChildByName("GameScene").setPosition(this._canvasSizeW, 0, 0);
                } else if (area == GAME_AREA.PRIVATE_ROOM) {
                    // 不用切换
                    return;
                } else if (area == GAME_AREA.WAIT_AREA) {
                    // 从包间切换到等待区
                    PlayerData.Instance.setPlayerArea(GAME_AREA.WAIT_AREA);
                    this.node.getChildByName("AllArea").setPosition(0, -this._canvasSizeH, 0);
                    this.node.getChildByName("UIRoot").getChildByName("GameScene").active = false;
                }
                break;
            case GAME_AREA.WAIT_AREA:
                if (area == GAME_AREA.HALL) {
                    // 从等待区切换到大厅
                    PlayerData.Instance.setPlayerArea(GAME_AREA.HALL);
                    this.node.getChildByName("AllArea").setPosition(0, 213, 0);
                    this.node.getChildByName("UIRoot").getChildByName("GameScene").setPosition(0, 0, 0);
                    this.node.getChildByName("UIRoot").getChildByName("GameScene").active = true;
                } else if (area == GAME_AREA.KITCHEN) {
                    // 从等待区切换到厨房
                    PlayerData.Instance.setPlayerArea(GAME_AREA.KITCHEN);
                    this.node.getChildByName("AllArea").setPosition(this._canvasSizeW, 213, 0);
                    this.node.getChildByName("UIRoot").getChildByName("GameScene").setPosition(this._canvasSizeW, 0, 0);
                } else if (area == GAME_AREA.PRIVATE_ROOM) {
                    // 从等待区切换到包间
                    PlayerData.Instance.setPlayerArea(GAME_AREA.PRIVATE_ROOM);
                    this.node.getChildByName("AllArea").setPosition(-this._canvasSizeW, 213, 0);
                    this.node.getChildByName("UIRoot").getChildByName("GameScene").active = false;
                } else if (area == GAME_AREA.WAIT_AREA) {
                    // 不用切换
                    return;
                }
                break;
        }
    }

    onTouchStart(event: EventTouch) {
        this._startTouchPos = event.getLocation();
    }

    onTouchEnd(event: EventTouch) {
        if (this._startTouchPos === null) {
            return;
        }

        let distance = Math.abs(event.getLocationX() - this._startTouchPos.x);
        let verticalDistance = Math.abs(event.getLocationY() - this._startTouchPos.y);
        if (distance < 10 && verticalDistance < 10) {
            return;
        }

        if (verticalDistance > distance) { // 这是上下滑动
            if (this._startTouchPos.y > event.getLocationY()) {
                // 向上滑动
                if (distance > 10) {
                    switch (PlayerData.Instance.getPlayerArea()) {
                        case GAME_AREA.HALL:
                            // 玩家在大厅，向上滑动，进入等待区
                            PlayerData.Instance.setPlayerArea(GAME_AREA.WAIT_AREA);
                            this.node.getChildByName("UIRoot").getChildByName("GameScene").active = false;
                            this.node.getChildByName("AllArea").setPosition(0, -this._canvasSizeH, 0);
                            break;
                        case GAME_AREA.KITCHEN:
                        case GAME_AREA.WAIT_AREA:
                        case GAME_AREA.PRIVATE_ROOM:
                            // 玩家在厨房或等待区或包间，向上滑动，区域不移动
                            break;
                    }
                }
            } else if (this._startTouchPos.y < event.getLocationY()) {
                // 向下滑动
                if (distance > 10) {
                    switch (PlayerData.Instance.getPlayerArea()) {
                        case GAME_AREA.HALL:
                        case GAME_AREA.KITCHEN:
                        case GAME_AREA.PRIVATE_ROOM:
                            // 玩家在大厅或厨房或包间，向下滑动，区域不移动
                            break;
                        case GAME_AREA.WAIT_AREA:
                            // 玩家在等待区，向下滑动，进入大厅
                            PlayerData.Instance.setPlayerArea(GAME_AREA.HALL);
                            this.node.getChildByName("AllArea").setPosition(0, 213, 0);
                            this.node.getChildByName("UIRoot").getChildByName("GameScene").active = true;
                            break;
                    }
                }
            }
        } else { // 这是左右滑动
            if (this._startTouchPos.x < event.getLocationX()) {
                // 向左滑动
                if (distance > 10) {
                    switch (PlayerData.Instance.getPlayerArea()) {
                        case GAME_AREA.HALL:
                            // 玩家在大厅，向左滑动，进入厨房
                            PlayerData.Instance.setPlayerArea(GAME_AREA.KITCHEN);
                            this.node.getChildByName("AllArea").setPosition(this._canvasSizeW, 213, 0);
                            this.node.getChildByName("UIRoot").getChildByName("GameScene").setPosition(this._canvasSizeW, 0, 0);
                            break;
                        case GAME_AREA.KITCHEN:
                        case GAME_AREA.WAIT_AREA:
                            // 玩家在厨房和等待区，向左滑动，区域不移动
                            break;
                        case GAME_AREA.PRIVATE_ROOM:
                            // 玩家在包间，向左滑动，进入大厅
                            PlayerData.Instance.setPlayerArea(GAME_AREA.HALL);
                            this.node.getChildByName("AllArea").setPosition(0, 213, 0);
                            this.node.getChildByName("UIRoot").getChildByName("GameScene").active = true;
                            break;
                    }
                }
            } else if (this._startTouchPos.x > event.getLocationX()) {
                // 向右滑动
                if (distance > 10) {
                    switch (PlayerData.Instance.getPlayerArea()) {
                        case GAME_AREA.HALL:
                            // 玩家在大厅，向右滑动，进入包间
                            PlayerData.Instance.setPlayerArea(GAME_AREA.PRIVATE_ROOM);
                            this.node.getChildByName("AllArea").setPosition(-this._canvasSizeW, 213, 0);
                            this.node.getChildByName("UIRoot").getChildByName("GameScene").active = false;
                            break;
                        case GAME_AREA.KITCHEN:
                            // 玩家在厨房，向右滑动，进入大厅
                            PlayerData.Instance.setPlayerArea(GAME_AREA.HALL);
                            this.node.getChildByName("AllArea").setPosition(0, 213, 0);
                            this.node.getChildByName("UIRoot").getChildByName("GameScene").setPosition(0, 0, 0);
                            break;
                        case GAME_AREA.WAIT_AREA:
                        case GAME_AREA.PRIVATE_ROOM:
                            // 玩家在等待区或包间，向右滑动，区域不移动
                            break;
                    }
                }
            }
        }
    }
}


