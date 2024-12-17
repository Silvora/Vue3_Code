export * from "@my-vue/shared";
import { nodeOps } from "./nodeOps"
import patchProp from "./patchProp"
import { createRenderer } from "@my-vue/runtime-core"

const renderOptions:any = Object.assign(nodeOps, patchProp)

export const  render = (vnode:any, container:any) => {
    createRenderer(renderOptions).render(vnode, container);
}

export * from "@my-vue/runtime-core"