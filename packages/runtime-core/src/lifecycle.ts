import { currentInstance, setCurrentInstance } from "./compontent";

export const enum LifecycleFlags {
    // BEFORE_MOUNT = 1,
    // MOUNTED = 2,
    // BEFORE_UPDATE = 4,
    // UPDATED = 8,
    // BEFORE_UNMOUNT = 16,
    // UNMOUNTED = 32
    BEFORE_MOUNT = 'beforeMount',
    MOUNTED = 'mounted',
    BEFORE_UPDATE = 'beforeUpdate',
    UPDATED = 'updated',
    BEFORE_UNMOUNT = 'beforeUnmount',
    UNMOUNTED = 'unmounted'
}

// export const LifecycleHooks = [
//     'beforeMount',
//     'mounted',
//     'beforeUpdate',
//     'updated',
//     'beforeUnmount',
//     'unmounted'
// ]

const createHook = (type:any) => {
    return (hook:any, target:any = currentInstance) => {
        if (target) {
            const hooks = target[type] || (target[type] = []);
            const warpHook = () => {
                setCurrentInstance(currentInstance);
                hook();
                setCurrentInstance(null);
            }
            hooks.push(warpHook);
        }
    }
}


export const onBeforeMount = createHook(LifecycleFlags.BEFORE_MOUNT);    
export const onMounted = createHook(LifecycleFlags.MOUNTED);
export const onBeforeUpdate = createHook(LifecycleFlags.BEFORE_UPDATE);
export const onUpdated = createHook(LifecycleFlags.UPDATED);
export const onBeforeUnmount = createHook(LifecycleFlags.BEFORE_UNMOUNT);
export const onUnmounted = createHook(LifecycleFlags.UNMOUNTED);




export const invokeHooks = (hooks:any) => {
    for (let i = 0; i < hooks.length; i++) {
        hooks[i]()
    }
}

