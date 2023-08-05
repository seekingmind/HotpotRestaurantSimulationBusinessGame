/*
 * @Author: jhonsion 18166038497@163.com
 * @Date: 2023-05-28 23:06:54
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-06-08 22:35:07
 * @FilePath: \HappyRoadHuoguo\assets\Scripts\Runtime\DeskData.ts
 * @Description: 桌子数据运行时管理
 */

import { log } from 'cc';
import Singleton from '../Base/Singleton';
import { DESK_STATES, SEAT_STATES } from '../Enums/GameEnums';
import { readLocalStorage, writeLocalStorageAsync } from '../Util/CommonUtil';

export interface IDeskData {
    id: number;
    status: DESK_STATES;
    spriteResName: string;
    seatsInfo: ISeatInfo[];
}

interface ISeatInfo {
    seatId: number;
    seatStatus: SEAT_STATES;
    seatSpriteResName: string;
    customerId: string;
}

export class DeskData extends Singleton {
    static get Instance() {
        return super.GetInstance<DeskData>();
    }

    constructor() {
        super();
        this.initDeskData();
    }

    private _playerDeskData: IDeskData[] = [];

    initDeskData() {
        // 从本地存储中读取桌子数据
        let playerDeskData = readLocalStorage('DeskData');
        if (playerDeskData) {
            // 把数据重置，不读取历史的数据了
            for (let i = 0; i < playerDeskData.length; i++) {
                playerDeskData[i].status = DESK_STATES.EMPTY;
                for (let j = 0; j < playerDeskData[i].seatsInfo.length; j++) {
                    playerDeskData[i].seatsInfo[j].seatStatus = SEAT_STATES.EMPTY;
                    playerDeskData[i].seatsInfo[j].customerId = '';
                }
            }
            this._playerDeskData = playerDeskData;
        } else {
            // 初始化桌子数据
            let initDeskData: IDeskData = {
                id: 1,
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

            this._playerDeskData.push(initDeskData);
            this.saveDeskDataToLocal();
        }
    }

    getDeskAll() {
        return this._playerDeskData;
    }

    /**
     * @description: 根据桌子id获取桌子数据
     * @param {number} id
     * @return {*}
     */
    getDeskDataById(id: number) {
        return this._playerDeskData.find((deskData) => {
            return deskData.id == id;
        });
    }

    addDeskData(deskData: IDeskData) {
        this._playerDeskData.push(deskData);
        this.saveDeskDataToLocal();
    }

    /**
     * @description: 根据桌子id更新桌子状态
     * @param {number} id
     * @param {DESK_STATES} status
     * @return {*}
     */
    updateDeskStatusById(id: number, status: DESK_STATES) {
        let deskData = this.getDeskDataById(id);
        if (deskData) {
            deskData.status = status;
        }

        this.saveDeskDataToLocal();
    }

    /**
     * @description: 根据桌子id和座位id更新座位状态
     * @param {number} id
     * @param {number} seatId
     * @param {SEAT_STATES} status
     * @return {*}
     */
    updateDeskSeatStatusById(id: number, seatId: number, status: SEAT_STATES) {
        let deskData = this.getDeskDataById(id);
        if (deskData) {
            let seatInfo = deskData.seatsInfo.find((seatInfo) => {
                return seatInfo.seatId == seatId;
            });
            if (seatInfo) {
                seatInfo.seatStatus = status;
            }
        }

        this.saveDeskDataToLocal();
    }

    /**
     * @description: 根据桌子id和座位id更新座位顾客id
     * @param {number} id
     * @param {number} seatId
     * @param {string} customerId
     * @return {*}
     */
    updateDeskSeatCustomerIdById(id: number, seatId: number, customerId: string) {
        let deskData = this.getDeskDataById(id);
        if (deskData) {
            let seatInfo = deskData.seatsInfo.find((seatInfo) => {
                return seatInfo.seatId == seatId;
            });
            if (seatInfo) {
                seatInfo.customerId = customerId;
            }
        }

        this.saveDeskDataToLocal();
    }

    updateDeskDataById(id: number, deskData: IDeskData) {
        let index = this._playerDeskData.findIndex((deskData) => {
            return deskData.id == id;
        });
        if (index != -1) {
            this._playerDeskData[index] = deskData;
        }

        this.saveDeskDataToLocal();
    }

    /**
     * @description: 根据桌子id更新桌子等级
     * @param {number} id
     * @param {number} level
     * @param {string} spriteResNameDesk
     * @param {string} spriteResNameSeat
     * @return {*}
     */
    updateDeskLevelById(id: number, level: number, spriteResNameDesk: string, spriteResNameSeat: string) {
        let deskData = this.getDeskDataById(id);
        if (deskData) {
            deskData.spriteResName = spriteResNameDesk;
            deskData.seatsInfo.forEach((seatInfo) => {
                seatInfo.seatSpriteResName = spriteResNameSeat;
            });
        }

        this.saveDeskDataToLocal();
    }

    /**
     * @description: 将桌子数据保存到本地存储
     * @return {*}
     */
    saveDeskDataToLocal() {
        writeLocalStorageAsync('DeskData', this._playerDeskData)
            .then(() => {
                log('写入本地存储成功');
            })
            .catch((error) => {
                error('写入本地存储失败:', error);
            });
    }
}


