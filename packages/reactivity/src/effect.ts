export let activeEffect: any;

export enum DirtyLevel { 
    Dirty = 4,
    NoDirty = 0
}

// 清理effect 更新新的active
const perCleanEffect = (effect:any) => {
    effect._depsLength = 0;
    effect._trackId++;
}
// 清理依赖
const cleanDepEffect = (dep:any,effect?:any) => {
    dep.delete(effect);
    if (dep.size === 0) {
        dep.cleanup();
    }
}
// 清理effect 清理多余的
const postCleanEffect = (effect:any) => {
   if(effect.deps.length > effect._depsLength){
      for(let i = effect._depsLength; i < effect.deps.length; i++){
         cleanDepEffect(effect.deps[i],effect);
      }
      effect.deps.length = effect._depsLength;
   }
}

export class ReactiveEffect {

    // 是响应式 标识
    public active = true;
    // 当前effect 执行次数
    _trackId = 0;
    // 存放依赖数据
    deps: any[] = [];
    // 依赖数据长度
    _depsLength = 0;
    // 是否在运行
    _running = 0;
    // 是否重新计算计算属性
    _dirtyLevel = DirtyLevel.Dirty;

    constructor(public fn:()=>{}, public scheduler: any) { }

    public get dirty() {
        return this._dirtyLevel === DirtyLevel.Dirty;
    }
    public set dirty(value) {
        this._dirtyLevel = value ? DirtyLevel.Dirty : DirtyLevel.NoDirty;
    }

    run() {
        // 运行就缓存属性
        this._dirtyLevel = DirtyLevel.NoDirty;

        if (!this.active) {
            return this.fn();
        }

        // 解决嵌套effect问题
        let lastEffect = activeEffect;

        try {

            activeEffect = this;
            perCleanEffect(this);
            this._running++;
            return this.fn();

        } finally {
            this._running--;
            postCleanEffect(this);
            activeEffect = lastEffect;

        }

    }

    stop() {
        if (this.active) {
            this.active = false;
            perCleanEffect(this);
            postCleanEffect(this);
        }
    }

}





// 创建响应式effect
export const effect = (fn:()=>{},options?:any) => {
    // 只要依赖属性变化,就会触发effect
    const _effect = new ReactiveEffect(fn,()=>{
        _effect.run()
    });

    // 默认触发一次
    _effect.run();

    if(options){
        Object.assign(_effect, options);

    }

    // 用户可自己调
    const runner:any = _effect.run.bind(_effect);
    runner.effect = _effect;

    return  runner
}


// 搜集effect 双向记忆
export const trackEffect = (effect:any,dep:any) => {
    // 重新收集依赖 diff不需要的
    if(dep.get(effect) !== effect._trackId){
        dep.set(effect,effect._trackId);
    }
    let oldDep = effect.deps[effect._depsLength];
    if(oldDep !== dep){

        if(oldDep){
            cleanDepEffect(oldDep, effect); 
        }

        effect.deps[effect._depsLength++] = dep;
    }else{
        effect._depsLength++;
    }

}

// 更新数据
export const triggerEffects = (dep:any) => {
    for(const effect of dep.keys()){
        // computed 更新属性
        if(effect._dirtyLevel < DirtyLevel.Dirty){
            effect._dirtyLevel = DirtyLevel.Dirty;
        }

        // 防止死循环
        if(!effect._running){

            if(effect.scheduler){
                 // effect.run();
                effect.scheduler(); 
            }

        }
    }
}