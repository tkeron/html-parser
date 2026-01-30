import { NodeType } from "./node-types.js";

export const createDoctype = (
  name: string = "html",
  publicId?: string,
  systemId?: string,
): any => {
  const doctypeNode: any = {
    nodeType: NodeType.DOCUMENT_TYPE_NODE,
    nodeName: name.toUpperCase(),
    name: name.toLowerCase(),
    nodeValue: null,
    textContent: "",
    publicId: publicId || null,
    systemId: systemId || null,
    childNodes: [],
    parentNode: null,
    firstChild: null,
    lastChild: null,
    nextSibling: null,
    previousSibling: null,
  };
  return doctypeNode;
};
