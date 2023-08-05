/*
 * @Author: Zhong Sheng
 * @Date: 2023-04-08 20:28:49
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-07-11 11:25:39
 * @Description: 员工
 */
import { _decorator, Component, log, resources, sp, Vec3 } from 'cc';
const { ccclass } = _decorator;

@ccclass('Employee')
export class Employee extends Component {

    public employeeConfigData: any = null;

    public employeeRuntimeData: any = null;

    protected checkEmployeeState: any = null;

    private _baseSkeletonPath = "Skele/Employee/";

    protected _targetDeskRuntimeData: any = null;
    protected _speed = 100;
    protected _bornPosToIdlePosPath: any = null;

    protected _moveToDeskPath: any = null;
    protected _moveToKitchenPath: any = null;
    protected _moveKitchenToDeskPath: any = null;

    protected _currentPathIndex = 0;
    protected _currentPosition: Vec3 = null;
    protected _targetPosition: Vec3 = null;

    protected _isMovingToIdlePos: boolean = false;
    protected _isMovingToDesk: boolean = false;
    protected _isLeavingFromDesk: boolean = false;
    protected _isMovingToKitchen: boolean = false;
    protected _isLeavingFromKitchen: boolean = false;

    start() {
        this._currentPosition = this.node.position;
        this._isMovingToDesk = true;

        this.initEvent();
    }

    update(dt: number) {}

    /**
     * @description: 初始化员工配置数据
     * @param {any} data
     * @return {*}
     */
    public initConfigData(data: any) {
        this.employeeConfigData = data;
    }

    /**
     * @description: 初始化员工运行时数据
     * @param {any} data
     * @return {*}
     */
    public initRuntimeData(data: any) {
        this.employeeRuntimeData = data;
    }

    /**
     * @description: 初始化视图
     * @return {*}
     */
    protected initView() {
        this.node.position = new Vec3(this.employeeConfigData.startPosition[0],
            this.employeeConfigData.startPosition[1], this.employeeConfigData.startPosition[2]);

        this._targetPosition = new Vec3(this._bornPosToIdlePosPath.movePoints[0].x, this._bornPosToIdlePosPath.movePoints[0].y,
            this._bornPosToIdlePosPath.movePoints[0].z);

        this._isMovingToIdlePos = true;
        this.node.eulerAngles = new Vec3(0, 180, 0);

        // 加载员工骨骼资源
        this.loadSkeleton();
    }

    /**
     * @description: 初始化事件
     * @return {*}
     */
    protected initEvent() {}

    /**
     * @description: 初始化员工移动路径
     * @return {*}
     */
    protected initMovePath() {}

    /**
     * @description: 员工从出生点移动到空闲点
     * @param {number} dt
     * @return {*}
     */
    moveToIdlePos(dt: number) {}

    /**
     * @description: 员工移动到桌子指定位置
     * @param {number} dt
     * @return {*}
     */
    moveToDesk(dt: number) {}

    /**
     * @description: 员工离开目标桌子
     * @param {number} dt
     * @return {*}
     */
    leftFromDesk(dt: number) {}

    /**
     * @description: 员工端到菜后，从厨房移动到指定桌子
     * @param {number} dt
     * @return {*}
     */
    leftFromKitchenToDesk(dt: number) {}

    /**
     * @description: 员工按照路径点移动到厨房
     * @param {number} dt
     * @return {*}
     */
    moveToKitchen(dt: number) {}

    /**
     * @description: 加载骨骼资源
     * @return {*}
     */
    loadSkeleton() {
        let skeletonName = this.employeeConfigData.skeletonResName;
        resources.load(this._baseSkeletonPath + skeletonName, sp.SkeletonData, (err, skeletonData) => {
            if (err) {
                log(err);
                return;
            }

            this.node.getComponent(sp.Skeleton).skeletonData = skeletonData;
            this.node.getComponent(sp.Skeleton).setAnimation(0, "move", true);
        });
    }

    /**
     * @description: 从员工任务中心获取任务
     * @return {*}
     */    
    getTaskFromEpTaskCenter() {}

    /**
     * @description: 检查员工是否空闲
     * @return {*}
     */    
    checkEpIdle() {}
}


