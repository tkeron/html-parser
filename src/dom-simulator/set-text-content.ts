import { NodeType } from "./node-types.js";
import { updateElementContent } from "./update-element-content.js";

export const setTextContent = (element: any, text: string): void => {
  element.childNodes = [];
  element.children = [];
  element.firstChild = null;
  element.lastChild = null;
  element.firstElementChild = null;
  element.lastElementChild = null;

  if (text) {
    const textNode: any = {
      nodeType: NodeType.TEXT_NODE,
      nodeName: "#text",
      nodeValue: text,
      textContent: text,
      data: text,
      childNodes: [],
      parentNode: element,
      firstChild: null,
      lastChild: null,
      nextSibling: null,
      previousSibling: null,
    };

    element.childNodes.push(textNode);
    element.firstChild = textNode;
    element.lastChild = textNode;
  }

  updateElementContent(element);
};
