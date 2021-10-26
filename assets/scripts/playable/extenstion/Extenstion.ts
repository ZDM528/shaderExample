declare global {
    interface Math {
        TWO_PI: number;
        minmax(min: number, max: number, value: number): number;
        /** 随机正负号，返回-1或者+1 */
        randomSign(): number;
        /** 在min和max范围内随机浮点数 */
        randomRange(min: number, max: number): number;
        /** min:最小值（包含），max:最大值（不包含） */
        randomIntRange(min: number, max: number): number;
        /** start:起始值（包含），end:结束值（包含） */
        randomIntBetween(start: number, end: number): number;
        /** 随机数组里任意一个值 */
        randomArrayValue<T>(array: ReadonlyArray<T>): T;
        /** 随机数组里任意多个值 */
        randomArrayValues<T>(array: ReadonlyArray<T>, count?: number): T[];
        /** 插值，根据比例求出在min和max之间的值 */
        lerp(min: number, max: number, t: number): number;
        /** 反向插值，求出value在min和max之间的比例 */
        inverseLerp(min: number, max: number, value: number): number;
        /** 弧度转角度 */
        radianToDegree(angle: number): number;
        /** 角度转弧度 */
        degreeToRadian(angle: number): number;
        clamp(value: number, min: number, max: number): number;
        /** 把值卡在0到1之间 */
        saturate(v: number): number;
        /** 获得小数部分 */
        fraction(value: number): number;

        /** 合并区间，start 和 end 必须是整数 */
        mergeInterval(start: number, end: number): number;
        /** 拆分区间 */
        splitInterval(value: number): { start: number, end: number };
        /** 从区间里随机一位数，如果不是区间值，则返回该参数值 */
        randomInterval(value: number): number;
        /** 从区间里随机一位整数，如果不是区间值，则返回该参数值 */
        randomIntInterval(value: number): number;

        toHash(value: string): number;
    }

    interface DateConstructor {
        getTimeSeconds(): number;
        getTomorrow(hours?: number, min?: number, sec?: number, ms?: number): Date;
        getTomorrowValue(hours?: number, min?: number, sec?: number, ms?: number): number;
        getTodayValue(hours?: number, min?: number, sec?: number, ms?: number): number;
    }

    interface Array<T> {
        first(): T | null;
        last(): T | null;
        isEmpty(): boolean;
        remove(item: T): T;
        remove(item: T): T;
        removeAt(index: number): T;
        contains(item: T): boolean;
        clear(): void;
    }
    interface ReadonlyArray<T> {
        first(): T | null;
        last(): T | null;
        isEmpty(): boolean;
        contains(item: T): boolean;
    }

    interface StringConstructor {
        isEmptyOrNull(value: string): boolean;
        format(format: string, ...params: any[]): string;
    }

    interface ObjectConstructor {
        createInstance<T>(prototype: Object): T;
        createClass<T>(className: string, ...params: any[]): T;
        instanceOf<T>(instance: any, property: keyof T): instance is T;
        callInterface<T, F extends ObjectFunctions<T>>(object: T, property: F, ...params: Parameters<T[F]>): void;
    }

    interface Function {
        /**
         * 注入一个函数在原函数调用之前调用，如果注入的函数返回值是false，则原函数不会被执行
         * @param func 注入的函数
         */
        before<T extends (...args: any[]) => any>(func: T): any;
        /**
         * 注入一个函数在原函数调用之后调用，如果注入的函数返回值为非空，则代替原函数返回值返回
         * @param func 注入的函数
         */
        after<T extends (...args: any[]) => any>(func: T): any;
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

Math.TWO_PI = Math.PI * 2;

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

Math.randomArrayValues = function <T>(array: ReadonlyArray<T>, count: number = array.length): T[] {
    count = Math.min(count, array.length);
    let temp = Array.from(array);
    let result: T[] = [];
    for (let i = 0; i < count; i++) {
        let index = Math.randomIntRange(0, temp.length);
        result.push(temp[index]);
        temp.removeAt(index);
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

Math.radianToDegree = (angle: number) => {
    return angle / Math.PI * 180;
}

Math.degreeToRadian = (angle: number) => {
    return angle * Math.PI / 180;
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

Date.getTomorrow = (hours: number = 0, min: number = 0, sec: number = 0, ms: number = 0) => {
    var curDate = new Date();
    curDate.setDate(curDate.getDate() + 1);
    curDate.setHours(hours, min, sec, ms);
    return curDate;
}

Date.getTomorrowValue = (hours: number = 0, min: number = 0, sec: number = 0, ms: number = 0) => {
    return Date.getTomorrow(hours, min, sec, ms).valueOf();
}

Date.getTodayValue = (hours: number = 0, min: number = 0, sec: number = 0, ms: number = 0) => {
    var curDate = new Date();
    curDate.setHours(hours, min, sec, ms);
    return curDate.valueOf();
}

// Array
Array.prototype.first = function <T>(this: T[]): T | null {
    return this.length > 0 ? this[0] : null;
}

Array.prototype.last = function <T>(this: T[]): T | null {
    return this.length > 0 ? this[this.length - 1] : null;
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

Object.instanceOf = function <T>(instance: any, property: keyof T): instance is T {
    return property in instance;
}

Object.callInterface = function <T, F extends ObjectFunctions<T>>(object: Object, method: F, ...params: Parameters<T[F]>): void {
    if (Object.instanceOf<T>(object, method)) {
        let func: Function = object[method];
        func.call(object, ...params);
    }
}

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

//---------------------------------------------------------------------------------------------------------------------------
export { }