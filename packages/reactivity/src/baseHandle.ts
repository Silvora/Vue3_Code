// import { activeEffect } from "./effect";
import {track} from "./reactiveEffect"

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

        // 为什么要使用Reflect?
        // 解决this指向问题
        return Reflect.get(target, key, receiver);
    },
    set(target:any, key:string, value:any, receiver:any) {

        // 触发更新

        return Reflect.set(target, key, value, receiver);
    }
}