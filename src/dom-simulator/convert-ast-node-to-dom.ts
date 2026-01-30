import type { ASTNode } from "../parser/index";
import { createElement } from "./create-element.js";
import { createTextNode } from "./create-text-node.js";
import { createComment } from "./create-comment.js";
import { appendChild } from "./append-child.js";
import { updateElementContent } from "./update-element-content.js";

export const convertASTNodeToDOM = (astNode: ASTNode): any => {
  switch (astNode.type) {
    case "ELEMENT":
      const tagName = astNode.tagName || "div";
      const element = createElement(tagName, astNode.attributes || {});

      if (astNode.children) {
        for (const child of astNode.children) {
          const domChild = convertASTNodeToDOM(child);
          if (domChild) {
            appendChild(element, domChild);
          }
        }
      }

      updateElementContent(element);
      return element;
    case "TEXT":
      return createTextNode(astNode.content || "");
    case "COMMENT":
      return createComment(astNode.content || "");
    case "CDATA":
      return createTextNode(astNode.content || "");
    case "DOCTYPE":
    case "PROCESSING_INSTRUCTION":
      return null;
    default:
      return null;
  }
};
