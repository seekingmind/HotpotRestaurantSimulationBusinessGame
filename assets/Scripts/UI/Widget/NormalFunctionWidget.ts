import { _decorator, Component, log, Node } from 'cc';
import { UIBase } from '../Framework/UIBase';
const { ccclass, property } = _decorator;

@ccclass('NormalFunctionWidget')
export class NormalFunctionWidget extends UIBase {
    onInit(params: any): void {
        log("NormalFunctionWidget onInit");
    }
}


