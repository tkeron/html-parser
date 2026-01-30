import { NodeType } from "./node-types.js";

export const createCDATA = (content: string): any => {
  const cdataNode: any = {
    nodeType: NodeType.CDATA_SECTION_NODE,
    nodeName: "#cdata-section",
    nodeValue: content,
    textContent: content,
    data: content,
    childNodes: [],
    parentNode: null,
    firstChild: null,
    lastChild: null,
    nextSibling: null,
    previousSibling: null,
  };
  return cdataNode;
};
