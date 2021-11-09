import { Component, _decorator } from "cc";

const { property } = _decorator;

/**
 * 这是一个View的基类，用来加载显示View，并且做数据绑定。
 */
export class View extends Component {
    public intialize(...params: any[]): void | Promise<void> { }
}