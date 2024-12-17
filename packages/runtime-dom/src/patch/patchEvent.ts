const createInvoker = (value:any) => {
    const invoker = (e:any) => {
        invoker.value(e);
    }
    invoker.value = value;
    return invoker
}

export const patchEvent = (el:any, key:any, value:any) => {
    const invokers = el._vei || (el._vei = {});
    const name = key.slice(2).toLowerCase();

    let exist = invokers[name];
    if(value && exist) {
        return exist.value = value
    }

    if (value) {
        const invoker = invokers[name] = createInvoker(value);
        return el.addEventListener(name, invoker);
    } 

    if (exist) {
        el.removeEventListener(name, exist);
        delete invokers[name];
    }
}