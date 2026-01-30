import { NodeType } from "./node-types.js";

export const createProcessingInstruction = (content: string): any => {
  const piNode: any = {
    nodeType: NodeType.PROCESSING_INSTRUCTION_NODE,
    nodeName: "#processing-instruction",
    nodeValue: content,
    textContent: content,
    data: content,
    target: content.split(" ")[0] || "",
    childNodes: [],
    parentNode: null,
    firstChild: null,
    lastChild: null,
    nextSibling: null,
    previousSibling: null,
  };
  return piNode;
};
