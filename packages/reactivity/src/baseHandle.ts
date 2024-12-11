// import { activeEffect } from "./effect";
import { isObject } from "@my-vue/shared";
import {track, trigger} from "./reactiveEffect"
import { reactive } from "./reactive";

export enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive'
}


export const mutableHandlers = {
    // receiver: 代理对象
    get(target:any, key:string, receiver:any) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return true;
        }

        // 依赖收集
        // console.log(activeEffect,key)
        track(target,key)

        // 懒触发 内部响应式
        // 为什么要使用Reflect?
        // 解决this指向问题
        let result = Reflect.get(target, key, receiver);
        if(isObject(result)){
            return reactive(result)
        }
 
        return result
    },
    set(target:any, key:string, value:any, receiver:any) {
        let oldValue = target[key];

        let result = Reflect.set(target, key, value, receiver);
        if (oldValue !== value) {
            // 依赖收集 设置新的值
            trigger(target, key, value, oldValue);
        }

        // 触发更新

        return result
    }
}