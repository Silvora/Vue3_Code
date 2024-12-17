export const patchStyle = (el:any,prevValue:any, nextValue:any) => {
    const style = el.style;
    for (const key in nextValue) {
        style[key] = nextValue[key];
    }

    if (prevValue) {
        for (const key in prevValue) {
            if (nextValue && nextValue[key] == null) {
                style[key] = '';
            }
        }
    }

}