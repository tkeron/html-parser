import { NodeType } from "./node-types.js";
import { updateElementContent } from "./update-element-content.js";

const removeChild = (parent: any, child: any): void => {
  const index = parent.childNodes.indexOf(child);
  if (index === -1) return;

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

  child.parentNode = null;
  child.nextSibling = null;
  child.previousSibling = null;

  if (
    parent.nodeType === NodeType.ELEMENT_NODE &&
    child.nodeType === NodeType.ELEMENT_NODE
  ) {
    const parentElement = parent;
    const childElement = child;

    const elementIndex = parentElement.children.indexOf(childElement);
    if (elementIndex !== -1) {
      parentElement.children.splice(elementIndex, 1);

      if (childElement.previousElementSibling) {
        childElement.previousElementSibling.nextElementSibling =
          childElement.nextElementSibling;
      }
      if (childElement.nextElementSibling) {
        childElement.nextElementSibling.previousElementSibling =
          childElement.previousElementSibling;
      }

      if (parentElement.firstElementChild === childElement) {
        parentElement.firstElementChild = childElement.nextElementSibling;
      }
      if (parentElement.lastElementChild === childElement) {
        parentElement.lastElementChild = childElement.previousElementSibling;
      }

      childElement.parentElement = null;
      childElement.nextElementSibling = null;
      childElement.previousElementSibling = null;
    }
  }

  if (parent.nodeType === NodeType.ELEMENT_NODE) {
    updateElementContent(parent);
  }
};

export const appendChild = (parent: any, child: any): void => {
  if (
    child.nodeType === NodeType.ELEMENT_NODE ||
    child.nodeType === NodeType.DOCUMENT_NODE
  ) {
    let ancestor = parent;
    while (ancestor) {
      if (ancestor === child) {
        throw new Error(
          "HierarchyRequestError: Cannot insert a node as a descendant of itself",
        );
      }
      ancestor = ancestor.parentNode;
    }
  }

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
};
