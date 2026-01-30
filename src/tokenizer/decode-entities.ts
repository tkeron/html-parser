import { HTML_ENTITIES } from "../html-entities.js";

export const decodeEntities = (text: string): string => {
  let result = "";
  let i = 0;
  while (i < text.length) {
    if (text[i] === "&") {
      let match = "";
      let j = i + 1;
      if (text[j] === "#") {
        j++;
        if (text[j] === "x" || text[j] === "X") {
          j++;
          while (j < text.length && /[0-9a-fA-F]/.test(text[j])) {
            j++;
          }
        } else {
          while (j < text.length && /[0-9]/.test(text[j])) {
            j++;
          }
        }
        if (text[j] === ";") {
          j++;
        }
        match = text.substring(i, j);
        const entity = match;
        if (entity.startsWith("&#x") && entity.endsWith(";")) {
          const hex = entity.slice(3, -1);
          result += String.fromCharCode(parseInt(hex, 16));
          i = j;
          continue;
        } else if (entity.startsWith("&#") && entity.endsWith(";")) {
          const decimal = entity.slice(2, -1);
          result += String.fromCharCode(parseInt(decimal, 10));
          i = j;
          continue;
        }
      } else {
        while (j < text.length && /[a-zA-Z0-9]/.test(text[j])) {
          j++;
        }
        const hasSemi = text[j] === ";";
        if (hasSemi) {
          j++;
        }
        match = text.substring(i, j);
        const named = match.slice(1, hasSemi ? -1 : undefined);
        if (HTML_ENTITIES[named]) {
          if (hasSemi || (j < text.length && !/[a-zA-Z0-9]/.test(text[j]))) {
            result += HTML_ENTITIES[named];
            i = j;
            continue;
          }
        }
      }
      result += text[i];
      i++;
    } else {
      result += text[i];
      i++;
    }
  }
  return result.replace(/\u0000/g, "\uFFFD");
};
