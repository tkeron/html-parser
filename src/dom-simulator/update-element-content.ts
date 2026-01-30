import { NodeType, VOID_ELEMENTS } from "./node-types.js";
import { getTextContent } from "./get-text-content.js";
import { escapeTextContent } from "./escape-text-content.js";

export const updateElementContent = (element: any): void => {
  const innerHTML = element.childNodes
    .map((child: any) => {
      if (child.nodeType === NodeType.TEXT_NODE) {
        return escapeTextContent(child.textContent || "");
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
  const isVoid = VOID_ELEMENTS.has(tagNameLower);

  const outerHTML = isVoid
    ? `<${tagNameLower}${attrs}>`
    : `<${tagNameLower}${attrs}>${innerHTML}</${tagNameLower}>`;

  Object.defineProperty(element, "_internalOuterHTML", {
    value: outerHTML,
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

  if (element.parentElement) {
    element.parentElement._internalOuterHTML = undefined;
    element.parentElement._internalInnerHTML = undefined;
    element.parentElement._internalTextContent = undefined;
  }
};
