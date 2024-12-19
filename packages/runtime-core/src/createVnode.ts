import { isFunction, isObject, isString, ShapeFlags } from "@my-vue/shared"
import { isTeleport } from "./teleport"

export const isVnode = (vnode: any) => {
    return vnode.__v_isVNode
}

export const isSameVnode = (n1: any, n2: any) => {
    return n1.type === n2.type && n1.key === n2.key
}


export const Text = Symbol('Text')
export const Fragment = Symbol('Fragment')


export const createVNode = (type: any, props?: any, children?: any) => {
    const shapeFlag = isString(type) ? ShapeFlags.ELEMENT 
    : isTeleport(type) ? ShapeFlags.TELEPORT
    : isObject(type) ? ShapeFlags.STATEFUL_COMPONENT 
    : isFunction(type) ? ShapeFlags.FUNCTIONAL_COMPONENT : 0
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
        }else if(typeof children === 'object'){
            if(children.__v_isVNode){
                vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
            }
        }
    }

    return vnode
}