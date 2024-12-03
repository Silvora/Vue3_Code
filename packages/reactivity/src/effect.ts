export let activeEffect: any;

const ReactiveEffects = (fn:()=>{}, scheduler: any) => {
    // 是响应式 标识
    let active = true;
    const run = () => {
        if (!active) {
            return fn()
        }
        // 解决嵌套effect问题
        let lastEffect = activeEffect;

        try{
            activeEffect = ReactiveEffects(fn,scheduler);
            return fn();
        }finally{
            activeEffect = lastEffect;
        }
    }


    return {
        run
    }
}



export const effect = (fn:()=>{},options?:any) => {
    const _effect = ReactiveEffects(fn,()=>{
        _effect.run()
    });
    
    _effect.run()
}