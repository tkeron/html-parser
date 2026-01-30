import { insertBefore } from "./insert-before.js";

export const insertAfter = (
  parent: any,
  newNode: any,
  referenceNode: any,
): any => {
  if (referenceNode === null) {
    insertBefore(parent, newNode, parent.firstChild);
    return newNode;
  }

  const refIndex = parent.childNodes.indexOf(referenceNode);
  if (refIndex === -1) {
    throw new Error("Reference node is not a child of this node");
  }

  const nextSibling = referenceNode.nextSibling;
  return insertBefore(parent, newNode, nextSibling);
};
