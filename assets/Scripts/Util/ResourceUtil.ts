/*
 * @Author: Zhong Sheng
 * @Date: 2023-04-05 16:39:30
 * @LastEditors: Zhong Sheng
 * @LastEditTime: 2023-04-21 11:40:00
 * @Description: 动态资源加载工具类
 */

import { Asset, error, resources, Node, log } from "cc";

class ResourceUtil {
    private _assetMap: Map<string, Asset[]> = null;
    private _assetRefCountMap: Map<string, number> = null;

    init() {
        this._assetMap = new Map<string, Asset[]>();
        this._assetRefCountMap = new Map<string, number>();
        console.log("动态资源管理器初始化完成");
    }

    /**
     * @description: 动态加载资源，可同时加载多个资源
     * @param {Node} node
     * @param {string} url
     * @param {typeof} assetType
     * @param {Function} callBackFun
     * @return {*}
     */
    load(node: Node, url: string | string[], assetType: typeof Asset, callBackFun: Function) {
        if (node && url) {
            if (Array.isArray(url)) {
                resources.load(url, assetType, (err, assets: Asset[]) => {
                    if (err) {
                        error(err.message || err);
                        return;
                    }
                    if (this.pushAsset(node, assets)) {
                        callBackFun(assets);
                    }
                });
            } else {
                resources.load(url, assetType, (err, asset: Asset) => {
                    if (err) {
                        error(err.message || err);
                        return;
                    }
                    if (this.pushAsset(node, asset)) {
                        callBackFun(asset);
                    }
                });
            }
        }
    }

    /**
     * @description: 动态加载目录全部资源
     * @param {Node} node
     * @param {string} url
     * @param {typeof} assetType
     * @param {Function} callBackFun
     * @return {*}
     */
    loadDir(node: Node, url: string, assetType: typeof Asset, callBackFun: Function) {
        if (node && url) {
            resources.loadDir(url, assetType, (err, assets: Asset[]) => {
                if (err) {
                    error(err.message || err);
                    return;
                }
                if (this.pushAsset(node, assets)) {
                    callBackFun(assets)
                }
            });
        }
    }

    /**
     * @description: 资源托管
     * @param {Node} node
     * @param {Asset} asset
     * @return {*}
     */
    private pushAsset(node: Node, asset: Asset | Asset[]): boolean {
        if (node && node.isValid) {
            let nodeId: string = node.uuid;
            if (!nodeId || !asset) {
                log(`pushAsset参数不正确:nodeId:${nodeId},asset:${asset}`);
                return false;
            }

            if (asset instanceof Array) {
                for (let ass of asset) {
                    this.extracted(ass, nodeId);
                }
            } else {
                this.extracted(asset, nodeId);
            }

            return true;
        } else {
            if (asset) {
                log(`资源还没加载完就被干掉了`);
                if (asset instanceof Array) {
                    for (let as of asset) {
                        as.decRef();
                    }
                } else {
                    asset.decRef();
                }
            }
            return false;
        }
    }

    private extracted(asset: Asset, nodeId: string) {
        let assetArray: Asset[] = this._assetMap.get(nodeId);
        if (!assetArray) {
            assetArray = [];
        }

        // 同一个节点只增加一次计数
        if (assetArray.indexOf(asset) < 0) {
            asset.addRef();
            assetArray.push(asset);
            this._assetMap.set(nodeId, assetArray);
        }
    }

    /**
     * @description: 释放资源
     * @param {Node} node
     * @param {string} source
     * @return {*}
     */
    releaseAsset(node: Node, source: string) {
        if (node && node.isValid) {
            let nodeId: string = node.uuid;
            if (this._assetMap.has(nodeId)) {
                let assetArray: Asset[] = this._assetMap.get(nodeId);
                for (let ass of assetArray) {
                    log(`释放资源 ${ass.name}`);
                    ass.decRef();
                }
                this._assetMap.delete(nodeId);
            }
        } else {
            error(`无法释放资源:传了个null, 源头:${source}`);
        }
    }


    /**
     * @description: 当前资源种类数量
     * @return {*}
     */
    getSize() {
        return this._assetMap.size;
    }
 
    /**
     * @description: 资源keys
     * @return {*}
     */
    getKeys() {
        return this._assetMap.keys();
    }
}

export default new ResourceUtil();