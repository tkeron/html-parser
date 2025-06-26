import type { ASTNode, ASTNodeType } from './parser.js';
import { querySelector as querySelectorFunction, querySelectorAll as querySelectorAllFunction } from './css-selector.js';

export const enum NodeType {
  ELEMENT_NODE = 1,
  TEXT_NODE = 3,
  COMMENT_NODE = 8,
  DOCUMENT_NODE = 9,
  DOCUMENT_TYPE_NODE = 10,
  PROCESSING_INSTRUCTION_NODE = 7,
  CDATA_SECTION_NODE = 4
}

export interface DOMNode {
  nodeType: NodeType;
  nodeName: string;
  nodeValue: string | null;
  textContent: string;
  childNodes: DOMNode[];
  parentNode: DOMNode | null;
  firstChild: DOMNode | null;
  lastChild: DOMNode | null;
  nextSibling: DOMNode | null;
  previousSibling: DOMNode | null;
}

export interface DOMElement extends DOMNode {
  tagName: string;
  attributes: Record<string, string>;
  children: DOMElement[];
  innerHTML: string;
  outerHTML: string;
  parentElement: DOMElement | null;
  firstElementChild: DOMElement | null;
  lastElementChild: DOMElement | null;
  nextElementSibling: DOMElement | null;
  previousElementSibling: DOMElement | null;
  appendChild(child: DOMNode): DOMNode;
  removeChild(child: DOMNode): DOMNode;
  setAttribute(name: string, value: string): void;
  getAttribute(name: string): string | null;
  hasAttribute(name: string): boolean;
  removeAttribute(name: string): void;
  querySelector(selector: string): DOMElement | null;
  querySelectorAll(selector: string): DOMElement[];
}

export interface DOMText extends DOMNode {
  data: string;
}

export interface DOMComment extends DOMNode {
  data: string;
}

export interface DOMDocument extends DOMNode {
  documentElement: DOMElement | null;
  body: DOMElement | null;
  head: DOMElement | null;
  createElement(tagName: string): DOMElement;
  createTextNode(data: string): DOMText;
  querySelector(selector: string): DOMElement | null;
  querySelectorAll(selector: string): DOMElement[];
}

export function createElement(tagName: string, attributes: Record<string, string> = {}): DOMElement {
  const innerHTML = '';
  const tagNameLower = tagName.toLowerCase();
  const outerHTML = `<${tagNameLower}${Object.entries(attributes).map(([k, v]) => ` ${k}="${v}"`).join('')}></${tagNameLower}>`;
  const textContent = '';
  
  const element: DOMElement = {
    nodeType: NodeType.ELEMENT_NODE,
    nodeName: tagName.toUpperCase(),
    nodeValue: null,
    tagName: tagName.toUpperCase(), // Cambiar a mayúsculas para ser consistente con DOM estándar
    attributes: { ...attributes },
    childNodes: [],
    children: [],
    textContent,
    innerHTML,
    outerHTML,
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
    
    // Implementar métodos directamente en el objeto
    appendChild(child: DOMNode): DOMNode {
      appendChild(element, child);
      return child;
    },
    
    removeChild(child: DOMNode): DOMNode {
      const index = element.childNodes.indexOf(child);
      if (index === -1) {
        throw new Error('Child not found');
      }
      
      // Remover de childNodes
      element.childNodes.splice(index, 1);
      
      // Actualizar relaciones de hermanos
      if (child.previousSibling) {
        child.previousSibling.nextSibling = child.nextSibling;
      }
      if (child.nextSibling) {
        child.nextSibling.previousSibling = child.previousSibling;
      }
      
      // Actualizar firstChild y lastChild
      if (element.firstChild === child) {
        element.firstChild = child.nextSibling;
      }
      if (element.lastChild === child) {
        element.lastChild = child.previousSibling;
      }
      
      // Si es un elemento, actualizar también children
      if (child.nodeType === NodeType.ELEMENT_NODE) {
        const childElement = child as DOMElement;
        const elemIndex = element.children.indexOf(childElement);
        if (elemIndex !== -1) {
          element.children.splice(elemIndex, 1);
          
          // Actualizar relaciones de elementos hermanos
          if (childElement.previousElementSibling) {
            childElement.previousElementSibling.nextElementSibling = childElement.nextElementSibling;
          }
          if (childElement.nextElementSibling) {
            childElement.nextElementSibling.previousElementSibling = childElement.previousElementSibling;
          }
          
          // Actualizar firstElementChild y lastElementChild
          if (element.firstElementChild === childElement) {
            element.firstElementChild = childElement.nextElementSibling;
          }
          if (element.lastElementChild === childElement) {
            element.lastElementChild = childElement.previousElementSibling;
          }
        }
      }
      
      // Limpiar referencias del hijo
      child.parentNode = null;
      if (child.nodeType === NodeType.ELEMENT_NODE) {
        (child as DOMElement).parentElement = null;
      }
      child.previousSibling = null;
      child.nextSibling = null;
      
      updateElementContent(element);
      return child;
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
    
    querySelector(selector: string): DOMElement | null {
      return querySelectorFunction(element, selector);
    },
    
    querySelectorAll(selector: string): DOMElement[] {
      return querySelectorAllFunction(element, selector);
    }
  };
  return element;
}

export function createTextNode(content: string): DOMText {
  const textNode: DOMText = {
    nodeType: NodeType.TEXT_NODE,
    nodeName: '#text',
    nodeValue: content,
    textContent: content,
    data: content,
    childNodes: [],
    parentNode: null,
    firstChild: null,
    lastChild: null,
    nextSibling: null,
    previousSibling: null
  };
  return textNode;
}

export function createComment(content: string): DOMComment {
  const commentNode: DOMComment = {
    nodeType: NodeType.COMMENT_NODE,
    nodeName: '#comment',
    nodeValue: content,
    textContent: '',
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

export function createDocument(): DOMDocument {
  const document: DOMDocument = {
    nodeType: NodeType.DOCUMENT_NODE,
    nodeName: '#document',
    nodeValue: null,
    textContent: '',
    childNodes: [],
    parentNode: null,
    firstChild: null,
    lastChild: null,
    nextSibling: null,
    previousSibling: null,
    documentElement: null,
    body: null,
    head: null,
    
    // Implementar métodos directamente en el objeto
    createElement(tagName: string): DOMElement {
      return createElement(tagName, {});
    },
    
    createTextNode(data: string): DOMText {
      return createTextNode(data);
    },
    
    querySelector(selector: string): DOMElement | null {
      return querySelectorFunction(document, selector);
    },
    
    querySelectorAll(selector: string): DOMElement[] {
      return querySelectorAllFunction(document, selector);
    }
  };
  return document;
}

export function astToDOM(ast: ASTNode): DOMDocument {
  const document = createDocument();
  if (ast.children) {
    for (const child of ast.children) {
      const domNode = convertASTNodeToDOM(child);
      if (domNode) {
        appendChild(document, domNode);
        if (domNode.nodeType === NodeType.ELEMENT_NODE) {
          const element = domNode as DOMElement;
          if (element.tagName === 'HTML') {
            document.documentElement = element;
            findSpecialElements(document, element);
          } else if (element.tagName === 'BODY') {
            document.body = element;
          } else if (element.tagName === 'HEAD') {
            document.head = element;
          }
        }
      }
    }
  }
  return document;
}

function findSpecialElements(document: DOMDocument, htmlElement: DOMElement): void {
  for (const child of htmlElement.childNodes) {
    if (child.nodeType === NodeType.ELEMENT_NODE) {
      const element = child as DOMElement;
      if (element.tagName === 'BODY') {
        document.body = element;
      } else if (element.tagName === 'HEAD') {
        document.head = element;
      }
    }
  }
}

function convertASTNodeToDOM(astNode: ASTNode): DOMNode | null {
  switch (astNode.type) {
    case 'ELEMENT':
      const tagName = astNode.tagName || 'div';
      const element = createElement(tagName, astNode.attributes || {});
      
      if (astNode.children) {
        for (const child of astNode.children) {
          const domChild = convertASTNodeToDOM(child);
          if (domChild) {
            appendChild(element, domChild);
          }
        }
      }
      
      updateElementContent(element);
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

function appendChild(parent: DOMNode, child: DOMNode): void {
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
    const parentElement = parent as DOMElement;
    const childElement = child as DOMElement;
    
    childElement.parentElement = parentElement;
    parentElement.children.push(childElement);
    
    if (parentElement.children.length === 1) {
      parentElement.firstElementChild = childElement;
    }
    parentElement.lastElementChild = childElement;
    
    if (parentElement.children.length > 1) {
      const previousElementSibling = parentElement.children[parentElement.children.length - 2];
      if (previousElementSibling) {
        previousElementSibling.nextElementSibling = childElement;
        childElement.previousElementSibling = previousElementSibling;
      }
    }
  }
}

function updateElementContent(element: DOMElement): void {
  element.innerHTML = element.childNodes.map(child => {
    if (child.nodeType === NodeType.TEXT_NODE) {
      return child.textContent;
    } else if (child.nodeType === NodeType.ELEMENT_NODE) {
      return (child as DOMElement).outerHTML;
    } else if (child.nodeType === NodeType.COMMENT_NODE) {
      return `<!--${(child as DOMComment).data}-->`;
    }
    return '';
  }).join('');
  
  const attrs = Object.entries(element.attributes)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join('');
  const tagNameLower = element.tagName.toLowerCase();
  element.outerHTML = `<${tagNameLower}${attrs}>${element.innerHTML}</${tagNameLower}>`;
  
  element.textContent = getTextContent(element);
}

export function getTextContent(node: DOMNode): string {
  if (node.nodeType === NodeType.TEXT_NODE) {
    return node.textContent;
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

export function getAttribute(element: DOMElement, name: string): string | null {
  return element.attributes[name] || null;
}

export function hasAttribute(element: DOMElement, name: string): boolean {
  return name in element.attributes;
}

export function setAttribute(element: DOMElement, name: string, value: string): void {
  element.attributes[name] = value;
  updateElementContent(element);
}

export function removeAttribute(element: DOMElement, name: string): void {
  delete element.attributes[name];
  updateElementContent(element);
}

export function setInnerHTML(element: DOMElement, html: string): void {
  element.innerHTML = html;
  element.childNodes = [];
  element.children = [];
  element.firstChild = null;
  element.lastChild = null;
  element.firstElementChild = null;
  element.lastElementChild = null;
  element.textContent = html.replace(/<[^>]*>/g, '');
  const attrs = Object.entries(element.attributes)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join('');
  const tagNameLower = element.tagName.toLowerCase();
  element.outerHTML = `<${tagNameLower}${attrs}>${element.innerHTML}</${tagNameLower}>`;
}

export { querySelector, querySelectorAll } from './css-selector.js';
