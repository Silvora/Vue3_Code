import { isObject } from '@my-vue/shared';
import { createVNode, isVnode } from './createVnode';
export const h = (type?: any, props?: any, children?: any) => {
    
    if(arguments.length === 2){

        if(isObject(props) && !Array.isArray(props)){
            if(isVnode(props)){
                return createVNode(type, null, [props])
            }else{
                return createVNode(type, props)
            }
        }

        return createVNode(type, null, props)
    }
  
    if(arguments.length > 3){
        children = Array.from(arguments).slice(2) 
    }
    if(arguments.length == 3 && isVnode(children)){
        children = [children]
    }
    
    return createVNode(type, props, children)
}



