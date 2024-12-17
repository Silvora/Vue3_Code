export * from "./shapeFlags"
export const isObject = (target: any): target is Record<string, any> => {
    return typeof target === 'object' && target !== null && !Array.isArray(target);
};

export const isFunction = (target: any): target is Function => {
    return typeof target === 'function';
}

export const isString = (target: any): target is string => {
    return typeof target === 'string';
}

export const hasOwn = (target: any, key: string) => {
    
    return Object.prototype.hasOwnProperty.call(target, key);
}