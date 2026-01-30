import { decodeEntities } from "./decode-entities.js";

export const parseAttributes = (
  attributeString: string,
): Record<string, string> => {
  const attributes: Record<string, string> = {};
  let i = 0;

  while (i < attributeString.length) {
    while (i < attributeString.length && /\s/.test(attributeString[i])) {
      i++;
    }
    if (
      i >= attributeString.length ||
      attributeString[i] === "/" ||
      attributeString[i] === ">"
    ) {
      break;
    }

    let name = "";
    while (i < attributeString.length && !/[\s=\/>]/.test(attributeString[i])) {
      name += attributeString[i];
      i++;
    }

    if (!name) {
      i++;
      continue;
    }

    while (i < attributeString.length && /\s/.test(attributeString[i])) {
      i++;
    }

    let value = "";
    if (i < attributeString.length && attributeString[i] === "=") {
      i++;
      while (i < attributeString.length && /\s/.test(attributeString[i])) {
        i++;
      }

      if (i < attributeString.length) {
        if (attributeString[i] === '"') {
          i++;
          while (i < attributeString.length && attributeString[i] !== '"') {
            value += attributeString[i];
            i++;
          }
          i++;
        } else if (attributeString[i] === "'") {
          i++;
          while (i < attributeString.length && attributeString[i] !== "'") {
            value += attributeString[i];
            i++;
          }
          i++;
        } else {
          while (
            i < attributeString.length &&
            !/[\s>]/.test(attributeString[i])
          ) {
            value += attributeString[i];
            i++;
          }
        }
      }
    }

    attributes[name.toLowerCase()] = decodeEntities(value);
  }

  return attributes;
};
