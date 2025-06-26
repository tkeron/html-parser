import type { ASTNode, ASTNodeType } from './parser.js';

// DOM Node Types (following W3C DOM specification)
export const enum NodeType {
  ELEMENT_NODE = 1,
  TEXT_NODE = 3,
  COMMENT_NODE = 8,
  DOCUMENT_NODE = 9,
  DOCUMENT_TYPE_NODE = 10,
  PROCESSING_INSTRUCTION_NODE = 7,
  CDATA_SECTION_NODE = 4
}

// Base Node interface - compatible with DOM Node
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

// Element interface - compatible with DOM Element
export interface Element extends Node {
  tagName: string;
  attributes: { [key: string]: string };
  children: Element[];
}

// Text interface - compatible with DOM Text
export interface Text extends Node {
  textContent: string;
}

// Comment interface - compatible with DOM Comment
export interface Comment extends Node {
  data: string;
}

// Document interface - compatible with DOM Document
export interface Document extends Node {
  documentElement: Element | null;
  body: Element | null;
  head: Element | null;
}

// Factory function to create Element nodes
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

// Factory function to create Text nodes
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

// Factory function to create Comment nodes
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

// Factory function to create Document nodes
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

// Main conversion function: AST -> DOM
export function astToDOM(ast: ASTNode): Document {
  const document = createDocument();
  
  // Convert AST children to DOM nodes
  if (ast.children) {
    for (const child of ast.children) {
      const domNode = convertASTNodeToDOM(child);
      if (domNode) {
        appendChild(document, domNode);
        
        // Set special document properties
        if (domNode.nodeType === NodeType.ELEMENT_NODE) {
          const element = domNode as Element;
          if (element.tagName === 'html') {
            document.documentElement = element;
            // Look for body and head within the html element
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

// Helper function to find head and body within the html element
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

// Helper function to convert individual AST nodes to DOM nodes
function convertASTNodeToDOM(astNode: ASTNode): Node | null {
  switch (astNode.type) {
    case 'ELEMENT':
      const element = createElement(astNode.tagName || 'div', astNode.attributes || {});
      
      // Convert children recursively
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
      // Treat CDATA as text content
      return createTextNode(astNode.content || '');
      
    case 'DOCTYPE':
    case 'PROCESSING_INSTRUCTION':
      // Skip these for now - they're not commonly needed in backend DOM manipulation
      return null;
      
    default:
      return null;
  }
}

// Helper function to append a child to a parent node
function appendChild(parent: Node, child: Node): void {
  // Set parent relationship
  child.parentNode = parent;
  
  // Add to childNodes
  parent.childNodes.push(child);
  
  // Update sibling relationships
  if (parent.childNodes.length > 1) {
    const previousSibling = parent.childNodes[parent.childNodes.length - 2];
    if (previousSibling) {
      previousSibling.nextSibling = child;
      child.previousSibling = previousSibling;
    }
  }
  
  // Update first/last child
  if (parent.childNodes.length === 1) {
    parent.firstChild = child;
  }
  parent.lastChild = child;
  
  // If parent is Element and child is Element, add to children array
  if (parent.nodeType === NodeType.ELEMENT_NODE && child.nodeType === NodeType.ELEMENT_NODE) {
    (parent as Element).children.push(child as Element);
  }
}
