import { SelectorGroup, SelectorToken } from "./types.ts";
import { parseSelector } from "./parse-selector.ts";
import { matchesSelector } from "./matches-selector.ts";
import { findElementsDescendant } from "./find-elements-descendant.ts";

const findElementsSimple = (
  node: any,
  tokens: SelectorToken[],
  results: any[],
): void => {
  if (node.nodeType === 1) {
    const element = node;
    if (matchesSelector(element, tokens)) {
      results.push(element);
    }
  }
  for (const child of node.childNodes || []) {
    findElementsSimple(child, tokens, results);
  }
};

const findElements = (
  node: any,
  selectorGroups: SelectorGroup[],
  results: any[],
): void => {
  if (selectorGroups.length === 1) {
    const firstGroup = selectorGroups[0];
    if (firstGroup) {
      const tokens = firstGroup.tokens;
      findElementsSimple(node, tokens, results);
    }
  } else {
    findElementsDescendant(node, selectorGroups, 0, results);
  }
};

export const querySelectorAll = (root: any, selector: string): any[] => {
  const selectorGroups = parseSelector(selector);
  const results: any[] = [];
  findElements(root, selectorGroups, results);
  return results;
};
