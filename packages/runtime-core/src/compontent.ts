import { proxyRefs } from "@my-vue/reactivity";
import { hasOwn, isFunction, ShapeFlags } from "@my-vue/shared";


export let currentInstance:any = null;


export const initProps = (instance:any, propsOptions:any) => {
    let props:any = {};
    let attrs:any = {};
    let op = instance.propsOptions;

    for (const key in propsOptions) {
        if (key in op) {
            props[key] = propsOptions[key];
        } else {
            attrs[key] = propsOptions[key];
        }
    }

    instance.props = props;
    instance.attrs = attrs;
}


export const initSlots = (instance:any, children:any) => {
    if(instance.vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
        instance.slots = children
    }else {
        instance.slots = {}
    }

}

export const publicProperty:any = {
    $attrs: (instance:any) => instance.attrs,
    $slots: (instance:any) => instance.slots,
}


export const instancePropsProxy = (instance:any) => {
    instance.proxy = new Proxy(instance, {
                get(target, key:any) {
    
                    const { state, props, setupState } = target;
                    if(state && hasOwn(state, key)) {
                        return state[key];
                    }else if (props && hasOwn(props, key)) {
                        return props[key];
                    }else if (setupState && hasOwn(setupState, key)) {
                        return setupState[key];
                    }
                    
                    const getter = publicProperty[key];
                    if (getter) {
                        return getter(target);
                    }
    
                },
                set(target:any, key:any, value:any) {
                    const { state, props, setupState } = target;
                    if(state && hasOwn(state, key)) {
                        state[key] = value;
                    }else if (props && hasOwn(props, key)) {
                        props[key] = value;
                    }else if (setupState && hasOwn(setupState, key)) {
                        setupState[key] = value;
                    }
    
                    return true
                }
            })
}


export const createComponentInstance = (vnode:any,parentComponent:any) => {
    const instance:any = {
        data: null,
        vnode,
        subTree: null,
        isMounted : false,
        update: null,
        next: null,
        props: {},
        attrs: {},
        propsOptions: vnode.type.props,
        // emit: () => {},
        slots: () => {},
        provides: parentComponent?parentComponent.provides:Object.create(null),
        // inject: () => {},
        // parent: null,
        proxy: null,
        // expose: () => {},
        // refs: {},
        // components: {},
        // ctx: {},
        render: null,
        setup: null,
        setupState: null,
        exposed: null,
        parent: parentComponent
    }
    return instance
}

export const setupComponent = (instance:any) => {
     initProps(instance, instance.vnode.props);
     initSlots(instance, instance.vnode.children);
     instancePropsProxy(instance);

     const { data, render, setup } = instance.vnode.type;

     if (setup) {
        const  setupContext = {
            attrs: instance.attrs,
            slots: instance.slots,
            expose: (value:any) => {
                instance.exposed = value;
            },
            emit: (event:any, ...args:any) => {
                // instance.emit(event, ...args);
                const handle = instance.vnode.props(event);
                handle && handle(...args);
            }
        }
        setCurrentInstance(instance);
        const setupResult = setup(instance.props, setupContext);
        //  handleSetupResult(instance, setupResult);
        setCurrentInstance(null);
        if (isFunction(setupResult)) {
            instance.render = setupResult;
        }else {
            instance.setupState = proxyRefs(setupResult);
        }
     }

     if (!isFunction(data)) {
         return console.warn("--")
     }else{
        instance.setupState = proxyRefs(data.call(instance.proxy));
     }

     if(!instance.render) {
        instance.render = render;
     }

    //  instance.data = reactive(data.call(instance.proxy));
    //  instance.render = render;
}



export const getCurrentInstance = () => {
    return currentInstance;
}

export const setCurrentInstance = (instance:any) => {
    currentInstance = instance;
}
