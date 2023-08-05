/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-05-31 01:34:32
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-06-09 00:28:28
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\OutsideMain.ts
 * @Description: 店外区域
 */
import { _decorator, Component, instantiate, JsonAsset, log, Prefab, Vec3 } from 'cc';
import { Customer } from './Entity/Character/Customer';
import { CUSTOMER_STATES, DESK_STATES, GAME_AREA, GAME_EVENTS, WAIT_AREA } from './Enums/GameEnums';
import GameData from './Runtime/GameData';
import { CustomerData, ICustomerData } from './Runtime/CustomerData';
import { Desk } from './Entity/Item/Desk';
import { DeskData } from './Runtime/DeskData';
import EventManager from './Runtime/EventManager';
const { ccclass, property } = _decorator;

@ccclass('OutsideMain')
export class OutsideMain extends Component {
    @property(Prefab)
    public customerPrefab: Prefab = null;

    @property(JsonAsset)
    public customerDataAsset: JsonAsset = null;

    @property(JsonAsset)
    public outsideMovePath: JsonAsset = null;

    private _customerConfig: any = null;
    private _outsideMovePath: any = null;

    private _delay: number = 10000;

    start() {
        this.initData();
        this.initView();
        this.initEvents();
    }

    update(deltaTime: number) {
        this.correctHierarchy();
    }

    initData() {
        this._customerConfig = this.customerDataAsset.json.CustomerData;

        // 初始化等待区位置坐标
        this._outsideMovePath = this.outsideMovePath.json.CustomerOutsideMovePath;
        let leftWaitMovePath = this._outsideMovePath.find(onePath => onePath.direction === "leftToTheDoor");
        let rightWaitMovePath = this._outsideMovePath.find(onePath => onePath.direction === "rightToTheDoor");
        let leftSubWaitMovePath = leftWaitMovePath.subLine;
        let rightSubWaitMovePath = rightWaitMovePath.subLine;
        for (let i = 0; i < leftSubWaitMovePath.length; i++) {
            const oneSubline = leftSubWaitMovePath[i];
            let lastPoint = oneSubline.points[oneSubline.points.length - 1];
            GameData.WaitPositions.push(new Vec3(lastPoint.x, lastPoint.y, 0));
        }
        for (let i = 0; i < rightSubWaitMovePath.length; i++) {
            const oneSubline = rightSubWaitMovePath[i];
            let lastPoint = oneSubline.points[oneSubline.points.length - 1];
            GameData.WaitPositions.push(new Vec3(lastPoint.x, lastPoint.y, 0));
        }
    }

    initView() {
        this.addCustomerWithDelay(this._delay);
    }

    initEvents() {
        // 顾客从等待区域走向大厅指定的空闲桌子
        EventManager.Instance.addEvent(GAME_EVENTS.CUSTOMER_WALK_TO_HALL_DESK, this.deliverCustomersToDesk, this);
    }

    /**
     * @description: 添加顾客，每间隔delay时间添加count个顾客
     * @param {number} delay 间隔时间
     * @return {*}
     */
    addCustomerWithDelay(delay: number) {
        setInterval(() => {
            this.genCustomers(false);
            this.genCustomers(true);
        }, delay);
    }

    /**
     * @description: 生成顾客
     * @return {*}
     */
    genCustomers(isWaiting: boolean): void {
        // let randomCount = Math.floor(Math.random() * 4) + 1;
        let randomCount = 2;
        for (let i = 0; i < randomCount; i++) {
            let customer = instantiate(this.customerPrefab);

            // 随机获取一个顾客配置
            let randomIndex = Math.floor(Math.random() * this._customerConfig.length);
            let randomCustomerConfig = { ...this._customerConfig[randomIndex] };

            // 初始化顾客运行时数据
            let waitLeft = Math.random() < 0.5;
            let customerRuntimeData: ICustomerData = {
                id: randomCustomerConfig.id,
                status: isWaiting ? CUSTOMER_STATES.WALK_TO_WAIT_AREA : CUSTOMER_STATES.OUTSIDE_WALK,
                waitTime: 15000,
                currentArea: GAME_AREA.WAIT_AREA,
                subArea: waitLeft ? WAIT_AREA.LEFT : WAIT_AREA.RIGHT
            }

            if (customerRuntimeData.status === CUSTOMER_STATES.WALK_TO_WAIT_AREA) {
                if (GameData.CustomerInWaitArr.length < 6) {
                    // 等待区域未满
                    if (waitLeft) {
                        this.node.getChildByName("OutsideCustomer").getChildByName("WaitAreaLeft").addChild(customer);
                    } else {
                        this.node.getChildByName("OutsideCustomer").getChildByName("WaitAreaRight").addChild(customer);
                    }

                    GameData.CustomerInWaitArr.push(customer);
                } else {
                    // 等待区域满了
                    customerRuntimeData.status = CUSTOMER_STATES.OUTSIDE_WALK;
                    this.node.getChildByName("OutsideCustomer").getChildByName("Passerby").addChild(customer);
                }
            } else {
                this.node.getChildByName("OutsideCustomer").getChildByName("Passerby").addChild(customer);
            }

            customer.getComponent(Customer).initDataNormal(randomCustomerConfig, customerRuntimeData);
            customer.getComponent(Customer).initViewOutside();

            CustomerData.Instance.addCustomerData(customerRuntimeData);
        }
    }

    /**
     * @description: 顾客进入大厅的空闲桌子
     * @return {*}
     */
    deliverCustomersToDesk(deskRuntimeDataArr) {
        let deskFreeCount = deskRuntimeDataArr.length;
        if (deskFreeCount == 0) {
            log("没有空闲桌子");
            return;
        } else {
            log("有空闲桌子，数量: " + deskFreeCount);
            let allocatePlans = this.randomAllocateCustomers(deskRuntimeDataArr);
            log("分配方案: " + allocatePlans);
            for (let i = 0; i < deskFreeCount; i++) {
                let onePlan = allocatePlans[i];
                if (onePlan == 0) {
                    // 不分配
                    continue;
                }

                for (let j = 0; j < onePlan; j++) {
                    let moveCustomer = GameData.CustomerInWaitArr.shift();
                    GameData.CustomerInMovingCountMap.set(
                        deskRuntimeDataArr[i].id,
                        GameData.CustomerInMovingCountMap.get(deskRuntimeDataArr[i].id) + 1
                    );

                    this.node.parent.getChildByName("HallKitchen").getChildByName("Characters").addChild(moveCustomer);
                    moveCustomer.getComponent(Customer).moveOn(deskRuntimeDataArr[i]);
                }

                // 更新桌子节点的桌子组件相关状态数据
                let deskComp = GameData.getDeskById(deskRuntimeDataArr[i].id).getComponent(Desk);
                if (onePlan != 4) {
                    deskComp.updateDeskInfo(deskRuntimeDataArr[i].id, DESK_STATES.NOT_EMPTY_NOT_FULL);
                } else {
                    deskComp.updateDeskInfo(deskRuntimeDataArr[i].id, DESK_STATES.FULL);
                }

                // 更新桌子运行时数据
                DeskData.Instance.updateDeskStatusById(deskRuntimeDataArr[i].id, deskComp.getComponent(Desk).deskRuntimeData.status);
            }
            log("等待区剩余顾客数量：" + GameData.CustomerInWaitArr.length);
        }
    }

    /**
     * @description: 随机分配顾客到桌子，返回分配方案，比如 5 个顾客等待，有 2 张空闲桌子，分配方案为 [2, 3]，
     *               表示第一张桌子分配 2 个顾客，第二张桌子分配 3 个顾客
     * @param {any} deskInfoArr 桌子信息数组
     * @return {*}
     */
    randomAllocateCustomers(deskInfoArr: any): number[] {
        if (deskInfoArr.length == 1 && GameData.CustomerInWaitArr.length <= 4) {
            return [GameData.CustomerInWaitArr.length];
        } else if (deskInfoArr.length == 1 && GameData.CustomerInWaitArr.length > 4) {
            return [4];
        } else if (deskInfoArr.length > 1 && GameData.CustomerInWaitArr.length > 4) {
            let maxCustomersPerTable = 4;
            let numWaitingCustomers = GameData.CustomerInWaitArr.length;
            let numCustomersPerTable = new Array(deskInfoArr.length).fill(0);
            for (let i = 0; i < deskInfoArr.length; i++) {
                if (numWaitingCustomers > 0) {
                    let customersToAdd = Math.min(numWaitingCustomers, maxCustomersPerTable);
                    numCustomersPerTable[i] = Math.floor(Math.random() * customersToAdd) + 1;
                    numWaitingCustomers -= customersToAdd;
                }
            }
            return numCustomersPerTable;
        }
    }

    /**
     * @description: 修正层级关系
     * @return {*}
     */
    correctHierarchy() {
        const leftWaitAreaNodes = this.node.getChildByName("OutsideCustomer").getChildByName("WaitAreaLeft").children;
        const rightWaitAreaNodes = this.node.getChildByName("OutsideCustomer").getChildByName("WaitAreaRight").children;
        const passerbyNodes = this.node.getChildByName("OutsideCustomer").getChildByName("Passerby").children;

        this.outsideCutomerNodesSortByY(leftWaitAreaNodes);
        this.outsideCutomerNodesSortByY(rightWaitAreaNodes);
        this.outsideCutomerNodesSortByY(passerbyNodes);
    }

    /**
     * @description: 店外顾客节点按照 y 坐标排序，用以正确显示层级
     * @param {any} nodes
     * @return {*}
     */
    outsideCutomerNodesSortByY(nodes: any) {
        const sortedNodes = nodes.sort((a, b) => {
            const aY = a.position.y;
            const bY = b.position.y;
            return bY - aY;
        });
        sortedNodes.forEach((node, index) => {
            node.setSiblingIndex(index);
        });
    }
}


