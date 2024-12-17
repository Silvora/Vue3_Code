import { patchAttr } from "./patch/patchAttr";
import { patchClass } from "./patch/patchClass";
import { patchEvent } from "./patch/patchEvent";
import { patchStyle } from "./patch/patchStyle";



const patchProp = (el:any, key:any, prevValue:any, nextValue:any    ) => {
    if (key === 'class') {
        patchClass(el, nextValue);
    }

    if (key === 'style') {
        patchStyle(el, prevValue, nextValue);
    }

    if(key.startsWith('on')) {
        patchEvent(el, key, nextValue);
    } else {
        patchAttr(el, key, nextValue);
    }



}


export default patchProp;