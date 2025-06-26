import type { ASTNode, ASTNodeType } from './parser.js';

export const enum NodeType {
  ELEMENT_NODE = 1,
  TEXT_NODE = 3,
  COMMENT_NODE = 8,
  DOCUMENT_NODE = 9,
  DOCUMENT_TYPE_NODE = 10,
  PROCESSING_INSTRUCTION_NODE = 7,
  CDATA_SECTION_NODE = 4
}

export interface Node {
  nodeType: NodeType;
  nodeName: string;
  nodeValue: string | null;
  childNodes: Node[];
  parentNode: Node | null;
  firstChild: Node | null;
  lastChild: Node | null;
  nextSibling: Node | null;
  previousSibling: Node | null;
}

export interface Element extends Node {
  tagName: string;
  attributes: { [key: string]: string };
  children: Element[];
}

export interface Text extends Node {
  textContent: string;
}

export interface Comment extends Node {
  data: string;
}

export interface Document extends Node {
  documentElement: Element | null;
  body: Element | null;
  head: Element | null;
}

export function createElement(tagName: string, attributes: { [key: string]: string } = {}): Element {
  const element: Element = {
    nodeType: NodeType.ELEMENT_NODE,
    nodeName: tagName.toUpperCase(),
    nodeValue: null,
    tagName: tagName.toLowerCase(),
    attributes: { ...attributes },
    childNodes: [],
    children: [],
    parentNode: null,
    firstChild: null,
    lastChild: null,
    nextSibling: null,
    previousSibling: null
  };
  return element;
}

export function createTextNode(content: string): Text {
  const textNode: Text = {
    nodeType: NodeType.TEXT_NODE,
    nodeName: '#text',
    nodeValue: content,
    textContent: content,
    childNodes: [],
    parentNode: null,
    firstChild: null,
    lastChild: null,
    nextSibling: null,
    previousSibling: null
  };
  return textNode;
}

export function createComment(content: string): Comment {
  const commentNode: Comment = {
    nodeType: NodeType.COMMENT_NODE,
    nodeName: '#comment',
    nodeValue: content,
    data: content,
    childNodes: [],
    parentNode: null,
    firstChild: null,
    lastChild: null,
    nextSibling: null,
    previousSibling: null
  };
  return commentNode;
}

export function createDocument(): Document {
  const document: Document = {
    nodeType: NodeType.DOCUMENT_NODE,
    nodeName: '#document',
    nodeValue: null,
    childNodes: [],
    parentNode: null,
    firstChild: null,
    lastChild: null,
    nextSibling: null,
    previousSibling: null,
    documentElement: null,
    body: null,
    head: null
  };
  return document;
}

export function astToDOM(ast: ASTNode): Document {
  const document = createDocument();
  if (ast.children) {
    for (const child of ast.children) {
      const domNode = convertASTNodeToDOM(child);
      if (domNode) {
        appendChild(document, domNode);
        if (domNode.nodeType === NodeType.ELEMENT_NODE) {
          const element = domNode as Element;
          if (element.tagName === 'html') {
            document.documentElement = element;
            findSpecialElements(document, element);
          } else if (element.tagName === 'body') {
            document.body = element;
          } else if (element.tagName === 'head') {
            document.head = element;
          }
        }
      }
    }
  }
  return document;
}

function findSpecialElements(document: Document, htmlElement: Element): void {
  for (const child of htmlElement.childNodes) {
    if (child.nodeType === NodeType.ELEMENT_NODE) {
      const element = child as Element;
      if (element.tagName === 'body') {
        document.body = element;
      } else if (element.tagName === 'head') {
        document.head = element;
      }
    }
  }
}

function convertASTNodeToDOM(astNode: ASTNode): Node | null {
  switch (astNode.type) {
    case 'ELEMENT':
      const element = createElement(astNode.tagName || 'div', astNode.attributes || {});
      if (astNode.children) {
        for (const child of astNode.children) {
          const domChild = convertASTNodeToDOM(child);
          if (domChild) {
            appendChild(element, domChild);
          }
        }
      }
      return element;
    case 'TEXT':
      return createTextNode(astNode.content || '');
    case 'COMMENT':
      return createComment(astNode.content || '');
    case 'CDATA':
      return createTextNode(astNode.content || '');
    case 'DOCTYPE':
    case 'PROCESSING_INSTRUCTION':
      return null;
    default:
      return null;
  }
}

function appendChild(parent: Node, child: Node): void {
  child.parentNode = parent;
  parent.childNodes.push(child);
  if (parent.childNodes.length > 1) {
    const previousSibling = parent.childNodes[parent.childNodes.length - 2];
    if (previousSibling) {
      previousSibling.nextSibling = child;
      child.previousSibling = previousSibling;
    }
  }
  if (parent.childNodes.length === 1) {
    parent.firstChild = child;
  }
  parent.lastChild = child;
  if (parent.nodeType === NodeType.ELEMENT_NODE && child.nodeType === NodeType.ELEMENT_NODE) {
    (parent as Element).children.push(child as Element);
  }
}

export function getTextContent(node: Node): string {
  if (node.nodeType === NodeType.TEXT_NODE) {
    return (node as Text).textContent;
  }
  if (node.nodeType !== NodeType.ELEMENT_NODE && node.nodeType !== NodeType.DOCUMENT_NODE) {
    return '';
  }
  let textContent = '';
  for (const child of node.childNodes) {
    textContent += getTextContent(child);
  }
  return textContent;
}

export function getAttribute(element: Element, name: string): string | null {
  return element.attributes[name] || null;
}

export function hasAttribute(element: Element, name: string): boolean {
  return name in element.attributes;
}

export function setAttribute(element: Element, name: string, value: string): void {
  element.attributes[name] = value;
}

export function removeAttribute(element: Element, name: string): void {
  delete element.attributes[name];
}

export { querySelector, querySelectorAll } from './css-selector.js';
