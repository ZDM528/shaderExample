declare global {
    interface Math {
        /** 半个PI的长度 */
        HALF_PI: number;
        /** 两个PI的长度 */
        TWO_PI: number;
        /** 角度转弧度 */
        DEGREE_TO_RADIAN: number;
        /** 弧度转角度 */
        RADIAN_TO_DEGREE: number;
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
        randomArrayValues<T>(array: ReadonlyArray<T>, count?: number): T[];
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
         * @param lambda 平滑参数，波长
         * @param delayTime 时长
         */
        damp(current: number, target: number, lambda: number, delayTime: number): number;
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
         * 把负数的角度转为正数
         * @param degree 角度
         * @returns 返回0到360之间的角度
         */
        positiveDegree(degree: number): number;
        /**
         * 平滑插值角度
         * @param current 当前值
         * @param target 目标值
         * @param smoothingTime 平滑时长
         * @param maxSpeed 最大旋转速度，即每秒多少度
         * @param delayTime 间隔时长
         */
        dampDegree(current: number, target: number, smoothingTime: number, maxSpeed: number, delayTime: number): number;

        /**
         * 两个弧度之间的增量值。
         * @param current 当前值
         * @param target 目标值
         * @returns 返回-PI到+PI之间的角度
         */
        deltaRadian(current: number, target: number): number;
        /**
         * 把负数的弧度转为正数
         * @param radian 弧度
         * @returns 返回0到 TwoPI 之间的角度
         */
        positiveRadian(radian: number): number;

        /**
         * 平滑插值弧度
         * @param current 当前值
         * @param target 目标值
         * @param smoothingTime 平滑时长
         * @param maxSpeed 最大旋转速度，即每秒多少度
         * @param delayTime 间隔时长
         */
        dampRadian(current: number, target: number, smoothingTime: number, maxSpeed: number, delayTime: number): number;
        /**
         * 两个度数之间的增量值。
         * @param current 当前值
         * @param target 目标值
         * @param pi PI的大小，可以是 PI 也可以是180
         * @param twoPI 两个PI的大小，可以是 PI * 2也可以是360
         */
        deltaAngle(current: number, target: number, pi: number, twoPI: number): number;

        /**
         * 把负数的度数转为正数
         * @param angle 度数
         * @param twoPI 两个PI的大小，可以是 PI * 2也可以是360
         */
        positiveAngle(angle: number, twoPI: number): number;

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
        callInterface<T, F extends ObjectFunctions<T>>(object: T, property: F, ...params: Parameters<T[F]>): void;
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

    type AnyFunction = (...args: any[]) => any;
    type AnyConstructor<T = any> = new (...args: any[]) => T;
    type ObjectExclude<T, E> = { [k in keyof T]: T[k] extends E ? never : k }[keyof T];
    type ObjectInclude<T, E> = { [k in keyof T]: T[k] extends E ? k : never }[keyof T];
    type ObjectProperties<T> = ObjectExclude<T, Function>;
    type ObjectFunctions<T> = ObjectInclude<T, Function>;
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------------
// Math

Math.HALF_PI = Math.PI * 0.5;
Math.TWO_PI = Math.PI * 2;
Math.DEGREE_TO_RADIAN = Math.PI / 180;
Math.RADIAN_TO_DEGREE = 1 / Math.PI * 180;

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


Math.damp = (source: number, target: number, lambda: number, delayTime: number): number => {
    return Math.lerp(source, target, 1 - Math.exp(-lambda * delayTime));
}

Math.deltaDegree = (current: number, target: number): number => {
    return Math.deltaAngle(current, target, 180, 360);
}

Math.positiveDegree = (degree: number): number => {
    return Math.positiveAngle(degree, 360);
}

Math.dampDegree = (current: number, target: number, smoothingTime: number, maxSpeed: number, delayTime: number): number => {
    let a: number = Math.deltaDegree(current, target);
    smoothingTime *= 0.2;
    if (delayTime < smoothingTime)
        a = Math.lerp(0, a, delayTime / smoothingTime);
    maxSpeed *= delayTime;
    if (a > maxSpeed)
        a = maxSpeed;
    else if (a < -maxSpeed)
        a = -maxSpeed;
    return (current + a) % 360;
}

Math.deltaRadian = (current: number, target: number): number => {
    return Math.deltaAngle(current, target, Math.PI, Math.TWO_PI);
}

Math.positiveRadian = (radian: number): number => {
    return Math.positiveAngle(radian, Math.TWO_PI);
}

Math.dampRadian = (current: number, target: number, smoothingTime: number, maxSpeed: number, delayTime: number): number => {
    let a: number = Math.deltaRadian(current, target);
    smoothingTime *= 0.2;
    if (delayTime < smoothingTime)
        a = Math.lerp(0, a, delayTime / smoothingTime);
    maxSpeed *= delayTime;
    if (a > maxSpeed)
        a = maxSpeed;
    else if (a < -maxSpeed)
        a = -maxSpeed;
    return (current + a) % Math.TWO_PI;
}

Math.deltaAngle = (current: number, target: number, pi: number, twoPI: number): number => {
    if (target < current) target += twoPI;
    let d = (target - current) % twoPI;
    let angle = Math.positiveAngle(d, twoPI);
    return angle < pi ? angle : angle - twoPI;
}

Math.positiveAngle = (angle: number, twoPI: number): number => {
    return angle > 0 ? angle : angle + twoPI;
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

Object.hasProperty = function <T>(instance: any, property: keyof T): instance is T {
    return property in instance;
}

Object.callInterface = function <T, F extends ObjectFunctions<T>>(object: Object, method: F, ...params: Parameters<T[F]>): void {
    if (Object.hasProperty<T>(object, method)) {
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