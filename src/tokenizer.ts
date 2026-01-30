export enum TokenType {
  TAG_OPEN = "TAG_OPEN",
  TAG_CLOSE = "TAG_CLOSE",
  TEXT = "TEXT",
  COMMENT = "COMMENT",
  CDATA = "CDATA",
  DOCTYPE = "DOCTYPE",
  PROCESSING_INSTRUCTION = "PROCESSING_INSTRUCTION",
  EOF = "EOF",
}

export interface Position {
  line: number;
  column: number;
  offset: number;
}

export interface Token {
  type: TokenType;
  value: string;
  position: Position;
  attributes?: Record<string, string>;
  isSelfClosing?: boolean;
  isClosing?: boolean;
}

import { HTML_ENTITIES } from "./html-entities.js";

const decodeEntities = (text: string): string => {
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

const parseAttributes = (attributeString: string): Record<string, string> => {
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

const calculatePosition = (text: string, offset: number): Position => {
  const lines = text.slice(0, offset).split("\n");
  return {
    line: lines.length,
    column: lines[lines.length - 1]?.length ?? 0,
    offset,
  };
};

const RAW_TEXT_ELEMENTS = new Set([
  "script",
  "style",
  "xmp",
  "iframe",
  "noembed",
  "noframes",
  "noscript",
]);
const RCDATA_ELEMENTS = new Set(["textarea", "title"]);

export const tokenize = (html: string): Token[] => {
  const tokens: Token[] = [];
  let currentPos = 0;

  while (currentPos < html.length) {
    const char = html[currentPos];

    if (char === "<") {
      const remaining = html.slice(currentPos);

      const doctypeMatch = remaining.match(/^<!DOCTYPE\s+[^>]*>/i);
      if (doctypeMatch) {
        const match = doctypeMatch[0];
        const nameMatch = match.match(/<!DOCTYPE\s+([^\s>]+)/i);
        tokens.push({
          type: TokenType.DOCTYPE,
          value: nameMatch && nameMatch[1] ? nameMatch[1].toLowerCase() : match,
          position: calculatePosition(html, currentPos),
        });
        currentPos += match.length;
        continue;
      }

      const commentMatch = remaining.match(/^<!--([\s\S]*?)(?:-->|$)/);
      if (commentMatch) {
        const match = commentMatch[0];
        tokens.push({
          type: TokenType.COMMENT,
          value: match.slice(4, match.endsWith("-->") ? -3 : match.length),
          position: calculatePosition(html, currentPos),
        });
        currentPos += match.length;
        continue;
      }

      const cdataMatch = remaining.match(/^<!\[CDATA\[([\s\S]*?)\]\]>/);
      if (cdataMatch) {
        const content = cdataMatch[1];
        tokens.push({
          type: TokenType.COMMENT,
          value: "[CDATA[" + content + "]]",
          position: calculatePosition(html, currentPos),
        });
        currentPos += cdataMatch[0].length;
        continue;
      }

      const piMatch = remaining.match(/^<\?([^>]*)/);
      if (piMatch) {
        let consumed = piMatch[0].length;
        if (remaining[consumed] === ">") {
          consumed++;
        }
        tokens.push({
          type: TokenType.COMMENT,
          value: "?" + piMatch[1],
          position: calculatePosition(html, currentPos),
        });
        currentPos += consumed;
        continue;
      }

      const tagMatch = remaining.match(/^<\/?([a-zA-Z][^\s/>]*)([^>]*)>/);

      if (tagMatch) {
        const fullTag = tagMatch[0];
        const tagName = tagMatch[1]?.toLowerCase();

        if (!tagName) {
          currentPos++;
          continue;
        }

        const isClosing = fullTag.startsWith("</");
        const isSelfClosing = fullTag.endsWith("/>");

        let attributes: Record<string, string> = {};
        if (!isClosing) {
          const attrMatch = fullTag.match(/^<[a-zA-Z][^\s/>]*\s+([^>]*?)\/?>$/);
          if (attrMatch && attrMatch[1]) {
            attributes = parseAttributes(attrMatch[1]);
          }
        }

        tokens.push({
          type: isClosing ? TokenType.TAG_CLOSE : TokenType.TAG_OPEN,
          value: tagName,
          position: calculatePosition(html, currentPos),
          ...(isClosing
            ? { isClosing: true }
            : {
                attributes,
                isSelfClosing,
              }),
        });

        currentPos += fullTag.length;

        if (
          !isClosing &&
          !isSelfClosing &&
          (RAW_TEXT_ELEMENTS.has(tagName) || RCDATA_ELEMENTS.has(tagName))
        ) {
          const closeTagPattern = new RegExp(`</${tagName}\\s*>`, "i");
          const restOfHtml = html.slice(currentPos);
          const closeMatch = restOfHtml.match(closeTagPattern);

          if (closeMatch && closeMatch.index !== undefined) {
            const rawContent = restOfHtml.slice(0, closeMatch.index);
            if (rawContent) {
              tokens.push({
                type: TokenType.TEXT,
                value: RCDATA_ELEMENTS.has(tagName)
                  ? decodeEntities(rawContent)
                  : rawContent,
                position: calculatePosition(html, currentPos),
              });
            }
            currentPos += rawContent.length;
          }
        }
      } else {
        const textStart = currentPos;
        currentPos++;

        while (currentPos < html.length && html[currentPos] !== "<") {
          currentPos++;
        }

        const textContent = html.slice(textStart, currentPos);
        if (textContent) {
          tokens.push({
            type: TokenType.TEXT,
            value: decodeEntities(textContent),
            position: calculatePosition(html, textStart),
          });
        }
      }
    } else {
      const textStart = currentPos;

      while (currentPos < html.length && html[currentPos] !== "<") {
        currentPos++;
      }

      const textContent = html.slice(textStart, currentPos);
      if (textContent) {
        tokens.push({
          type: TokenType.TEXT,
          value: decodeEntities(textContent),
          position: calculatePosition(html, textStart),
        });
      }
    }
  }

  tokens.push({
    type: TokenType.EOF,
    value: "",
    position: calculatePosition(html, html.length),
  });

  return tokens;
};
