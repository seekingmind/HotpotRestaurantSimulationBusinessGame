import { _decorator, Component, Node, Size } from 'cc';
const { ccclass, property } = _decorator;

export class Point {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    G: number = 0;   //G = 从起点A，沿着产生的路径，移动到网格上指定方格的移动耗费。
    H: number = 0;   //H = 从网格上那个方格移动到终点B的预估移动耗费
    F: number = 0;   //F = G + H
    father: Point = null;   //这个点的上一个点，通过回溯可以找到起点 
    is_close: boolean = false;   //是否关闭搜索
}

@ccclass('AStar')
export class AStar extends Component {
    static start: Point = null;      //起点
    static end: Point = null;        //终点
    static map: Map<number, Point> = null;   //地图point
    static size: Size = null;    //地图尺寸

    static arr_open: Array<Point> = [];  //开放队列
    static pppp: Point = null;       //执行完寻路，它就有值了，除非没找到

    static is_find = false;    //是否已经找到路线

    /**
     * @description: 获取路线
     * @param {Point} start
     * @param {Point} end
     * @param {Map} map
     * @param {*} Point
     * @param {cc} size
     * @return {*}
     */
    static getRoute(start: Point, end: Point, map: Map<number, Point>, size: Size) {
        //清空上次寻路，并赋值
        this.is_find = false;
        this.arr_open = [];
        this.pppp = null;
        this.start = { ...start };
        this.end = { ...end };
        this.map = new Map<number, Point>();
        map.forEach((value, key) => {
            this.map.set(key, { ...value });       //map 里放的是传过来的对象，使用深拷贝
        });
        this.size = size;
        map.get(this.start.x + this.start.y * this.size.width).G = 0;

        //开始寻路
        let route = new Array<Point>();
        try {
            this.search(this.start);     //内存不够会报错，一般是终点封闭
        } catch (error) {
            console.error("位置不对");
            return route;
        }
        if (this.pppp) {
            this.getFather(this.pppp, route);
        }
        return route;
    }

    /**
     * @description: 寻路
     * @param {Point} point
     * @return {*}
     */
    static search(point: Point) {
        if (point.x == this.end.x && point.y == this.end.y) {
            this.is_find = true;
            this.pppp = point;
            return;
        }
        let arr = this.getAround(point);
        arr.forEach(p => {
            this.setFather(p, point);
        });
        //arr按照F排序 从小到大
        this.arr_open.sort(this.compare);
        //递归继续找
        this.arr_open.forEach((pp, index, arr) => {
            if (pp.is_close) {        //删除没用的
                arr.splice(index, 1);
            }
            if (!this.is_find) {
                this.search(pp);
            }
        });
    }

    /**
     * @description: 获取周围四个点
     * @param {Point} point
     * @return {*}
     */
    static getAround(point: Point) {
        point.is_close = true;
        let arr = new Array<Point>();
        let index: number;
        let p: Point;
        //上
        if (point.y != 0) {     //到顶了，没有上
            index = point.x + (point.y - 1) * this.size.width;
            p = this.map.get(index)
            if (p && !p.is_close) {
                arr.push(this.map.get(index));
                this.arr_open.push(this.map.get(index));    //我也要一份
            }
        }
        //下
        if (point.y + 1 != this.size.height) {        //到底了，没有下
            index = point.x + (point.y + 1) * this.size.width;
            p = this.map.get(index)
            if (p && !p.is_close) {
                arr.push(this.map.get(index));
                this.arr_open.push(this.map.get(index));
            }
        }
        //左
        if (point.x != 0) {            //同理
            index = point.x - 1 + point.y * this.size.width;
            p = this.map.get(index)
            if (p && !p.is_close) {
                arr.push(this.map.get(index));
                this.arr_open.push(this.map.get(index));
            }
        }
        //右
        if (point.x + 1 != this.size.width) {             //同理
            index = point.x + 1 + point.y * this.size.width;
            p = this.map.get(index)
            if (p && !p.is_close) {
                arr.push(this.map.get(index));
                this.arr_open.push(this.map.get(index));
            }
        }
        return arr;
    }

    /**
     * @description: point换父亲,并重新计算G、H、F
     * @param {Point} son
     * @param {Point} father
     * @return {*}
     */
    static setFather(son: Point, father: Point) {
        if (!son.father || son.father.G > father.G) {
            son.father = father;
            son.G = son.father.G + 1;
            son.H = Math.abs(son.x - this.end.x) + Math.abs(son.y - this.end.y);
            son.F = son.G + son.H;
        }
    }

    /**
     * @description: 比较器
     * @param {Point} p1
     * @param {Point} p2
     * @return {*}
     */
    static compare(p1: Point, p2: Point) {
        if (p1.F > p2.F) {
            return 1;
        } else {
            return -1;
        }
    }

    /**
     * @description: 递归获取
     * @param {Point} point
     * @param {Array} route
     * @return {*}
     */
    static getFather(point: Point, route: Array<Point>) {
        let father = point.father;
        if (father) {
            this.getFather(father, route);
        }
        route.push(point);
    }
}


