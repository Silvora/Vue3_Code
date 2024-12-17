import { isFunction, isObject } from "@my-vue/shared";
import { ReactiveEffect } from "./effect";
import { isReactive } from "./reactive";
import { isRef } from "./ref";

export const traverse = (source:any, depth:any, currentDepth:any = 0,seen:any = new Set()) => {
    if (!isObject(source)) {
        return source;
    }

    if (depth) {
        if (currentDepth < depth) {
            return source;
        }
        currentDepth++;
    }

    if (seen.has(source)) {
        return source;
    }
    //seen.add(source);
    for (let key in source) {
        traverse(source[key], depth, currentDepth, seen);
    }
    return source
}

export const doWatch = (source:any, cb:any, {deep,immediate,once,flush}:any) => {
    let reactiveGetter:any = (source:any) => traverse(source,deep===false?1:undefined);
    let getter:any
    if (isReactive(source)) {
        getter = () => reactiveGetter(source);
    }
    if(isRef(source)){
        getter = () => source.value;
    }
    if (isFunction(source)) {
        getter = () => source;
    }
    
   
    let oldValue:any;
    let clean:any;
    const onCleanup = (fn:any) => {
        clean = () => {
            fn();
            clean = null;
        }
    }
    const job = () => {
        const newValue = effect.run();
        if (clean) {
            clean();
        }
        if (oldValue !== newValue) {
            cb(newValue, oldValue, onCleanup);
        }
        oldValue = newValue
    }

    const effect = new ReactiveEffect(getter, job);

    if(cb){
        if(immediate){
            job();
        }else{
            oldValue = effect.run();
        }
    }else{
        effect.run();
    }

    const unwatch = () => {
        effect.stop();
    }

    return unwatch
}

export const watch = (source:any, cb:any, options?:any) => {
    return doWatch(source,cb,options);
}

export const watchEffect = (source:any,options?:any) => {
    return doWatch(source,null,options);
}

