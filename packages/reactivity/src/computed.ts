import { isFunction } from "@my-vue/shared";
import { ReactiveEffect } from "./effect";
import { trackRefValue, triggerRefValue } from "./ref";


class ComputedRefImpl {
    public _value:any; 
    public effect;
    public dep:any;
    constructor(public getter:any,public setter:any) {
        this.effect = new ReactiveEffect(()=>getter(this._value), () => {
            triggerRefValue(this);
        })
    }
    get value() {
        let dirty = this.effect.dirty;
        if(dirty){
            this._value = this.effect.run();
            trackRefValue(this);
        }
        return this._value;
    }
    set value(newValue) {

        this.setter(newValue);

    }
    
}

export const computed = (option:any) => {
    let isF = isFunction(option)
    let getter
    let setter;
    console.log(option,isF)


    if (isF) {
        getter = option;
        setter = () => { };
    }else {
        getter = option.get;
        setter = option.set;
    }

    return new ComputedRefImpl(getter, setter);
}