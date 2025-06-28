import type { ASTNode, ASTNodeType } from "./parser.js";
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
): HTMLElement {
  const innerHTML = "";
  const tagNameLower = tagName.toLowerCase();
  const outerHTML = `<${tagNameLower}${Object.entries(attributes)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join("")}></${tagNameLower}>`;
  const textContent = "";

  const element: HTMLElement = {
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

    appendChild(child: Node): Node {
      appendChild(element, child);
      return child;
    },

    removeChild(child: Node): Node {
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
        const childElement = child as HTMLElement;
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
        (child as HTMLElement).parentElement = null;
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

    querySelector(selector: string): HTMLElement | null {
      return querySelectorFunction(element, selector);
    },

    querySelectorAll(selector: string): HTMLElement[] {
      return querySelectorAllFunction(element, selector);
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

  return element;
}

export function createTextNode(content: string): Text {
  const textNode: Text = {
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

export function createComment(content: string): DOMComment {
  const commentNode: DOMComment = {
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

export function createDocument(): Document {
  const document: Document = {
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

    createElement(tagName: string): HTMLElement {
      return createElement(tagName, {});
    },

    createTextNode(data: string): Text {
      return createTextNode(data);
    },

    querySelector(selector: string): HTMLElement | null {
      return querySelectorFunction(document, selector);
    },

    querySelectorAll(selector: string): HTMLElement[] {
      return querySelectorAllFunction(document, selector);
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
          const element = Node as HTMLElement;
          if (element.tagName === "HTML") {
            (document as any).documentElement = element;
            findSpecialElements(document, element);
          } else if (element.tagName === "BODY") {
            (document as any).body = element;
          } else if (element.tagName === "HEAD") {
            (document as any).head = element;
          }
        }
      }
    }
  }

  // If there's no explicit body element, create one that acts as a container
  // for querySelector functionality, but don't change the document structure
  if (!document.body) {
    const bodyElement = createElement("body");
    (document as any).body = bodyElement;

    // Make the body element's querySelector search the entire document
    (bodyElement as any).querySelector = function (selector: string) {
      return querySelectorFunction(document, selector);
    };
    (bodyElement as any).querySelectorAll = function (selector: string) {
      return querySelectorAllFunction(document, selector);
    };
  }

  return document;
}

function findSpecialElements(
  document: Document,
  htmlElement: HTMLElement
): void {
  for (const child of (htmlElement as any).childNodes) {
    if (child.nodeType === NodeType.ELEMENT_NODE) {
      const element = child as HTMLElement;
      if (element.tagName === "BODY") {
        (document as any).body = element;
      } else if (element.tagName === "HEAD") {
        (document as any).head = element;
      }
    }
  }
}

function convertASTNodeToDOM(astNode: ASTNode): Node | null {
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

function appendChild(parent: Node, child: Node): void {
  (child as any).parentNode = parent;
  (parent as any).childNodes.push(child);

  if ((parent as any).childNodes.length > 1) {
    const previousSibling = (parent as any).childNodes[
      (parent as any).childNodes.length - 2
    ];
    if (previousSibling) {
      (previousSibling as any).nextSibling = child;
      (child as any).previousSibling = previousSibling;
    }
  }

  if ((parent as any).childNodes.length === 1) {
    (parent as any).firstChild = child;
  }
  (parent as any).lastChild = child;

  if (
    parent.nodeType === NodeType.ELEMENT_NODE &&
    child.nodeType === NodeType.ELEMENT_NODE
  ) {
    const parentElement = parent as HTMLElement;
    const childElement = child as HTMLElement;

    (childElement as any).parentElement = parentElement;
    (parentElement as any).children.push(childElement);

    if ((parentElement as any).children.length === 1) {
      (parentElement as any).firstElementChild = childElement;
    }
    (parentElement as any).lastElementChild = childElement;

    if ((parentElement as any).children.length > 1) {
      const previousElementSibling = (parentElement as any).children[
        (parentElement as any).children.length - 2
      ];
      if (previousElementSibling) {
        (previousElementSibling as any).nextElementSibling = childElement;
        (childElement as any).previousElementSibling = previousElementSibling;
      }
    }
  }

  if (parent.nodeType === NodeType.ELEMENT_NODE) {
    updateElementContent(parent as HTMLElement);
  }
}

function updateElementContent(element: HTMLElement): void {
  (element as any).innerHTML = (element as any).childNodes
    .map((child: any) => {
      if (child.nodeType === NodeType.TEXT_NODE) {
        return child.textContent;
      } else if (child.nodeType === NodeType.ELEMENT_NODE) {
        return (child as HTMLElement).outerHTML;
      } else if (child.nodeType === NodeType.COMMENT_NODE) {
        return `<!--${(child as any).data}-->`;
      }
      return "";
    })
    .join("");

  const attrs = Object.entries((element as any).attributes)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join("");
  const tagNameLower = element.tagName.toLowerCase();
  (element as any).outerHTML = `<${tagNameLower}${attrs}>${
    (element as any).innerHTML
  }</${tagNameLower}>`;

  const computedTextContent = getTextContent(element);
  Object.defineProperty(element, "_internalTextContent", {
    value: computedTextContent,
    writable: true,
    enumerable: false,
    configurable: true,
  });
}

export function getTextContent(node: Node): string {
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
  for (const child of (node as any).childNodes) {
    textContent += getTextContent(child);
  }
  return textContent;
}

export function getAttribute(
  element: HTMLElement,
  name: string
): string | null {
  return (element as any).attributes[name] || null;
}

export function hasAttribute(element: HTMLElement, name: string): boolean {
  return name in (element as any).attributes;
}

export function setAttribute(
  element: HTMLElement,
  name: string,
  value: string
): void {
  (element as any).attributes[name] = value;
  updateElementContent(element);
}

export function removeAttribute(element: HTMLElement, name: string): void {
  delete (element as any).attributes[name];
  updateElementContent(element);
}

export function setInnerHTML(element: HTMLElement, html: string): void {
  (element as any).innerHTML = html;
  (element as any).childNodes = [];
  (element as any).children = [];
  (element as any).firstChild = null;
  (element as any).lastChild = null;
  (element as any).firstElementChild = null;
  (element as any).lastElementChild = null;

  const textContent = html.replace(/<[^>]*>/g, "");
  Object.defineProperty(element, "_internalTextContent", {
    value: textContent,
    writable: true,
    enumerable: false,
    configurable: true,
  });

  const attrs = Object.entries((element as any).attributes)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join("");
  const tagNameLower = element.tagName.toLowerCase();
  (element as any).outerHTML = `<${tagNameLower}${attrs}>${
    (element as any).innerHTML
  }</${tagNameLower}>`;
}

function setTextContent(element: HTMLElement, text: string): void {
  (element as any).childNodes = [];
  (element as any).children = [];
  (element as any).firstChild = null;
  (element as any).lastChild = null;
  (element as any).firstElementChild = null;
  (element as any).lastElementChild = null;

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

    (element as any).childNodes.push(textNode);
    (element as any).firstChild = textNode;
    (element as any).lastChild = textNode;
  }

  updateElementContent(element);
}

export { querySelector, querySelectorAll } from "./css-selector.js";
