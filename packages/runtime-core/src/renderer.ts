// eslint-disable no-unused-vars
import { hasOwn, ShapeFlags } from "@my-vue/shared";
import { Fragment, Text, isSameVnode } from "./createVnode";
import { reactive, ReactiveEffect } from '@my-vue/reactivity';
import { queueJob } from "./scheduler";
import { createComponentInstance, setupComponent } from "./compontent";
import { invokeHooks } from "./lifecycle";


export const createRenderer = (renderOptions:any) => {
    
    const {
        insert: hostInsert,
        remove: hostRemove,
        setElementText: hostSetElementText,
        setText: hostSetText,
        patchProp: hostPatchProp,
        createElement: hostCreateElement,
        createText: hostCreateText,
        createComment: hostCreateComment,
        parentNode: hostParentNode,
        nextSibling: hostNextSibling,
        querySelector: hostQuerySelector,
    } = renderOptions

    const unmount = (vnode:any) => {
        if (vnode.type === Fragment) {
            unmountChildren(vnode.children);
        }else if (vnode.shapeFlag & ShapeFlags.COMPONENT) {
            unmount(vnode.component.subTree);
        }else if (vnode.shapeFlag & ShapeFlags.TELEPORT) {
            vnode.type.remove(vnode, unmount);
        }else{
            hostRemove(vnode.el)
        }
    }
    const unmountChildren = (children:any) => {
        children.forEach((v:any) => {
            unmount(v);
        });
    }
    const mountChildren = (children:any, container:any, parentComponent:any) => {
        children.forEach((v:any) => {
            patch(null, v, container,parentComponent);
        });
    }

    const mountElement = (vnode:any, container:any, anchor:any, parentComponent:any) => {
       const {type, props, children, shapeFlag} = vnode;

       const el = hostCreateElement(type);
       if (props) {
           for (const key in props) {
               hostPatchProp(el, key, null, props[key]);
           }
       }
       if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
           hostSetElementText(el, children);
       } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
           mountChildren(children, el, parentComponent);
       }
       hostInsert(el, container, anchor);
       vnode.el = el
    }

    const patchProps = (oldProps:any, newProps:any, el:any) => {
        for (const key in newProps) {
            hostPatchProp(el, key, oldProps[key], newProps[key]);
        }
        for (const key in oldProps) {
            if (!(key in newProps)) {
                hostPatchProp(el, key, oldProps[key], null);
            }
        }
    }

    const processElement = (n1:any, n2:any, container:any,anchor:any, parentComponent:any) => {
        if (n1 == null) {
            mountElement(n2, container, anchor, parentComponent);
        }else {
            patchElement(n1, n2, container, parentComponent);
        }
    }
    const patchKeyedChildren = (c1:any, c2:any, container:any) => {
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = c2.length - 1;
        function isSomeVnodeSameVnode(n1:any, n2:any) {
            return isSameVnode(n1, n2)
        }
        // 1. 同时向前遍历
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSomeVnodeSameVnode(n1, n2)) {
                patch(n1, n2, container);
            } else {
                break;
            }
            i++;
        }
        // 2. 同时向后遍历
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSomeVnodeSameVnode(n1, n2)) {
                patch(n1, n2, container);
            } else {
                break;
            }    
            e1--;
            e2--;
        }
        // 3. 新的比老的多
        if (i > e1) {
            let nextPos = e2 + 1;
            let anchor = c2[nextPos]?.el;

            while (i <= e2) {
                patch(null, c2[i], container, anchor);
                i++;
            }
        } else if (i > e2) {
            // 4. 老的比新的多
            while (i <= e1) {
                unmount(c1[i]);
                i++;
            }   
        }else {
            // 5. 中间对比
            let s1 = i;
            let s2 = i;
            let patched = 0;
            const toBePatched = e2 - s2 + 1;
            let moved = false;
            let maxNewIndexSoFar = 0;
            const newIndexToOldIndexMap = new Map();
            for (let i = 0; i < toBePatched; i++) {
                const nextChild = c2[s2 + i];
                newIndexToOldIndexMap.set(nextChild.key, s2 + i);
            }
            for (let i = 0; i < toBePatched; i++) {
                const prevChild = c1[s1];
                const nextChild = c2[s2];
                if (isSameVnode(prevChild, nextChild)) {
                    patch(prevChild, nextChild, container);
                    patched++;
                    s1++;
                    s2++;
                } else {
                    const nextIndex = newIndexToOldIndexMap.get(nextChild.key);
                    if (nextIndex === undefined) {
                        unmount(prevChild);
                    } else {
                        if (nextIndex > maxNewIndexSoFar) {
                            maxNewIndexSoFar = nextIndex;
                        } else {
                            moved = true;
                        }
                        if (moved) {
                            hostInsert(nextChild.el, container, c2[nextIndex - 1].el);
                        }
                        patch(prevChild, nextChild, container);
                        patched++;
                    }
                    newIndexToOldIndexMap.set(nextChild.key, s2);
                    s1++;
                    s2++;
                }
            }
            if (patched) {
                console.log('patched', patched);
            }
        }


    }

    const patchChildren = (n1:any, n2:any, container:any, parentComponent:any) => {
        const prevShapeFlag = n1.shapeFlag;
        const nextShapeFlag = n2.shapeFlag;
        const c1 = n1.children;
        const c2 = n2.children;
        if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                unmountChildren(n1.children);
            }
            if (c1 !== c2) {
                hostSetElementText(container, c2);
            }
        } else {
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(container, '');
            }
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN && nextShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                patchKeyedChildren(c1, c2, container);
            }else {
                if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                    unmountChildren(c1);
                }
                if (nextShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                    mountChildren(c2, container, parentComponent);
                }
            }
            
        }
    }

    const patchElement = (n1:any, n2:any, container:any, parentComponent:any) => {
        const oldProps = n1.props || {};
        const newProps = n2.props || {};
        const el = n2.el = n1.el;
        patchProps(oldProps, newProps, el);

        patchChildren(n1, n2, el,parentComponent);
       
    }

    const processText = (n1:any, n2:any, container:any) => {
        if (n1 == null) {
            hostInsert((n2.el = hostCreateText(n2.children)), container, null);
        }else {
            const el = n2.el = n1.el;
            if (n1.children !== n2.children) {
                hostSetText(el, n2.children);
            }
        }
    }
    
    const processFragment = (n1:any, n2:any, container:any, anchor:any, parentComponent:any) => {
        if (n1 == null) {
            mountChildren(n2.children, container, parentComponent);
        }else {
            patchChildren(n1, n2, container, parentComponent);
        }
    }
    // const initProps = (instance:any, propsOptions:any) => {
    //     let props:any = {};
    //     let attrs:any = {};
    //     let op = instance.propsOptions;

    //     for (const key in propsOptions) {
    //         if (key in op) {
    //             props[key] = propsOptions[key];
    //         } else {
    //             attrs[key] = propsOptions[key];
    //         }
    //     }

    //     instance.props = props;
    //     instance.attrs = attrs;
    // }

    const updateComponentPreRender = (instance:any, nextVNode:any) => {
        instance.vnode = nextVNode;
        instance.next = nextVNode;
    }


    const setupRenderEffect = (instance:any, vnode:any, container:any, anchor:any) => {
        const { render } = instance;
        const componentUpdateFn:any = () => {
            const { beforeMount, mounted } = instance;
            if (!instance.isMounted) {

                if (beforeMount) {
                    invokeHooks(beforeMount);
                }

                instance.isMounted = true;
                const subTree = render.call(instance.proxy, instance.proxy);
                patch(null, subTree, container, anchor);
                instance.subTree = subTree;

                if (beforeMount) {
                    invokeHooks(mounted);
                }

            }else {
                const { next,beforeUpdate, update } = instance;
                if(next) {
                    updateComponentPreRender(instance, next);
                }
                if (beforeUpdate) {
                    invokeHooks(beforeUpdate);
                }

                const subTree = render.call(instance.proxy, instance.proxy);
                patch(instance.subTree, subTree, container, anchor);
                instance.subTree = subTree;

                if (update) {
                    invokeHooks(update);
                }
            }
        }
    
        const update = () => {

            instance.update = () => effect.run()
        }
        const effect = new ReactiveEffect(componentUpdateFn, ()=>queueJob(update));
        update();
    } 
    const mountComponent = (vnode:any, container:any, anchor:any, parentComponent:any) => {

        const instance = createComponentInstance(vnode,parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, vnode, container, anchor);
        // const { data = () => {}, render, props:propsOptions = {} } = n2.type
        // const state = reactive(data());
        // const instance:any = {
        //     state,
        //     vnode: n2,
        //     subTree: null,
        //     isMounted : false,
        //     update: null,
        //     next: null,
        //     props: {},
        //     attrs: {},
        //     propsOptions,
        //     // emit: () => {},
        //     // slots: () => {},
        //     // provide: () => {},
        //     // inject: () => {},
        //     // parent: null,
        //     proxy: null,
        //     // expose: () => {},
        //     // refs: {},
        //     // components: {},
        //     // ctx: {},
        // }

        // const publicProperty:any = {
        //     $attrs: (instance:any) => instance.attrs
        // }

        // n2.component = instance;

        // initProps(instance, propsOptions);
        // instance.proxy = new Proxy(instance, {
        //     get(target, key:any) {

        //         const { state, props } = target;
        //         if(state && hasOwn(state, key)) {
        //             return state[key];
        //         }else if (props && hasOwn(props, key)) {
        //             return props[key];
        //         }
        //         // else if (attrs && hasOwn(attrs, key)) {
        //         //     return attrs[key];
        //         // }
        //         const getter = publicProperty[key];
        //         if (getter) {
        //             return getter(target);
        //         }

        //     },
        //     set(target:any, key:any, value:any) {
        //         const { state, props } = target;
        //         if(state && hasOwn(state, key)) {
        //             state[key] = value;
        //         }else if (props && hasOwn(props, key)) {
        //             // props[key] = value;
        //         }

        //         return true
        //     }
        // })


        // const componentUpdateFn:any = () => {
        //     if (!instance.isMounted) {
        //         instance.isMounted = true;
        //         const subTree = render.call(state, state);
        //         patch(null, subTree, container, anchor);
        //         instance.subTree = subTree;
        //     }else {
        //         const subTree = render.call(state, state);
        //         patch(instance.subTree, subTree, container, anchor);
        //         instance.subTree = subTree;

        //     }
        // }

        

        // const update = () => {
        //     instance.update = () => effect.run()
        // }
        // const effect = new ReactiveEffect(componentUpdateFn, ()=>queueJob(update));
        // update();
    }
    const shouldUpdateComponent = (n1:any, n2:any) => {
        const { props: prevProps } = n1;
        const { props: nextProps } = n2;
        for (const key in nextProps) {
            if (nextProps[key] !== prevProps[key]) {
                return true
            }
        }
        return false
    }
    const updateComponent = (n1:any, n2:any) => {
        const instance = n2.component = n1.component;

        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2;
            instance.update();
        }
    }

    const processComponent = (n1:any, n2:any, container:any, anchor:any, parentComponent:any) => {
        if (n1 == null) {
            mountComponent(n2, container, anchor, parentComponent);
        }else {
            updateComponent(n1, n2);
        }
    }

    const isOn = (key:any) => key.startsWith('on');


    const patch = (n1:any, n2:any, container:any, anchor?:any, parentComponent?:any) => {
        // n1 旧节点 n2 新节点
        if (n1 === n2) {
            return;
        }

        if (n1 && !isSameVnode(n1, n2)) {
            unmount(n1);
            n1 = null;
        }

        const  { type,ShapeFlags, ref } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, anchor, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (ShapeFlags & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, anchor, parentComponent);
                }else if(ShapeFlags & ShapeFlags.TELEPORT) {
                    type.process(n1, n2, container, anchor,parentComponent,{
                        mountChildren,
                        patchChildren,
                        move(vnode:any, container:any, anchor:any) {
                            hostInsert(vnode.el, container, anchor);
                        }
                    });
                }
                 else if(ShapeFlags & ShapeFlags.COMPONENT) {
                    processComponent(n1, n2, container, anchor,parentComponent);
                }
                break;
        }


        if (ref) {
            ref(n2.el);
        }


         // 第一次渲染
        // processElement(n1, n2, container,anchor);
        
    }

    

    const render = (vnode:any, container:any) => {
        console.log(vnode,container)
        if(vnode == null) {
            if(container._vnode) {
                unmount(container._vnode)
            }
        }
        patch(container._vnode || null, vnode, container)
        container._vnode = vnode

    }
    
    return {render}
}