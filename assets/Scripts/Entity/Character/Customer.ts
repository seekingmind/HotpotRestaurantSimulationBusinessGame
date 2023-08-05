/*
 * @Author: Zhong Sheng
 * @Date: 2023-04-04 14:31:51
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-07-14 00:40:01
 * @Description: 顾客组件
 */
import { _decorator, Component, sp, Vec3, log, JsonAsset, resources, error, misc } from 'cc';
import GameData from '../../Runtime/GameData';
import EventManager from '../../Runtime/EventManager';
import { CUSTOMER_STATES, EMPLOYEE_PANEL_TYPE, EMPLOYEE_TASK_STATE, EMPLOYEE_TASK_TYPE, GAME_AREA, GAME_EVENTS, HOTPOT_SOUP_TYPE, MENU_FOOD_TYPE, MENU_PANEL_TYPE, SEAT_STATES, WAIT_AREA } from '../../Enums/GameEnums';
import { generateUniqueId } from '../../Util/CommonUtil';
import { CustomerData, ICustomerData } from '../../Runtime/CustomerData';
import { DeskData } from '../../Runtime/DeskData';
import { EmployeeTasks, ITask } from '../../Runtime/EmployeeTasks';
import { EmployeeData } from '../../Runtime/EmployeeData';
import { MenuInfoData } from '../../Runtime/MenuInfoData';
import { PlayerData } from '../../Runtime/PlayerData';
const { ccclass, property } = _decorator;

@ccclass('Customer')
export class Customer extends Component {

    // 顾客在大厅的移动路径数据
    @property(JsonAsset)
    public movePathJsonData: JsonAsset = null;

    // 顾客在店外的移动路径数据
    @property(JsonAsset)
    public outsideMovePathJsonData: JsonAsset = null;

    // 顾客配置信息数据
    public customerInfo: any = null;
    // 顾客运行时数据
    public customerRuntimeData: ICustomerData = null;
    // 桌子运行时数据
    public deskRuntimeData: any = null;
    // 是否是行人
    public isWalkingMan: boolean = null;
    // 是否是等待区域的顾客
    public isWaitingMan: boolean = null;
    // 等待区左边
    public isWaitingLeft: boolean = null;
    // 等待区右边
    public isWaitingRight: boolean = null;

    // 顾客移动速度
    private _speed: number = null;

    // 顾客在大厅的移动路径点数组，key为桌子id，value为路径点数组
    private _movePathHallAll: Map<number, Array<any>> = new Map();
    // 顾客在大厅的移动路径点数组
    private _movePathCurr: any = null;
    // 顾客在店外的移动路径点数组
    private _outsideMovePath: any = null;

    // 顾客在大厅的当前移动路径点索引
    private _currentPathIndex = null;
    // 顾客在店外的当前移动路径点索引
    private _outsideCurrentPathIndex = null;

    // 顾客在大厅移动的当前位置
    private _currentPosition: Vec3 = null;
    // 顾客在店外移动的当前位置
    private _outsideCurrentPosition: Vec3 = null;

    // 顾客在大厅移动的目标位置
    private _targetPosition: Vec3 = null;
    // 顾客在店外移动的目标位置
    private _outsideTargetPosition: Vec3 = null;

    // 顾客在大厅是否移动
    private _isMoving: boolean = null;
    // 顾客在店外是否移动
    private _isOutsideMoving: boolean = null;

    // 顾客在大厅是否正在离开
    private _isLeaving: boolean = null;

    start() {
        this._currentPosition = this.node.position;
        this.initEvents();
    }

    update(dt: number) {
        if (this._outsideMovePath == null || this._movePathHallAll == null) {
            return;
        }

        this.outsideMove(dt);
        this.moveToDesk(dt);
        this.leftFromDesk(dt);
    }

    /**
     * @description: 正常顾客初始化数据
     * @param {any} customerConfig 顾客配置信息
     * @param {ICustomerData} customerRuntimeData 顾客运行时数据
     * @return {*}
     */
    initDataNormal(customerConfig: any, customerRuntimeData: ICustomerData): void {
        let customerId = generateUniqueId();

        // 重新赋值一遍顾客数据的id
        this.customerInfo = customerConfig;
        this.customerRuntimeData = customerRuntimeData;
        this.customerRuntimeData.id = customerId;
        this.customerInfo.id = customerId;

        // 设置顾客的骨骼动画
        let skeletonResUrl = `Skele/Customer/${customerConfig.skeletonResName}`;
        resources.load(skeletonResUrl, sp.SkeletonData, (err, skeleton) => {
            if (err) {
                error(err);
                return;
            }
            this.node.getComponent(sp.Skeleton).skeletonData = skeleton;
            this.node.getComponent(sp.Skeleton).setAnimation(0, "move", true);
        });

        // 根据初始化好的顾客运行时数据中的顾客状态信息，确定顾客是否是行人或者是等待区域的顾客
        if (this.customerRuntimeData.status == CUSTOMER_STATES.OUTSIDE_WALK) {
            this.isWalkingMan = true;

        } else if (this.customerRuntimeData.status == CUSTOMER_STATES.WALK_TO_WAIT_AREA) {
            this.isWaitingMan = true;

        }

        // 设置顾客是从左往右还是从右往左
        if (this.customerRuntimeData.subArea == WAIT_AREA.LEFT) {
            this.isWaitingLeft = true;
        } else {
            this.isWaitingRight = true;
        }

        // 设置顾客移动速度
        this._speed = customerConfig.speed;

        // 设置顾客在大厅的移动路径数据
        this.initHallMovePathAll();

        // 设置顾客在店外的移动路径点数组、当前移动路径点索引、目标移动位置
        if (this.isWalkingMan) {
            // 店外行人，总共有2条路线，随机选择一条路线
            if (this.isWaitingLeft) {
                let randomPathNo = Math.random() < 0.5 ? 1 : 2;
                this.initOutsideMovePath(randomPathNo);
            } else if (this.isWaitingRight) {
                let randomPathNo = Math.random() < 0.5 ? 3 : 4;
                this.initOutsideMovePath(randomPathNo);
            }
        } else if (this.isWaitingMan) {
            // 店外等待区顾客，有4条路线
            let randomPathSubno = Math.floor(Math.random() * 4) + 1;
            if (this.isWaitingLeft) {
                this.initOutsideMovePath(5, randomPathSubno);
            } else {
                this.initOutsideMovePath(6, randomPathSubno);
            }
        }
    }

    /**
     * @description: 初始化店外顾客的视图
     * @return {*}
     */
    initViewOutside(): void {
        if ((this.isWaitingMan && this.isWaitingRight) || (this.isWalkingMan && this.isWaitingRight)) {
            // 是等待区域的顾客，从右往左行走；是行人，从右往左行走  
            // 这两种情况，顾客的初始位置坐标，都不从配置数据中取
            this.node.position = new Vec3(this._outsideMovePath[0].x, this._outsideMovePath[0].y, 0);
        } else {
            this.node.position = new Vec3(this.customerInfo.outsideStartPosition[0], this.customerInfo.outsideStartPosition[1],
                this.customerInfo.outsideStartPosition[2]);
        }
        this._outsideCurrentPosition = this.node.position;
        this._isOutsideMoving = true;
    }

    /**
     * @description: 初始化顾客的行为事件
     * @return {*}
     */
    initEvents(): void {
        // 顾客点餐
        EventManager.Instance.addEvent(GAME_EVENTS.CUSTOMER_ORDER_FOOD, this.orderFood, this);
        // 顾客用餐
        EventManager.Instance.addEvent(GAME_EVENTS.CUSTOMER_EAT_FOOD, this.eatFood, this);
        // 顾客用餐结束离开
        EventManager.Instance.addEvent(GAME_EVENTS.CUSTOMER_LEAVE, this.leave, this);
    }

    /**
     * @description: 初始化大堂顾客的行走路径点
     * @return {*}
     */
    initHallMovePathAll(): void {
        const movePathJson = this.movePathJsonData.json!;
        const movePathJsonData = movePathJson.CustomerMovePath;
        for (let i = 0; i < movePathJsonData.length; i++) {
            const oneMovePath = movePathJsonData[i];
            let deskId = oneMovePath.deskId;
            let pathPoints = oneMovePath.movePoints;
            this._movePathHallAll.set(deskId, pathPoints);
        }
    }

    /**
     * @description: 初始化店外顾客行走路径点
     * @param {number} lineNo 路径编号
     * @param {sublineNo} sublineNo 
     * @return {*}
     */
    initOutsideMovePath(lineNo: number, sublineNo?: number): void {
        const outsideMovePathJson = this.outsideMovePathJsonData.json!;
        const outsidMovePathJsonData = outsideMovePathJson.CustomerOutsideMovePath;
        const outsidePathData = outsidMovePathJsonData.find(oneData => oneData.lineNo === lineNo);
        if (outsidePathData) {
            let pathDirection = outsidePathData.direction;
            if (pathDirection == "leftToRight") {
                // 这是店外行人，路径点从左向右
                this._outsideMovePath = outsidePathData.points;
            } else if (pathDirection == "rightToLeft") {
                // 这是店外行人，路径点从右向左
                this._outsideMovePath = outsidePathData.points;
                this.node.eulerAngles = new Vec3(0, 180, 0);
            } else if (pathDirection == "leftToTheDoor") {
                // 这是店外等待顾客，从左边走向店门口
                let sublinePath = outsidePathData.subLine.find(oneSubLine => oneSubLine.no === sublineNo);
                this._outsideMovePath = sublinePath.points;
            } else if (pathDirection == "rightToTheDoor") {
                // 这是店外等待顾客，从右边走向店门口
                let sublinePath = outsidePathData.subLine.find(oneSubLine => oneSubLine.no === sublineNo);
                this._outsideMovePath = sublinePath.points;
                this.node.eulerAngles = new Vec3(0, 180, 0);
            }

            this._outsideCurrentPathIndex = 0;
            this._outsideTargetPosition = new Vec3(this._outsideMovePath[this._outsideCurrentPathIndex].x,
                this._outsideMovePath[this._outsideCurrentPathIndex].y, 0);
        }
    }

    /**
     * @description: 店外顾客移动
     * @return {*}
     */
    outsideMove(dt): void {
        if (!this._isOutsideMoving) {
            return;
        }

        const distance = Vec3.distance(this._outsideCurrentPosition, this._outsideTargetPosition);
        if (distance < 0.1) {
            this._outsideCurrentPathIndex++;
            if (this._outsideCurrentPathIndex >= this._outsideMovePath.length) {  // 走完了预设的点
                this._isOutsideMoving = false;
                if (this.isWaitingMan) {
                    // 如果是等待的顾客
                    // 1.转换当前顾客状态为等待
                    this.customerRuntimeData.status = CUSTOMER_STATES.IN_WAIT_AREA;
                    // 2.动画切换为idle
                    this.node.getComponent(sp.Skeleton).setAnimation(0, "idle", true);
                    // 3.等待顾客移动到等待区目标位置的数量加1
                    GameData.CustomerInWaitPositionCount++;
                } else {
                    // 如果是店外行走的顾客
                    // 1.删除当前顾客相关的数据
                    CustomerData.Instance.deleteCustomerRuntimeData(this.customerRuntimeData.id);
                    // 2.销毁当前顾客节点
                    this.node.removeFromParent();
                }
                return;
            }

            this._outsideCurrentPosition.set(this.node.position);
            this._outsideTargetPosition.set(new Vec3(this._outsideMovePath[this._outsideCurrentPathIndex].x,
                this._outsideMovePath[this._outsideCurrentPathIndex].y, 0));
        } else {
            const ratio = Math.min(1, this._speed * dt / distance);
            this._outsideCurrentPosition.lerp(this._outsideTargetPosition, ratio);
            this.node.position = this._outsideCurrentPosition;
        }
    }

    /**
     * @description: 顾客分配到指定桌子的移动
     * @param {any} deskInfo
     * @return {*}
     */
    moveOn(deskInfo: any): any {
        this.deskRuntimeData = deskInfo;
        log("顾客移动到桌子：", deskInfo);

        let deskId = deskInfo.id;
        let deskMovePathData = this._movePathHallAll.get(deskId);
        if (deskMovePathData) {
            let seatsInfo = this.deskRuntimeData.seatsInfo;
            let findSeat = seatsInfo.find(oneSeat => oneSeat.customerId === this.customerInfo.id);
            if (findSeat == null) {
                this.setUpSeatInfo();
                findSeat = seatsInfo.find(oneSeat => oneSeat.customerId === this.customerInfo.id);
            }

            this._movePathCurr = deskMovePathData.find(onePath => onePath.seatId === findSeat.seatId).points;
            this._currentPathIndex = 0;
            this._currentPosition = new Vec3(this._movePathCurr[this._currentPathIndex].x,
                this._movePathCurr[this._currentPathIndex].y, 0);
            this.node.position = this._currentPosition;
            this._targetPosition = new Vec3(this._movePathCurr[this._currentPathIndex].x, this._movePathCurr[this._currentPathIndex].y, 0);
        }

        // 数据更新
        this.customerRuntimeData.status = CUSTOMER_STATES.WALK_TO_DESK;
        this.customerRuntimeData.currentArea = GAME_AREA.HALL;
        CustomerData.Instance.updateCustomerData(this.customerRuntimeData);
        DeskData.Instance.updateDeskDataById(this.deskRuntimeData.id, this.deskRuntimeData);

        this._isMoving = true;
        this.node.getComponent(sp.Skeleton).setAnimation(0, "move", true);
    }

    setUpSeatInfo() {
        // 获取座位的信息
        // 座位编号：1，2，3，4；对应位置按照顺时针方向：top，right，bottom，left
        let seatsInfo = GameData.SeatsInfo.get(this.deskRuntimeData.id);

        for (let i = 0; i < seatsInfo.length; i++) {
            let seat = seatsInfo[i];
            if (seat.seatStatus != SEAT_STATES.EMPTY) {
                continue;
            } else {
                seat.seatStatus = SEAT_STATES.OCCUPIED;  // 修改座位状态为已占用
                seat.customerId = this.customerInfo.id;   // 设置座位上的顾客id
                break;
            }
        }
    }

    /**
     * @description: 顾客走向桌子的移动过程
     * @param {*} dt
     * @return {*}
     */
    moveToDesk(dt) {
        if (!this._isMoving) {
            return;
        }

        const distance = Vec3.distance(this._currentPosition, this._targetPosition);
        this.changeOrientation(this._currentPosition, this._targetPosition);

        if (distance < 0.1) {  // 到达了一个路径点
            this._currentPathIndex++;

            // 顾客朝向修正
            let seatsInfo = this.deskRuntimeData.seatsInfo;
            let findSeatInfo = seatsInfo.find(oneSeat => oneSeat.customerId == this.customerRuntimeData.id);
            if (this._currentPathIndex >= this._movePathCurr.length) {
                this._isMoving = false;

                // 已经走完了预设的路径点，更换顾客动画，存储一遍数据
                if (findSeatInfo.seatId == 1) {
                    this.node.getComponent(sp.Skeleton).setAnimation(0, "sitDown_F", true);
                } else if (findSeatInfo.seatId == 2) {
                    this.node.eulerAngles = new Vec3(0, 180, 0);
                    this.node.getComponent(sp.Skeleton).setAnimation(0, "sitDown_LR", true);
                } else if (findSeatInfo.seatId == 3) {
                    this.node.eulerAngles = new Vec3(0, 0, 0);
                    this.node.getComponent(sp.Skeleton).setAnimation(0, "sitDown_B", true);
                } else if (findSeatInfo.seatId == 4) {
                    this.node.getComponent(sp.Skeleton).setAnimation(0, "sitDown_LR", true);
                }

                GameData.CustomerInDeskCountMap.set(this.deskRuntimeData.id,
                    GameData.CustomerInDeskCountMap.get(this.deskRuntimeData.id) + 1);

                GameData.CustomerInWaitPositionCount--;

                this.beforeOrderFood();

                return;
            }
            this._currentPosition.set(this.node.position);
            this._targetPosition.set(new Vec3(this._movePathCurr[this._currentPathIndex].x,
                this._movePathCurr[this._currentPathIndex].y, 0));
        } else {
            const ratio = Math.min(1, this._speed * dt / distance);
            this._currentPosition.lerp(this._targetPosition, ratio);
            this.node.position = this._currentPosition;
        }
    }

    /**
     * @description: 顾客离开桌子的移动过程
     * @param {*} dt
     * @return {*}
     */
    leftFromDesk(dt) {
        if (!this._isLeaving) {
            return;
        }

        const distance = Vec3.distance(this._currentPosition, this._targetPosition);
        this.changeOrientation(this._currentPosition, this._targetPosition);

        if (distance < 0.1) {
            this._currentPathIndex--;
            if (this._currentPathIndex < 0) {
                this._isLeaving = false;
                this.node.destroy();
                return;
            }
            this._currentPosition.set(this.node.position);
            this._targetPosition.set(new Vec3(this._movePathCurr[this._currentPathIndex].x,
                this._movePathCurr[this._currentPathIndex].y, 0));
        } else {
            const ratio = Math.min(1, this._speed * dt / distance);
            this._currentPosition.lerp(this._targetPosition, ratio);
            this.node.position = this._currentPosition;
        }
    }

    /**
     * @description: 顾客点菜前的一些准备工作
     * @return {*}
     */
    beforeOrderFood() {
        // 更新顾客状态为在座位上
        this.customerRuntimeData.status = CUSTOMER_STATES.ON_THE_SEAT;
        CustomerData.Instance.updateCustomerData(this.customerRuntimeData);

        if (GameData.CustomerInDeskCountMap.get(this.deskRuntimeData.id) ==
            GameData.CustomerInMovingCountMap.get(this.deskRuntimeData.id)) {
            let epTask: ITask = {
                id: generateUniqueId(),
                taskType: EMPLOYEE_TASK_TYPE.ORDER_FOOD,
                status: EMPLOYEE_TASK_STATE.WAITING,
                epType: EMPLOYEE_PANEL_TYPE.WAITER,
                taskTargetDeskData: this.deskRuntimeData,
                createdAt: new Date(),
                updatedAt: new Date()
            }
            EmployeeTasks.Instance.createTask(epTask);

            EventManager.Instance.emit(GAME_EVENTS.ORDER_FOOD_UI_SHOW, this.deskRuntimeData);
            
            if (EmployeeData.Instance.getOneTypeEmployeeData(EMPLOYEE_PANEL_TYPE.WAITER).length != 0) {
                // 通知服务员要开始检查是否空闲了
                EventManager.Instance.emit(GAME_EVENTS.CHECK_WAITER_IDLE);
            }
        }
    }

    /**
     * @description: 顾客正式开始点餐
     * @return {*}
     */
    orderFood(deskRuntimeData: any) {
        if (this.deskRuntimeData == null) {
            return;
        }
        if (this.deskRuntimeData.id == deskRuntimeData.id) {
            let randomWait = Math.random() * (3 - 1 + 1) + 1; // 随机等待1-3秒
            this.scheduleOnce(() => {
                log("顾客：" + this.customerInfo.id + "，在桌子编号：" + this.deskRuntimeData.id + "，正式开始点餐！");

                let customerOrderedFoodArr = GameData.CustomerOrderFood.get(deskRuntimeData.id);
                if (customerOrderedFoodArr.length === 0) {
                    // 先点一个火锅汤底
                    let hotpotMenuItems = MenuInfoData.Instance.getMenuDataByMenuType(MENU_PANEL_TYPE.HOTPOT_SOUP).MenuItems;
                    
                    let customerOrderHotpotSoup = hotpotMenuItems[Math.floor(Math.random() * hotpotMenuItems.length)];
                    customerOrderedFoodArr.push(customerOrderHotpotSoup);
                    EventManager.Instance.emit(GAME_EVENTS.SHOW_CUSTOMER_TALK_POP, customerOrderHotpotSoup.ItemName, this.node);

                    // 增加对应的销量数据
                    PlayerData.Instance.addPlayerMenuItemSaleCount(MENU_PANEL_TYPE.HOTPOT_SOUP, customerOrderHotpotSoup.MenuSubType, 
                        customerOrderHotpotSoup.ItemId);
                } else {
                    // 点非汤底的菜品
                    // 随机一种MENU_PANEL_TYPE，不要是 HOTPOT_SOUP 类型
                    let randomMenuType = MenuInfoData.Instance.getRandomMenuType();
                    let notHotpotSoupMenuItems = MenuInfoData.Instance.getMenuDataByMenuType(randomMenuType).MenuItems;

                    let customerOrderFood = notHotpotSoupMenuItems[Math.floor(Math.random() * notHotpotSoupMenuItems.length)];
                    customerOrderedFoodArr.push(customerOrderFood);
                    EventManager.Instance.emit(GAME_EVENTS.SHOW_CUSTOMER_TALK_POP, customerOrderFood.ItemName, this.node);
                    
                    // 增加对应的销量数据
                    PlayerData.Instance.addPlayerMenuItemSaleCount(randomMenuType, customerOrderFood.MenuSubType, customerOrderFood.ItemId);
                }

                GameData.CustomerFinishOrderFoodCount.set(this.deskRuntimeData.id,
                    GameData.CustomerFinishOrderFoodCount.get(this.deskRuntimeData.id) + 1);

                this.customerRuntimeData.status = CUSTOMER_STATES.WAITING_FOR_FOOD;
                CustomerData.Instance.updateCustomerData(this.customerRuntimeData);

                this.node.getComponent(Customer).customerInfo.hallStartPosition[0] = this.node.position.x;
                this.node.getComponent(Customer).customerInfo.hallStartPosition[1] = this.node.position.y;

                // 通知系统检查一下是否该桌子的所有顾客都已经点完菜了
                EventManager.Instance.emit(GAME_EVENTS.CHECK_CUSTOMER_ORDER_FOOD, deskRuntimeData);
            }, randomWait);
        }
    }

    /**
     * @description: 顾客用餐
     * @return {*}
     */
    eatFood(deskRuntimeData) {
        // 不同位置的顾客，用餐动画不一样，首先获取当前桌子的座位信息
        if (this.deskRuntimeData == null) {
            log("顾客还在等待区，无法用餐");
            return;
        }

        if (this.deskRuntimeData.id == deskRuntimeData.id) {
            let seatsInfo = deskRuntimeData.seatsInfo;
            for (let i = 0; i < seatsInfo.length; i++) {
                const seatInfo = seatsInfo[i];
                let seatId = seatInfo.seatId;
                let customerId = seatInfo.customerId;
                if (customerId == this.customerRuntimeData.id) {
                    // 顾客状态更改为正在用餐
                    this.customerRuntimeData.status = CUSTOMER_STATES.EATING;
                    CustomerData.Instance.updateCustomerData(this.customerRuntimeData);

                    // 座位编号：1，2，3，4；对应位置按照顺时针方向：top，right，bottom，left
                    if (seatId == 1) {
                        this.changeAnimation("eat_F_01", "sitDown_F");
                    } else if (seatId == 2) {
                        this.changeAnimation("eat_LR_01", "sitDown_LR");
                    } else if (seatId == 3) {
                        this.changeAnimation("eat_B_01", "sitDown_B");
                    } else if (seatId == 4) {
                        this.changeAnimation("eat_LR_01", "sitDown_LR");
                    }
                }
            }
        }
    }

    /**
     * @description: 顾客用餐和用餐结束的动画切换
     * @param {*} aniOne
     * @param {*} aniTwo
     * @return {*}
     */
    changeAnimation(aniOne, aniTwo) {
        this.node.getComponent(sp.Skeleton).setAnimation(0, aniOne, true);

        this.scheduleOnce(() => {
            log("顾客：" + this.customerInfo.id + "，在桌子编号：" + this.deskRuntimeData.id + "，用餐结束！");
            this.node.getComponent(sp.Skeleton).setAnimation(0, aniTwo, true);

            // 修改顾客状态为在结账
            this.customerRuntimeData.status = CUSTOMER_STATES.CHECKOUT;
            CustomerData.Instance.updateCustomerData(this.customerRuntimeData);

            // 通知大厅展示出结账按钮
            EventManager.Instance.emit(GAME_EVENTS.CUSTOMER_CHECKOUT, this.deskRuntimeData);
        }, 10);
    }

    /**
     * @description: 顾客离开
     * @param {any} deskInfo
     * @param {any} doorPosition
     * @return {*}
     */
    leave(deskInfo: any) {
        if (this.deskRuntimeData == null) {
            log("顾客还在等待区，无法离开");
            return;
        }
        if (this.deskRuntimeData.id == deskInfo.id) {
            this.node.getComponent(sp.Skeleton).setAnimation(0, "move", true);
            this._isLeaving = true;
            CustomerData.Instance.deleteCustomerRuntimeData(this.customerRuntimeData.id);
        }
    }

    /**
     * @description: 人物朝向判断，初始朝向右边
     * @param {Vec3} currentPos 当前位置
     * @param {Vec3} targetPos 目标位置
     * @return {*}
     */
    changeOrientation(currentPos: Vec3, targetPos: Vec3) {
        let useTargetPos = targetPos.clone();
        let customerDir = useTargetPos.subtract3f(currentPos.x, currentPos.y, currentPos.z).normalize();
        let angle = Math.atan2(customerDir.y, customerDir.x);
        let degress = misc.radiansToDegrees(angle);
        if (Math.abs(degress) < 90) {
            // 朝右边
            this.node.eulerAngles = new Vec3(0, 0, 0);
        } else {
            // 朝左边
            this.node.eulerAngles = new Vec3(0, 180, 0);
        }
    }

    /**
     * @description: 检查等待区的某个位置是否有顾客
     * @return {*}
     */
    isPositionOccipied(pathNo: number, subPathNo: number) {
        const outsideMovePathJson = this.outsideMovePathJsonData.json!;
        const outsidMovePathJsonData = outsideMovePathJson.CustomerOutsideMovePath;
        const waitPath = outsidMovePathJsonData.find(oneData => oneData.lineNo === pathNo);
        const sublinePath = waitPath.subLine.find(oneSubline => oneSubline.no === subPathNo);
        const sublineEndPoint = sublinePath.points[sublinePath.points.length - 1];

        let customerWaitFind = GameData.CustomerInWaitArr.find(oneCustomer => (oneCustomer.position.x === sublineEndPoint.x)
            && (oneCustomer.position.y === sublineEndPoint.y));

        if (customerWaitFind) {
            return true;
        }

        return false;
    }
}


