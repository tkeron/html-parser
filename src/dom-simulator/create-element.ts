import { NodeType, VOID_ELEMENTS } from "./node-types.js";
import { appendChild } from "./append-child.js";
import { prepend } from "./index.js";
import { querySelector, querySelectorAll } from "../selectors/index.js";
import {
  getTextContent,
  setInnerHTML,
  cloneNode,
  getInnerHTML,
  setTextContent,
  setOuterHTML,
} from "./index.js";
import {
  append,
  remove,
  insertAfter,
  replaceChild,
  insertBefore,
  removeChild,
  matches,
} from "./index.js";
import { updateElementContent } from "./update-element-content.js";

export const createElement = (
  tagName: string,
  attributes: Record<string, string> = {},
  namespaceURI?: string,
  isSelfClosing?: boolean,
): any => {
  const innerHTML = "";
  const tagNameLower = tagName.toLowerCase();
  const isVoid = VOID_ELEMENTS.has(tagNameLower);
  const attrsStr = Object.entries(attributes)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join("");
  const initialOuterHTML = isVoid
    ? `<${tagNameLower}${attrsStr}>`
    : `<${tagNameLower}${attrsStr}></${tagNameLower}>`;
  const textContent = "";

  const element: any = {
    nodeType: NodeType.ELEMENT_NODE,
    nodeName: tagName.toUpperCase(),
    nodeValue: null,
    tagName: tagName.toUpperCase(),
    namespaceURI: namespaceURI || null,
    isSelfClosing: isSelfClosing || isVoid,
    attributes: { ...attributes },
    childNodes: [],
    children: [],
    textContent,
    innerHTML,
    _internalOuterHTML: initialOuterHTML,
    parentNode: null,
    parentElement: null,
    firstChild: null,
    lastChild: null,
    nextSibling: null,
    previousSibling: null,
    firstElementChild: null,
    lastElementChild: null,
    nextElementSibling: null,
    previousElementSibling: null,

    appendChild(child: any): any {
      appendChild(element, child);
      return child;
    },

    prepend(...nodes: any[]): void {
      prepend(element, ...nodes);
    },

    append(...nodes: any[]): void {
      append(element, ...nodes);
    },

    remove(): void {
      remove(element);
    },

    removeChild(child: any): any {
      return removeChild(element, child);
    },

    insertBefore(newNode: any, referenceNode: any): any {
      return insertBefore(element, newNode, referenceNode);
    },

    replaceChild(newChild: any, oldChild: any): any {
      return replaceChild(element, newChild, oldChild);
    },

    insertAfter(newNode: any, referenceNode: any): any {
      return insertAfter(element, newNode, referenceNode);
    },

    setAttribute(name: string, value: string): void {
      element.attributes[name] = value;
      updateElementContent(element);
    },

    getAttribute(name: string): string | null {
      return element.attributes[name] || null;
    },

    hasAttribute(name: string): boolean {
      return name in element.attributes;
    },

    removeAttribute(name: string): void {
      delete element.attributes[name];
      updateElementContent(element);
    },

    querySelector(selector: string): any {
      return querySelector(element, selector);
    },

    querySelectorAll(selector: string): any[] {
      return querySelectorAll(element, selector);
    },

    matches(selector: string): boolean {
      return matches(element, selector);
    },

    cloneNode(deep: boolean = false): any {
      return cloneNode(element, deep);
    },
  };

  Object.defineProperty(element, "textContent", {
    get() {
      return (element as any)._internalTextContent || getTextContent(element);
    },
    set(value: string) {
      setTextContent(element, value);
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(element, "innerHTML", {
    get() {
      if (!element._internalInnerHTML) {
        updateElementContent(element);
      }
      return element._internalInnerHTML || getInnerHTML(element);
    },
    set(value: string) {
      setInnerHTML(element, value);
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(element, "className", {
    get() {
      return element.attributes.class || "";
    },
    set(value: string) {
      element.attributes.class = value;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(element, "id", {
    get() {
      return element.attributes.id || "";
    },
    set(value: string) {
      element.attributes.id = value;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(element, "outerHTML", {
    get() {
      if (!element._internalOuterHTML) {
        updateElementContent(element);
      }
      return element._internalOuterHTML || "";
    },
    set(value: string) {
      setOuterHTML(element, value);
    },
    enumerable: true,
    configurable: true,
  });

  return element;
};
