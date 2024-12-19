export const isTeleport = (type:any) => type.__isTeleport


export const Teleport = {
    __isTeleport: true,
    name: 'Teleport',
    remove(vnode:any, unmount:any) {
        const { ShapeFlags, children } = vnode;
        if (ShapeFlags & ShapeFlags.ARRAY_CHILDREN) {
            unmount(children);
        }
    },
    process(n1:any, n2:any, container:any, anchor:any, parentComponent:any, internals:any) {
        const { mountChildren, move, patchChildren } = internals;
        if (!n1) {
            const target = n2.target = document.querySelector(n2.props.to);
            if (target) {
                mountChildren(n2.children, target, parentComponent);
            }
        }else {
            patchChildren(n1, n2, n2.target, parentComponent, container);

            if (n1.target.to !== n2.target.to) {
                const target = document.querySelector(n2.props.to);
                n2.children.forEach((c:any) => {
                    move(c, target, anchor);
                })
            }
        }
    }
}