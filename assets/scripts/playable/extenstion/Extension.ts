import { game } from "cc";

declare global {
    interface Math {
        readonly EPSILON: number;
        /** 四分之一PI的长度，即45度 */
        readonly QUARTER_PI: number;
        /** 三分之一PI的长度，即60度 */
        readonly THIRD_PI: number;
        /** 半个PI的长度，即90度 */
        readonly HALF_PI: number;
        /** 两个PI的长度，即360度 */
        readonly TWO_PI: number;
        /** 角度转弧度 */
        readonly DEGREE_TO_RADIAN: number;
        /** 弧度转角度 */
        readonly RADIAN_TO_DEGREE: number;

        /**
         * 浮点数相比，会有误差值检测。
         * @param a 
         * @param b 
         */
        floatEqual(a: number, b: number): boolean;
        /**
         * 对value取最大和最小
         * @param min 最小值
         * @param max 最大值
         * @param value 要取最大最小的值
         * @returns 返回最大最小的结果
         */
        minmax(min: number, max: number, value: number): number;
        /**
         * 随机正负号
         * @returns 返回-1或者+1
         */
        randomSign(): number;
        /**
         * 在min和max范围内随机浮点数
         * @param min 最小值（包含）
         * @param max 最大值（包含）
         * @returns 返回随机结果
         */
        randomRange(min: number, max: number): number;
        /**
         * 随机一个整数
         * @param min 最小值（包含）
         * @param max 最大值（不包含）
         * @returns 返回一个整数值
         */
        randomIntRange(min: number, max: number): number;
        /**
         * 随机一个整数
         * @param start 起始值（包含）
         * @param end 结束值（包含）
         * @returns 返回一个整数值
         */
        randomIntBetween(start: number, end: number): number;
        /**
         * 随机数组里任意一个值
         * @param array 数组
         * @returns 返回数组的一项
         */
        randomArrayValue<T>(array: ReadonlyArray<T>): T;
        /**
         * 随机数组里任意多个值
         * @param array 数组
         * @param count 起始位置
         * @param count 随机数量
         * @returns 返回装了随机项的新数组
         */
        randomArrayValues<T>(array: ReadonlyArray<T>, start: number, count?: number): T[];
        /**
         * 插值，根据比例求出在min和max之间的值
         * @param min 最小值（包含）
         * @param max 最大值（包含）
         * @param t 比例0~1
         * @returns 返回中间值
         */
        lerp(min: number, max: number, t: number): number;
        /**
         * 反向插值，求出value在min和max之间的比例
         * @param min 最小值（包含）
         * @param max 最大值（包含）
         * @param value 中间值
         * @returns 返回中间值在min和max的比例
         */
        inverseLerp(min: number, max: number, value: number): number;
        /**
         * 夹取，把value卡在min和max之间，包含min和max
         * @param value 要夹取的值
         * @param min 最小值（包含）
         * @param max 最大值（包含）
         * @returns 返回夹取后的值
         */
        clamp(value: number, min: number, max: number): number;
        /**
         * 把值卡在0到1之间
         * @param v 要卡的值
         * @returns 返回夹取后的值
         */
        saturate(v: number): number;
        /**
         * 获得小数部分
         * @param value 浮点数
         * @returns 返回小数部分
         */
        fraction(value: number): number;

        /**
         * 合并两个整数，high 和 low 必须是整数
         * @param high 高位数
         * @param low 低位数
         * @returns 返回合并后的值
         */
        mergeInterval(start: number, end: number): number;
        /**
         * 拆分整数，把value拆分成两个整数
         * @param value 合并的值
         * @returns 返回拆分后的高低值
         */
        splitInterval(value: number): { start: number, end: number };
        /** 从区间里随机一位数，如果不是区间值，则返回该参数值 */
        randomInterval(value: number): number;
        /** 从区间里随机一位整数，如果不是区间值，则返回该参数值 */
        randomIntInterval(value: number): number;

        /**
         * 平滑插值
         * @param current 当前值
         * @param target 目标值
         * @param velocity 当前速度，需要外部保存此变量
         * @param smoothTime 到达目标的大约时间，较小的值将快速到达目标，此值必须大于0
         * @param maxSpeed 最大速度，默认为Infinity
         * @param deltaTime 每帧的时长，默认为game.deltaTime
         */
        smoothDamp(current: number, target: number, velocity: { current: number }, smoothTime: number, maxSpeed?: number, deltaTime?: number): number;

        /**
         * Gradually changes an angle given in degrees towards a desired goal angle over time.
         * @param current 当前值
         * @param target 目标值
         * @param velocity 当前速度，需要外部保存此变量
         * @param smoothTime 到达目标的大约时间，较小的值将快速到达目标，此值必须大于0
         * @param maxSpeed 最大速度，默认为Infinity
         * @param deltaTime 每帧的时长，默认为game.deltaTime
         */
        smoothDampDegree(current: number, target: number, velocity: { current: number }, smoothTime: number, maxSpeed?: number, deltaTime?: number): number;

        /**
         * Gradually changes an angle given in degrees towards a desired goal angle over time.
         * @param current 当前值
         * @param target 目标值
         * @param velocity 当前速度，需要外部保存此变量
         * @param smoothTime 到达目标的大约时间，较小的值将快速到达目标，此值必须大于0
         * @param maxSpeed 最大速度，默认为Infinity
         * @param deltaTime 每帧的时长，默认为game.deltaTime
         */
        smoothDampRadian(current: number, target: number, velocity: { current: number }, smoothTime: number, maxSpeed?: number, deltaTime?: number): number;

        /**
         * Loops the value t, so that it is never larger than length and never smaller than 0.
         * @param t 
         * @param length 
         */
        repeat(t: number, length: number): number;

        /**
         * 两个角度之间的增量值。
         * Math.deltaAngle(90, 1080) // 90
         * Math.deltaAngle(15, 194) // 179
         * Math.deltaAngle(15, 196) // -179
         * @param current 
         * @param target 
         * @returns 返回-180到+180之间的角度
         */
        deltaDegree(current: number, target: number): number;

        /**
         * 两个弧度之间的增量值。
         * @param current 当前值
         * @param target 目标值
         * @returns 返回-PI到+PI之间的角度
         */
        deltaRadian(current: number, target: number): number;

        /**
         * 把一个自然数转为整数
         * @example 有一组数 0, 1, 2, 3, 4, 5, 6, 7, 8, 9，经过转换后，变为 0, -1, +1, -2, +2, -3, +3, -4, +4, -5
         * @param index 自然数
         */
        naturalToInteger(index: number): number;
        /**
         * 把一个字符串转成hash
         * @param value 字符串
         * @returns 返回hash值
         */
        toHash(value: string): number;
    }

    interface DateConstructor {
        getTimeSeconds(): number;
    }
    interface Array<T> {
        first: T | null;
        last: T | null;
        at(index: number): T;
        isEmpty(): boolean;
        remove(item: T): T;
        remove(item: T): T;
        removeAt(index: number): T;
        contains(item: T): boolean;
        clear(): void;
    }
    interface ReadonlyArray<T> {
        readonly first: T | null;
        readonly last: T | null;
        isEmpty(): boolean;
        contains(item: T): boolean;
    }

    interface StringConstructor {
        /**
         * 判断字符串是否为null或者为“”
         * @param value 字符串
         * @returns 返回结果
         */
        isEmptyOrNull(value: string): boolean;
        /**
         * 格式化字符串。使用大括号+数字来表示参数。参数起始为0，参数可以不按顺序来。
         * @example
         * let format = "这是一段需要翻译的文本，有{1}，有{0}, 有{2}";
         * let text = String.format(format, "鸡", "鸭", "鹅");
         * text的内容为：这是一段需要翻译的文本，有鸭，有鸡, 有鹅
         * @param format 要格式化的字符串
         * @param params 格式化参数
         * @returns 返回格式化好的字符串
         */
        format(format: string, ...params: any[]): string;
    }

    interface ObjectConstructor {
        /**
         * 深度拷贝对象
         * @param target 目标对象
         * @param source 源对象
         */
        assignDepth<T extends {}, U>(target: T, source: U): T & U;
        /**
         * 根据对象原型创建一个实例
         * @param prototype 对象原型
         * @returns 返回对象实例
         */
        createInstance<T>(prototype: Object): T;
        /**
         * 根据一个全局对象名，创建一个实例，该对象必须是window的一个属性。
         * @param className 对象名称
         * @param params 构造函数参数
         * @returns 返回对象实例
         */
        createClass<T>(className: string, ...params: any[]): T;
        /**
         * 判断一个实例是否有指定的属性或者函数
         * @example
         * interface A {
         *     value: string;
         * }
         * 
         * let b: { value: string };
         * let result = Object.hasProperty<A>(b, "value"); // result is true
         * 
         * @param instance 对象实例
         * @param property 指定的属性或者函数
         * @returns 返回结果
         */
        hasProperty<T>(instance: any, property: keyof T): instance is T;
        // callInterface<T, F extends ObjectFunctions<T>>(object: T, property: F, ...params: Parameters<T[F]>): void;
    }

    interface Function {
        /**
         * 注入一个函数在原函数调用之前调用，如果注入的函数返回值是false，则原函数不会被执行
         * @example
         * Math.abs = Math.abs.before(function (value: number): boolean {
         *     value = value < 0 ? -value : value;
         *     return false;
         * });
         * 
         * @param func 注入的函数
         * @returns 返回注入的函数
         */
        before<T extends (...args: any[]) => any>(func: T): any;
        /**
         * 注入一个函数在原函数调用之后调用，如果注入的函数返回值为非空，则代替原函数返回值返回
         * @example
         * Math.abs = Math.abs.after(function (value: number): void {
         *     value = value < 0 ? -value : value;
         * });
         * 
         * @param func 注入的函数
         * @returns 返回注入的函数
         */
        after<T extends (...args: any[]) => any>(func: T): any;
    }

    interface Console {
        /**
         * 打印带颜色的log
         * @param data log数据
         * @param color log颜色，默认：#00AAEE
         */
        logColor(data: any, color?: string): void;
    }

    type AnyFunction = (...args: any[]) => any;
    type AnyConstructor<T = any> = new (...args: any[]) => T;
    type ObjectExclude<T, E> = { [k in keyof T]: T[k] extends E ? never : k }[keyof T];
    type ObjectInclude<T, E> = { [k in keyof T]: T[k] extends E ? k : never }[keyof T];
    type ObjectProperties<T> = ObjectExclude<T, Function>;
    type ObjectFunctions<T> = ObjectInclude<T, Function>;
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------------
// Math
Object.defineProperties(Math, {
    EPSILON: {
        enumerable: true,
        writable: false,
        value: 0.000001
    },
    QUARTER_PI: {
        enumerable: true,
        writable: false,
        value: Math.PI * 0.25
    },
    THIRD_PI: {
        enumerable: true,
        writable: false,
        value: Math.PI / 3
    },
    HALF_PI: {
        enumerable: true,
        writable: false,
        value: Math.PI * 0.5
    },
    TWO_PI: {
        enumerable: true,
        writable: false,
        value: Math.PI * 2
    },
    DEGREE_TO_RADIAN: {
        enumerable: true,
        writable: false,
        value: Math.PI / 180
    },
    RADIAN_TO_DEGREE: {
        enumerable: true,
        writable: false,
        value: 1 / Math.PI * 180
    },
});

Math.floatEqual = (a: number, b: number) => {
    return Math.abs(a - b) <= Math.EPSILON;
}

Math.minmax = (min: number, max: number, value: number) => {
    return Math.min(max, Math.max(min, value));
}

Math.randomSign = () => {
    return Math.random() < 0.5 ? +1 : -1;
}

Math.randomRange = (min: number, max: number) => {
    return min + Math.random() * (max - min);
}

Math.randomIntRange = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min)) + min;
}

Math.randomIntBetween = (start: number, end: number) => {
    return Math.floor(Math.random() * (end - start + 1)) + start;
}

Math.randomArrayValue = function <T>(array: ReadonlyArray<T>): T {
    let index = Math.randomIntRange(0, array.length);
    return array[index];
}

Math.randomArrayValues = function <T>(array: ReadonlyArray<T>, start: number = 0, count: number = array.length): T[] {
    count = Math.min(count, array.length - start);
    let result: T[] = [];
    let temp: T[] = [];
    for (let i = 0; i < start; i++)
        result[i] = array[i];
    for (let i = 0; i < count; i++)
        temp[i] = array[i + start];

    for (let i = 0; i < count; i++) {
        let index = Math.randomIntRange(0, temp.length);
        result.push(temp[index]);
        temp.splice(index, 1);
    }
    return result;
}

Math.lerp = (start: number, end: number, t: number) => {
    // return start * (1.0 - t) + end * t;
    return (end - start) * t + start;
}

Math.inverseLerp = (min: number, max: number, value: number) => {
    if (Math.abs(max - min) < 0.001) return min;
    return (value - min) / (max - min);
}

Math.clamp = (value: number, min: number, max: number) => {
    return value < min ? min : value > max ? max : value;
}

Math.saturate = (value: number) => {
    return Math.clamp(value, 0, 1);
}

Math.fraction = (angle: number) => {
    return angle - Math.trunc(angle);
}

Math.mergeInterval = (start: number, end: number) => {
    return start << 16 | end & 0xFFFF;
}

Math.splitInterval = (value: number) => {
    return { start: value >> 16, end: value & 0xFFFF };
}

Math.randomInterval = (value: number) => {
    let interval = Math.splitInterval(value);
    return interval.start == 0 ? interval.end : Math.randomRange(interval.start, interval.end);
}

Math.randomIntInterval = (value: number) => {
    let interval = Math.splitInterval(value);
    return interval.start == 0 ? interval.end : Math.randomIntBetween(interval.start, interval.end);
}

Math.smoothDamp = (current: number, target: number, velocity: { current: number }, smoothTime: number, maxSpeed: number = Infinity, deltaTime: number = game.deltaTime): number => {
    // Based on Game Programming Gems 4 Chapter 1.10
    smoothTime = Math.max(0.0001, smoothTime);
    let omega = 2 / smoothTime;

    let x = omega * deltaTime;
    let exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    let change = current - target;
    let originalTo = target;

    // Clamp maximum speed
    let maxChange = maxSpeed * smoothTime;
    change = Math.clamp(change, -maxChange, maxChange);
    target = current - change;

    let temp = (velocity.current + omega * change) * deltaTime;
    velocity.current = (velocity.current - omega * temp) * exp;
    let output = target + (change + temp) * exp;

    // Prevent overshooting
    if (originalTo - current > 0.0 == output > originalTo) {
        output = originalTo;
        velocity.current = (output - originalTo) / deltaTime;
    }

    return output;
}

Math.smoothDampDegree = (current: number, target: number, velocity: { current: number }, smoothTime: number, maxSpeed?: number, deltaTime?: number): number => {
    target = current + Math.deltaDegree(current, target);
    return Math.smoothDamp(current, target, velocity, smoothTime, maxSpeed, deltaTime);
}

Math.smoothDampRadian = (current: number, target: number, velocity: { current: number }, smoothTime: number, maxSpeed?: number, deltaTime?: number): number => {
    target = current + Math.deltaRadian(current, target);
    return Math.smoothDamp(current, target, velocity, smoothTime, maxSpeed, deltaTime);
}

Math.repeat = (t: number, length: number): number => {
    return Math.clamp(t - Math.floor(t / length) * length, 0.0, length);
}

Math.deltaDegree = (current: number, target: number): number => {
    let delta = Math.repeat((target - current), 360);
    if (delta > 180)
        delta -= 360;
    return delta;
}

Math.deltaRadian = (current: number, target: number): number => {
    let delta = Math.repeat((target - current), Math.TWO_PI);
    if (delta > Math.PI)
        delta -= Math.TWO_PI;
    return delta;
}

Math.toHash = (str: string) => {
    // from https://github.com/darkskyapp/string-hash/blob/master/index.js
    let hash = 5381, i = str.length;
    while (i) {
        hash = (hash * 33) ^ str.charCodeAt(--i);
    }
    /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
     * integers. Since we want the results to be always positive, convert the
     * signed int to an unsigned by doing an unsigned bitshift. */
    return hash >>> 0;
};

// Date
Date.getTimeSeconds = () => {
    return Date.now() / 1000;
}

// Array
Object.defineProperties(Array.prototype, {
    first: {
        enumerable: true,
        configurable: true,
        get(): any { return this[0]; },
        set(v: any): void {
            this[0] = v;
        }
    },
    last: {
        enumerable: true,
        configurable: true,
        get(): any { return this[this.length - 1]; },
        set(v: any): void {
            this[this.length - 1] = v;
        }
    },
});

// Array
if (Array.prototype.at == null) {
    Array.prototype.at = function <T>(this: T[], index: number): T {
        if (index < 0) return this[this.length + index];
        return this[index];
    }
}

Array.prototype.isEmpty = function <T>(this: T[]): boolean {
    return this.length == 0;
}

Array.prototype.remove = function <T>(this: T[], item: T): T {
    let index = this.indexOf(item);
    if (index == -1) return null;
    return this.splice(index, 1)[0];
}

Array.prototype.removeAt = function <T>(this: T[], index: number): T {
    return this.splice(index, 1)[0];
}

Array.prototype.contains = function <T>(this: T[], item: T): boolean {
    return this.indexOf(item) != -1;
}

Array.prototype.clear = function <T>(this: T[]): void {
    this.length = 0;
}

// String
String.isEmptyOrNull = (value: string) => {
    return value == null || value == "";
}

String.format = (format: string, ...params: any[]) => {
    return format.replace(/{(\d+)}/g, function (match, number) {
        return typeof params[number] != 'undefined' ? params[number] : match;
    });
};

// Object
Object.assignDepth = function <T extends {}, U>(target: T, source: U): T & U {
    let result = Object.assign({}, target, source);
    for (let key of Object.keys(source)) {
        let sourceValue = source[key];
        if (sourceValue == null || typeof sourceValue !== "object" || Array.isArray(sourceValue)) continue;
        let targetValue = target[key];
        if (targetValue == null) continue;
        result[key] = Object.assignDepth(targetValue, sourceValue);
    }
    return result;
}

Object.createInstance = function <T>(prototype: Object): T {
    let newInstance: T = Object.create(prototype);
    return newInstance.constructor.apply(newInstance);
}

Object.createClass = function <T>(className: string, ...params: any[]): T {
    let newClass: any = new (<any>window)[className](params);
    return newClass;
    // let instance = Object.create(window[className].prototype);
    // instance.constructor.apply(instance, params);
    // return instance;
}

Object.hasProperty = function <T>(instance: any, property: keyof T): instance is T {
    return property in instance;
}

// Object.callInterface = function <T, F extends ObjectFunctions<T>>(object: Object, method: F, ...params: Parameters<T[F]>): void {
//     if (Object.hasProperty<T>(object, method)) {
//         let func: Function = object[method];
//         func.call(object, ...params);
//     }
// }

// if (Object["values"] == null) {
//     Object["values"] = function (o: {}): any[] {
//         return Object.keys(o).map((key) => o[key]);
//     }
// }

// Function
Function.prototype.before = function <T extends (...args: any[]) => any>(func: T) {
    let __self = this;
    return function (...args: any[]) {
        if (func.apply(this, args) === false) return undefined;
        return __self.apply(this, args);
    };
}

Function.prototype.after = function <T extends (...args: any[]) => any>(func: T) {
    let __self = this;
    return function (...args: any[]): any {
        let result = __self.apply(this, args);
        return func.apply(this, args) || result;
    }
}

// const oldLog = console.log;
// console.log = function (...data: any[]): void {
//     oldLog(...data);
//     let frames = -1;
//     let color = '#eeeeee';
//     let apartLine = '_'.repeat(100);
//     return function (...args) {
//         if (director._totalFrames != frames) {
//             frames = cc.director._totalFrames;
//             if (cc.sys.isBrowser) {
//                 orgFunc(`%c${apartLine}`, `color:${color}; background:${color}`);
//             } else {
//                 orgFunc(apartLine);
//             }
//         }
//         return orgFunc(...args)
//     }
// }

console.logColor = function (data: any, color: string = "#00AAEE"): void {
    console.log(`%c${data}`, `color:${color}`);
}

//---------------------------------------------------------------------------------------------------------------------------
export { }