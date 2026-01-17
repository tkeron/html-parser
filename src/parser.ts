import type { Token } from './tokenizer.js';
import { TokenType } from './tokenizer.js';

export interface ASTNode {
  type: ASTNodeType;
  tagName?: string;
  attributes?: Record<string, string>;
  children?: ASTNode[];
  content?: string;
  parent?: ASTNode;
  isSelfClosing?: boolean;
  position?: {
    start: number;
    end: number;
    line: number;
    column: number;
  };
}

export enum ASTNodeType {
  DOCUMENT = 'DOCUMENT',
  ELEMENT = 'ELEMENT',
  TEXT = 'TEXT',
  COMMENT = 'COMMENT',
  CDATA = 'CDATA',
  DOCTYPE = 'DOCTYPE',
  PROCESSING_INSTRUCTION = 'PROCESSING_INSTRUCTION'
}

export interface ParserState {
  tokens: Token[];
  position: number;
  length: number;
  stack: ASTNode[];
  root: ASTNode;
  errors: ParseError[];
}

export interface ParseError {
  message: string;
  position: number;
  line: number;
  column: number;
  severity: 'error' | 'warning';
}

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

const RAW_TEXT_ELEMENTS = new Set([
  'script', 'style', 'textarea', 'title'
]);

const AUTO_CLOSE_RULES: Record<string, string[]> = {
  'li': ['li'],
  'dt': ['dt', 'dd'],
  'dd': ['dt', 'dd'],
  'p': ['p'],
  'rt': ['rt', 'rp'],
  'rp': ['rt', 'rp'],
  'optgroup': ['optgroup'],
  'option': ['option'],
  'thead': ['tbody', 'tfoot'],
  'tbody': ['thead', 'tbody', 'tfoot'],
  'tfoot': ['thead', 'tbody'],
  'tr': ['tr'],
  'td': ['td', 'th'],
  'th': ['td', 'th']
};

export function parse(tokens: Token[]): ASTNode {
  const state = createParserState(tokens);
  
  while (state.position < state.length) {
    const token = getCurrentToken(state);
    
    if (!token || token.type === TokenType.EOF) {
      break;
    }

    parseToken(state, token);
    advance(state);
  }

  while (state.stack.length > 1) {
    const unclosedElement = state.stack.pop()!;
    const currentToken = getCurrentToken(state);
    addError(state, `Unclosed tag: ${unclosedElement.tagName}`, currentToken?.position?.start || 0);
  }

  return state.root;
}

function createParserState(tokens: Token[]): ParserState {
  const root: ASTNode = {
    type: ASTNodeType.DOCUMENT,
    children: [],
    tagName: '#document'
  };

  return {
    tokens,
    position: 0,
    length: tokens.length,
    stack: [root],
    root,
    errors: []
  };
}

function parseToken(state: ParserState, token: Token): void {
  switch (token.type) {
    case TokenType.TAG_OPEN:
      parseOpenTag(state, token);
      break;
    case TokenType.TAG_CLOSE:
      parseCloseTag(state, token);
      break;
    case TokenType.TEXT:
      parseText(state, token);
      break;
    case TokenType.COMMENT:
      parseComment(state, token);
      break;
    case TokenType.CDATA:
      parseCDATA(state, token);
      break;
    case TokenType.DOCTYPE:
      parseDoctype(state, token);
      break;
    case TokenType.PROCESSING_INSTRUCTION:
      parseProcessingInstruction(state, token);
      break;
  }
}

function parseOpenTag(state: ParserState, token: Token): void {
  const tagName = token.value.toLowerCase();

  handleAutoClosing(state, tagName);

  const currentParent = getCurrentParent(state);

  const element: ASTNode = {
    type: ASTNodeType.ELEMENT,
    tagName,
    attributes: token.attributes || {},
    children: [],
    parent: currentParent,
    isSelfClosing: token.isSelfClosing || VOID_ELEMENTS.has(tagName),
    position: token.position
  };

  if (currentParent.children) {
    currentParent.children.push(element);
  }

  if (!element.isSelfClosing) {
    state.stack.push(element);
  }
}

function parseCloseTag(state: ParserState, token: Token): void {
  const tagName = token.value.toLowerCase();
  
  let found = false;
  for (let i = state.stack.length - 1; i >= 0; i--) {
    const element = state.stack[i]!;
    if (element.tagName === tagName) {
      while (state.stack.length > i + 1) {
        const unclosedElement = state.stack.pop()!;
        addError(state, `Unclosed tag: ${unclosedElement.tagName}`, token.position?.start || 0);
      }
      state.stack.pop();
      found = true;
      break;
    }
  }

  if (!found) {
    addError(state, `Unexpected closing tag: ${tagName}`, token.position?.start || 0);
  }
}

function parseText(state: ParserState, token: Token): void {
  const content = token.value;
  const currentParent = getCurrentParent(state);

  if (content.trim() === '' && shouldSkipWhitespace(currentParent)) {
    return;
  }

  const textNode: ASTNode = {
    type: ASTNodeType.TEXT,
    content,
    parent: currentParent,
    position: token.position
  };

  if (currentParent.children) {
    currentParent.children.push(textNode);
  }
}

function parseComment(state: ParserState, token: Token): void {
  const currentParent = getCurrentParent(state);

  const commentNode: ASTNode = {
    type: ASTNodeType.COMMENT,
    content: token.value,
    parent: currentParent,
    position: token.position
  };

  if (currentParent.children) {
    currentParent.children.push(commentNode);
  }
}

function parseCDATA(state: ParserState, token: Token): void {
  const currentParent = getCurrentParent(state);

  const cdataNode: ASTNode = {
    type: ASTNodeType.CDATA,
    content: token.value,
    parent: currentParent,
    position: token.position
  };

  if (currentParent.children) {
    currentParent.children.push(cdataNode);
  }
}

function parseDoctype(state: ParserState, token: Token): void {
  const currentParent = getCurrentParent(state);

  const doctypeNode: ASTNode = {
    type: ASTNodeType.DOCTYPE,
    content: token.value,
    parent: currentParent,
    position: token.position
  };

  if (currentParent.children) {
    currentParent.children.push(doctypeNode);
  }
}

function parseProcessingInstruction(state: ParserState, token: Token): void {
  const currentParent = getCurrentParent(state);

  const piNode: ASTNode = {
    type: ASTNodeType.PROCESSING_INSTRUCTION,
    content: token.value,
    parent: currentParent,
    position: token.position
  };

  if (currentParent.children) {
    currentParent.children.push(piNode);
  }
}

function handleAutoClosing(state: ParserState, tagName: string): void {
  const autoCloseList = AUTO_CLOSE_RULES[tagName];
  if (!autoCloseList) return;

  const currentElement = getCurrentElement(state);
  if (currentElement && currentElement.tagName && autoCloseList.includes(currentElement.tagName)) {
    state.stack.pop();
  }
}

function getCurrentParent(state: ParserState): ASTNode {
  return state.stack[state.stack.length - 1]!;
}

function getCurrentElement(state: ParserState): ASTNode | null {
  for (let i = state.stack.length - 1; i >= 0; i--) {
    const element = state.stack[i]!;
    if (element.type === ASTNodeType.ELEMENT) {
      return element;
    }
  }
  return null;
}

function getCurrentToken(state: ParserState): Token | null {
  return state.tokens[state.position] || null;
}

function advance(state: ParserState): void {
  state.position++;
}

function addError(state: ParserState, message: string, position: number): void {
  state.errors.push({
    message,
    position,
    line: 0,
    column: 0,
    severity: 'error'
  });
}

function shouldSkipWhitespace(parent: ASTNode): boolean {
  const skipWhitespaceIn = new Set([
    'html', 'head', 'body', 'table', 'tbody', 'thead', 'tfoot', 'tr',
    'ul', 'ol', 'dl', 'select', 'optgroup'
  ]);

  return parent.tagName ? skipWhitespaceIn.has(parent.tagName) : false;
}
