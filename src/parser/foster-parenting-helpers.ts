export const mergeAdjacentTextNodes = (
  parent: any,
  insertIndex: number,
): void => {
  if (!parent.childNodes || parent.childNodes.length < 2) {
    return;
  }

  const node = parent.childNodes[insertIndex];
  if (!node || node.nodeType !== 3) {
    return;
  }

  if (insertIndex > 0) {
    const prevNode = parent.childNodes[insertIndex - 1];
    if (prevNode && prevNode.nodeType === 3) {
      prevNode.textContent =
        (prevNode.textContent || "") + (node.textContent || "");
      prevNode.nodeValue = prevNode.textContent;
      parent.childNodes.splice(insertIndex, 1);
      return;
    }
  }

  if (insertIndex < parent.childNodes.length - 1) {
    const nextNode = parent.childNodes[insertIndex + 1];
    if (nextNode && nextNode.nodeType === 3) {
      node.textContent =
        (node.textContent || "") + (nextNode.textContent || "");
      node.nodeValue = node.textContent;
      parent.childNodes.splice(insertIndex + 1, 1);
    }
  }
};

export const insertNodeBeforeTable = (
  parent: any,
  tableElement: any,
  node: any,
): number => {
  const idx = parent.childNodes.indexOf(tableElement);
  if (idx !== -1) {
    node.parentNode = parent;
    parent.childNodes.splice(idx, 0, node);
    return idx;
  }
  return -1;
};
