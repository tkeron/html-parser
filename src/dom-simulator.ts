import type { ASTNode } from "./parser/index";
import {
  querySelector as querySelectorFunction,
  querySelectorAll as querySelectorAllFunction,
} from "./selectors";
import { NodeType } from "./dom-simulator/node-types.js";
import { createElement } from "./dom-simulator/create-element.js";
import { createDocument } from "./dom-simulator/create-document.js";
import { appendChild } from "./dom-simulator/append-child.js";
import { convertASTNodeToDOM } from "./dom-simulator/convert-ast-node-to-dom.js";
import { findSpecialElements } from "./dom-simulator/find-special-elements.js";

export const astToDOM = (ast: ASTNode): Document => {
  const document = createDocument();
  if (ast.children) {
    for (const child of ast.children) {
      const Node = convertASTNodeToDOM(child);
      if (Node) {
        appendChild(document, Node);
        if (Node.nodeType === NodeType.ELEMENT_NODE) {
          const element = Node as any;
          if (element.tagName === "HTML") {
            document.documentElement = element;
            findSpecialElements(document, element);
          } else if (element.tagName === "BODY") {
            document.body = element;
          } else if (element.tagName === "HEAD") {
            document.head = element;
          }
        }
      }
    }
  }

  if (!document.body) {
    const bodyElement = createElement("body");
    document.body = bodyElement;

    bodyElement.querySelector = function (selector: string) {
      return querySelectorFunction(document, selector);
    };
    bodyElement.querySelectorAll = function (selector: string) {
      return querySelectorAllFunction(document, selector);
    };
  }

  return document;
};

export { querySelector, querySelectorAll } from "./selectors";
