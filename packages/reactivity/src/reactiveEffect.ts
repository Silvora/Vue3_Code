import { activeEffect } from "./effect"

// effect依赖收集
export const track = (target:any, key:any) => {
    if(activeEffect){
        console.log("ccccc",key,activeEffect)
    }
}