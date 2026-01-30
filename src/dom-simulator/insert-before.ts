import { NodeType } from "./node-types.js";
import { appendChild } from "./append-child.js";
import { removeChild } from "./remove-child.js";
import { updateElementContent } from "./update-element-content.js";

export const insertBefore = (
  parent: any,
  newNode: any,
  referenceNode: any,
): any => {
  if (referenceNode === null) {
    appendChild(parent, newNode);
    return newNode;
  }

  const refIndex = parent.childNodes.indexOf(referenceNode);
  if (refIndex === -1) {
    throw new Error("Reference node is not a child of this node");
  }

  if (
    newNode.nodeType === NodeType.ELEMENT_NODE ||
    newNode.nodeType === NodeType.DOCUMENT_NODE
  ) {
    let ancestor = parent;
    while (ancestor) {
      if (ancestor === newNode) {
        throw new Error(
          "HierarchyRequestError: Cannot insert a node as a descendant of itself",
        );
      }
      ancestor = ancestor.parentNode;
    }
  }

  if (newNode.parentNode) {
    removeChild(newNode.parentNode, newNode);
  }

  parent.childNodes.splice(refIndex, 0, newNode);
  newNode.parentNode = parent;

  newNode.previousSibling = referenceNode.previousSibling;
  newNode.nextSibling = referenceNode;

  if (referenceNode.previousSibling) {
    referenceNode.previousSibling.nextSibling = newNode;
  }
  referenceNode.previousSibling = newNode;

  if (parent.firstChild === referenceNode) {
    parent.firstChild = newNode;
  }

  if (
    parent.nodeType === NodeType.ELEMENT_NODE &&
    newNode.nodeType === NodeType.ELEMENT_NODE
  ) {
    const parentElement = parent;
    const newElement = newNode;

    newElement.parentElement = parentElement;

    let refElementIndex = -1;
    if (referenceNode.nodeType === NodeType.ELEMENT_NODE) {
      refElementIndex = parentElement.children.indexOf(referenceNode);
    } else {
      let nextElement = referenceNode.nextSibling;
      while (nextElement && nextElement.nodeType !== NodeType.ELEMENT_NODE) {
        nextElement = nextElement.nextSibling;
      }
      if (nextElement) {
        refElementIndex = parentElement.children.indexOf(nextElement);
      }
    }

    if (refElementIndex === -1) {
      parentElement.children.push(newElement);
    } else {
      parentElement.children.splice(refElementIndex, 0, newElement);
    }

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

    if (newElemIndex === 0) {
      parentElement.firstElementChild = newElement;
    }
  }

  if (parent.nodeType === NodeType.ELEMENT_NODE) {
    updateElementContent(parent);
  }

  return newNode;
};
