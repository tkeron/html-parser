import { SelectorGroup } from "./types.ts";
import { matchesSelector } from "./matches-selector.ts";

export const findElementsDescendant = (
  node: any,
  selectorGroups: SelectorGroup[],
  groupIndex: number,
  results: any[],
): void => {
  if (groupIndex >= selectorGroups.length) {
    return;
  }

  const currentGroup = selectorGroups[groupIndex];
  if (!currentGroup) {
    return;
  }

  const isLastGroup = groupIndex === selectorGroups.length - 1;

  for (const child of node.childNodes || []) {
    if (child.nodeType === 1) {
      const element = child;

      if (matchesSelector(element, currentGroup.tokens)) {
        if (isLastGroup) {
          results.push(element);
        } else {
          findElementsDescendant(
            element,
            selectorGroups,
            groupIndex + 1,
            results,
          );
        }
      }
    }

    const shouldContinueSearching =
      !isLastGroup ||
      child.nodeType !== 1 ||
      !matchesSelector(child, currentGroup.tokens);
    if (shouldContinueSearching) {
      findElementsDescendant(child, selectorGroups, groupIndex, results);
    }
  }
};
