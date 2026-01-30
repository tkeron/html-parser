import { createTextNode } from "./create-text-node.js";
import { insertBefore } from "./insert-before.js";
import { appendChild } from "./append-child.js";

export const prepend = (parent: any, ...nodes: any[]): void => {
  if (nodes.length === 0) return;

  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    let childNode: any;

    if (typeof node === "string") {
      childNode = createTextNode(node);
    } else {
      childNode = node;
    }

    if (parent.firstChild) {
      insertBefore(parent, childNode, parent.firstChild);
    } else {
      appendChild(parent, childNode);
    }
  }
};
