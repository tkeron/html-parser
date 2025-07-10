/**
 * HTML Tokenizer using Bun's HTMLRewriter for efficient HTML parsing
 * This tokenizer provides a stream-based approach to HTML parsing
 */

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

// HTML entities mapping
const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&nbsp;': '\u00A0',
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&hellip;': '…',
  '&mdash;': '—',
  '&ndash;': '–',
  '&lsquo;': '\u2018',
  '&rsquo;': '\u2019',
  '&ldquo;': '\u201C',
  '&rdquo;': '\u201D'
};

/**
 * Decode HTML entities in a string and handle null characters
 */
function decodeEntities(text: string): string {
  // First, replace null characters with the Unicode replacement character
  let result = text.replace(/\u0000/g, '\uFFFD');
  
  // Then decode HTML entities
  return result.replace(/&(?:#x([0-9a-fA-F]+)|#([0-9]+)|([a-zA-Z][a-zA-Z0-9]*));/g, (match, hex, decimal, named) => {
    if (hex) {
      return String.fromCharCode(parseInt(hex, 16));
    }
    if (decimal) {
      return String.fromCharCode(parseInt(decimal, 10));
    }
    if (named) {
      return HTML_ENTITIES[`&${named};`] || match;
    }
    return match;
  });
}

/**
 * Parse attributes from a tag string
 */
function parseAttributes(attributeString: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  
  // Regex to match attributes: name="value", name='value', name=value, or just name
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

/**
 * Calculate position in text
 */
function calculatePosition(text: string, offset: number): Position {
  const lines = text.slice(0, offset).split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1]?.length ?? 0,
    offset
  };
}

/**
 * Tokenize HTML using a combination of HTMLRewriter and manual parsing
 * HTMLRewriter is great for structured HTML but we need manual parsing for edge cases
 */
export function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  let position = 0;
  
  // Handle special cases first (DOCTYPE, comments, CDATA, processing instructions)
  const specialCases = [
    // DOCTYPE
    {
      pattern: /<!DOCTYPE\s+[^>]*>/gi,
      type: TokenType.DOCTYPE,
      getValue: (match: string) => match
    },
    // Comments (including unclosed ones)
    {
      pattern: /<!--([\s\S]*?)(?:-->|$)/g,
      type: TokenType.COMMENT,
      getValue: (match: string) => match.slice(4, match.endsWith('-->') ? -3 : match.length)
    },
    // CDATA
    {
      pattern: /<!\[CDATA\[([\s\S]*?)\]\]>/g,
      type: TokenType.CDATA,
      getValue: (match: string) => match.slice(9, -3)
    },
    // Processing Instructions
    {
      pattern: /<\?([^?]*(?:\?(?!>)[^?]*)*)\?>/g,
      type: TokenType.PROCESSING_INSTRUCTION,
      getValue: (match: string) => match.slice(0, -2) // Remove the ?> at the end
    }
  ];

  // Track processed ranges to avoid double processing
  const processedRanges: Array<[number, number]> = [];
  
  // Process special cases first
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
  
  // Sort processed ranges by start position
  processedRanges.sort((a, b) => a[0] - b[0]);
  
  // Process remaining HTML with manual parsing
  let currentPos = 0;
  
  while (currentPos < html.length) {
    // Check if current position is in a processed range
    const inProcessedRange = processedRanges.some(([start, end]) => 
      currentPos >= start && currentPos < end
    );
    
    if (inProcessedRange) {
      // Skip to end of processed range
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
      // Check if it's a tag
      const tagMatch = html.slice(currentPos).match(/^<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/);
      
      if (tagMatch) {
        const fullTag = tagMatch[0];
        const tagName = tagMatch[1]?.toLowerCase();
        
        if (!tagName) {
          currentPos++;
          continue;
        }
        
        const isClosing = fullTag.startsWith('</');
        const isSelfClosing = fullTag.endsWith('/>');
        
        // Parse attributes if it's an opening tag
        let attributes: Record<string, string> = {};
        if (!isClosing) {
          const attrMatch = fullTag.match(/^<[a-zA-Z][a-zA-Z0-9]*\s+([^>]*?)\/?>$/);
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
        // Not a valid tag, treat as text
        const textStart = currentPos;
        currentPos++;
        
        // Find the end of text (next '<' or end of string)
        while (currentPos < html.length && html[currentPos] !== '<') {
          currentPos++;
        }
        
        const textContent = html.slice(textStart, currentPos);
        if (textContent) { // Keep all text content, including whitespace-only
          tokens.push({
            type: TokenType.TEXT,
            value: decodeEntities(textContent),
            position: calculatePosition(html, textStart)
          });
        }
      }
    } else {
      // Text content
      const textStart = currentPos;
      
      // Find the end of text (next '<' or end of string)
      while (currentPos < html.length && html[currentPos] !== '<') {
        currentPos++;
      }
      
      const textContent = html.slice(textStart, currentPos);
      if (textContent) { // Keep all text content, including whitespace-only
        tokens.push({
          type: TokenType.TEXT,
          value: decodeEntities(textContent),
          position: calculatePosition(html, textStart)
        });
      }
    }
  }
  
  // Sort tokens by position
  tokens.sort((a, b) => a.position.offset - b.position.offset);
  
  // Add EOF token
  tokens.push({
    type: TokenType.EOF,
    value: '',
    position: calculatePosition(html, html.length)
  });
  
  return tokens;
}

/**
 * Enhanced tokenizer that uses HTMLRewriter for better performance on large HTML
 * This is more efficient for well-formed HTML documents
 */
export function tokenizeWithRewriter(html: string): Token[] {
  const tokens: Token[] = [];
  let textBuffer = '';
  let position = 0;
  
  // First pass: collect all tokens using HTMLRewriter
  const rewriter = new HTMLRewriter();
  
  // Handle all elements
  rewriter.on('*', {
    element(element) {
      // Flush any accumulated text
      if (textBuffer.trim()) {
        tokens.push({
          type: TokenType.TEXT,
          value: decodeEntities(textBuffer),
          position: calculatePosition(html, position - textBuffer.length)
        });
        textBuffer = '';
      }
      
      // Add opening tag
      const attributes: Record<string, string> = {};
      for (const [name, value] of element.attributes) {
        attributes[name] = value;
      }
      
      tokens.push({
        type: TokenType.TAG_OPEN,
        value: element.tagName.toLowerCase(),
        position: calculatePosition(html, position),
        attributes,
        isSelfClosing: element.selfClosing
      });
      
      // Handle self-closing tags
      if (!element.selfClosing) {
        // We'll add the closing tag in the end handler
        element.onEndTag((endTag) => {
          tokens.push({
            type: TokenType.TAG_CLOSE,
            value: endTag.name.toLowerCase(),
            position: calculatePosition(html, position),
            isClosing: true
          });
        });
      }
    },
    
    text(text) {
      textBuffer += text.text;
    },
    
    comments(comment) {
      tokens.push({
        type: TokenType.COMMENT,
        value: comment.text,
        position: calculatePosition(html, position)
      });
    }
  });
  
  try {
    // Transform the HTML (this triggers the rewriter)
    const response = new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    });
    
    rewriter.transform(response);
    
    // Flush any remaining text
    if (textBuffer.trim()) {
      tokens.push({
        type: TokenType.TEXT,
        value: decodeEntities(textBuffer),
        position: calculatePosition(html, position - textBuffer.length)
      });
    }
    
  } catch (error) {
    // If HTMLRewriter fails, fall back to manual parsing
    console.warn('HTMLRewriter failed, falling back to manual parsing:', error);
    return tokenize(html);
  }
  
  // Sort tokens by position and add EOF
  tokens.sort((a, b) => a.position.offset - b.position.offset);
  tokens.push({
    type: TokenType.EOF,
    value: '',
    position: calculatePosition(html, html.length)
  });
  
  return tokens;
}

/**
 * Smart tokenizer that chooses the best method based on HTML content
 */
export function smartTokenize(html: string): Token[] {
  // Use HTMLRewriter for well-formed HTML, manual parsing for edge cases
  const hasSpecialContent = /<!DOCTYPE|<!--|\[CDATA\[|<\?/.test(html);
  
  if (hasSpecialContent || html.length < 1000) {
    // Use manual parsing for small HTML or HTML with special content
    return tokenize(html);
  } else {
    // Use HTMLRewriter for large, well-formed HTML
    return tokenizeWithRewriter(html);
  }
}
