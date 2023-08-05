import { _decorator, Button, Component, error, EventHandler, instantiate, Label, log, Node, Prefab, resources, Vec3 } from 'cc';
import { UIBase } from '../../../Framework/UIBase';
import { nowTimeString } from '../../../../Util/CommonUtil';
import GameData from '../../../../Runtime/GameData';
import EventManager from '../../../../Runtime/EventManager';
import { GAME_EVENTS, UI_EVENTS } from '../../../../Enums/GameEnums';
import { BillData, IBill, IBillDetail } from '../../../../Runtime/BillData';
import { IMenuItem } from '../../../../Runtime/MenuInfoData';
import { PlayerData } from '../../../../Runtime/PlayerData';
const { ccclass, property } = _decorator;

@ccclass('CheckoutPanel')
export class CheckoutPanel extends UIBase {
    private _billData: IBill = null!;
    private _profit: number = 0;

    onInit(params: any): void {
        log("CheckoutPanel onInit");

        this.initEvent();
    }

    initEvent() {
        EventManager.Instance.addEvent(UI_EVENTS.CASH_ADD_UI, this.cashUpgradeUI, this);
    }

    onEnter(params: any): void {
        log("CheckoutPanel onEnter");

        // 赋值桌子编号赋值
        this.node.getChildByName("OrderBase").getChildByName("DeskNum").getComponent(Label).string = "大 堂 桌 椅：" + params.id;

        // 赋值落座人数
        let seatsInfo = params.seatsInfo;
        let customerCount = seatsInfo.filter(seat => seat.seatStatus === 1).reduce((count, seat) => count + 1, 0);
        this.node.getChildByName("OrderBase").getChildByName("CustomerNum").getComponent(Label).string = "人 数：" + customerCount;

        // 赋值订单编号
        // 获取最后一个订单数据的订单编号
        let lastOneBillData = BillData.Instance.getLastOneBillData();
        let nowBillId = 0;
        if (lastOneBillData) { // 有数据则赋值，没有则从0开始
            let lastBillId = lastOneBillData.id;
            nowBillId = lastBillId + 1;
            this.node.getChildByName("OrderBase").getChildByName("OrderNum").getComponent(Label).string = "单 号：" + nowBillId.toString();
        } else {
            this.node.getChildByName("OrderBase").getChildByName("OrderNum").getComponent(Label).string = "单 号：" + nowBillId.toString();
        }

        // 赋值订单时间
        let orderTime = nowTimeString();
        this.node.getChildByName("OrderBase").getChildByName("OrderTime").getComponent(Label).string = "时 间：" + orderTime;

        // 赋值菜品信息
        let customerOrderedFoods = GameData.CustomerOrderFood.get(params.id);
        if (this.node.getChildByName("OrderDetail").getChildByName("DishDetail").children.length > 0) {
            this.node.getChildByName("OrderDetail").getChildByName("DishDetail").removeAllChildren();
        }
        this.dishDetailForCheckout(customerOrderedFoods, this.node);

        // 总价赋值
        let totalPrice = 0;
        let totalCost = 0;
        for (let i = 0; i < customerOrderedFoods.length; i++) {
            let playerMenuData = PlayerData.Instance.getPlayerMenuDataByMenuItemId(customerOrderedFoods[i].ItemId);
            let currentMenuLevel = playerMenuData.ItemLevel;
            let currentMenuPrice = customerOrderedFoods[i].ItemPrice.find(onePrice => onePrice.level === currentMenuLevel).price;
            totalPrice += currentMenuPrice;
            totalCost += customerOrderedFoods[i].ItemCost;
        }
        this._profit = totalPrice - totalCost;
        this.node.getChildByName("Account").getChildByName("TotalPrice").getComponent(Label).string = "总 计：" + totalPrice;
        this.node.getChildByName("Account").getChildByName("TotalProfit").getComponent(Label).string = "利 润：" + this._profit;

        const [dishCountMap, uniqueFood] = this.statisticOrderedFood(customerOrderedFoods);
        let billDetails: IBillDetail[] = [];
        for (let i = 0; i < uniqueFood.length; i++) {
            let aFood: IMenuItem = uniqueFood[i];
            let aFoodCount = dishCountMap.get(aFood.ItemId);
            let aFoodBillDetail: IBillDetail = { orderFood: aFood, orderCount: aFoodCount };
            billDetails.push(aFoodBillDetail);
        }

        // 构建订单数据
        this._billData = {
            id: nowBillId,
            billDetails: billDetails,
            deskId: params.id,
            totalPrice: totalPrice,
            orderTime: orderTime,
        };

        if (this.getButton("ConfirmButton").clickEvents.length != 0) {
            // 说明之前已经添加了点击事件，需要先清空
            this.getButton("ConfirmButton").clickEvents = [];
        }

        // 动态设置确认按钮的点击事件
        let confirmButtomClickedEvent = new EventHandler();
        confirmButtomClickedEvent.target = this.node;
        confirmButtomClickedEvent.component = "CheckoutPanel";
        confirmButtomClickedEvent.handler = "onConfirmButtonClick";
        confirmButtomClickedEvent.customEventData = params;
        this.getButton("ConfirmButton").clickEvents.push(confirmButtomClickedEvent);
    }

    /**
     * @description: 账单确认按钮点击事件回调
     * @param {*} event
     * @param {any} params
     * @return {*}
     */    
    onConfirmButtonClick(event, params: any) {
        // 通知大厅界面，桌子已经结账
        EventManager.Instance.emit(GAME_EVENTS.CHECKOUT_CONFIRM_BUTTON_CLICK, params);
        // 保存账单数据到本地
        BillData.Instance.addBillData(this._billData);

        // 玩家收益增加
        // 玩家数据的现金值增加，同时更新到本地存储
        PlayerData.Instance.addCash(this._profit);
        // ui界面的现金值增加
        this.cashUpgradeUI(this._profit);
    }

    /**
     * @description: UI界面现金值增加
     * @param {any} profit 收益
     * @return {*}
     */    
    cashUpgradeUI(profit: any) {
        this.sendMsg("cashWidget", "upgradePlayerCashNum", profit);
    }

    /**
     * @description: 菜品详情赋值
     * @param {any} customerOrderedFoods
     * @param {Node} checkoutBoard
     * @return {*}
     */
    dishDetailForCheckout(customerOrderedFoods: any, checkoutBoard: Node) {
        resources.load("Prefabs/UI/Panel/Checkout/DishDetail", Prefab, (err, prefab) => {
            if (err) {
                error(err);
                return;
            }

            // 统计每个菜品点的数量
            const [dishCountMap, uniqueFood] = this.statisticOrderedFood(customerOrderedFoods);
            for (let i = 0; i < uniqueFood.length; i++) {
                const food = uniqueFood[i];

                let dishName = food.ItemName;
                let playerMenuData = PlayerData.Instance.getPlayerMenuDataByMenuItemId(food.ItemId);
                let currentMenuLevel = playerMenuData.ItemLevel;
                let currentMenuPrice = food.ItemPrice.find(onePrice => onePrice.level === currentMenuLevel).price;
                let dishCount = dishCountMap.get(food.ItemId);
                let dishCost = food.ItemCost;

                let dishDetail = instantiate(prefab);
                dishDetail.getChildByName("DishDetailName").getComponent(Label).string = dishName;
                dishDetail.getChildByName("DishDetailPrice").getComponent(Label).string = currentMenuPrice;
                dishDetail.getChildByName("DishDetailNum").getComponent(Label).string = dishCount;
                dishDetail.getChildByName("DishDetailCost").getComponent(Label).string = dishCost;
                dishDetail.position = new Vec3(dishDetail.position.x, dishDetail.position.y - i * 30, 0);

                checkoutBoard.getChildByName("OrderDetail").getChildByName("DishDetail").addChild(dishDetail);
            }
        });
    }

    /**
     * @description: 统计每个菜品点的数量
     * @param {any} customerOrderedFoods
     * @return {*}
     */
    statisticOrderedFood(customerOrderedFoods: any) {
        // 统计每个菜品点的数量，结果类似：{ 0 => 1, 1 => 1, 2 => 1 }
        const dishCountMap = customerOrderedFoods.reduce((countMap, dish) => {
            const dishId = dish.ItemId;
            if (countMap.has(dishId)) {
                countMap.set(dishId, countMap.get(dishId) + 1);
            } else {
                countMap.set(dishId, 1);
            }
            return countMap;
        }, new Map<number, number>());

        const uniqueFood = customerOrderedFoods.filter((obj, index, self) => {
            return index === self.findIndex((o) => o.ItemId === obj.ItemId);
        });

        log("dishCountMap: ", dishCountMap);
        log("uniqueFood: ", uniqueFood);

        return [dishCountMap, uniqueFood];
    }
}


