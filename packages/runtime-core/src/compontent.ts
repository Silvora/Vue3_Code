import { reactive } from "@my-vue/reactivity";
import { hasOwn, isFunction } from "@my-vue/shared";

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

export const publicProperty:any = {
    $attrs: (instance:any) => instance.attrs
}


export const instancePropsProxy = (instance:any) => {
    instance.proxy = new Proxy(instance, {
                get(target, key:any) {
    
                    const { state, props } = target;
                    if(state && hasOwn(state, key)) {
                        return state[key];
                    }else if (props && hasOwn(props, key)) {
                        return props[key];
                    }
                    // else if (attrs && hasOwn(attrs, key)) {
                    //     return attrs[key];
                    // }
                    const getter = publicProperty[key];
                    if (getter) {
                        return getter(target);
                    }
    
                },
                set(target:any, key:any, value:any) {
                    const { state, props } = target;
                    if(state && hasOwn(state, key)) {
                        state[key] = value;
                    }else if (props && hasOwn(props, key)) {
                        // props[key] = value;
                    }
    
                    return true
                }
            })
}


export const createComponentInstance = (vnode:any) => {
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
        // slots: () => {},
        // provide: () => {},
        // inject: () => {},
        // parent: null,
        proxy: null,
        // expose: () => {},
        // refs: {},
        // components: {},
        // ctx: {},
        render: null    
    }
    return instance
}

export const setupComponent = (instance:any) => {
     initProps(instance, instance.vnode.props);
     instancePropsProxy(instance);

     const { data } = instance.vnode.type;
     if (!isFunction(data)) {
         return console.warn("--")
     }
     instance.data = reactive(data.call(instance.proxy));
     instance.render = render;
}

