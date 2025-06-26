/**
 * HTML Tokenizer - Advanced tokenization for HTML, XML, SVG and other markup languages
 * Handles all standard tokens: tags, attributes, text, comments, CDATA, DOCTYPE, processing instructions
 */

export interface Token {
  type: TokenType;
  value: string;
  position: Position;
  attributes?: Record<string, string>;
  isSelfClosing?: boolean;
  isClosing?: boolean;
}

export interface Position {
  start: number;
  end: number;
  line: number;
  column: number;
}

export enum TokenType {
  TAG_OPEN = 'TAG_OPEN',           // <div>, <img/>  
  TAG_CLOSE = 'TAG_CLOSE',         // </div>
  TEXT = 'TEXT',                   // plain text content
  COMMENT = 'COMMENT',             // <!-- comment -->
  CDATA = 'CDATA',                 // <![CDATA[...]]>
  DOCTYPE = 'DOCTYPE',             // <!DOCTYPE html>
  PROCESSING_INSTRUCTION = 'PI',   // <?xml version="1.0"?>
  EOF = 'EOF'                      // End of file
}

export interface TokenizerState {
  input: string;
  position: number;
  line: number;
  column: number;
  length: number;
}

/**
 * HTML Entity mappings for decoding
 */
const HTML_ENTITIES: Record<string, string> = {
  'amp': '&',
  'lt': '<',
  'gt': '>',
  'quot': '"',
  'apos': "'",
  'nbsp': '\u00A0',
  'copy': '©',
  'reg': '®',
  'trade': '™',
  // Add more as needed
};

/**
 * Create initial tokenizer state
 */
export function createTokenizerState(input: string): TokenizerState {
  return {
    input,
    position: 0,
    line: 1,
    column: 1,
    length: input.length
  };
}

/**
 * Main tokenizer function - converts HTML string to array of tokens
 */
export function tokenize(html: string): Token[] {
  const state = createTokenizerState(html);
  const tokens: Token[] = [];

  while (state.position < state.length) {
    const token = getNextToken(state);
    if (token) {
      tokens.push(token);
    }
  }

  // Add EOF token
  tokens.push({
    type: TokenType.EOF,
    value: '',
    position: createPosition(state, state.position, state.position)
  });

  return tokens;
}

/**
 * Get the next token from the input stream
 */
function getNextToken(state: TokenizerState): Token | null {
  // Skip whitespace but preserve it in text nodes
  if (isAtEndOfInput(state)) {
    return null;
  }

  const char = getCurrentChar(state);

  // Handle different token types based on current character
  if (char === '<') {
    return parseMarkup(state);
  } else {
    // All other characters (including &) are considered text
    return parseText(state);
  }
}

/**
 * Parse markup tokens (tags, comments, DOCTYPE, CDATA, processing instructions)
 */
function parseMarkup(state: TokenizerState): Token | null {
  const start = state.position;
  
  if (peek(state, 1) === '!') {
    if (peek(state, 2) === '-' && peek(state, 3) === '-') {
      return parseComment(state);
    } else if (matchString(state, '<![CDATA[')) {
      return parseCDATA(state);
    } else if (matchString(state, '<!DOCTYPE')) {
      return parseDoctype(state);
    }
  } else if (peek(state, 1) === '?') {
    return parseProcessingInstruction(state);
  } else if (peek(state, 1) === '/') {
    return parseClosingTag(state);
  } else {
    return parseOpeningTag(state);
  }

  return null;
}

/**
 * Parse opening tag: <div class="test" id="example">
 */
function parseOpeningTag(state: TokenizerState): Token {
  const start = state.position;
  advance(state); // Skip '<'

  // Parse tag name
  const tagName = parseTagName(state);
  const attributes = parseAttributes(state);
  
  // Check for self-closing
  let isSelfClosing = false;
  skipWhitespace(state);
  if (getCurrentChar(state) === '/') {
    isSelfClosing = true;
    advance(state);
  }

  // Expect closing '>'
  skipWhitespace(state);
  if (getCurrentChar(state) === '>') {
    advance(state);
  }

  return {
    type: TokenType.TAG_OPEN,
    value: tagName,
    position: createPosition(state, start, state.position),
    attributes,
    isSelfClosing
  };
}

/**
 * Parse closing tag: </div>
 */
function parseClosingTag(state: TokenizerState): Token {
  const start = state.position;
  advance(state); // Skip '<'
  advance(state); // Skip '/'

  const tagName = parseTagName(state);
  
  skipWhitespace(state);
  if (getCurrentChar(state) === '>') {
    advance(state);
  }

  return {
    type: TokenType.TAG_CLOSE,
    value: tagName,
    position: createPosition(state, start, state.position),
    isClosing: true
  };
}

/**
 * Parse tag name (alphanumeric + hyphens + colons for namespaces)
 */
function parseTagName(state: TokenizerState): string {
  let tagName = '';
  
  while (!isAtEndOfInput(state)) {
    const char = getCurrentChar(state);
    if (isTagNameChar(char)) {
      tagName += char;
      advance(state);
    } else {
      break;
    }
  }

  return tagName.toLowerCase(); // HTML is case-insensitive
}

/**
 * Parse attributes: class="value" id='value' disabled data-test=unquoted
 */
function parseAttributes(state: TokenizerState): Record<string, string> {
  const attributes: Record<string, string> = {};
  
  while (!isAtEndOfInput(state)) {
    skipWhitespace(state);
    
    const char = getCurrentChar(state);
    if (char === '>' || char === '/' || char === '?') {
      break;
    }

    // Parse attribute name
    const attrName = parseAttributeName(state);
    if (!attrName) break;

    skipWhitespace(state);
    
    // Check for '=' and value
    if (getCurrentChar(state) === '=') {
      advance(state); // Skip '='
      skipWhitespace(state);
      const attrValue = parseAttributeValue(state);
      attributes[attrName.toLowerCase()] = attrValue;
    } else {
      // Boolean attribute (no value)
      attributes[attrName.toLowerCase()] = '';
    }
  }

  return attributes;
}

/**
 * Parse attribute name
 */
function parseAttributeName(state: TokenizerState): string {
  let name = '';
  
  while (!isAtEndOfInput(state)) {
    const char = getCurrentChar(state);
    if (isAttributeNameChar(char)) {
      name += char;
      advance(state);
    } else {
      break;
    }
  }

  return name;
}

/**
 * Parse attribute value (quoted or unquoted)
 */
function parseAttributeValue(state: TokenizerState): string {
  const char = getCurrentChar(state);
  
  if (char === '"') {
    return parseQuotedValue(state, '"');
  } else if (char === "'") {
    return parseQuotedValue(state, "'");
  } else {
    return parseUnquotedValue(state);
  }
}

/**
 * Parse quoted attribute value
 */
function parseQuotedValue(state: TokenizerState, quote: string): string {
  advance(state); // Skip opening quote
  let value = '';
  
  while (!isAtEndOfInput(state)) {
    const char = getCurrentChar(state);
    if (char === quote) {
      advance(state); // Skip closing quote
      break;
    } else if (char === '&') {
      // Handle entities in attribute values
      const entity = parseEntityInline(state);
      value += entity;
    } else {
      value += char;
      advance(state);
    }
  }

  return value;
}

/**
 * Parse unquoted attribute value
 */
function parseUnquotedValue(state: TokenizerState): string {
  let value = '';
  
  while (!isAtEndOfInput(state)) {
    const char = getCurrentChar(state);
    if (isWhitespace(char) || char === '>' || char === '/' || char === '?') {
      break;
    } else if (char === '&') {
      const entity = parseEntityInline(state);
      value += entity;
    } else {
      value += char;
      advance(state);
    }
  }

  return value;
}

/**
 * Parse HTML comment: <!-- comment -->
 */
function parseComment(state: TokenizerState): Token {
  const start = state.position;
  advance(state, 4); // Skip '<!--'
  
  let content = '';
  while (!isAtEndOfInput(state)) {
    if (matchString(state, '-->')) {
      advance(state, 3); // Skip '-->'
      break;
    }
    content += getCurrentChar(state);
    advance(state);
  }

  return {
    type: TokenType.COMMENT,
    value: content,
    position: createPosition(state, start, state.position)
  };
}

/**
 * Parse CDATA section: <![CDATA[content]]>
 */
function parseCDATA(state: TokenizerState): Token {
  const start = state.position;
  advance(state, 9); // Skip '<![CDATA['
  
  let content = '';
  while (!isAtEndOfInput(state)) {
    if (matchString(state, ']]>')) {
      advance(state, 3); // Skip ']]>'
      break;
    }
    content += getCurrentChar(state);
    advance(state);
  }

  return {
    type: TokenType.CDATA,
    value: content,
    position: createPosition(state, start, state.position)
  };
}

/**
 * Parse DOCTYPE declaration: <!DOCTYPE html>
 */
function parseDoctype(state: TokenizerState): Token {
  const start = state.position;
  
  let content = '';
  while (!isAtEndOfInput(state) && getCurrentChar(state) !== '>') {
    content += getCurrentChar(state);
    advance(state);
  }
  
  if (getCurrentChar(state) === '>') {
    content += getCurrentChar(state);
    advance(state);
  }

  return {
    type: TokenType.DOCTYPE,
    value: content,
    position: createPosition(state, start, state.position)
  };
}

/**
 * Parse processing instruction: <?xml version="1.0"?>
 */
function parseProcessingInstruction(state: TokenizerState): Token {
  const start = state.position;
  
  let content = '';
  while (!isAtEndOfInput(state)) {
    if (matchString(state, '?>')) {
      advance(state, 2); // Skip '?>'
      break;
    }
    content += getCurrentChar(state);
    advance(state);
  }

  return {
    type: TokenType.PROCESSING_INSTRUCTION,
    value: content,
    position: createPosition(state, start, state.position)
  };
}

/**
 * Parse text content between tags
 */
function parseText(state: TokenizerState): Token {
  const start = state.position;
  let content = '';
  
  while (!isAtEndOfInput(state)) {
    const char = getCurrentChar(state);
    if (char === '<') {
      break;
    } else if (char === '&') {
      const entity = parseEntityInline(state);
      content += entity;
    } else {
      content += char;
      advance(state);
    }
  }

  return {
    type: TokenType.TEXT,
    value: content,
    position: createPosition(state, start, state.position)
  };
}

/**
 * Parse entity inline (used within text and attributes)
 */
function parseEntityInline(state: TokenizerState): string {
  advance(state); // Skip '&'
  
  let entityName = '';
  while (!isAtEndOfInput(state) && getCurrentChar(state) !== ';') {
    entityName += getCurrentChar(state);
    advance(state);
  }
  
  if (getCurrentChar(state) === ';') {
    advance(state); // Skip ';'
  }

  // Decode entity
  if (entityName.startsWith('#')) {
    // Numeric entity
    if (entityName.startsWith('#x') || entityName.startsWith('#X')) {
      // Hexadecimal
      const code = parseInt(entityName.slice(2), 16);
      return String.fromCharCode(code);
    } else {
      // Decimal
      const code = parseInt(entityName.slice(1), 10);
      return String.fromCharCode(code);
    }
  } else {
    // Named entity
    return HTML_ENTITIES[entityName] || `&${entityName};`;
  }
}

// Utility functions

function getCurrentChar(state: TokenizerState): string {
  return state.input[state.position] || '';
}

function peek(state: TokenizerState, offset: number): string {
  return state.input[state.position + offset] || '';
}

function advance(state: TokenizerState, count: number = 1): void {
  for (let i = 0; i < count && state.position < state.length; i++) {
    if (state.input[state.position] === '\n') {
      state.line++;
      state.column = 1;
    } else {
      state.column++;
    }
    state.position++;
  }
}

function isAtEndOfInput(state: TokenizerState): boolean {
  return state.position >= state.length;
}

function matchString(state: TokenizerState, str: string): boolean {
  return state.input.slice(state.position, state.position + str.length) === str;
}

function skipWhitespace(state: TokenizerState): void {
  while (!isAtEndOfInput(state) && isWhitespace(getCurrentChar(state))) {
    advance(state);
  }
}

function isWhitespace(char: string): boolean {
  return /\s/.test(char);
}

function isTagNameChar(char: string): boolean {
  return /[a-zA-Z0-9\-:_]/.test(char);
}

function isAttributeNameChar(char: string): boolean {
  return /[a-zA-Z0-9\-:_.]/.test(char);
}

function createPosition(state: TokenizerState, start: number, end: number): Position {
  return {
    start,
    end,
    line: state.line,
    column: state.column
  };
}
