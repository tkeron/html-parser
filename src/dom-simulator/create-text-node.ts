import { NodeType } from "./node-types.js";
import { remove } from "./index.js";

export const createTextNode = (content: string): any => {
  const textNode: any = {
    nodeType: NodeType.TEXT_NODE,
    nodeName: "#text",
    nodeValue: content,
    textContent: content,
    data: content,
    childNodes: [],
    parentNode: null,
    firstChild: null,
    lastChild: null,
    nextSibling: null,
    previousSibling: null,

    remove(): void {
      remove(textNode);
    },
  };
  return textNode;
};
