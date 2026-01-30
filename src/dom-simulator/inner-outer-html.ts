import { NodeType, VOID_ELEMENTS } from "./node-types.js";
import { tokenize } from "../tokenizer/index.js";
import { parse } from "../parser/index.js";
import { appendChild } from "./append-child.js";
import { getTextContent } from "./get-text-content.js";
import { escapeTextContent } from "./escape-text-content.js";
import { updateElementContent } from "./update-element-content.js";

export const setInnerHTML = (element: any, html: string): void => {
  element.childNodes = [];
  element.children = [];
  element.firstChild = null;
  element.lastChild = null;
  element.firstElementChild = null;
  element.lastElementChild = null;

  if (html.trim()) {
    const wrappedHtml = "<div>" + html + "</div>";
    const tokens = tokenize(wrappedHtml);
    const doc = parse(tokens);
    const div = doc.querySelector("div");
    if (div && div.childNodes) {
      const nodesToMove = [...div.childNodes];
      for (const child of nodesToMove) {
        child.parentNode = null;
        appendChild(element, child);
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
  const isVoid = VOID_ELEMENTS.has(tagNameLower);

  Object.defineProperty(element, "_internalOuterHTML", {
    value: isVoid
      ? `<${tagNameLower}${attrs}>`
      : `<${tagNameLower}${attrs}>${actualInnerHTML}</${tagNameLower}>`,
    writable: true,
    enumerable: false,
    configurable: true,
  });
};

export const setOuterHTML = (element: any, html: string): void => {
  if (!element.parentNode) {
    throw new Error("Cannot set outerHTML on element without a parent");
  }

  const parent = element.parentNode;
  const indexInParent = parent.childNodes.indexOf(element);

  if (indexInParent === -1) {
    throw new Error("Element not found in parent's childNodes");
  }

  let newNodes: any[] = [];

  if (html.trim()) {
    const tokens = tokenize(html);
    const doc = parse(tokens);
    const body = doc.body;
    if (body && body.childNodes) {
      for (const child of body.childNodes) {
        child.parentNode = null;
        newNodes.push(child);
      }
    }
  }

  const previousSibling = element.previousSibling;
  const nextSibling = element.nextSibling;

  parent.childNodes.splice(indexInParent, 1);

  if (newNodes.length > 0) {
    parent.childNodes.splice(indexInParent, 0, ...newNodes);

    for (const newNode of newNodes) {
      newNode.parentNode = parent;
      newNode.parentElement =
        parent.nodeType === NodeType.ELEMENT_NODE ? parent : null;
    }

    for (let i = 0; i < newNodes.length; i++) {
      const currentNode = newNodes[i];

      if (i === 0) {
        currentNode.previousSibling = previousSibling;
        if (previousSibling) {
          previousSibling.nextSibling = currentNode;
        }
      } else {
        currentNode.previousSibling = newNodes[i - 1];
      }

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
    if (previousSibling) {
      previousSibling.nextSibling = nextSibling;
    }
    if (nextSibling) {
      nextSibling.previousSibling = previousSibling;
    }
  }

  element.parentNode = null;
  element.parentElement = null;
  element.previousSibling = null;
  element.nextSibling = null;

  parent.children = parent.childNodes.filter(
    (child: any) => child.nodeType === NodeType.ELEMENT_NODE,
  );

  parent.firstChild =
    parent.childNodes.length > 0 ? parent.childNodes[0] : null;
  parent.lastChild =
    parent.childNodes.length > 0
      ? parent.childNodes[parent.childNodes.length - 1]
      : null;

  parent.firstElementChild =
    parent.children.length > 0 ? parent.children[0] : null;
  parent.lastElementChild =
    parent.children.length > 0
      ? parent.children[parent.children.length - 1]
      : null;

  for (let i = 0; i < parent.children.length; i++) {
    const child = parent.children[i];
    child.previousElementSibling = i > 0 ? parent.children[i - 1] : null;
    child.nextElementSibling =
      i < parent.children.length - 1 ? parent.children[i + 1] : null;
  }

  updateElementContent(parent);
};

export const getInnerHTML = (element: any): string => {
  if (element.nodeType !== NodeType.ELEMENT_NODE) {
    return "";
  }

  let innerHTML = "";
  for (const child of element.childNodes) {
    if (child.nodeType === NodeType.ELEMENT_NODE) {
      innerHTML += child.outerHTML;
    } else if (child.nodeType === NodeType.TEXT_NODE) {
      innerHTML += escapeTextContent(child.textContent || "");
    } else if (child.nodeType === NodeType.COMMENT_NODE) {
      innerHTML += `<!--${child.data || ""}-->`;
    }
  }
  return innerHTML;
};
