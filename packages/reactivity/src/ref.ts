import { activeEffect, trackEffect, triggerEffects } from "./effect";
import { toReactive } from "./reactive";
import { createDep } from "./reactiveEffect";


// 依赖收集
export const trackRefValue = (ref:any) => {
    if (activeEffect) {
        let dep = ref.dep || createDep(()=>(ref.dep = undefined),"undefined")
        trackEffect(activeEffect, ref["dep"] = dep);
    }
}

// 更新数据
export const triggerRefValue = (ref:any) => {
    let dep = ref.dep;
    if (dep) {
        triggerEffects(dep);
    }
}

class ObjectRefImpl {
    // ref标识
    public __v_isRef = true;
    // 响应式值
    public _value:any;
    // 搜集依赖
    public dep:any;
    constructor(public object:any,public key:any) {
    }
    get value() {
        return this.object[this.key];
    }
    set value(newValue) {
        this.object[this.key] = newValue;
    }

}

class RefImpl {
    // ref标识
    __v_isRef = true;
    // 响应式值
    _value:any;
    // 搜集依赖
    dep:any;
    constructor(public rawValue:any) {
        this._value = toReactive(rawValue);
    }

    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        if (this._value !== newValue) {
            this.rawValue = newValue;
            this._value = newValue;
            triggerRefValue(this);
        }
    }
}

const createRef = (value:any) => {
    return new RefImpl(value);
}

// ref响应式对象
export const ref = (value:any) => {
    return createRef(value);
}

// toRef 基于响应式对象上的一个属性，创建一个对应的 ref
export const toRef = (target:any,key:any) => {
    return new ObjectRefImpl(target,key);
}

// toRefs 将一个响应式对象转换为一个普通对象
export const toRefs = (obj:any) => {
    const ret:any = {};
    for (const key in obj) {
        ret[key] = toRef(obj,key);
    }
    return ret;
}

// 返回参数本身
export const unref = (ref:any) => {
    console.log("--------",ref)
    return isRef(ref) ? ref.value : ref;
}

// 判断是否是ref
export const isRef = (ref:any) => {
    return !!ref.__v_isRef;
}

export const proxyRefs = (obj:any) => {
    return new Proxy(obj, {
        get(target, key, receiver) {
            return unref(Reflect.get(target, key, receiver));
        },
        set(target, key, value, receiver) {
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value;
            }
            return Reflect.set(target, key, value, receiver);
        }
    });
}