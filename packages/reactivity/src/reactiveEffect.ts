import { activeEffect, trackEffect, triggerEffects } from "./effect"

// 存放依赖收集关系
const targetMap = new WeakMap();  
// {
//     {a:1,b:2}:{a:{effect},b:{effect,effect}}
// }

export const createDep = (cleanup:any,key:any) => {
    
    const dep:any = new Map();
    dep.cleanup = cleanup;
    dep.name = key

    return dep
}



// effect依赖收集
export const track = (target:any, key:any) => {
    if(activeEffect){

        let depsMap = targetMap.get(target);

        if(!depsMap){
            // 新增
            depsMap = new Map();
            targetMap.set(target, depsMap);
        }

        let dep = depsMap.get(key);

        if(!dep){
            dep = createDep(() => {
                depsMap.delete(key);
            },key)
            depsMap.set(key,dep);
        }

        // 根据值的变化,触发effect
        trackEffect(activeEffect,dep);

    }
}


export const trigger = (target:any, key:any, value:any, oldValue:any) => {
    
    const depsMap = targetMap.get(target);
    if(!depsMap){
        return;
    }

    const dep = depsMap.get(key);
    if(!dep){
        return;
    }

    triggerEffects(dep);
    dep.cleanup();
    
}