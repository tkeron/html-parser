import { NodeType } from "./node-types.js";

export const createComment = (content: string): any => {
  const commentNode: any = {
    nodeType: NodeType.COMMENT_NODE,
    nodeName: "#comment",
    nodeValue: content,
    textContent: content,
    data: content,
    childNodes: [],
    parentNode: null,
    firstChild: null,
    lastChild: null,
    nextSibling: null,
    previousSibling: null,

    remove(): void {
      remove(commentNode);
    },
  };
  return commentNode;
};
