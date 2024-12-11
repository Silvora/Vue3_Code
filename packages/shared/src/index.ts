export const isObject = (target: any): target is Record<string, any> => {
    return typeof target === 'object' && target !== null && !Array.isArray(target);
};

export const isFunction = (target: any): target is Function => {
    return typeof target === 'function';
}