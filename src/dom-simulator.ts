import type { ASTNode, ASTNodeType } from "./parser.js";
import { parse } from "./parser.js";
import { tokenize } from "./tokenizer.js";
import {
  querySelector as querySelectorFunction,
  querySelectorAll as querySelectorAllFunction,
} from "./css-selector.js";

export const enum NodeType {
  ELEMENT_NODE = 1,
  TEXT_NODE = 3,
  COMMENT_NODE = 8,
  DOCUMENT_NODE = 9,
  DOCUMENT_TYPE_NODE = 10,
  PROCESSING_INSTRUCTION_NODE = 7,
  CDATA_SECTION_NODE = 4,
}

export function createElement(
  tagName: string,
  attributes: Record<string, string> = {}
): any {
  const innerHTML = "";
  const tagNameLower = tagName.toLowerCase();
  const outerHTML = `<${tagNameLower}${Object.entries(attributes)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join("")}></${tagNameLower}>`;
  const textContent = "";

  const element: any = {
    nodeType: NodeType.ELEMENT_NODE,
    nodeName: tagName.toUpperCase(),
    nodeValue: null,
    tagName: tagName.toUpperCase(),
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

    appendChild(child: any): any {
      appendChild(element, child);
      return child;
    },

    removeChild(child: any): any {
      const index = element.childNodes.indexOf(child);
      if (index === -1) {
        throw new Error("Child not found");
      }

      element.childNodes.splice(index, 1);

      if (child.previousSibling) {
        child.previousSibling.nextSibling = child.nextSibling;
      }
      if (child.nextSibling) {
        child.nextSibling.previousSibling = child.previousSibling;
      }

      if (element.firstChild === child) {
        element.firstChild = child.nextSibling;
      }
      if (element.lastChild === child) {
        element.lastChild = child.previousSibling;
      }

      if (child.nodeType === NodeType.ELEMENT_NODE) {
        const childElement = child;
        const elemIndex = element.children.indexOf(childElement);
        if (elemIndex !== -1) {
          element.children.splice(elemIndex, 1);

          if (childElement.previousElementSibling) {
            childElement.previousElementSibling.nextElementSibling =
              childElement.nextElementSibling;
          }
          if (childElement.nextElementSibling) {
            childElement.nextElementSibling.previousElementSibling =
              childElement.previousElementSibling;
          }

          if (element.firstElementChild === childElement) {
            element.firstElementChild = childElement.nextElementSibling;
          }
          if (element.lastElementChild === childElement) {
            element.lastElementChild = childElement.previousElementSibling;
          }
        }
      }

      child.parentNode = null;
      if (child.nodeType === NodeType.ELEMENT_NODE) {
        child.parentElement = null;
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

    querySelector(selector: string): any {
      return querySelectorFunction(element, selector);
    },

    querySelectorAll(selector: string): any[] {
      return querySelectorAllFunction(element, selector);
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
      return (element as any)._internalInnerHTML || getInnerHTML(element);
    },
    set(value: string) {
      setInnerHTML(element, value);
    },
    enumerable: true,
    configurable: true,
  });

  // Add className property
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

  // Add id property
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

  return element;
}

export function createTextNode(content: string): any {
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
  };
  return textNode;
}

export function createComment(content: string): any {
  const commentNode: any = {
    nodeType: NodeType.COMMENT_NODE,
    nodeName: "#comment",
    nodeValue: content,
    textContent: "",
    data: content,
    childNodes: [],
    parentNode: null,
    firstChild: null,
    lastChild: null,
    nextSibling: null,
    previousSibling: null,
  };
  return commentNode;
}

export function createDocument(): any {
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

    querySelector(selector: string): any {
      return querySelectorFunction(document, selector);
    },

    querySelectorAll(selector: string): any[] {
      return querySelectorAllFunction(document, selector);
    },

    getElementById(id: string): any {
      return querySelectorFunction(document, `#${id}`);
    },
  };
  return document;
}

export function astToDOM(ast: ASTNode): Document {
  const document = createDocument();
  if (ast.children) {
    for (const child of ast.children) {
      const Node = convertASTNodeToDOM(child);
      if (Node) {
        appendChild(document, Node);
        if (Node.nodeType === NodeType.ELEMENT_NODE) {
          const element = Node as any;
          if (element.tagName === "HTML") {
            document.documentElement = element;
            findSpecialElements(document, element);
          } else if (element.tagName === "BODY") {
            document.body = element;
          } else if (element.tagName === "HEAD") {
            document.head = element;
          }
        }
      }
    }
  }

  if (!document.body) {
    const bodyElement = createElement("body");
    document.body = bodyElement;

    bodyElement.querySelector = function (selector: string) {
      return querySelectorFunction(document, selector);
    };
    bodyElement.querySelectorAll = function (selector: string) {
      return querySelectorAllFunction(document, selector);
    };
  }

  return document;
}

function findSpecialElements(document: any, htmlElement: any): void {
  for (const child of htmlElement.childNodes) {
    if (child.nodeType === NodeType.ELEMENT_NODE) {
      const element = child;
      if (element.tagName === "BODY") {
        document.body = element;
      } else if (element.tagName === "HEAD") {
        document.head = element;
      }
    }
  }
}

function convertASTNodeToDOM(astNode: ASTNode): any {
  switch (astNode.type) {
    case "ELEMENT":
      const tagName = astNode.tagName || "div";
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
    case "TEXT":
      return createTextNode(astNode.content || "");
    case "COMMENT":
      return createComment(astNode.content || "");
    case "CDATA":
      return createTextNode(astNode.content || "");
    case "DOCTYPE":
    case "PROCESSING_INSTRUCTION":
      return null;
    default:
      return null;
  }
}

function appendChild(parent: any, child: any): void {
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

  if (
    parent.nodeType === NodeType.ELEMENT_NODE &&
    child.nodeType === NodeType.ELEMENT_NODE
  ) {
    const parentElement = parent;
    const childElement = child;

    childElement.parentElement = parentElement;
    parentElement.children.push(childElement);

    if (parentElement.children.length === 1) {
      parentElement.firstElementChild = childElement;
    }
    parentElement.lastElementChild = childElement;

    if (parentElement.children.length > 1) {
      const previousElementSibling =
        parentElement.children[parentElement.children.length - 2];
      if (previousElementSibling) {
        previousElementSibling.nextElementSibling = childElement;
        childElement.previousElementSibling = previousElementSibling;
      }
    }
  }

  if (parent.nodeType === NodeType.ELEMENT_NODE) {
    updateElementContent(parent);
  }
}

function updateElementContent(element: any): void {
  const innerHTML = element.childNodes
    .map((child: any) => {
      if (child.nodeType === NodeType.TEXT_NODE) {
        return child.textContent;
      } else if (child.nodeType === NodeType.ELEMENT_NODE) {
        return child.outerHTML;
      } else if (child.nodeType === NodeType.COMMENT_NODE) {
        return `<!--${child.data}-->`;
      }
      return "";
    })
    .join("");

  Object.defineProperty(element, "_internalInnerHTML", {
    value: innerHTML,
    writable: true,
    enumerable: false,
    configurable: true,
  });

  const attrs = Object.entries(element.attributes)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join("");
  const tagNameLower = element.tagName.toLowerCase();
  element.outerHTML = `<${tagNameLower}${attrs}>${innerHTML}</${tagNameLower}>`;

  const computedTextContent = getTextContent(element);
  Object.defineProperty(element, "_internalTextContent", {
    value: computedTextContent,
    writable: true,
    enumerable: false,
    configurable: true,
  });
}

export function getTextContent(node: any): string {
  if (node.nodeType === NodeType.TEXT_NODE) {
    return node.textContent || "";
  }
  if (
    node.nodeType !== NodeType.ELEMENT_NODE &&
    node.nodeType !== NodeType.DOCUMENT_NODE
  ) {
    return "";
  }
  let textContent = "";
  for (const child of node.childNodes) {
    textContent += getTextContent(child);
  }
  return textContent;
}

export function getAttribute(element: any, name: string): string | null {
  return element.attributes[name] || null;
}

export function hasAttribute(element: any, name: string): boolean {
  return name in element.attributes;
}

export function setAttribute(element: any, name: string, value: string): void {
  element.attributes[name] = value;
  updateElementContent(element);
}

export function removeAttribute(element: any, name: string): void {
  delete element.attributes[name];
  updateElementContent(element);
}

export function setInnerHTML(element: any, html: string): void {
  element.childNodes = [];
  element.children = [];
  element.firstChild = null;
  element.lastChild = null;
  element.firstElementChild = null;
  element.lastElementChild = null;

  if (html.trim()) {
    const tokens = tokenize(html);
    const ast = parse(tokens);
    if (ast.children) {
      for (const child of ast.children) {
        const domChild = convertASTNodeToDOM(child);
        if (domChild) {
          appendChild(element, domChild);
        }
      }
    }
  }

  const actualInnerHTML = getInnerHTML(element);
  Object.defineProperty(element, "_internalInnerHTML", {
    value: actualInnerHTML,
    writable: true,
    enumerable: false,
    configurable: true,
  });

  const textContent = getTextContent(element);
  Object.defineProperty(element, "_internalTextContent", {
    value: textContent,
    writable: true,
    enumerable: false,
    configurable: true,
  });

  const attrs = Object.entries(element.attributes)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join("");
  const tagNameLower = element.tagName.toLowerCase();
  element.outerHTML = `<${tagNameLower}${attrs}>${actualInnerHTML}</${tagNameLower}>`;
}

function setTextContent(element: any, text: string): void {
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
}

export function cloneNode(node: any, deep: boolean = false): any {
  if (node.nodeType === NodeType.ELEMENT_NODE) {
    const element = node;
    const cloned = createElement(element.tagName, element.attributes || {});

    if (deep && element.childNodes && element.childNodes.length > 0) {
      for (let i = 0; i < element.childNodes.length; i++) {
        const child = element.childNodes[i];
        const childClone = cloneNode(child, true);
        appendChild(cloned, childClone);
      }
    }

    return cloned;
  } else if (node.nodeType === NodeType.TEXT_NODE) {
    return createTextNode(node.textContent || "");
  } else if (node.nodeType === NodeType.COMMENT_NODE) {
    return createComment(node.data || "");
  } else if (node.nodeType === NodeType.DOCUMENT_NODE) {
    const doc = createDocument();
    if (deep && node.childNodes && node.childNodes.length > 0) {
      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        const childClone = cloneNode(child, true);
        appendChild(doc, childClone);
      }
    }
    return doc;
  }

  return createTextNode("");
}

export function getInnerHTML(element: any): string {
  if (element.nodeType !== NodeType.ELEMENT_NODE) {
    return "";
  }

  let innerHTML = "";
  for (const child of element.childNodes) {
    if (child.nodeType === NodeType.ELEMENT_NODE) {
      innerHTML += child.outerHTML;
    } else if (child.nodeType === NodeType.TEXT_NODE) {
      innerHTML += child.textContent || "";
    } else if (child.nodeType === NodeType.COMMENT_NODE) {
      innerHTML += `<!--${child.data || ""}-->`;
    }
  }
  return innerHTML;
}

export { querySelector, querySelectorAll } from "./css-selector.js";
