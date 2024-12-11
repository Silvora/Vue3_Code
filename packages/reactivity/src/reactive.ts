import { isObject } from "@my-vue/shared";
import { mutableHandlers, ReactiveFlags } from "./baseHandle";

// 响应式对象缓存
const reactiveMap = new WeakMap();

// 创建响应式对象
const createReactiveObject = (target: any) => {
    return new Proxy(target, mutableHandlers);
}

// 转换响应式
export const toReactive = (target: any) => {
    return reactive(target);
}

export const reactive = (target: any) => {

    // 判断是否是对象
    if (!isObject(target)) {
        return target;
    }

    // 判断是否已经是响应式
    if (target[ReactiveFlags.IS_REACTIVE]) {
        return target;
    }

    // 判断是否已经缓存 
    if (reactiveMap.has(target)) {
        return reactiveMap.get(target);
    }

    // 创建响应式
    const proxy = createReactiveObject(target);
     
    // 缓存
    reactiveMap.set(target, proxy);

    return proxy;   
}