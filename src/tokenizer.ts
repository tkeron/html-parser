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
  TAG_OPEN = 'TAG_OPEN',
  TAG_CLOSE = 'TAG_CLOSE',
  TEXT = 'TEXT',
  COMMENT = 'COMMENT',
  CDATA = 'CDATA',
  DOCTYPE = 'DOCTYPE',
  PROCESSING_INSTRUCTION = 'PI',
  EOF = 'EOF'
}

export interface TokenizerState {
  input: string;
  position: number;
  line: number;
  column: number;
  length: number;
}

const SELF_CLOSING_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

const HTML_ENTITIES: Record<string, string> = {
  'amp': '&', 'lt': '<', 'gt': '>', 'quot': '"', 'apos': "'",
  'nbsp': '\u00A0', 'copy': '©', 'reg': '®', 'trade': '™'
};

function createTokenizerState(input: string): TokenizerState {
  return {
    input,
    position: 0,
    line: 1,
    column: 1,
    length: input.length
  };
}

function createPosition(state: TokenizerState, start: number, end: number): Position {
  return {
    start,
    end,
    line: state.line,
    column: state.column
  };
}

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
  while (!isAtEndOfInput(state) && /\s/.test(getCurrentChar(state))) {
    advance(state);
  }
}

function isTagNameChar(char: string): boolean {
  return /[a-zA-Z0-9\-:_]/.test(char);
}

function isAttributeNameChar(char: string): boolean {
  return /[a-zA-Z0-9\-:_.]/.test(char);
}

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

  return tagName.toLowerCase();
}

function parseAttributes(state: TokenizerState): Record<string, string> {
  const attributes: Record<string, string> = {};
  
  while (!isAtEndOfInput(state)) {
    skipWhitespace(state);
    
    const char = getCurrentChar(state);
    if (char === '>' || char === '/' || char === '?') {
      break;
    }

    const attrName = parseAttributeName(state);
    if (!attrName) break;

    skipWhitespace(state);
    
    if (getCurrentChar(state) === '=') {
      advance(state);
      skipWhitespace(state);
      const attrValue = parseAttributeValue(state);
      attributes[attrName.toLowerCase()] = attrValue;
    } else {
      attributes[attrName.toLowerCase()] = '';
    }
  }

  return attributes;
}

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

function parseQuotedValue(state: TokenizerState, quote: string): string {
  advance(state);
  let value = '';
  
  while (!isAtEndOfInput(state)) {
    const char = getCurrentChar(state);
    if (char === quote) {
      advance(state);
      break;
    } else if (char === '&') {
      const entity = parseEntityInline(state);
      value += entity;
    } else if (char === '\0') {
      value += '\uFFFD';
      advance(state);
    } else {
      value += char;
      advance(state);
    }
  }

  return value;
}

function parseUnquotedValue(state: TokenizerState): string {
  let value = '';
  
  while (!isAtEndOfInput(state)) {
    const char = getCurrentChar(state);
    if (/\s/.test(char) || char === '>' || char === '/' || char === '?') {
      break;
    } else if (char === '&') {
      const entity = parseEntityInline(state);
      value += entity;
    } else if (char === '\0') {
      value += '\uFFFD';
      advance(state);
    } else {
      value += char;
      advance(state);
    }
  }

  return value;
}

function parseEntityInline(state: TokenizerState): string {
  const originalPos = state.position;
  advance(state);
  
  let entityName = '';
  let maxEntityLength = 50;
  
  while (!isAtEndOfInput(state) && getCurrentChar(state) !== ';' && entityName.length < maxEntityLength) {
    const char = getCurrentChar(state);
    
    if (/\s/.test(char) || char === '<' || char === '&') {
      
      state.position = originalPos;
      advance(state);
      return '&';
    }
    entityName += char;
    advance(state);
  }
  
  
  if (getCurrentChar(state) !== ';' || entityName.length >= maxEntityLength) {
    
    state.position = originalPos;
    advance(state);
    return '&';
  }
  
  
  advance(state);

  if (entityName.startsWith('#')) {
    if (entityName.startsWith('#x') || entityName.startsWith('#X')) {
      const code = parseInt(entityName.slice(2), 16);
      return isNaN(code) ? '&' + entityName + ';' : String.fromCharCode(code);
    } else {
      const code = parseInt(entityName.slice(1), 10);
      return isNaN(code) ? '&' + entityName + ';' : String.fromCharCode(code);
    }
  } else {
    return HTML_ENTITIES[entityName] || `&${entityName};`;
  }
}

function parseOpeningTag(state: TokenizerState): Token {
  const start = state.position;
  advance(state);
  const tagName = parseTagName(state);
  const attributes = parseAttributes(state);
  
  let isSelfClosing = false;
  skipWhitespace(state);
  if (getCurrentChar(state) === '/') {
    isSelfClosing = true;
    advance(state);
  }

  skipWhitespace(state);
  if (getCurrentChar(state) === '>') {
    advance(state);
  }

  return {
    type: TokenType.TAG_OPEN,
    value: tagName,
    position: createPosition(state, start, state.position),
    attributes: Object.keys(attributes).length > 0 ? attributes : {},
    isSelfClosing: isSelfClosing || SELF_CLOSING_TAGS.has(tagName)
  };
}

function parseClosingTag(state: TokenizerState): Token {
  const start = state.position;
  advance(state);
  advance(state);
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

function parseComment(state: TokenizerState): Token {
  const start = state.position;
  advance(state, 4);
  
  let content = '';
  while (!isAtEndOfInput(state)) {
    if (matchString(state, '-->')) {
      advance(state, 3);
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

function parseCDATA(state: TokenizerState): Token {
  const start = state.position;
  advance(state, 9);
  
  let content = '';
  while (!isAtEndOfInput(state)) {
    if (matchString(state, ']]>')) {
      advance(state, 3);
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

function parseProcessingInstruction(state: TokenizerState): Token {
  const start = state.position;
  
  let content = '';
  while (!isAtEndOfInput(state)) {
    if (matchString(state, '?>')) {
      advance(state, 2);
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
    } else if (char === '\0') {
      content += '\uFFFD';
      advance(state);
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

function parseMarkup(state: TokenizerState): Token | null {
  if (peek(state, 1) === '!') {
    if (peek(state, 2) === '-' && peek(state, 3) === '-') {
      return parseComment(state);
    } else if (matchString(state, '<![CDATA[')) {
      return parseCDATA(state);
    } else if (matchString(state, '<!DOCTYPE') || matchString(state, '<!doctype')) {
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

function getNextToken(state: TokenizerState): Token | null {
  if (isAtEndOfInput(state)) {
    return null;
  }

  const char = getCurrentChar(state);

  if (char === '<') {
    return parseMarkup(state);
  } else {
    return parseText(state);
  }
}

export function tokenize(html: string): Token[] {
  const state = createTokenizerState(html);
  const tokens: Token[] = [];

  while (state.position < state.length) {
    const token = getNextToken(state);
    if (token) {
      tokens.push(token);
    }
  }

  tokens.push({
    type: TokenType.EOF,
    value: '',
    position: createPosition(state, state.position, state.position)
  });

  return tokens;
}
