import { NodeType } from "./node-types.js";

export const findSpecialElements = (document: any, htmlElement: any): void => {
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
};
