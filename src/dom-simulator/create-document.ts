import { NodeType } from "./node-types.js";
import { createElement } from "./create-element.js";
import { createTextNode } from "./create-text-node.js";
import {
  prepend,
  append,
  appendChild,
  removeChild,
  insertBefore,
  insertAfter,
  replaceChild,
} from "./index.js";
import { querySelector, querySelectorAll } from "../selectors/index.js";

export const createDocument = (): any => {
  const document: any = {
    nodeType: NodeType.DOCUMENT_NODE,
    nodeName: "#document",
    nodeValue: null,
    textContent: "",
    childNodes: [],
    parentNode: null,
    firstChild: null,
    lastChild: null,
    nextSibling: null,
    previousSibling: null,
    documentElement: null,
    body: null,
    head: null,

    createElement(tagName: string): any {
      return createElement(tagName, {});
    },

    createTextNode(data: string): any {
      return createTextNode(data);
    },

    appendChild(child: any): any {
      appendChild(document, child);
      return child;
    },

    prepend(...nodes: any[]): void {
      prepend(document, ...nodes);
    },

    append(...nodes: any[]): void {
      append(document, ...nodes);
    },

    removeChild(child: any): any {
      return removeChild(document, child);
    },

    insertBefore(newNode: any, referenceNode: any): any {
      return insertBefore(document, newNode, referenceNode);
    },

    replaceChild(newChild: any, oldChild: any): any {
      return replaceChild(document, newChild, oldChild);
    },

    insertAfter(newNode: any, referenceNode: any): any {
      return insertAfter(document, newNode, referenceNode);
    },

    querySelector(selector: string): any {
      return querySelector(document, selector);
    },

    querySelectorAll(selector: string): any[] {
      return querySelectorAll(document, selector);
    },

    getElementById(id: string): any {
      return querySelector(document, `#${id}`);
    },
  };
  return document;
};
