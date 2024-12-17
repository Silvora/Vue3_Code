export const patchAttr = (el:any, key:any, value:any) => {
    if (value == null) {
        el.removeAttribute(key);
    } else {
        el.setAttribute(key, value);
    }
}