import type { SelectorGroup, SelectorToken } from "./types.js";

export const parseSelector = (selector: string): SelectorGroup[] => {
  const parts = selector.trim().split(/\s+/);

  return parts.map((part) => {
    const trimmed = part.trim();
    let tokens: SelectorToken[] = [];

    if (trimmed === "*") {
      return { tokens: [] };
    }

    let remaining = trimmed;

    const tagMatch = remaining.match(/^([a-zA-Z][a-zA-Z0-9-]*)/);
    if (tagMatch) {
      tokens.push({ type: "tag", value: tagMatch[1].toLowerCase() });
      remaining = remaining.slice(tagMatch[1].length);
    }

    const idMatches = remaining.matchAll(/#([a-zA-Z0-9_-][a-zA-Z0-9_-]*)/g);
    for (const match of idMatches) {
      tokens.push({ type: "id", value: match[1] });
    }
    remaining = remaining.replace(/#[a-zA-Z0-9_-][a-zA-Z0-9_-]*/g, "");

    const classMatches = remaining.matchAll(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g);
    for (const match of classMatches) {
      tokens.push({ type: "class", value: match[1] });
    }
    remaining = remaining.replace(/\.[a-zA-Z][a-zA-Z0-9_-]*/g, "");

    const attrMatches = remaining.matchAll(
      /\[([^=\]]+)(?:=["']?([^"'\]]*?)["']?)?\]/g,
    );
    for (const match of attrMatches) {
      tokens.push({
        type: "attribute",
        value: match[1].trim(),
        attributeName: match[1].trim(),
        attributeValue: match[2] ? match[2].trim() : undefined,
      });
    }

    return { tokens };
  });
};
