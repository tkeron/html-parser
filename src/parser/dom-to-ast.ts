import type { ASTNode } from "./types.js";
import { ASTNodeType } from "./types.js";

export const domToAST = (dom: any): ASTNode => {
  if (!dom) {
    return {
      type: ASTNodeType.Document,
      children: [],
    };
  }

  if (dom.nodeType === 9) {
    return {
      type: ASTNodeType.Document,
      children: dom.childNodes ? dom.childNodes.map(domToAST) : [],
    };
  }

  if (dom.nodeType === 1) {
    const attributes: Record<string, string> = {};
    if (dom.attributes) {
      for (const [name, value] of Object.entries(dom.attributes)) {
        attributes[name] = value;
      }
    }

    return {
      type: ASTNodeType.Element,
      tagName: dom.tagName.toLowerCase(),
      attributes,
      children: dom.childNodes ? dom.childNodes.map(domToAST) : [],
      namespaceURI: dom.namespaceURI,
      isSelfClosing: dom.isSelfClosing || false,
    };
  }

  if (dom.nodeType === 3) {
    return {
      type: ASTNodeType.Text,
      content: dom.textContent || "",
    };
  }

  if (dom.nodeType === 8) {
    return {
      type: ASTNodeType.Comment,
      content: (dom.data as string) || "",
    };
  }

  if (dom.nodeType === 10) {
    return {
      type: ASTNodeType.Doctype,
      name: dom.name || "html",
      publicId: dom.publicId || "",
      systemId: dom.systemId || "",
      content: dom.name || "html",
    };
  }

  if (dom.nodeType === 4) {
    return {
      type: ASTNodeType.CDATA,
      content: dom.textContent || "",
    };
  }

  return {
    type: ASTNodeType.Text,
    content: "",
  };
};
