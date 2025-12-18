interface SelectorToken {
  type: "tag" | "class" | "id" | "attribute";
  value: string;
  attributeName?: string;
  attributeValue?: string;
}

interface SelectorGroup {
  tokens: SelectorToken[];
}

function parseSelector(selector: string): SelectorGroup[] {
  const parts = selector.trim().split(/\s+/);

  return parts.map((part) => {
    const trimmed = part.trim();
    let tokens: SelectorToken[];

    if (trimmed.startsWith("#")) {
      tokens = [{ type: "id", value: trimmed.slice(1) }];
    } else if (trimmed.startsWith(".")) {
      tokens = [{ type: "class", value: trimmed.slice(1) }];
    } else if (trimmed.includes("[") && trimmed.includes("]")) {
      const attributeMatch = trimmed.match(/^([^[\]]*)\[([^=\]]+)(?:=["']?([^"'\]]*?)["']?)?\]$/);
      if (attributeMatch) {
        const [, tagName, attrName, attrValue] = attributeMatch;
        tokens = [];
        
        if (tagName && tagName.trim()) {
          tokens.push({ type: "tag", value: tagName.trim().toLowerCase() });
        }
        
        tokens.push({ 
          type: "attribute", 
          value: (attrName || "").trim(),
          attributeName: (attrName || "").trim(),
          attributeValue: attrValue ? attrValue.trim() : undefined
        });
      } else {
        tokens = [{ type: "tag", value: trimmed.toLowerCase() }];
      }
    } else {
      tokens = [{ type: "tag", value: trimmed.toLowerCase() }];
    }

    return { tokens };
  });
}

function matchesToken(element: any, token: SelectorToken): boolean {
  if (!element || !element.tagName) {
    return false;
  }

  switch (token.type) {
    case "tag":
      return element.tagName.toLowerCase() === token.value;
    case "class":
      const classAttr =
        element.attributes?.class || element.attributes?.className || "";
      const classes = classAttr.split(/\s+/).filter(Boolean);
      return classes.includes(token.value);
    case "id":
      return element.attributes?.id === token.value;
    case "attribute":
      const attrValue = element.attributes?.[token.attributeName || ""];
      if (token.attributeValue === undefined) {
        return attrValue !== undefined;
      }
      return attrValue === token.attributeValue;
    default:
      return false;
  }
}

function matchesSelector(element: any, tokens: SelectorToken[]): boolean {
  return tokens.every((token) => matchesToken(element, token));
}

function findElementsDescendant(
  node: any,
  selectorGroups: SelectorGroup[],
  groupIndex: number,
  results: any[]
): void {
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
            results
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
}

function findElements(
  node: any,
  selectorGroups: SelectorGroup[],
  results: any[]
): void {
  if (selectorGroups.length === 1) {
    const firstGroup = selectorGroups[0];
    if (firstGroup) {
      const tokens = firstGroup.tokens;
      findElementsSimple(node, tokens, results);
    }
  } else {
    findElementsDescendant(node, selectorGroups, 0, results);
  }
}

function findElementsSimple(
  node: any,
  tokens: SelectorToken[],
  results: any[]
): void {
  if (node.nodeType === 1) {
    const element = node;
    if (matchesSelector(element, tokens)) {
      results.push(element);
    }
  }
  for (const child of node.childNodes || []) {
    findElementsSimple(child, tokens, results);
  }
}

export function querySelectorAll(root: any, selector: string): any[] {
  const selectorGroups = parseSelector(selector);
  const results: any[] = [];
  findElements(root, selectorGroups, results);
  return results;
}

export function querySelector(root: any, selector: string): any | null {
  const results = querySelectorAll(root, selector);
  return results[0] || null;
}
