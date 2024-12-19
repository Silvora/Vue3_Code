import { isFunction } from "@my-vue/shared";
import { getCurrentInstance } from "./compontent";

export const provide = (key:any, value:any) => {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}

export const inject = (key:any, defaultValue:any) => {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        } else if (defaultValue) {
            if (isFunction(defaultValue)) {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}