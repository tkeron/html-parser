import { NodeType } from "./node-types.js";
import { removeChild } from "./remove-child.js";
import { updateElementContent } from "./update-element-content.js";

export const replaceChild = (
  parent: any,
  newChild: any,
  oldChild: any,
): any => {
  const oldIndex = parent.childNodes.indexOf(oldChild);
  if (oldIndex === -1) {
    throw new Error("Old child is not a child of this node");
  }

  if (
    newChild.nodeType === NodeType.ELEMENT_NODE ||
    newChild.nodeType === NodeType.DOCUMENT_NODE
  ) {
    let ancestor = parent;
    while (ancestor) {
      if (ancestor === newChild) {
        throw new Error(
          "HierarchyRequestError: Cannot insert a node as a descendant of itself",
        );
      }
      ancestor = ancestor.parentNode;
    }
  }

  if (newChild.parentNode) {
    removeChild(newChild.parentNode, newChild);
  }

  parent.childNodes[oldIndex] = newChild;
  newChild.parentNode = parent;

  newChild.previousSibling = oldChild.previousSibling;
  newChild.nextSibling = oldChild.nextSibling;

  if (oldChild.previousSibling) {
    oldChild.previousSibling.nextSibling = newChild;
  }
  if (oldChild.nextSibling) {
    oldChild.nextSibling.previousSibling = newChild;
  }

  if (parent.firstChild === oldChild) {
    parent.firstChild = newChild;
  }
  if (parent.lastChild === oldChild) {
    parent.lastChild = newChild;
  }

  if (parent.nodeType === NodeType.ELEMENT_NODE) {
    const parentElement = parent;

    if (oldChild.nodeType === NodeType.ELEMENT_NODE) {
      const oldElemIndex = parentElement.children.indexOf(oldChild);
      if (oldElemIndex !== -1) {
        if (newChild.nodeType === NodeType.ELEMENT_NODE) {
          parentElement.children[oldElemIndex] = newChild;
          newChild.parentElement = parentElement;

          newChild.previousElementSibling = oldChild.previousElementSibling;
          newChild.nextElementSibling = oldChild.nextElementSibling;

          if (oldChild.previousElementSibling) {
            oldChild.previousElementSibling.nextElementSibling = newChild;
          }
          if (oldChild.nextElementSibling) {
            oldChild.nextElementSibling.previousElementSibling = newChild;
          }

          if (parentElement.firstElementChild === oldChild) {
            parentElement.firstElementChild = newChild;
          }
          if (parentElement.lastElementChild === oldChild) {
            parentElement.lastElementChild = newChild;
          }
        } else {
          parentElement.children.splice(oldElemIndex, 1);

          if (oldChild.previousElementSibling) {
            oldChild.previousElementSibling.nextElementSibling =
              oldChild.nextElementSibling;
          }
          if (oldChild.nextElementSibling) {
            oldChild.nextElementSibling.previousElementSibling =
              oldChild.previousElementSibling;
          }

          if (parentElement.firstElementChild === oldChild) {
            parentElement.firstElementChild = oldChild.nextElementSibling;
          }
          if (parentElement.lastElementChild === oldChild) {
            parentElement.lastElementChild = oldChild.previousElementSibling;
          }
        }
      }
    } else if (newChild.nodeType === NodeType.ELEMENT_NODE) {
      const newElement = newChild;
      newElement.parentElement = parentElement;

      let insertIndex = 0;
      for (let i = 0; i < oldIndex; i++) {
        if (parent.childNodes[i].nodeType === NodeType.ELEMENT_NODE) {
          insertIndex++;
        }
      }

      parentElement.children.splice(insertIndex, 0, newElement);

      newElement.previousElementSibling =
        insertIndex > 0 ? parentElement.children[insertIndex - 1] : null;
      newElement.nextElementSibling =
        insertIndex < parentElement.children.length - 1
          ? parentElement.children[insertIndex + 1]
          : null;

      if (newElement.previousElementSibling) {
        newElement.previousElementSibling.nextElementSibling = newElement;
      }
      if (newElement.nextElementSibling) {
        newElement.nextElementSibling.previousElementSibling = newElement;
      }

      if (insertIndex === 0) {
        parentElement.firstElementChild = newElement;
      }
      if (insertIndex === parentElement.children.length - 1) {
        parentElement.lastElementChild = newElement;
      }
    }
  }

  oldChild.parentNode = null;
  if (oldChild.nodeType === NodeType.ELEMENT_NODE) {
    oldChild.parentElement = null;
  }
  oldChild.previousSibling = null;
  oldChild.nextSibling = null;
  if (oldChild.nodeType === NodeType.ELEMENT_NODE) {
    oldChild.previousElementSibling = null;
    oldChild.nextElementSibling = null;
  }

  if (parent.nodeType === NodeType.ELEMENT_NODE) {
    updateElementContent(parent);
  }

  return oldChild;
};
