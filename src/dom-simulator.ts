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
  const initialOuterHTML = `<${tagNameLower}${Object.entries(attributes)
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

  // Add outerHTML property with getter and setter
  Object.defineProperty(element, "outerHTML", {
    get() {
      return element._internalOuterHTML || "";
    },
    set(value: string) {
      setOuterHTML(element, value);
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

    appendChild(child: any): any {
      appendChild(document, child);
      return child;
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
  // Check for hierarchy request error: prevent circular references
  // Check if parent is a descendant of child
  if (child.nodeType === NodeType.ELEMENT_NODE || child.nodeType === NodeType.DOCUMENT_NODE) {
    let ancestor = parent;
    while (ancestor) {
      if (ancestor === child) {
        throw new Error("HierarchyRequestError: Cannot insert a node as a descendant of itself");
      }
      ancestor = ancestor.parentNode;
    }
  }

  // Remove child from its current parent if it has one
  if (child.parentNode) {
    removeChild(child.parentNode, child);
  }

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

function removeChild(parent: any, child: any): any {
  const index = parent.childNodes.indexOf(child);
  if (index === -1) {
    throw new Error("Child not found");
  }

  parent.childNodes.splice(index, 1);

  if (child.previousSibling) {
    child.previousSibling.nextSibling = child.nextSibling;
  }
  if (child.nextSibling) {
    child.nextSibling.previousSibling = child.previousSibling;
  }

  if (parent.firstChild === child) {
    parent.firstChild = child.nextSibling;
  }
  if (parent.lastChild === child) {
    parent.lastChild = child.previousSibling;
  }

  // Only handle element-specific relationships if parent is an element
  if (parent.nodeType === NodeType.ELEMENT_NODE && child.nodeType === NodeType.ELEMENT_NODE) {
    const childElement = child;
    const elemIndex = parent.children.indexOf(childElement);
    if (elemIndex !== -1) {
      parent.children.splice(elemIndex, 1);

      if (childElement.previousElementSibling) {
        childElement.previousElementSibling.nextElementSibling =
          childElement.nextElementSibling;
      }
      if (childElement.nextElementSibling) {
        childElement.nextElementSibling.previousElementSibling =
          childElement.previousElementSibling;
      }

      if (parent.firstElementChild === childElement) {
        parent.firstElementChild = childElement.nextElementSibling;
      }
      if (parent.lastElementChild === childElement) {
        parent.lastElementChild = childElement.previousElementSibling;
      }
    }
  }

  child.parentNode = null;
  if (child.nodeType === NodeType.ELEMENT_NODE) {
    child.parentElement = null;
  }
  child.previousSibling = null;
  child.nextSibling = null;
  if (child.nodeType === NodeType.ELEMENT_NODE) {
    child.previousElementSibling = null;
    child.nextElementSibling = null;
  }

  if (parent.nodeType === NodeType.ELEMENT_NODE) {
    updateElementContent(parent);
  }
  return child;
}

function insertBefore(parent: any, newNode: any, referenceNode: any): any {
  // If referenceNode is null, append to the end
  if (referenceNode === null) {
    appendChild(parent, newNode);
    return newNode;
  }

  // Verify referenceNode is actually a child of parent
  const refIndex = parent.childNodes.indexOf(referenceNode);
  if (refIndex === -1) {
    throw new Error("Reference node is not a child of this node");
  }

  // Check for hierarchy request error: prevent circular references
  if (newNode.nodeType === NodeType.ELEMENT_NODE || newNode.nodeType === NodeType.DOCUMENT_NODE) {
    let ancestor = parent;
    while (ancestor) {
      if (ancestor === newNode) {
        throw new Error("HierarchyRequestError: Cannot insert a node as a descendant of itself");
      }
      ancestor = ancestor.parentNode;
    }
  }

  // Remove newNode from its current parent if it has one
  if (newNode.parentNode) {
    removeChild(newNode.parentNode, newNode);
  }

  // Insert into childNodes
  parent.childNodes.splice(refIndex, 0, newNode);
  newNode.parentNode = parent;

  // Update sibling relationships for all nodes
  newNode.previousSibling = referenceNode.previousSibling;
  newNode.nextSibling = referenceNode;
  
  if (referenceNode.previousSibling) {
    referenceNode.previousSibling.nextSibling = newNode;
  }
  referenceNode.previousSibling = newNode;

  // Update firstChild if inserting at the beginning
  if (parent.firstChild === referenceNode) {
    parent.firstChild = newNode;
  }

  // Handle element-specific relationships
  if (
    parent.nodeType === NodeType.ELEMENT_NODE &&
    newNode.nodeType === NodeType.ELEMENT_NODE
  ) {
    const parentElement = parent;
    const newElement = newNode;

    newElement.parentElement = parentElement;

    // Find the reference node in the children array
    let refElementIndex = -1;
    if (referenceNode.nodeType === NodeType.ELEMENT_NODE) {
      refElementIndex = parentElement.children.indexOf(referenceNode);
    } else {
      // Find the next element sibling
      let nextElement = referenceNode.nextSibling;
      while (nextElement && nextElement.nodeType !== NodeType.ELEMENT_NODE) {
        nextElement = nextElement.nextSibling;
      }
      if (nextElement) {
        refElementIndex = parentElement.children.indexOf(nextElement);
      }
    }

    if (refElementIndex === -1) {
      // No element siblings after, append to children
      parentElement.children.push(newElement);
    } else {
      // Insert before the reference element
      parentElement.children.splice(refElementIndex, 0, newElement);
    }

    // Update element sibling relationships
    const newElemIndex = parentElement.children.indexOf(newElement);
    newElement.previousElementSibling =
      newElemIndex > 0 ? parentElement.children[newElemIndex - 1] : null;
    newElement.nextElementSibling =
      newElemIndex < parentElement.children.length - 1
        ? parentElement.children[newElemIndex + 1]
        : null;

    if (newElement.previousElementSibling) {
      newElement.previousElementSibling.nextElementSibling = newElement;
    }
    if (newElement.nextElementSibling) {
      newElement.nextElementSibling.previousElementSibling = newElement;
    }

    // Update firstElementChild if needed
    if (newElemIndex === 0) {
      parentElement.firstElementChild = newElement;
    }

    // lastElementChild is not affected since we're inserting before
  }

  if (parent.nodeType === NodeType.ELEMENT_NODE) {
    updateElementContent(parent);
  }

  return newNode;
}

function replaceChild(parent: any, newChild: any, oldChild: any): any {
  // Verify oldChild is actually a child of parent
  const oldIndex = parent.childNodes.indexOf(oldChild);
  if (oldIndex === -1) {
    throw new Error("Old child is not a child of this node");
  }

  // Check for hierarchy request error: prevent circular references
  if (newChild.nodeType === NodeType.ELEMENT_NODE || newChild.nodeType === NodeType.DOCUMENT_NODE) {
    let ancestor = parent;
    while (ancestor) {
      if (ancestor === newChild) {
        throw new Error("HierarchyRequestError: Cannot insert a node as a descendant of itself");
      }
      ancestor = ancestor.parentNode;
    }
  }

  // Remove newChild from its current parent if it has one
  if (newChild.parentNode) {
    removeChild(newChild.parentNode, newChild);
  }

  // Replace in childNodes array
  parent.childNodes[oldIndex] = newChild;
  newChild.parentNode = parent;

  // Transfer sibling relationships
  newChild.previousSibling = oldChild.previousSibling;
  newChild.nextSibling = oldChild.nextSibling;

  if (oldChild.previousSibling) {
    oldChild.previousSibling.nextSibling = newChild;
  }
  if (oldChild.nextSibling) {
    oldChild.nextSibling.previousSibling = newChild;
  }

  // Update first/last child if needed
  if (parent.firstChild === oldChild) {
    parent.firstChild = newChild;
  }
  if (parent.lastChild === oldChild) {
    parent.lastChild = newChild;
  }

  // Handle element-specific relationships
  if (parent.nodeType === NodeType.ELEMENT_NODE) {
    const parentElement = parent;

    // Remove old element from children if it's an element
    if (oldChild.nodeType === NodeType.ELEMENT_NODE) {
      const oldElemIndex = parentElement.children.indexOf(oldChild);
      if (oldElemIndex !== -1) {
        if (newChild.nodeType === NodeType.ELEMENT_NODE) {
          // Replace with new element
          parentElement.children[oldElemIndex] = newChild;
          newChild.parentElement = parentElement;

          // Transfer element sibling relationships
          newChild.previousElementSibling = oldChild.previousElementSibling;
          newChild.nextElementSibling = oldChild.nextElementSibling;

          if (oldChild.previousElementSibling) {
            oldChild.previousElementSibling.nextElementSibling = newChild;
          }
          if (oldChild.nextElementSibling) {
            oldChild.nextElementSibling.previousElementSibling = newChild;
          }

          if (parentElement.firstElementChild === oldChild) {
            parentElement.firstElementChild = newChild;
          }
          if (parentElement.lastElementChild === oldChild) {
            parentElement.lastElementChild = newChild;
          }
        } else {
          // Replacing element with non-element, remove from children
          parentElement.children.splice(oldElemIndex, 1);

          if (oldChild.previousElementSibling) {
            oldChild.previousElementSibling.nextElementSibling =
              oldChild.nextElementSibling;
          }
          if (oldChild.nextElementSibling) {
            oldChild.nextElementSibling.previousElementSibling =
              oldChild.previousElementSibling;
          }

          if (parentElement.firstElementChild === oldChild) {
            parentElement.firstElementChild = oldChild.nextElementSibling;
          }
          if (parentElement.lastElementChild === oldChild) {
            parentElement.lastElementChild = oldChild.previousElementSibling;
          }
        }
      }
    } else if (newChild.nodeType === NodeType.ELEMENT_NODE) {
      // Replacing non-element with element, need to insert into children array
      const newElement = newChild;
      newElement.parentElement = parentElement;

      // Find correct position in children array
      let insertIndex = 0;
      for (let i = 0; i < oldIndex; i++) {
        if (parent.childNodes[i].nodeType === NodeType.ELEMENT_NODE) {
          insertIndex++;
        }
      }

      parentElement.children.splice(insertIndex, 0, newElement);

      // Update element sibling relationships
      newElement.previousElementSibling =
        insertIndex > 0 ? parentElement.children[insertIndex - 1] : null;
      newElement.nextElementSibling =
        insertIndex < parentElement.children.length - 1
          ? parentElement.children[insertIndex + 1]
          : null;

      if (newElement.previousElementSibling) {
        newElement.previousElementSibling.nextElementSibling = newElement;
      }
      if (newElement.nextElementSibling) {
        newElement.nextElementSibling.previousElementSibling = newElement;
      }

      if (insertIndex === 0) {
        parentElement.firstElementChild = newElement;
      }
      if (insertIndex === parentElement.children.length - 1) {
        parentElement.lastElementChild = newElement;
      }
    }
  }

  // Clear oldChild's relationships
  oldChild.parentNode = null;
  if (oldChild.nodeType === NodeType.ELEMENT_NODE) {
    oldChild.parentElement = null;
  }
  oldChild.previousSibling = null;
  oldChild.nextSibling = null;
  if (oldChild.nodeType === NodeType.ELEMENT_NODE) {
    oldChild.previousElementSibling = null;
    oldChild.nextElementSibling = null;
  }

  if (parent.nodeType === NodeType.ELEMENT_NODE) {
    updateElementContent(parent);
  }

  return oldChild;
}

function insertAfter(parent: any, newNode: any, referenceNode: any): any {
  // If referenceNode is null, insert at the beginning
  if (referenceNode === null) {
    insertBefore(parent, newNode, parent.firstChild);
    return newNode;
  }

  // Verify referenceNode is actually a child of parent
  const refIndex = parent.childNodes.indexOf(referenceNode);
  if (refIndex === -1) {
    throw new Error("Reference node is not a child of this node");
  }

  // Insert after means insert before the next sibling
  const nextSibling = referenceNode.nextSibling;
  return insertBefore(parent, newNode, nextSibling);
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
  
  // Update internal outerHTML without triggering the setter
  Object.defineProperty(element, "_internalOuterHTML", {
    value: `<${tagNameLower}${attrs}>${innerHTML}</${tagNameLower}>`,
    writable: true,
    enumerable: false,
    configurable: true,
  });

  const computedTextContent = getTextContent(element);
  Object.defineProperty(element, "_internalTextContent", {
    value: computedTextContent,
    writable: true,
    enumerable: false,
    configurable: true,
  });

  // Propagate changes up to parent elements
  if (element.parentElement) {
    updateElementContent(element.parentElement);
  }
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
  
  // Update internal outerHTML without triggering the setter
  Object.defineProperty(element, "_internalOuterHTML", {
    value: `<${tagNameLower}${attrs}>${actualInnerHTML}</${tagNameLower}>`,
    writable: true,
    enumerable: false,
    configurable: true,
  });
}

export function setOuterHTML(element: any, html: string): void {
  // Cannot replace document root or elements without parent
  if (!element.parentNode) {
    throw new Error("Cannot set outerHTML on element without a parent");
  }

  const parent = element.parentNode;
  const indexInParent = parent.childNodes.indexOf(element);
  
  if (indexInParent === -1) {
    throw new Error("Element not found in parent's childNodes");
  }

  // Parse the new HTML
  let newNodes: any[] = [];
  
  if (html.trim()) {
    const tokens = tokenize(html);
    const ast = parse(tokens);
    
    if (ast.children) {
      for (const child of ast.children) {
        const domChild = convertASTNodeToDOM(child);
        if (domChild) {
          newNodes.push(domChild);
        }
      }
    }
  }

  // Store references to siblings
  const previousSibling = element.previousSibling;
  const nextSibling = element.nextSibling;

  // Remove the element from parent's childNodes
  parent.childNodes.splice(indexInParent, 1);

  // Insert new nodes at the same position
  if (newNodes.length > 0) {
    // Insert all new nodes at the position where element was
    parent.childNodes.splice(indexInParent, 0, ...newNodes);

    // Set up parentNode for all new nodes
    for (const newNode of newNodes) {
      newNode.parentNode = parent;
      newNode.parentElement = parent.nodeType === NodeType.ELEMENT_NODE ? parent : null;
    }

    // Update sibling relationships
    for (let i = 0; i < newNodes.length; i++) {
      const currentNode = newNodes[i];
      
      // Set previousSibling
      if (i === 0) {
        currentNode.previousSibling = previousSibling;
        if (previousSibling) {
          previousSibling.nextSibling = currentNode;
        }
      } else {
        currentNode.previousSibling = newNodes[i - 1];
      }

      // Set nextSibling
      if (i === newNodes.length - 1) {
        currentNode.nextSibling = nextSibling;
        if (nextSibling) {
          nextSibling.previousSibling = currentNode;
        }
      } else {
        currentNode.nextSibling = newNodes[i + 1];
      }
    }
  } else {
    // No new nodes, just connect siblings to each other
    if (previousSibling) {
      previousSibling.nextSibling = nextSibling;
    }
    if (nextSibling) {
      nextSibling.previousSibling = previousSibling;
    }
  }

  // Clear element's relationships
  element.parentNode = null;
  element.parentElement = null;
  element.previousSibling = null;
  element.nextSibling = null;

  // Update parent's children array (only element nodes)
  parent.children = parent.childNodes.filter(
    (child: any) => child.nodeType === NodeType.ELEMENT_NODE
  );

  // Update firstChild and lastChild
  parent.firstChild = parent.childNodes.length > 0 ? parent.childNodes[0] : null;
  parent.lastChild = parent.childNodes.length > 0 ? parent.childNodes[parent.childNodes.length - 1] : null;

  // Update firstElementChild and lastElementChild
  parent.firstElementChild = parent.children.length > 0 ? parent.children[0] : null;
  parent.lastElementChild = parent.children.length > 0 ? parent.children[parent.children.length - 1] : null;

  // Update element sibling pointers for all children
  for (let i = 0; i < parent.children.length; i++) {
    const child = parent.children[i];
    child.previousElementSibling = i > 0 ? parent.children[i - 1] : null;
    child.nextElementSibling = i < parent.children.length - 1 ? parent.children[i + 1] : null;
  }

  // Update parent's content
  updateElementContent(parent);
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
