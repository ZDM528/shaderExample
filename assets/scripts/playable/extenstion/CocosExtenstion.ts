import { instantiate } from "cc";
import { Component, Label, Node } from "cc";

declare module "cc" {
    interface Node {
        getComponentInParent<T extends Component>(type: { prototype: T }): T;

        getOrAddComponent<T extends Component>(type: { prototype: T }): T;
        /**
         * 查找子节点
         * @param childPath 子节点的路径，例如:"Window/CloseButton/Sprite"
         */
        findChild(childPath: string): Node;
        /**
         * 搜索子节点
         * @param name 子节点的名字
         */
        searchChild(name: string): Node;

        enabledAllChild(enabled: boolean, startIndex?: number): void;
        /**
         * 克隆一个子对象
         * @param indexClone 克隆子的索引，默认为0
         */
        instantiateChild(indexClone?: number): Node;
        /**
         * 获得或者克隆一个子对象
         * @param index 获得子对象的索引
         * @param indexClone 克隆子的索引，默认为0
         */
        getOrCreateChild(index: number, indexClone?: number): Node;
        /**
         * 获得或者克隆一个子对象，并且设置active为true
         * @param index 获得子对象的索引
         * @param indexClone 克隆子的索引，默认为0
         */
        getOrCreateAndActiveChild(index: number, indexClone?: number): Node;
    }

    interface Component {
        getOrAddComponent<T extends Component>(type: { prototype: T }): T;
        waitForTime(time: number): Promise<void>;
    }
    interface Label {
        /**
         * 格式化多语言文本。例如：label.format("My name is {0}, and my age is {1}", "hubluesky", 18);
         * 大括号内的数字对应后面params参数对应的索引位置。
         * 此函数只在该节点有@see LocalizeLabel 的时候才有效果。
         * 
         * @param format 格式化的字符串
         * @param params 格式化参数
         */
        format(format: string, ...params: any[]): void;
        /**
         * 更新文本样式。
         * 此函数只在该节点有@see LocalizeLabel 的时候才有效果。
         * @param key 样式的key
         */
        updateStyle(key: string): void;
    }
}

Node.prototype.getComponentInParent = function <T extends Component>(this: Node, type: { prototype: T, new() }): T {
    if (this.parent == null) return null;
    let component = this.getComponent(type);
    if (component != null) return component;
    return this.parent.getComponentInParent(type);
}

Node.prototype.getOrAddComponent = function <T extends Component>(this: Node, type: { prototype: T, new() }): T {
    let component = this.getComponent(type);
    if (component != null) return component;
    return this.addComponent(type);
}

Node.prototype.findChild = function (this: Node, childPath: string): Node {
    if (childPath == null) return null;
    let node = this;
    let nodeNames = childPath.split('/');
    for (let i = 0; i < nodeNames.length; i++) {
        let child = node.getChildByName(nodeNames[i]);
        if (child == null)
            console.warn("GetChildNodeByPath failed", node, nodeNames[i]);
        node = child;
    }
    if (node == null)
        console.warn("GetChildNodeByPath failed", node, nodeNames);
    return node;
}

Node.prototype.searchChild = function (this: Node, name: string): Node {
    let ret: Node = this.getChildByName(name);
    if (ret) return ret;
    for (let i = 0; i < this.children.length; i++) {
        let child: Node = this.children[i];
        ret = child.searchChild(name);
        if (ret) return ret;
    }
    return null;
}

Node.prototype.enabledAllChild = function (this: Node, enabled: boolean, startIndex: number = 0): void {
    for (let i = startIndex; i < this.children.length; i++)
        this.children[i].active = enabled;
}

Node.prototype.instantiateChild = function (this: Node, indexClone: number = 0): Node {
    let child = instantiate(this.children[indexClone]);
    this.addChild(child);
    return child;
}

Node.prototype.getOrCreateChild = function (this: Node, index: number, indexClone: number = 0): Node {
    return index < this.children.length ? this.children[index] : this.instantiateChild(indexClone);
}

Node.prototype.getOrCreateAndActiveChild = function (this: Node, index: number, indexClone: number = 0): Node {
    let child = this.getOrCreateChild(index, indexClone);
    child.active = true;
    return child;
}


Component.prototype.getOrAddComponent = function <T extends Component>(this: T, type: { prototype: T, new() }): T {
    let component = this.getComponent(type);
    if (component != null) return component;
    return this.addComponent(type);
}

Component.prototype.waitForTime = async function <T extends Component>(this: T, time: number): Promise<void> {
    return new Promise<void>((resolve) => this.scheduleOnce(resolve, time));
}

// 有些平台没有console.time和console.timeEnd这两个函数，会导致引擎异常无法正常启动，在这里模拟一下。
if (console.time == null) console.time = function (message?: any, ...optionalParams: any[]): void {
    console.log(message, ...optionalParams);
}
if (console.timeEnd == null) console.timeEnd = function (message?: string, ...optionalParams: any[]) {
    console.log(message, ...optionalParams);
}