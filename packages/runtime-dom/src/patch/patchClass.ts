export const patchClass = (el:any, value:any) => {
    if (value == null) {
        el.removeAttribute('class');
    } else {
        el.className = value;
    }
}