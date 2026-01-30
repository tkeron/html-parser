import { NodeType } from "./node-types.js";
import { querySelectorAll as querySelectorAllFunction } from "../selectors";
import { createTempParent } from "./create-temp-parent.js";

export const matches = (element: any, selector: string): boolean => {
  if (!selector || element.nodeType !== NodeType.ELEMENT_NODE) {
    return false;
  }

  try {
    if (selector.includes(" ") || selector.includes(">")) {
      let root = element;
      while (root.parentNode) {
        root = root.parentNode;
      }
      const results = querySelectorAllFunction(root, selector);
      return results.includes(element);
    }

    const parent = element.parentNode || createTempParent(element);
    const results = querySelectorAllFunction(parent, selector);
    return results.includes(element);
  } catch (error) {
    return false;
  }
};
