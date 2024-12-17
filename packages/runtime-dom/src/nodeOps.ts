 // 节点操作 
export const nodeOps = {
    // 插入
    insert: (child: any, parent: any, anchor: any) => {
        parent.insertBefore(child, anchor);
    },
    // 删除
    remove: (child: any) => {
        const parent = child.parentNode;
        if (parent) {
            parent.removeChild(child);
        }
    },
    // 创建元素
    createElement: (tag: any) => {
        return document.createElement(tag);
    },
    // 设置元素文本
    setElementText: (el: any, text: any) => {
        el.textContent = text;
    },
    // 创建文本节点
    createText: (text: any) => {
        return document.createTextNode(text);
    },
    // 设置文本
    setText: (node: any, text: any) => {
        node.nodeValue = text;
    },
    // 获取父节点
    parentNode: (node: any) => {
        return node.parentNode;
    },
    // 获取下一个兄弟节点
    nextSibling: (node: any) => {
        return node.nextSibling;
    },
    // 获取元素
    querySelector: (selector: any) => {
        return document.querySelector(selector);
    },
    // 设置作用域
    setScopeId(el: any, id: any) {
        el.setAttribute('data-v-' + id, '');
    },
    // 克隆节点
    cloneNode(el: any) {
        return el.cloneNode(true);
    },
    // 插入静态内容
    insertStaticContent(content: any, parent: any, anchor: any) {
        parent.insertBefore(content, anchor);
    }
}