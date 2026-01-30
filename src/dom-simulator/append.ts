import { createTextNode } from "./create-text-node.js";
import { appendChild } from "./append-child.js";

export const append = (parent: any, ...nodes: any[]): void => {
  if (nodes.length === 0) return;

  for (const node of nodes) {
    let childNode: any;

    if (typeof node === "string") {
      childNode = createTextNode(node);
    } else {
      childNode = node;
    }

    appendChild(parent, childNode);
  }
};
