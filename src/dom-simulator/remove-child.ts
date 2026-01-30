import { NodeType } from "./node-types.js";
import { updateElementContent } from "./update-element-content.js";

export const removeChild = (parent: any, child: any): any => {
  const index = parent.childNodes.indexOf(child);
  if (index === -1) {
    throw new Error("Child not found");
  }

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

  if (
    parent.nodeType === NodeType.ELEMENT_NODE &&
    child.nodeType === NodeType.ELEMENT_NODE
  ) {
    const childElement = child;
    const elemIndex = parent.children.indexOf(childElement);
    if (elemIndex !== -1) {
      parent.children.splice(elemIndex, 1);

      if (childElement.previousElementSibling) {
        childElement.previousElementSibling.nextElementSibling =
          childElement.nextElementSibling;
      }
      if (childElement.nextElementSibling) {
        childElement.nextElementSibling.previousElementSibling =
          childElement.previousElementSibling;
      }

      if (parent.firstElementChild === childElement) {
        parent.firstElementChild = childElement.nextElementSibling;
      }
      if (parent.lastElementChild === childElement) {
        parent.lastElementChild = childElement.previousElementSibling;
      }
    }
  }

  child.parentNode = null;
  if (child.nodeType === NodeType.ELEMENT_NODE) {
    child.parentElement = null;
  }
  child.previousSibling = null;
  child.nextSibling = null;
  if (child.nodeType === NodeType.ELEMENT_NODE) {
    child.previousElementSibling = null;
    child.nextElementSibling = null;
  }

  if (parent.nodeType === NodeType.ELEMENT_NODE) {
    updateElementContent(parent);
  }
  return child;
};
