/*
 * @Author: Zhong Sheng
 * @Date: 2023-05-07 00:28:55
 * @LastEditors: Zhong Sheng
 * @LastEditTime: 2023-05-07 00:32:07
 * @Description: 
 */

import { Component, Label, log } from "cc";

export default class UIUtils {
    static refreshComponent(oldValue:any, newValue:any, component:Component) {
        log("UIUtils.refreshComponent");

        if (component instanceof Label) {  // 更新label组件的文本内容
            component.string = newValue;
        }

        //TODO：后续可以添加其他组件的更新
    }
}
