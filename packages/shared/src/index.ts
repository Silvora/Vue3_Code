export const isObject = (target: any): target is Record<string, any> => {
    return typeof target === 'object' && target !== null && !Array.isArray(target);
};