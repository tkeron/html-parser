import { TokenType, Token } from "./types.js";
import { RAW_TEXT_ELEMENTS, RCDATA_ELEMENTS } from "./constants.js";
import { decodeEntities } from "./decode-entities.js";
import { parseAttributes } from "./parse-attributes.js";
import { calculatePosition } from "./calculate-position.js";

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

      const piMatch = remaining.match(/^<(\?[\s\S]*?)>/);
      if (piMatch) {
        tokens.push({
          type: TokenType.COMMENT,
          value: piMatch[1],
          position: calculatePosition(html, currentPos),
        });
        currentPos += piMatch[0].length;
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
