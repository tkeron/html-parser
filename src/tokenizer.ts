export enum TokenType {
  TAG_OPEN = 'TAG_OPEN',
  TAG_CLOSE = 'TAG_CLOSE',
  TEXT = 'TEXT',
  COMMENT = 'COMMENT',
  CDATA = 'CDATA',
  DOCTYPE = 'DOCTYPE',
  PROCESSING_INSTRUCTION = 'PROCESSING_INSTRUCTION',
  EOF = 'EOF'
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

import { allNamedEntities } from 'all-named-html-entities';

const HTML_ENTITIES: Record<string, string> = allNamedEntities;

function decodeEntities(text: string): string {
  let result = '';
  let i = 0;
  while (i < text.length) {
    if (text[i] === '&') {
      let match = '';
      let j = i + 1;
      if (text[j] === '#') {
        j++;
        if (text[j] === 'x' || text[j] === 'X') {
          j++;
          while (j < text.length && /[0-9a-fA-F]/.test(text[j])) {
            j++;
          }
        } else {
          while (j < text.length && /[0-9]/.test(text[j])) {
            j++;
          }
        }
        if (text[j] === ';') {
          j++;
        }
        match = text.substring(i, j);
        const entity = match;
        if (entity.startsWith('&#x') && entity.endsWith(';')) {
          const hex = entity.slice(3, -1);
          result += String.fromCharCode(parseInt(hex, 16));
          i = j;
          continue;
        } else if (entity.startsWith('&#') && entity.endsWith(';')) {
          const decimal = entity.slice(2, -1);
          result += String.fromCharCode(parseInt(decimal, 10));
          i = j;
          continue;
        }
      } else {
        while (j < text.length && /[a-zA-Z0-9]/.test(text[j])) {
          j++;
        }
        const hasSemi = text[j] === ';';
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
  return result.replace(/\u0000/g, '\uFFFD');
}

function parseAttributes(attributeString: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  
  const attrRegex = /([a-zA-Z][a-zA-Z0-9\-_:]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match;
  
  while ((match = attrRegex.exec(attributeString)) !== null) {
    const [, name, doubleQuoted, singleQuoted, unquoted] = match;
    if (name) {
      const value = doubleQuoted ?? singleQuoted ?? unquoted ?? '';
      attributes[name.toLowerCase()] = decodeEntities(value);
    }
  }
  
  return attributes;
}

function calculatePosition(text: string, offset: number): Position {
  const lines = text.slice(0, offset).split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1]?.length ?? 0,
    offset
  };
}

export function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  let position = 0;
  
  const specialCases = [
    {
      pattern: /<!DOCTYPE\s+[^>]*>/gi,
      type: TokenType.DOCTYPE,
      getValue: (match: string) => {
        const doctypeMatch = match.match(/<!DOCTYPE\s+([^\s>]+)/i);
        return doctypeMatch && doctypeMatch[1] ? doctypeMatch[1].toLowerCase() : match;
      }
    },
    {
      pattern: /<!--([\s\S]*?)(?:-->|$)/g,
      type: TokenType.COMMENT,
      getValue: (match: string) => match.slice(4, match.endsWith('-->') ? -3 : match.length)
    },
    {
      pattern: /<!\[CDATA\[([\s\S]*?)\]\]>/g,
      type: TokenType.CDATA,
      getValue: (match: string) => match.slice(9, -3)
    },
    {
      pattern: /<\?([^?]*(?:\?(?!>)[^?]*)*)\?>/g,
      type: TokenType.PROCESSING_INSTRUCTION,
      getValue: (match: string) => match.slice(0, -2)
    }
  ];

  const processedRanges: Array<[number, number]> = [];
  
  for (const { pattern, type, getValue } of specialCases) {
    const regex = new RegExp(pattern);
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      
      tokens.push({
        type,
        value: getValue(match[0]),
        position: calculatePosition(html, start)
      });
      
      processedRanges.push([start, end]);
    }
  }
  
  processedRanges.sort((a, b) => a[0] - b[0]);
  
  let currentPos = 0;
  
  while (currentPos < html.length) {
    const inProcessedRange = processedRanges.some(([start, end]) => 
      currentPos >= start && currentPos < end
    );
    
    if (inProcessedRange) {
      const range = processedRanges.find(([start, end]) => 
        currentPos >= start && currentPos < end
      );
      if (range) {
        currentPos = range[1];
      }
      continue;
    }
    
    const char = html[currentPos];
    
    if (char === '<') {
      const tagMatch = html.slice(currentPos).match(/^<\/?([a-zA-Z][^\s/>]*)([^>]*)>/);
      
      if (tagMatch) {
        const fullTag = tagMatch[0];
        const tagName = tagMatch[1]?.toLowerCase();
        
        if (!tagName) {
          currentPos++;
          continue;
        }
        
        const isClosing = fullTag.startsWith('</');
        const isSelfClosing = fullTag.endsWith('/>');
        
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
          ...(isClosing ? { isClosing: true } : { 
            attributes, 
            isSelfClosing 
          })
        });
        
        currentPos += fullTag.length;
      } else {
        const textStart = currentPos;
        currentPos++;
        
        while (currentPos < html.length && html[currentPos] !== '<') {
          currentPos++;
        }
        
        const textContent = html.slice(textStart, currentPos);
        if (textContent) {
          tokens.push({
            type: TokenType.TEXT,
            value: decodeEntities(textContent),
            position: calculatePosition(html, textStart)
          });
        }
      }
    } else {
      const textStart = currentPos;
      
      while (currentPos < html.length && html[currentPos] !== '<') {
        currentPos++;
      }
      
      const textContent = html.slice(textStart, currentPos);
      if (textContent) {
        tokens.push({
          type: TokenType.TEXT,
          value: decodeEntities(textContent),
          position: calculatePosition(html, textStart)
        });
      }
    }
  }
  
  tokens.sort((a, b) => a.position.offset - b.position.offset);
  
  tokens.push({
    type: TokenType.EOF,
    value: '',
    position: calculatePosition(html, html.length)
  });
  
  return tokens;
}
