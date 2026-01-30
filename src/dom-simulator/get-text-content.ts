import { NodeType } from "./node-types.js";

export const getTextContent = (node: any): string => {
  if (node.nodeType === NodeType.TEXT_NODE) {
    return node.textContent || "";
  }
  if (
    node.nodeType !== NodeType.ELEMENT_NODE &&
    node.nodeType !== NodeType.DOCUMENT_NODE
  ) {
    return "";
  }
  let textContent = "";
  for (const child of node.childNodes) {
    textContent += getTextContent(child);
  }
  return textContent;
};
