export interface ChildNode extends Node {
  nextSibling: ChildNode | null;
  previousSibling: ChildNode | null;
  parentNode: ParentNode | null;
}

export interface ParentNode extends Node {
  childNodes: ChildNode[];
  firstChild: ChildNode | null;
  lastChild: ChildNode | null;
  appendChild(child: ChildNode): ChildNode;
  removeChild(child: ChildNode): ChildNode;
  insertBefore(newNode: ChildNode, referenceNode: ChildNode | null): ChildNode;
  replaceChild(newChild: ChildNode, oldChild: ChildNode): ChildNode;
  insertAfter?(newNode: ChildNode, referenceNode: ChildNode | null): ChildNode;
}

export interface Text extends ChildNode {
  nodeType: 3;
  nodeName: "#text";
  nodeValue: string;
  textContent: string;
  data: string;
}

export interface Comment extends ChildNode {
  nodeType: 8;
  nodeName: "#comment";
  nodeValue: string;
  textContent: string;
  data: string;
}

export interface HTMLElement extends ChildNode, ParentNode {
  nodeType: 1;
  tagName: string;
  attributes: Record<string, string>;
  innerHTML: string;
  outerHTML: string;
  textContent: string;
  children: HTMLElement[];
  parentElement: HTMLElement | null;
  firstElementChild: HTMLElement | null;
  lastElementChild: HTMLElement | null;
  nextElementSibling: HTMLElement | null;
  previousElementSibling: HTMLElement | null;

  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  hasAttribute(name: string): boolean;
  removeAttribute(name: string): void;
  querySelector(selector: string): HTMLElement | null;
  querySelectorAll(selector: string): HTMLElement[];
  cloneNode(deep?: boolean): HTMLElement;
}

export interface Document extends ParentNode {
  nodeType: 9;
  nodeName: "#document";
  documentElement: HTMLElement | null;
  head: HTMLElement | null;
  body: HTMLElement | null;

  createElement(tagName: string): HTMLElement;
  createTextNode(data: string): Text;
  querySelector(selector: string): HTMLElement | null;
  querySelectorAll(selector: string): HTMLElement[];
}

export interface Node {
  nodeType: number;
  nodeName: string;
  nodeValue: string | null;
  textContent: string;
  childNodes: ChildNode[];
  parentNode: ParentNode | null;
  firstChild: ChildNode | null;
  lastChild: ChildNode | null;
  nextSibling: ChildNode | null;
  previousSibling: ChildNode | null;
}
