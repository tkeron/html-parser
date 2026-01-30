import { NodeType } from "./node-types.js";
import { createElement } from "./index.js";

const cloneNode = (node: any, deep: boolean = false): any => {
  if (node.nodeType === NodeType.ELEMENT_NODE) {
    const cloned = createElement(node.tagName, node.attributes);

    if (deep) {
      for (const child of node.childNodes) {
        const clonedChild = cloneNode(child, true);
        cloned.appendChild(clonedChild);
      }
    }

    return cloned;
  } else if (node.nodeType === NodeType.TEXT_NODE) {
    return {
      nodeType: NodeType.TEXT_NODE,
      textContent: node.textContent,
      parentNode: null,
      parentElement: null,
      previousSibling: null,
      nextSibling: null,
    };
  } else if (node.nodeType === NodeType.COMMENT_NODE) {
    return {
      nodeType: NodeType.COMMENT_NODE,
      data: node.data,
      textContent: node.textContent,
      parentNode: null,
      parentElement: null,
      previousSibling: null,
      nextSibling: null,
    };
  } else if (node.nodeType === NodeType.DOCUMENT_TYPE_NODE) {
    return {
      nodeType: NodeType.DOCUMENT_TYPE_NODE,
      name: node.name,
      publicId: node.publicId,
      systemId: node.systemId,
      parentNode: null,
      parentElement: null,
      previousSibling: null,
      nextSibling: null,
    };
  } else {
    throw new Error(`Unsupported node type: ${node.nodeType}`);
  }
};

export { cloneNode };
