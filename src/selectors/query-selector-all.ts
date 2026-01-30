import type { SelectorGroup, SelectorToken } from "./types.js";
import { parseSelector } from "./parse-selector.js";
import { matchesSelector } from "./matches-selector.js";
import { findElementsDescendant } from "./find-elements-descendant.js";

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
