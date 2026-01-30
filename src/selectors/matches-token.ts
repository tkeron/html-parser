import { SelectorToken } from "./types.ts";

export const matchesToken = (element: any, token: SelectorToken): boolean => {
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
};
