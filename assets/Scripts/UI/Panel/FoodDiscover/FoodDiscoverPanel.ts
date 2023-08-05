import { _decorator, BlockInputEvents, Color, Component, Label, log, Node, tween, UITransform, Vec3, Animation, AnimationClip } from 'cc';
import { UIBase } from '../../Framework/UIBase';
import { AudioManager } from '../../../Runtime/AudioManager';
import { uiPanelCloseSound, uiPanelOpenSound } from '../../../Util/CommonUtil';
import { DISCOVER_TYPE, GAME_EVENTS } from '../../../Enums/GameEnums';
import { PlayerData } from '../../../Runtime/PlayerData';
import { UILAYER } from '../../Framework/UIDefine';
import EventManager from '../../../Runtime/EventManager';
const { ccclass, property } = _decorator;

@ccclass('FoodDiscoverPanel')
export class FoodDiscoverPanel extends UIBase {
    private _currentDiscoverType = DISCOVER_TYPE.NONE;

    private _sideBarSmallWidth = 95;
    private _sideBarSmallHeight = 60;
    private _sideBarBigWidth = 110;
    private _sideBarBigHeight = 70;

    private _sideBarSmallLabelFontSize = 22;
    private _sideBarBigLabelFontSize = 25;

    private _sideBarSmallLabelColor = new Color(207, 147, 40, 255);
    private _sideBarBigLabelColor = new Color(255, 255, 255, 255);

    private _foodDiscoverTitleStartPos = new Vec3(0, 680, 0);
    private _fourCloverStartPos = new Vec3(480, 446, 0);
    private _hotpotSynthesisElementsStartPos = new Vec3(373, -413, 0);
    private _dishesSynthesisElementsStartPos = new Vec3(373, -413, 0);

    onInit(params: any): void {
        log("FoodDiscoverPanel onInit");

        // 面板关闭按钮点击事件
        this.addButtonClick("CloseBtn", () => {
            AudioManager.inst.playOneShot(uiPanelCloseSound);
            this.closeSelf();
        });

        // 给sidebar 两个按钮添加点击事件
        this.addButtonClick("HotpotSideBarBg", () => {
            this._currentDiscoverType = DISCOVER_TYPE.HOTPOT_SOUP;
            this.showUIByDiscoverType();
        });
        this.addButtonClick("DishesSideBarBg", () => {
            this._currentDiscoverType = DISCOVER_TYPE.DISHES;
            this.showUIByDiscoverType();
        });

        // 研发按钮点击事件
        this.addButtonClick("DevBtn", () => {
            log("研发按钮点击事件");

            // 根据当前的选择要研发的类型，判断不同的资源数量是否足够，够的话，播放对应的研发动画，不够的话，打开仓库面板并给出相应的提示
            this.checkResCountAndPlayAni();
        });
    }

    onEnter(params: any): void {
        log("FoodDiscoverPanel onEnter");

        let bgNode = this.node.getChildByPath("BaseBoard/Bg");
        bgNode.getComponent(BlockInputEvents).enabled = true;

        if (params) {
            if (params != DISCOVER_TYPE.NONE) {
                log("FoodDiscoverPanel params: ", params);
                this._currentDiscoverType = params;
            } else {
                // 默认进入，选择的是菜品
                this._currentDiscoverType = DISCOVER_TYPE.DISHES;
            }
        }

        this.tweenSomeNodes();
        this.showUIByDiscoverType();
        this.updateCloverCount();
    }

    onExit() {
        log("FoodDiscoverPanel onExit");
        let bgNode = this.node.getChildByPath("BaseBoard/Bg");
        bgNode.getComponent(BlockInputEvents).enabled = false;

        // 缓动几个节点到初始位置
        let foodDiscoverTitleNode = this.node.getChildByName("FoodDiscoverTitle");
        tween(foodDiscoverTitleNode).to(0.5, { position: this._foodDiscoverTitleStartPos }, { easing: 'sineOut' }).start();

        let fourCloverNode = this.node.getChildByName("FourLeafClover");
        tween(fourCloverNode).to(0.5, { position: this._fourCloverStartPos }, { easing: 'sineOut' }).start();

        let dishesSynthesisElementsNode = this.node.getChildByName("DishesSynthesisElements");
        tween(dishesSynthesisElementsNode).to(0.5, { position: this._dishesSynthesisElementsStartPos }, { easing: 'sineOut' }).start();
        dishesSynthesisElementsNode.active = false;

        let hotpotSynthesisElementsNode = this.node.getChildByName("HotpotSynthesisElements");
        tween(hotpotSynthesisElementsNode).to(0.5, { position: this._hotpotSynthesisElementsStartPos }, { easing: 'sineOut' }).start();
        hotpotSynthesisElementsNode.active = false;
    }

    start() {

    }

    update(deltaTime: number) {

    }

    /**
     * @description: 根据当前的研发类型，ui做出不同的显示
     * @return {*}
     */
    showUIByDiscoverType() {
        let dishBarBgNode = this.node.getChildByPath("DishesSideBar/DishesSideBarBg");
        let dishBarLabelNode = this.node.getChildByPath("DishesSideBar/DishesName");

        let hotpotBarBgNode = this.node.getChildByPath("HotpotSideBar/HotpotSideBarBg");
        let hotpotBarLabelNode = this.node.getChildByPath("HotpotSideBar/HotpotName");

        let dishesSynthesisElementsNode = this.node.getChildByName("DishesSynthesisElements");
        let hotpotSynthesisElementsNode = this.node.getChildByName("HotpotSynthesisElements");

        let dishesSynthesisResCount = PlayerData.Instance.getPlayerDishesSynthesisResCount();
        let dishesSynResCountNodes = this.node.getChildByName("DishesSynthesisElements").children;

        let hotpotSynthesisResCount = PlayerData.Instance.getPlayerHotpotSynthesisResCount();
        let hotpotSynResCountNodes = this.node.getChildByName("HotpotSynthesisElements").children;

        switch (this._currentDiscoverType) {
            case DISCOVER_TYPE.NONE:
            case DISCOVER_TYPE.DISHES:
                dishBarBgNode.getComponent(UITransform).setContentSize(this._sideBarBigWidth, this._sideBarBigHeight);
                dishBarLabelNode.getComponent(Label).fontSize = this._sideBarBigLabelFontSize;
                dishBarLabelNode.getComponent(Label).color = this._sideBarBigLabelColor;

                hotpotBarBgNode.getComponent(UITransform).setContentSize(this._sideBarSmallWidth, this._sideBarSmallHeight);
                hotpotBarLabelNode.getComponent(Label).fontSize = this._sideBarSmallLabelFontSize;
                hotpotBarLabelNode.getComponent(Label).color = this._sideBarSmallLabelColor;

                dishesSynthesisElementsNode.active = true;
                hotpotSynthesisElementsNode.active = false;

                for (let i = 0; i < dishesSynResCountNodes.length; i++) {
                    const oneNode = dishesSynResCountNodes[i];
                    let oneNodeName = oneNode.name;
                    let oneNodeLabel = oneNode.getChildByName("ElementLeftCount").getComponent(Label);
                    let oneNodeCount = dishesSynthesisResCount[oneNodeName];
                    oneNodeLabel.string = oneNodeCount.toString();
                    if (oneNodeCount == 0) {
                        oneNodeLabel.color = new Color(214, 51, 51, 255);
                    } else if (oneNodeCount > 0) {
                        oneNodeLabel.color = new Color(74, 197, 26, 255);
                    }
                }

                break;
            case DISCOVER_TYPE.HOTPOT_SOUP:
                dishBarBgNode.getComponent(UITransform).setContentSize(this._sideBarSmallWidth, this._sideBarSmallHeight);
                dishBarLabelNode.getComponent(Label).fontSize = this._sideBarSmallLabelFontSize;
                dishBarLabelNode.getComponent(Label).color = this._sideBarSmallLabelColor;

                hotpotBarBgNode.getComponent(UITransform).setContentSize(this._sideBarBigWidth, this._sideBarBigHeight);
                hotpotBarLabelNode.getComponent(Label).fontSize = this._sideBarBigLabelFontSize;
                hotpotBarLabelNode.getComponent(Label).color = this._sideBarBigLabelColor;

                dishesSynthesisElementsNode.active = false;
                hotpotSynthesisElementsNode.active = true;

                for (let i = 0; i < hotpotSynResCountNodes.length; i++) {
                    const oneNode = hotpotSynResCountNodes[i];
                    let oneNodeName = oneNode.name;
                    let oneNodeLabel = oneNode.getChildByName("ResLeftCount").getComponent(Label);
                    let oneNodeCount = hotpotSynthesisResCount[oneNodeName];
                    oneNodeLabel.string = oneNodeCount.toString();
                    if (oneNodeCount == 0) {
                        oneNodeLabel.color = new Color(214, 51, 51, 255);
                    } else if (oneNodeCount > 0) {
                        oneNodeLabel.color = new Color(74, 197, 26, 255);
                    }
                }

                break;
            default:
                break;
        }
    }

    /**
     * @description: 四叶草道具的数量更新
     * @return {*}
     */
    updateCloverCount() {
        let playerOtherProps = PlayerData.Instance.getPlayerOtherProps();
        let cloverData = playerOtherProps.find((oneItem: any) => oneItem.propNameCZ === "四叶草");
        let cloverCount = cloverData.propCount;

        let cloverCountLabelNode = this.node.getChildByPath("FourLeafClover/CloverCount");
        cloverCountLabelNode.getComponent(Label).string = cloverCount.toString();
    }

    /**
     * @description: 指定几个节点缓动到指定位置
     * @return {*}
     */
    tweenSomeNodes() {
        let foodDiscoverTitleNode = this.node.getChildByName("FoodDiscoverTitle");
        tween(foodDiscoverTitleNode).to(0.5, { position: new Vec3(0, 532, 0) }, { easing: 'sineOut' }).start();

        let fourCloverNode = this.node.getChildByName("FourLeafClover");
        tween(fourCloverNode).to(0.5, { position: new Vec3(248, 446, 0) }, { easing: 'sineOut' }).start();

        let dishesSynthesisElementsNode = this.node.getChildByName("DishesSynthesisElements");
        let hotpotSynthesisElementsNode = this.node.getChildByName("HotpotSynthesisElements");
        switch (this._currentDiscoverType) {
            case DISCOVER_TYPE.NONE:
            case DISCOVER_TYPE.DISHES:
                dishesSynthesisElementsNode.active = true;
                hotpotSynthesisElementsNode.active = false;
                break;
            case DISCOVER_TYPE.HOTPOT_SOUP:
                dishesSynthesisElementsNode.active = false;
                hotpotSynthesisElementsNode.active = true;
                break;
            default:
                break;
        }

        tween(dishesSynthesisElementsNode).to(0.5, { position: new Vec3(-342, -413, 0) }, { easing: 'sineOut' }).start();
        tween(hotpotSynthesisElementsNode).to(0.5, { position: new Vec3(-342, -413, 0) }, { easing: 'sineOut' }).start();
    }

    /**
     * @description: 检查当前要研发的资源数量是否足够
     * @return {*}
     */
    checkResCountAndPlayAni() {
        switch (this._currentDiscoverType) {
            case DISCOVER_TYPE.NONE:
            case DISCOVER_TYPE.DISHES:
                let dishesSynthesisResCount = PlayerData.Instance.getPlayerDishesSynthesisResCount();
                if (dishesSynthesisResCount.element1 > 0 && dishesSynthesisResCount.element2 > 0 && dishesSynthesisResCount.element3 > 0) {
                    // 播放研发动画
                    this.node.getChildByName("DevAnimation").active = true;
                    let dishesDevAniNode = this.node.getChildByPath("DevAnimation/DishesSynthesisElements");
                    this.node.getChildByPath("DevAnimation/HotpotSynthesisElements").active = false;
                    let dishAniComp = dishesDevAniNode.getComponent(Animation);
                    this.playAnimation(dishAniComp);
                    this.dealWithResAfterDev();
                } else {
                    // 跳转到仓库面板
                    this.openUI("warehousePanel", undefined, UILAYER.E_PANEL);
                    AudioManager.inst.playOneShot(uiPanelOpenSound);
                    this.closeSelf();
                    // 提示资源不足
                    EventManager.Instance.emit(GAME_EVENTS.FOOD_DISCOVER_TIP, "菜品研发所需资源不足");
                }
                break;
            case DISCOVER_TYPE.HOTPOT_SOUP:
                let hotpotSynthesisResCount = PlayerData.Instance.getPlayerHotpotSynthesisResCount();
                if (hotpotSynthesisResCount.suan > 0 && hotpotSynthesisResCount.tian > 0 && hotpotSynthesisResCount.ku > 0 &&
                    hotpotSynthesisResCount.ku > 0 && hotpotSynthesisResCount.xian > 0) {
                    // 播放研发动画
                    this.node.getChildByName("DevAnimation").active = true;
                    let hotpotDevAniNode = this.node.getChildByPath("DevAnimation/HotpotSynthesisElements");
                    this.node.getChildByPath("DevAnimation/DishesSynthesisElements").active = false;
                    let hotpotAniComp = hotpotDevAniNode.getComponent(Animation);
                    this.playAnimation(hotpotAniComp);
                } else {
                    // 跳转到仓库面板
                    this.openUI("warehousePanel", undefined, UILAYER.E_PANEL);
                    AudioManager.inst.playOneShot(uiPanelOpenSound);
                    this.closeSelf();
                    // 提示资源不足
                    EventManager.Instance.emit(GAME_EVENTS.FOOD_DISCOVER_TIP, "火锅底料研发所需资源不足");
                }
            default:
                break;
        }
    }

    /**
     * @description: 播放动画
     * @param {Animation} ani 动画组件
     * @return {*}
     */    
    playAnimation(ani: Animation) {
        // 目前只有一个动画剪辑
        const dishAniDefaultClip = ani.defaultClip;
        const dishAniDefaultClipState = ani.getState(dishAniDefaultClip.name);
        dishAniDefaultClipState.wrapMode = AnimationClip.WrapMode.Normal;  // 循环方式为一般模式
        dishAniDefaultClipState.speed = 0.8;  // 播放速度
        dishAniDefaultClipState.play();
    }

    dealWithResAfterDev() {

    }
}


