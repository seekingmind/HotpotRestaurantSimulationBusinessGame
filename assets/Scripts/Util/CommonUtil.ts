/*
 * @Author: Zhong Sheng
 * @Date: 2023-04-12 03:00:24
 * @LastEditors: jhonsion 18166038497@163.com
 * @LastEditTime: 2023-07-26 01:20:51
 * @Description: 通用的工具方法
 */

import { log, sys } from "cc";

let uiPanelOpenSound: string = "Audio/Sound/uiPanelOpenClick";
let uiPanelCloseSound: string = "Audio/Sound/uiPanelCloseBtn";
let uiShopPanelClickSound: string = "Audio/Sound/sound_ui_nextpage";
let uiPanelUnlockSound: string = "Audio/Sound/sound_ui_unlock";
let uiDiamondFlySound: string = "Audio/Sound/sound_ui_FlyZuanShi";
let sceneUIClickSound: string = "Audio/Sound/sceneUIClick";
let synthesisSuccessSound: string = "Audio/Sound/sound_fusion";

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function randomSleep() {
    let randomTime = Math.floor(Math.random() * (10 - 2 + 1) + 2);
    log('开始等待：' + randomTime + '秒');
    await sleep(randomTime * 1000); // 随机等待1-3秒
    log('结束等待：' + randomTime + '秒');
}

function nowTimeString() {
    let nowTime = new Date();
    let hour = "" + nowTime.getHours();
    let minute = "" + nowTime.getMinutes();
    let second = "" + nowTime.getSeconds();

    hour = hour.length < 2 ? "0" + hour : hour;
    minute = minute.length < 2 ? "0" + minute : minute;
    second = second.length < 2 ? "0" + second : second;

    let timeString = `${nowTime.getFullYear()}-${nowTime.getMonth() + 1}-${nowTime.getDate()} ${hour}:${minute}:${second}`;

    return timeString;
}

// 同步读
function readLocalStorage(localStorageKey) {
    if (sys.platform.indexOf(sys.Platform.WECHAT_GAME) > 0) {
        wx.getStorage({
            key: localStorageKey,
            success(res) {
                const data = res.data;
                if (data === null || data === undefined || data === "") {
                    return;
                } else {
                    return JSON.parse(data);
                }
            }
        });
    } else {
        const localStorageValue = sys.localStorage.getItem(localStorageKey);
        if (localStorageValue === null || localStorageValue === undefined || localStorageValue === "") {
            return;
        } else {
            return JSON.parse(localStorageValue);
        }
    }
}

// 同步写
function writeLocalStorage(localStorageKey, localStorageValue) {
    sys.localStorage.setItem(localStorageKey, JSON.stringify(localStorageValue));
}

// 异步写
function writeLocalStorageAsync(localStorageKey, localStorageValue) {
    return new Promise<void>((resolve, reject) => {
        try {
            if (sys.platform.indexOf(sys.Platform.WECHAT_GAME) > 0) {
                wx.setStorage({
                    key: localStorageKey,
                    data: JSON.stringify(localStorageValue),
                    success() { }
                });
            } else {
                sys.localStorage.setItem(localStorageKey, JSON.stringify(localStorageValue));
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

// 生成唯一ID
function generateUniqueId() {
    let id = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 8; i++) {
        id += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return id;
}

export {
    randomSleep, nowTimeString, readLocalStorage, writeLocalStorage, writeLocalStorageAsync,
    uiPanelOpenSound, uiPanelCloseSound, uiShopPanelClickSound, uiPanelUnlockSound, uiDiamondFlySound, synthesisSuccessSound,
    sceneUIClickSound, generateUniqueId
}
