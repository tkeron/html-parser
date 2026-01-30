import { removeChild } from "./remove-child.js";

export const remove = (node: any): void => {
  if (node.parentNode) {
    removeChild(node.parentNode, node);
  }
};
