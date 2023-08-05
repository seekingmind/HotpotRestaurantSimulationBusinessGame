/*
 * @Author: Zhong Sheng
 * @Date: 2023-05-06 03:32:41
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-07-28 22:19:35
 * @Description: UI 的配置信息
 */


export let UIRoot = "Canvas/UIRoot";

// UI预制体的资源路径
export let uiPrefabsPath = {
    levelWidget: "Prefabs/UI/Widget/Level/Level",
    diamondWidget: "Prefabs/UI/Widget/DiamondMoney/Diamond",
    cashWidget: "Prefabs/UI/Widget/DiamondMoney/Cash",
    gameFunctionWidget: "Prefabs/UI/Widget/GameFunction/GameFunction",
    normalFunctionWidget: "Prefabs/UI/Widget/NormalFunction/NormalFunction",

    // 等级面板
    levelPanel: "Prefabs/UI/Panel/Level/LevelPanel",
    increaseFacilityTipsPanel: "Prefabs/UI/Panel/Level/IncreaseFacilityTipsPanel",
    increaseServeTipsPanel: "Prefabs/UI/Panel/Level/IncreaseServeTipsPanel",
    increaseFoodTipsPanel: "Prefabs/UI/Panel/Level/IncreaseFoodTipsPanel",

    // 店铺面板
    shopPanel: "Prefabs/UI/Panel/Shop/ShopPanel",
    itemNormal: "Prefabs/UI/Panel/Shop/itemNormal",
    shopSubItemPanel: "Prefabs/UI/Panel/Shop/ShopSubItemPanel",

    // 喵喵补给站面板
    meowDepotPanel: "Prefabs/UI/Panel/MeowDepot/MeowDepotPanel",

    // 结账面板
    checkOutPanel: "Prefabs/UI/Panel/Checkout/CheckoutBoard",

    // 员工板块面板
    employeePanel: "Prefabs/UI/Panel/Employee/EmployeePanel",
    employeePersonalPanel: "Prefabs/UI/Panel/Employee/EmployPersonalPanel",

    // 菜单面板
    menuPanel: "Prefabs/UI/Panel/Menu/MenuPanel",
    // 菜单详情面板
    menuDetailPanel: "Prefabs/UI/Panel/Menu/MenuDetail/MenuDetail",

    // 仓库面板
    warehousePanel: "Prefabs/UI/Panel/WareHouse/WareHousePanel",

    // 研发面板
    foodDiscoverPanel: "Prefabs/UI/Panel/FoodDiscover/FoodDiscoverPanel",
}

// UI节点可能包含的组件类型
export enum COMPTYPE {
    E_NONE = -1,
    E_BUTTON,
    E_LABEL,
    E_SPRITE
}

// UI层级
export enum UILAYER {
    E_PAGE,  // 页面层
    E_WIDGIT,  // 挂件层
    E_PANEL,  // 弹窗层
    E_TIPS,  // 提示层
}
