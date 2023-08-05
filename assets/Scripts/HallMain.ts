/*
 * @Author: Zhong Sheng
 * @Date: 2023-04-06 00:33:09
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-07-12 16:25:43
 * @Description: 游戏主逻辑
 */
import { _decorator, Button, Component, error, EventHandler, EventTouch, instantiate, JsonAsset, Label, log, Node, Prefab, resources, Vec3 } from 'cc';
import { Desk } from '../Scripts/Entity/Item/Desk';
import { Customer } from '../Scripts/Entity/Character/Customer';
import GameData from '../Scripts/Runtime/GameData';
import EventManager from '../Scripts/Runtime/EventManager';
import { DESK_STATES, EMPLOYEE_PANEL_TYPE, EMPLOYEE_RECRUITMENT_STATES, EMPLOYEE_STATES, EMPLOYEE_TASK_STATE, EMPLOYEE_TASK_TYPE, GAME_AREA, GAME_EVENTS, HALL_ENTITY_ADD, SEAT_STATES, UI_EVENTS } from '../Scripts/Enums/GameEnums';
import { AudioManager } from './Runtime/AudioManager';
import { UIManager } from './UI/Framework/UIManager';
import { UILAYER } from './UI/Framework/UIDefine';
import { ShopInfoData } from './Runtime/ShopInfoData';
import { DeskData, IDeskData } from './Runtime/DeskData';
import { EmployeeData, IEmployeeData } from './Runtime/EmployeeData';
import { EmployeeInfoData } from './Runtime/EmployeeInfoData';
import { EpWaiter } from './Entity/Character/Employee/EpWaiter';
import { EmployeeTasks, ITask } from './Runtime/EmployeeTasks';
import { generateUniqueId } from './Util/CommonUtil';
import { EpCashier } from './Entity/Character/Employee/EpCashier';
import { MenuInfoData } from './Runtime/MenuInfoData';
const { ccclass, property } = _decorator;

@ccclass('HallMain')
export class HallMain extends Component {
    @property(Prefab)
    public customer: Prefab = null!;

    @property(Prefab)
    public desk: Prefab = null!;

    @property(Node)
    public sceneUI: Node = null!;

    @property(Prefab)
    public employee: Prefab = null!;

    @property(Node)
    public door: Node = null!;

    @property(Node)
    public outSideDoor: Node = null!;

    @property(JsonAsset)
    public employeeJsonAsset: JsonAsset = null!;

    @property(JsonAsset)
    public deskJsonAsset: JsonAsset = null!;

    private _deskConfigurationData: any = null;

    private _employeeData: any = null;

    private _doorPosition: Vec3 = new Vec3(0, 0, 0);

    private _hallUIBtnClickSound = "Audio/Sound/sceneUIClick";

    onLoad() { }

    start() {
        this.initData();
        this.initView();
        this.initEvents();
    }

    update() {
        this.correctCharacterHierarchy();
    }

    /**
     * @description: 初始化游戏数据
     * @return {*}
     */
    initData(): any {
        // 桌子配置数据加载
        let deskJsonData = this.deskJsonAsset.json;
        this._deskConfigurationData = deskJsonData.DeskData;

        // 员工配置数据加载
        let employeeJsonData = this.employeeJsonAsset.json;
        this._employeeData = employeeJsonData.EmployeeData;

        let doorNode = this.node.getChildByName("AllArea").getChildByName("HallKitchen").getChildByName("Door");
        this._doorPosition.set(doorNode.position);

        // 店铺面板的信息数据初始化
        ShopInfoData.Instance.initShopInfoData();
        // 员工面板的信息数据初始化
        EmployeeInfoData.Instance.initEmployeeInfoData();
        // 菜单面板的信息数据初始化
        MenuInfoData.Instance.initMenuData();

        log("游戏对象数据初始化完成");
    }

    /**
     * @description: 初始化游戏界面
     * @return {*}
     */
    initView(): any {
        //TODO：暂时现在这里写ui的初始化，后面在游戏启动脚本中初始化
        UIManager.Instance.openUI("levelWidget", undefined, UILAYER.E_WIDGIT);
        UIManager.Instance.openUI("cashWidget", undefined, UILAYER.E_WIDGIT);
        UIManager.Instance.openUI("diamondWidget", undefined, UILAYER.E_WIDGIT);
        UIManager.Instance.openUI("gameFunctionWidget", undefined, UILAYER.E_WIDGIT);
        UIManager.Instance.openUI("normalFunctionWidget", undefined, UILAYER.E_WIDGIT);

        this.addDesk();
        this.addEmployee();
    }

    /**
     * @description: 初始化大厅相关的事件
     * @return {*}
     */
    initEvents() {
        // 当顾客全部都落座时，显示点菜UI
        EventManager.Instance.addEvent(GAME_EVENTS.ORDER_FOOD_UI_SHOW, this.showOrderFoodUI, this);
        // 当收银员给顾客结完账后，显示清理桌面UI按钮
        EventManager.Instance.addEvent(UI_EVENTS.SHOW_CLEAN_UP_DESK_UI, this.showCleanUpPopUI, this);

        // 取消点菜UI
        EventManager.Instance.addEvent(UI_EVENTS.CANCLE_ORDER_FOOD_UI, this.cancelOrderFoodUI, this);
        // 取消结账UI
        EventManager.Instance.addEvent(UI_EVENTS.CANCLE_CHECKOUT_UI, this.cancelCheckoutPopUI, this);
        // 取消清理桌面UI
        EventManager.Instance.addEvent(UI_EVENTS.CANCLE_CLEAN_UP_DESK_UI, this.cancelCleanUpPopUI, this);

        // 服务员抵达指定餐桌
        EventManager.Instance.addEvent(GAME_EVENTS.EMPLOYEE_IN_DESK, this.employeeInDesk, this);
        // 顾客点菜时，在顾客头上显示说话气泡
        EventManager.Instance.addEvent(GAME_EVENTS.SHOW_CUSTOMER_TALK_POP, this.showCustomerTalkPop, this);
        // 系统检查顾客是否已经点完菜
        EventManager.Instance.addEvent(GAME_EVENTS.CHECK_CUSTOMER_ORDER_FOOD, this.checkCustomerOrderFoodFinished, this);
        // 顾客用餐完成，在桌子上显示结账UI
        EventManager.Instance.addEvent(GAME_EVENTS.CUSTOMER_CHECKOUT, this.customerCheckout, this);
        // 结账完成后的操作
        EventManager.Instance.addEvent(GAME_EVENTS.CHECKOUT_CONFIRM_BUTTON_CLICK, this.onCheckoutBoardConfirmClicked, this);

        // 添加桌子
        EventManager.Instance.addEvent(HALL_ENTITY_ADD.ADD_DESK, this.addDeskFromShop, this);
        // 添加员工
        EventManager.Instance.addEvent(HALL_ENTITY_ADD.ADD_EP, this.addEpByEpPanel, this);

        // 门节点添加点击事件
        this.door.on(Node.EventType.TOUCH_START, this.onDoorClick, this);
        this.outSideDoor.on(Node.EventType.TOUCH_START, this.onOutsideDoorClick, this);

        // 每间隔几秒钟，检查一次桌子是否空闲，如果空闲，则通知店外的顾客进店
        this.schedule(this.checkDeskIdle, 5);

        // 每间隔几秒钟，删除一次已经完成的员工任务
        this.schedule(this.deleteDoneTask, 10);
    }

    /**
     * @description: 添加桌子
     * @param {number} num 要添加的桌子数量
     * @return {*}
     */
    addDesk(): any {
        if (GameData.Desks.length >= this._deskConfigurationData.length) {
            log("桌子数量不够");
            return;
        }

        if (this._deskConfigurationData.length < 0) {
            error("桌子的json数据为空");
            return;
        }

        DeskData.Instance.initDeskData();
        this.genDesks();
    }

    /**
     * @description: 生成桌子
     * @return {*}
     */
    genDesks(): any {
        let allDeskLocal = DeskData.Instance.getDeskAll();
        log("生成桌子，桌子数量：", allDeskLocal.length);
        for (let i = 0; i < allDeskLocal.length; i++) {
            let desk = instantiate(this.desk);
            desk.getComponent(Desk).initConfigData(this._deskConfigurationData[i])
            desk.getComponent(Desk).initRuntimeData(allDeskLocal[i]);
            this.node.getChildByName("AllArea").getChildByName("HallKitchen").getChildByName("Desks").addChild(desk);

            GameData.updateDesks(desk);
            GameData.updateSeatsInfo(i + 1, desk.getComponent(Desk).deskRuntimeData.seatsInfo);
            GameData.updateCustomerOrderFood(i + 1);
            GameData.updateHotpotSoupFinish(i + 1, false);
            GameData.updateDishFinish(i + 1, false);

            GameData.CustomerInMovingCountMap.set(i + 1, 0);
            GameData.CustomerInDeskCountMap.set(i + 1, 0);
            GameData.CustomerFinishOrderFoodCount.set(i + 1, 0);
        }
    }

    /**
     * @description: 通过店铺添加桌子，初始添加
     * @return {*}
     */
    addDeskFromShop(deskInfo: any): any {
        // 往桌子数据中添加新的桌子
        // 找到对应的桌子配置数据
        let findDeskConfig = this._deskConfigurationData.find(oneConfig => oneConfig.id === deskInfo.id);
        if (findDeskConfig) {
            let desk = instantiate(this.desk);
            desk.getComponent(Desk).initConfigData(findDeskConfig);

            let initDeskData: IDeskData = {
                id: deskInfo.id,
                status: DESK_STATES.EMPTY,
                spriteResName: 'LV01_SItem_Hall_zuozi_01',
                seatsInfo: [
                    {
                        seatId: 1,
                        seatStatus: SEAT_STATES.EMPTY,
                        seatSpriteResName: 'LV01_SItem_Hall_dengzi_01',
                        customerId: ''
                    },
                    {
                        seatId: 2,
                        seatStatus: SEAT_STATES.EMPTY,
                        seatSpriteResName: 'LV01_SItem_Hall_dengzi_02',
                        customerId: ''
                    },
                    {
                        seatId: 3,
                        seatStatus: SEAT_STATES.EMPTY,
                        seatSpriteResName: 'LV01_SItem_Hall_dengzi_01',
                        customerId: ''
                    },
                    {
                        seatId: 4,
                        seatStatus: SEAT_STATES.EMPTY,
                        seatSpriteResName: 'LV01_SItem_Hall_dengzi_02',
                        customerId: ''
                    }
                ]
            };
            desk.getComponent(Desk).initRuntimeData(initDeskData);

            this.node.getChildByName("AllArea").getChildByName("HallKitchen").getChildByName("Desks").addChild(desk);

            DeskData.Instance.addDeskData(initDeskData);
            GameData.updateDesks(desk);
            GameData.updateSeatsInfo(deskInfo.id, desk.getComponent(Desk).deskRuntimeData.seatsInfo);
            GameData.updateCustomerOrderFood(deskInfo.id);
            GameData.updateHotpotSoupFinish(deskInfo.id, false);
            GameData.updateDishFinish(deskInfo.id, false);

            GameData.CustomerInMovingCountMap.set(deskInfo.id, 0);
            GameData.CustomerInDeskCountMap.set(deskInfo.id, 0);
            GameData.CustomerFinishOrderFoodCount.set(deskInfo.id, 0);
        }
    }

    /**
     * @description: 添加员工
     * @return {*}
     */
    addEmployee(): any {
        if (this._employeeData.length < 0) {
            error("员工的json数据为空");
            return;
        }

        if (EmployeeData.Instance.getAllEmployeeData().length == 0) {
            log("无员工游戏运行时数据");
            return;
        } else {
            this.genEmployees(EmployeeData.Instance.getAllEmployeeData());
        }
    }

    /**
     * @description: 通过员工面板添加员工
     * @return {*}
     */
    addEpByEpPanel(epConfigData: any, epType: any) {
        let ep = instantiate(this.employee);
        this.node.getChildByName("AllArea").getChildByName("HallKitchen").getChildByName("Characters").addChild(ep);

        // 员工运行时数据，在生成员工的时候进行初始化
        let epRuntimeData: IEmployeeData = {
            id: epConfigData.id,
            area: GAME_AREA.HALL,
            epType: epType,
            status: EMPLOYEE_STATES.IS_WALKING,
            recruitmentStatus: EMPLOYEE_RECRUITMENT_STATES.RECRUITED
        }

        // 根据员工类型，添加不同的员工类型的组件
        switch (epType) {
            case EMPLOYEE_PANEL_TYPE.WAITER:
                ep.addComponent(EpWaiter);
                ep.getComponent(EpWaiter).initConfigData(epConfigData);
                ep.getComponent(EpWaiter).initMovePath();
                ep.getComponent(EpWaiter).initRuntimeData(epRuntimeData);
                break;
            case EMPLOYEE_PANEL_TYPE.CASHIER:
                ep.addComponent(EpCashier);
                ep.getComponent(EpCashier).initConfigData(epConfigData);
                ep.getComponent(EpCashier).initMovePath();
                ep.getComponent(EpCashier).initRuntimeData(epRuntimeData);
                break;
            default:
                break;
        }

        EmployeeData.Instance.addEmployeeData(epRuntimeData);
        GameData.updateEmployees(ep);
    }

    /**
     * @description: 生成员工
     * @return {*}
     */
    genEmployees(epRuntimData: IEmployeeData[]): any {
        let genCount = epRuntimData.length;
        for (let i = 0; i < genCount; i++) {
            let employee = instantiate(this.employee);
            this.node.getChildByName("AllArea").getChildByName("HallKitchen").getChildByName("Characters").addChild(employee);

            // 初始化员工配置数据、员工游戏运行时数据
            let epArea = epRuntimData[i].area;
            let epType = epRuntimData[i].epType;
            let epId = epRuntimData[i].id;
            let employeeConfigData = EmployeeInfoData.Instance.getEpInfoDataByAreaAndTypeAndId(epArea, epType, epId);

            // 根据员工类型，添加不同的员工类型的组件
            switch (epType) {
                case EMPLOYEE_PANEL_TYPE.WAITER:
                    employee.addComponent(EpWaiter);
                    employee.getComponent(EpWaiter).initConfigData(employeeConfigData);
                    employee.getComponent(EpWaiter).initMovePath();
                    employee.getComponent(EpWaiter).initRuntimeData(epRuntimData[i]);
                    break;
                case EMPLOYEE_PANEL_TYPE.CHEF:
                    break;
                case EMPLOYEE_PANEL_TYPE.CASHIER:
                    employee.addComponent(EpCashier);
                    employee.getComponent(EpCashier).initConfigData(employeeConfigData);
                    employee.getComponent(EpCashier).initMovePath();
                    employee.getComponent(EpCashier).initRuntimeData(epRuntimData[i]);
                    break;
                default:
                    break;
            }

            // 初始化的时候，员工都是在走向站桩点的路上
            epRuntimData[i].status = EMPLOYEE_STATES.IS_WALKING;
            EmployeeData.Instance.updateEmployeeStatusById(epRuntimData[i].id, epRuntimData[i].status);

            GameData.updateEmployees(employee);
        }
    }

    /**
     * @description: 当顾客全部落座后，在对应的桌子上显示点菜UI按钮
     * @return {*}
     */
    showOrderFoodUI(deskRuntimeData: any) {
        // 拿到点菜UI prefab 资源
        resources.load("Prefabs/UI/Scene/Hall/OrderDishesPop", Prefab, (err, prefab) => {
            if (err) {
                console.error(err);
                return;
            } else {
                let orderFoodUI = instantiate(prefab);
                let desk = GameData.getDeskById(deskRuntimeData.id);
                // desk.addChild(orderFoodUI);
                orderFoodUI.setPosition(new Vec3(desk.position.x, desk.position.y + 90, desk.position.z));
                orderFoodUI.name = "OrderDishesPop_" + deskRuntimeData.id;
                this.sceneUI.addChild(orderFoodUI);

                // 动态设置点菜UI按钮的点击事件
                let orderFoodUIClickedEvent = new EventHandler();
                orderFoodUIClickedEvent.target = this.node;
                orderFoodUIClickedEvent.component = "HallMain";
                orderFoodUIClickedEvent.handler = "onOrderFoodUIClicked";
                orderFoodUIClickedEvent.customEventData = deskRuntimeData;

                orderFoodUI.getComponent(Button).clickEvents.push(orderFoodUIClickedEvent);
            }
        });
    }

    /**
     * @description: 桌面上的点单UI按钮点击事件
     * @param {*} event
     * @param {any} deskRuntimeData
     * @return {*}
     */
    onOrderFoodUIClicked(event, deskRuntimeData: any) {
        AudioManager.inst.playOneShot(this._hallUIBtnClickSound);
        
        this.cancelOrderFoodUI(deskRuntimeData);

        // 检查当前桌子的点餐任务
        let waiterTasks = EmployeeTasks.Instance.getTasksByEpType(EMPLOYEE_PANEL_TYPE.WAITER);
        if (waiterTasks) {
            for (let i = 0; i < waiterTasks.length; i++) {
                let oneTask = waiterTasks[i];
                if (oneTask.taskType == EMPLOYEE_TASK_TYPE.ORDER_FOOD && oneTask.taskTargetDeskData.id == deskRuntimeData.id) {
                    log("当前桌子的点餐任务有，将这条任务设置为已取消状态", oneTask);
                    oneTask.status = EMPLOYEE_TASK_STATE.CANCLE;
                    EmployeeTasks.Instance.updateTaskStatus(oneTask.id, EMPLOYEE_TASK_STATE.CANCLE);
                }
            }
        }
        
        EventManager.Instance.emit(GAME_EVENTS.CUSTOMER_ORDER_FOOD, deskRuntimeData);
    }

    /**
     * @description: 服务员抵达指定餐桌，需要告知系统，取消该餐桌的点菜UI按钮，同时通知顾客点菜
     * @return {*}
     */
    employeeInDesk(deskInfo: any) {
        log("服务员抵达指定餐桌: ", deskInfo);

        this.cancelOrderFoodUI(deskInfo);

        // 通知顾客正式开始点菜
        EventManager.Instance.emit(GAME_EVENTS.CUSTOMER_ORDER_FOOD, deskInfo);
    }

    /**
     * @description: 取消点菜UI按钮
     * @param {any} deskInfo
     * @return {*}
     */
    cancelOrderFoodUI(deskInfo: any) {
        log("取消点菜UI按钮");
        this.sceneUI.removeChild(this.sceneUI.getChildByName("OrderDishesPop_" + deskInfo.id));
    }

    /**
     * @description: 显示顾客头上的说话气泡
     * @param {string} orderFoodName 点的菜名
     * @return {*}
     */
    showCustomerTalkPop(orderFoodName: string, customer: Node) {
        resources.load("Prefabs/UI/Scene/Hall/Dialog", Prefab, (err, prefab) => {
            let dialog = instantiate(prefab);
            customer.addChild(dialog);

            // 2号座位的顾客，气泡需要沿着Y轴旋转180度
            let customerId = customer.getComponent(Customer).customerInfo.id;
            let seatsInfo = customer.getComponent(Customer).deskRuntimeData.seatsInfo;
            for (let i = 0; i < seatsInfo.length; i++) {
                let oneSeatInfo = seatsInfo[i];
                if (oneSeatInfo.customerId == customerId && oneSeatInfo.seatId == 2) {
                    customer.getChildByName("Dialog").eulerAngles = new Vec3(0, 180, 0);
                    customer.getChildByName("Dialog").position = new Vec3(customer.getChildByName("Dialog").position.x - 150, customer.getChildByName("Dialog").position.y + 50, 0);
                    break;
                }
            }

            dialog.getChildByName("DialogPop").getChildByName("DialogCont").getComponent(Label).string = orderFoodName;

            this.scheduleOnce(() => {
                customer.removeChild(dialog);
            }, 2);

        });
    }

    /**
     * @description: 检查顾客是否完成点菜
     * @return {*}
     */
    checkCustomerOrderFoodFinished(deskRuntimeData: any) {
        let seatsInfo = GameData.SeatsInfo.get(deskRuntimeData.id);
        let customerInSeatCount = 0;
        for (let i = 0; i < seatsInfo.length; i++) {
            let oneSeatInfo = seatsInfo[i];
            if (oneSeatInfo.customerId != null && oneSeatInfo.customerId != '') {
                customerInSeatCount++;
            }
        }

        if (customerInSeatCount == GameData.CustomerFinishOrderFoodCount.get(deskRuntimeData.id)) {
            log("桌子：" + deskRuntimeData.id + "，顾客点菜完成");

            // 服务员类型的员工有的话，通知服务员回到初始位置
            if (EmployeeData.Instance.getOneTypeEmployeeData(EMPLOYEE_PANEL_TYPE.WAITER).length != 0) {
                this.scheduleOnce(() => {
                    EventManager.Instance.emit(GAME_EVENTS.CUSTOMER_ORDER_FOOD_FINISHED, deskRuntimeData);
                }, 2);
            } else {
                // 没有员工数据的情况
                log("没有员工数据，不用告知员工回到初始位置");
            }

            // 通知厨房开始制作菜品
            this.scheduleOnce(() => {
                EventManager.Instance.emit(GAME_EVENTS.KITCHEN_MAKE_FOOD_START, deskRuntimeData);
            }, 3);
        }
    }

    /**
     * @description: 结账
     * @param {any} deskRuntimeData
     * @return {*}
     */
    customerCheckout(deskRuntimeData: any) {
        resources.load("Prefabs/UI/Scene/Hall/CheckoutPop", Prefab, (err, prefab) => {
            if (err) {
                console.error(err);
                return;
            }
            let checkout = instantiate(prefab);
            let desk = GameData.getDeskById(deskRuntimeData.id);

            checkout.setPosition(new Vec3(desk.position.x, desk.position.y + 90, desk.position.z));

            if (this.sceneUI.getChildByName("CheckoutPop")) {
                this.sceneUI.removeChild(this.sceneUI.getChildByName("CheckoutPop"));
            }
            this.sceneUI.addChild(checkout);

            // 动态设置结账UI的点击事件
            let checkoutUIClickedEvent = new EventHandler();
            checkoutUIClickedEvent.target = this.node;
            checkoutUIClickedEvent.component = "HallMain";
            checkoutUIClickedEvent.handler = "onCheckoutUIClicked";
            checkoutUIClickedEvent.customEventData = deskRuntimeData;
            checkout.getComponent(Button).clickEvents.push(checkoutUIClickedEvent);

            if (EmployeeData.Instance.getOneTypeEmployeeData(EMPLOYEE_PANEL_TYPE.CASHIER).length != 0) {
                let epTask: ITask = {
                    id: generateUniqueId(),
                    taskType: EMPLOYEE_TASK_TYPE.CHECKOUT,
                    status: EMPLOYEE_TASK_STATE.WAITING,
                    epType: EMPLOYEE_PANEL_TYPE.CASHIER,
                    taskTargetDeskData: deskRuntimeData,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
                EmployeeTasks.Instance.createTask(epTask);

                // 通知收银员要开始检查是否空闲了
                EventManager.Instance.emit(GAME_EVENTS.CHECK_CASHIER_IDLE);
            }
        });
    }

    /**
     * @description: 结账UI按钮点击事件
     * @return {*}
     */
    onCheckoutUIClicked(event, deskRuntimeData: any) {
        AudioManager.inst.playOneShot(this._hallUIBtnClickSound);

        // 打开结账面板
        UIManager.Instance.openUI("checkOutPanel", deskRuntimeData, UILAYER.E_PANEL);
    }

    /**
     * @description: 删除结账UI节点
     * @return {*}
     */
    cancelCheckoutPopUI() {
        this.sceneUI.removeChild(this.sceneUI.getChildByName("CheckoutPop"));
    }

    /**
     * @description: 确认结账按钮点击事件
     * @param {*} event
     * @param {any} deskInfo
     * @return {*}
     */
    onCheckoutBoardConfirmClicked(deskInfo: any) {
        AudioManager.inst.playOneShot(this._hallUIBtnClickSound);

        // 1. 隐藏结账面板节点
        UIManager.Instance.closeUI("checkOutPanel");
        // 2. 删除桌子上的结账UI节点
        this.cancelCheckoutPopUI();
        // 3. 通知顾客离开
        EventManager.Instance.emit(GAME_EVENTS.CUSTOMER_LEAVE, deskInfo);
        // 4. 显示清洁桌子按钮
        this.showCleanUpPopUI(deskInfo);

        // 5. 如果有服务员，则添加一个服务员清洁桌子的任务到任务中心
        if (EmployeeData.Instance.getOneTypeEmployeeData(EMPLOYEE_PANEL_TYPE.WAITER).length != 0) {
            let epCleanUpDeskTask: ITask = {
                id: generateUniqueId(),
                taskType: EMPLOYEE_TASK_TYPE.CLEAN_DESK,
                status: EMPLOYEE_TASK_STATE.WAITING,
                epType: EMPLOYEE_PANEL_TYPE.WAITER,
                createdAt: new Date(),
                taskTargetDeskData: deskInfo,
            }
            EmployeeTasks.Instance.createTask(epCleanUpDeskTask);

            // 通知服务员要开始检查是否空闲了
            EventManager.Instance.emit(GAME_EVENTS.CHECK_WAITER_IDLE);
        }

        // 6. 游戏数据重置
        GameData.CustomerInMovingCountMap.set(deskInfo.id, 0);
        GameData.CustomerInDeskCountMap.set(deskInfo.id, 0);
        GameData.CustomerFinishOrderFoodCount.set(deskInfo.id, 0);
        GameData.updateHotpotSoupFinish(deskInfo.id, false);
        GameData.updateDishFinish(deskInfo.id, false);
    }

    /**
     * @description: 展示清洁桌子按钮
     * @param {any} deskRuntimeData
     * @return {*}
     */
    showCleanUpPopUI(deskRuntimeData: any) {
        resources.load("Prefabs/UI/Scene/Hall/CleanUpPop", Prefab, (err, prefab) => {
            if (err) {
                error(err);
                return;
            }

            let cleanUpPop = instantiate(prefab);
            let deskNode = GameData.getDeskById(deskRuntimeData.id);
            cleanUpPop.setPosition(new Vec3(deskNode.position.x, deskNode.position.y + 90, deskNode.position.z));
            cleanUpPop.name = "CleanUpPop_" + deskRuntimeData.id;
            this.sceneUI.addChild(cleanUpPop);

            // 设置清洁桌子按钮的点击事件
            let cleanUpPopClickedEvent = new EventHandler();
            cleanUpPopClickedEvent.target = this.node;
            cleanUpPopClickedEvent.component = "HallMain";
            cleanUpPopClickedEvent.handler = "onCleanUpPopClicked";
            cleanUpPopClickedEvent.customEventData = deskRuntimeData;
            cleanUpPop.getComponent(Button).clickEvents.push(cleanUpPopClickedEvent);
        });
    }

    /**
     * @description: 去除清洁桌子的按钮
     * @param {any} deskRuntimeData 桌子运行时数据
     * @return {*}
     */
    cancelCleanUpPopUI(deskRuntimeData: any) {
        this.sceneUI.removeChild(this.sceneUI.getChildByName("CleanUpPop_" + deskRuntimeData.id));
    }

    /**
     * @description: 清洁桌子按钮点击事件
     * @param {*} event
     * @param {any} deskRuntimeData
     * @return {*}
     */
    onCleanUpPopClicked(event, deskRuntimeData: any) {
        this.cancelCleanUpPopUI(deskRuntimeData);

        if (EmployeeData.Instance.getOneTypeEmployeeData(EMPLOYEE_PANEL_TYPE.WAITER).length === 0) {
            // 没有雇佣服务员的情况，直接开始清洁桌子
            AudioManager.inst.playOneShot("Audio/Sound/employeeCleanTable");
            this.scheduleOnce(() => {
                log("清理桌面完成");
                EventManager.Instance.emit(GAME_EVENTS.EMPLOYEE_CLEAN_DESK_FINISH, deskRuntimeData);
            }, 5);
        }
    }

    /**
     * @description: 大厅门点击事件
     * @param {EventTouch} event
     * @return {*}
     */
    onDoorClick(event: EventTouch) {
        // 在大厅点击门，到店外区域
        EventManager.Instance.emit(GAME_EVENTS.AREA_CHANGE, GAME_AREA.WAIT_AREA);
    }

    /**
     * @description: 店外门点击事件
     * @param {EventTouch} event
     * @return {*}
     */
    onOutsideDoorClick(event: EventTouch) {
        // 在店外点击门，到大厅区域
        EventManager.Instance.emit(GAME_EVENTS.AREA_CHANGE, GAME_AREA.HALL);
    }

    /**
     * @description: 检查桌子的空闲情况
     * @return {*}
     */
    checkDeskIdle(): any {
        if (GameData.Desks.length <= 0) return;

        let deskRuntimeDataArr = [];
        for (let i = 0; i < GameData.Desks.length; i++) {
            let deskRuntimeData = GameData.Desks[i].getComponent(Desk).deskRuntimeData
            let isDeskFree = GameData.Desks[i].getComponent(Desk).getDeskIsFree();
            if (isDeskFree) deskRuntimeDataArr.push(deskRuntimeData);
        }

        if (deskRuntimeDataArr.length > 0) {
            if (GameData.CustomerInWaitArr.length == GameData.CustomerInWaitPositionCount) {
                EventManager.Instance.emit(GAME_EVENTS.CUSTOMER_WALK_TO_HALL_DESK, deskRuntimeDataArr);
            }
        }
    }

    /**
     * @description: 删除已经完成的员工任务，避免队列过长
     * @return {*}
     */
    deleteDoneTask() {
        EmployeeTasks.Instance.deleteDoneTasks();
    }

    /**
     * @description: 节点层级重新修正
     * @return {*}
     */
    correctCharacterHierarchy() {
        const hallCharacterNodes = this.node.getChildByName("AllArea").getChildByName("HallKitchen").getChildByName("Characters");
        this.nodesSortByY(hallCharacterNodes.children);
    }

    /**
     * @description: 节点按照Y轴排序
     * @param {any} nodes
     * @return {*}
     */
    nodesSortByY(nodes: any) {
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


