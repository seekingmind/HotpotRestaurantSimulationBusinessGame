/*
 * @Author: Zhong Sheng
 * @Date: 2023-04-10 22:30:52
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-08-01 04:10:48
 * @Description: 游戏用到的一些枚举
 */

// 游戏区域枚举
export enum GAME_AREA {
    WAIT_AREA = "WaitingArea",  // 等待区
    HALL = "Hall",  // 大厅
    KITCHEN = "Kitchen",  // 厨房
    PRIVATE_ROOM = "PrivateRoom",  // 包间
    SELF_SERVICE = "SelfService",  // 自助区
}

// 等待区域枚举
export enum WAIT_AREA {
    LEFT = "Left",  // 左边
    RIGHT = "Right",  // 右边
}

// 店铺子项状态枚举
export enum SHOP_SUBITEM_STATS {
    PURCHASED = "PURCHASED",  // 已购买
    INUSE = "INUSE",  // 使用中
    UNPURCHASED = "UNPURCHASED",  // 未购买
    LOCKED = "LOCKED",  // 未解锁
}

// 顾客状态枚举
// 顾客状态： 0:在等待区等待 1：走向等待区 2:走向空桌子 3:点菜 4:等餐中 5:吃饭 6:在结账 7：离开 8:在店外行走
export enum CUSTOMER_STATES {
    IN_WAIT_AREA = 0,
    WALK_TO_WAIT_AREA = 1,
    WALK_TO_DESK = 2,
    ON_THE_SEAT = 3,
    ORDER_FOOD = 4,
    WAITING_FOR_FOOD = 5,
    EATING = 6,
    CHECKOUT = 7,
    LEFT = 8,
    OUTSIDE_WALK = 9,
}

// 员工状态枚举
// 员工状态：0：空闲，1：正在行走 2：点单，3：上菜，4：收拾餐桌，5：结账
export enum EMPLOYEE_STATES {
    IDLE = 0,
    IS_WALKING = 1,
    ORDER_FOOD = 2,
    SERVE_FOOD = 3,
    CLEAN_DESK = 4,
    CHECKOUT = 5,
}

// 员工招聘状态
// 员工招聘状态：UNRECRUITED：未招聘，RECRUITED：已招聘
export enum EMPLOYEE_RECRUITMENT_STATES {
    UNRECRUITED = "UNRECRUITED",
    RECRUITED = "RECRUITED"
}

// 员工面板类型枚举
// 员工面板类型：WAITER：服务员，CASHIER：收银员，PANELIST：配菜员，CHEF：厨师，WELCOMESTAFF：迎宾员
export enum EMPLOYEE_PANEL_TYPE {
    WAITER = "WAITER",
    CASHIER = "CASHIER",
    PANELIST = "PANELIST",
    CHEF = "CHEF",
    WELCOMESTAFF = "WELCOMESTAFF",
}

// 员工执行任务的任务类型
// 任务类型：ORDER_FOOD：点菜，SERVE_FOOD：上菜品，SERVE_HOTPOT：上锅底，CLEAN_DESK：收拾餐桌，CHECKOUT：结账
export enum EMPLOYEE_TASK_TYPE {
    ORDER_FOOD = "ORDER_FOOD",
    SERVE_FOOD = "SERVE_FOOD",
    SERVE_HOTPOT = "SERVE_HOTPOT",
    CLEAN_DESK = "CLEAN_DESK",
    CHECKOUT = "CHECKOUT",
}

// 员工执行的任务的状态
// 任务状态：WAITING：等待中，DOING：执行中，DONE：已完成，CANCLE：已取消
export enum EMPLOYEE_TASK_STATE {
    WAITING = "WAITING",
    DOING = "DOING",
    DONE = "DONE",
    CANCLE = "CANCLE",
}

// 桌子状态枚举
// 桌子状态：0：空闲，1：满客，2：非空闲未满客
export enum DESK_STATES {
    EMPTY = 0,
    FULL = 1,
    NOT_EMPTY_NOT_FULL = 2
}

// 座位状态枚举
// 座位状态：0：空闲，1：占用
export enum SEAT_STATES {
    EMPTY = 0,
    OCCUPIED = 1
}

// 厨房状态枚举
// 厨房状态：0：空闲，1：繁忙
export enum KITCHEN_STATES {
    IDLE = 0,
    BUSY = 1
}

// 游戏事件枚举
export enum GAME_EVENTS {
    CUSTOMER_WALK_TO_HALL_DESK = "CUSTOMER_WALK_TO_HALL_DESK",  // 顾客走向大厅桌子事件
    CUSTOMER_SITE_DOWN = "CUSTOMER_SITE_DOWN",  // 顾客全部落座事件，需要全部顾客落座后才能开始点菜
    ORDER_FOOD_UI_SHOW = "ORDER_FOOD_UI_SHOW",  // 点菜UI显示事件，顾客全部落座后，显示点菜UI
    CUSTOMER_ORDER_FOOD = "CUSTOMER_ORDER_FOOD",  // 顾客点菜事件，这个时候要通知服务员点菜，然后记录顾客点的菜
    EMPLOYEE_IN_DESK = "EMPLOYEE_IN_DESK",  // 服务员到达指定餐桌事件
    SHOW_CUSTOMER_TALK_POP = "SHOW_CUSTOMER_TALK_POP",  // 顾客点菜时，在顾客头上显示说话气泡
    CHECK_CUSTOMER_ORDER_FOOD = "CHECK_CUSTOMER_ORDER_FOOD",  // 检查顾客是否点菜完成事件
    CHECKOUT_CONFIRM_BUTTON_CLICK = "CHECKOUT_CONFIRM_BUTTON_CLICK",  // 结账确认按钮点击事件
    CUSTOMER_ORDER_FOOD_FINISHED = "CUSTOMER_ORDER_FOOD_FINISHED",  // 顾客点菜完成事件
    
    WAITER_TASK_DONE = "WAITER_TASK_DONE",  // 服务员任务完成事件
    WAITER_RECALL = "WAITER_RECALL",  // 服务员召回事件

    KITCHEN_MAKE_FOOD_START = "KITCHEN_MAKE_FOOD_START",  // 厨房做菜事件，顾客点菜结束后，通知厨房做菜
    KITCHEN_MAKE_FOOD_DONE = "KITCHEN_MAKE_FOOD_DONE",  // 厨房做菜完成事件
    EMPLOYEE_IN_SERVE_PLATE = "EMPLOYEE_IN_SERVE_PLATE",  // 服务员到达上菜盘事件
    EMPLOYEE_SERVE_FOOD = "EMPLOYEE_SERVE_FOOD",  // 服务员上菜事件，厨房做菜完成后，通知服务员上菜
    EMPLOYEE_SERVE_FINISH = "EMPLOYEE_SERVE_FINISH",  // 服务员将顾客点的菜送到指定桌子
    
    CHECK_WAITER_IDLE = "CHECK_WAITER_IDLE",  // 检查服务员是否空闲
    CHECK_CASHIER_IDLE = "CHECK_CASHIER_IDLE",  // 检查收银员是否空闲
    CHECK_CHEF_IDLE = "CHECK_CHEF_IDLE",  // 检查厨师是否空闲
    CHECK_PANELIST_IDLE = "CHECK_PANELIST_IDLE",  // 检查配菜员是否空闲
    
    CASHIER_CHECKOUT = "CASHIER_CHECKOUT",  // 收银员结账事件
    
    CUSTOMER_EAT_FOOD = "CUSTOMER_EAT_FOOD",  // 顾客吃饭事件，服务员上菜后，顾客开始吃饭，此时要切换顾客状态以及自身动画
    CUSTOMER_CHECKOUT = "CUSTOMER_CHECKOUT",  // 顾客结账事件，顾客吃饭结束后，通知系统结账
    CUSTOMER_LEAVE = "CUSTOMER_LEAVE",  // 顾客离开事件，顾客结账结束后，通知顾客离开
    EMPLOYEE_CLEAN_DESK = "EMPLOYEE_CLEAN_DESK",  // 服务员清理餐桌事件，顾客离开后，通知服务员清理桌子
    EMPLOYEE_CLEAN_DESK_FINISH = "EMPLOYEE_CLEAN_DESK_FINISH",  // 服务员清理餐桌完成事件

    AREA_CHANGE = "AREA_CHANGE",  // 区域切换事件

    FACILITY_SOCRE_UP = "FACILITY_SOCRE_UP",  // 设施分增加事件
    SERVICE_SCORE_UP = "SERVICE_SCORE_UP",  // 服务分增加事件
    FOOD_SCORE_UP = "FOOD_SCORE_UP",  // 菜品分增加事件
    WAREHOUSE_EVENTS_TIP = "WAREHOUSE_EVENTS_TIP",  // 仓库格子满了事件
    GEN_HOTPOT_RES = "GEN_HOTPOT_RES",  // 生成火锅研发资源事件
    FOOD_DISCOVER_TIP = "FOOD_DISCOVER_TIP",  // 研发菜品事件
}

// 大厅实体添加枚举
export enum HALL_ENTITY_ADD {
    ADD_DESK = "ADD_DESK",  // 添加餐桌
    ADD_EP = "ADD_EP",  // 添加员工
}

// UI点击事件枚举
export enum UI_EVENTS {
    ORDER_FOOD_UI_CLICKED = "ORDER_FOOD_UI_CLICKED",  // 点菜点菜UI事件
    SHOW_CLEAN_UP_DESK_UI = "SHOW_CLEAN_UP_DESK_UI",  // 显示清理餐桌UI
    
    CANCLE_ORDER_FOOD_UI = "CANCLE_ORDER_FOOD_UI",  // 取消点菜UI
    CANCLE_CHECKOUT_UI = "CANCLE_CHECKOUT_UI",  // 取消结账UI
    CANCLE_CLEAN_UP_DESK_UI = "CANCLE_CLEAN_UP_DESK_UI",  // 取消清理餐桌UI

    CASH_ADD_UI = "CASH_ADD_UI",  // 增加现金的UI事件
}

// 菜品类别枚举
export enum MENU_FOOD_TYPE {
    HOTPOT_SOUP = 0,  // 火锅汤底
    HOTPOT_MEAT = 1,  // 肉类
    HOTPOT_VEGETABLE = 2,  // 蔬菜
    HOTPOT_WHEATEN_FOOD = 3,  // 面食
    HOTPOT_FISH = 4,  // 鱼类
    HOTPOT_BALLS = 5,  // 丸子类
    HOTPOT_DRINKS = 6,  // 饮料
}

// 菜单面板类型枚举
export enum MENU_PANEL_TYPE {
    HOTPOT_SOUP = "HOTPOT_SOUP",  // 火锅汤底
    DISHES = "DISHES",  // 菜品
    DIPPING_SAUCE = "DIPPING_SAUCE",  // 蘸料
}

// 火锅锅底类型枚举
export enum HOTPOT_SOUP_TYPE {
    CYHG = "CYHG",  // 川渝火锅
    BPHG = "BPHG",  // 北派火锅
    MNHG = "MNHG",  // 闽南火锅
    JZHG = "JZHG",  // 江浙火锅
    YGHG = "YGHG",  // 云贵火锅
    QTHG = "QTHG",  // 其他火锅
    HOTPOT_ALL = "HOTPOT_ALL",  // 全部火锅
}

// 菜品类型枚举
export enum DISHES_TYPE {
    MEAT_DISHES = "MEAT_DISHES",  // 荤菜
    VEGETABLE_DISHES = "VEGETABLE_DISHES",  // 素菜
    SEA_FOOD_DISHES = "SEA_FOOD_DISHES",  // 海产品
    SNACK_DISHES = "SNACK_DISHES",  // 小吃
    DRINKS = "DRINKS",  // 饮品
    DISHES_ALL = "DISHES_ALL",  // 全部菜品
}

// 蘸料类型枚举
export enum DIPPING_SAUCE_TYPE {
    DIPPING_SAUCE_ALL = "DIPPING_SAUCE_ALL",  // 全部蘸料
}

// 五味类型枚举
export enum WUWEI_TYPE {
    SUAN = "SUAN",  // 酸
    TIAN = "TIAN",  // 甜
    KU = "KU",  // 苦
    LA = "LA",  // 辣
    XIAN = "XIAN",  // 咸
    NONE = ""
}

// 定义一个碰撞分组枚举，与在引擎中设置的碰撞矩阵一致
export enum COLLISION_GROUP {
    DEFAULT = 1 << 0,
    SUAN_ITEM = 1 << 3,
    TIAN_ITEM = 1 << 4,
    KU_ITEM = 1 << 5,
    LA_ITEM = 1 << 6,
    XIAN_ITEM = 1 << 7,
}

// 要研发的是火锅汤底还是菜品
export enum DISCOVER_TYPE {
    HOTPOT_SOUP = "HOTPOT_SOUP",  // 火锅汤底
    DISHES = "DISHES",  // 菜品
    NONE = "NONE",  // 无
}
