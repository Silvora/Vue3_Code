import { isObject, isString, ShapeFlags } from "@my-vue/shared"

export const isVnode = (vnode: any) => {
    return vnode.__v_isVNode
}

export const isSameVnode = (n1: any, n2: any) => {
    return n1.type === n2.type && n1.key === n2.key
}


export const Text = Symbol('Text')
export const Fragment = Symbol('Fragment')


export const createVNode = (type: any, props?: any, children?: any) => {
    const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : 0
    const vnode = {
        __v_isVNode: true,
        type,
        props,
        children,
        key: props && props.key,
        el: null,
        shapeFlag
    }


    if(children){
        if(typeof children === 'string' || typeof children === 'number'){
            vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
        } else if(Array.isArray(children)){
            vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
        }
    }

    return vnode
}