/**
 * HTML Parser - Converts tokens into Abstract Syntax Tree (AST)
 * Handles nested structures, error recovery, and builds a complete DOM-like tree
 */

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

/**
 * Self-closing HTML tags (void elements)
 */
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

/**
 * Tags that can contain raw text (script, style, etc.)
 */
const RAW_TEXT_ELEMENTS = new Set([
  'script', 'style', 'textarea', 'title'
]);

/**
 * Tags that automatically close certain other tags
 */
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

/**
 * Main parser function - converts tokens to AST
 */
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

  // Close any remaining open tags
  while (state.stack.length > 1) {
    const unclosedElement = state.stack.pop()!;
    const currentToken = getCurrentToken(state);
    addError(state, `Unclosed tag: ${unclosedElement.tagName}`, currentToken?.position?.start || 0);
  }

  return state.root;
}

/**
 * Create initial parser state
 */
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

/**
 * Parse a single token based on its type
 */
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

/**
 * Parse opening tag
 */
function parseOpenTag(state: ParserState, token: Token): void {
  const tagName = token.value.toLowerCase();

  // Handle auto-closing tags
  handleAutoClosing(state, tagName);

  // Get parent AFTER auto-closing (it might have changed)
  const currentParent = getCurrentParent(state);

  // Create element node
  const element: ASTNode = {
    type: ASTNodeType.ELEMENT,
    tagName,
    attributes: token.attributes || {},
    children: [],
    parent: currentParent,
    isSelfClosing: token.isSelfClosing || VOID_ELEMENTS.has(tagName),
    position: token.position
  };

  // Add to parent's children
  if (currentParent.children) {
    currentParent.children.push(element);
  }

  // If not self-closing, push to stack for potential children
  if (!element.isSelfClosing) {
    state.stack.push(element);
  }
}

/**
 * Parse closing tag
 */
function parseCloseTag(state: ParserState, token: Token): void {
  const tagName = token.value.toLowerCase();
  
  // Find matching opening tag in stack
  let found = false;
  for (let i = state.stack.length - 1; i >= 0; i--) {
    const element = state.stack[i]!;
    if (element.tagName === tagName) {
      // Close all tags up to this one
      while (state.stack.length > i + 1) {
        const unclosedElement = state.stack.pop()!;
        addError(state, `Unclosed tag: ${unclosedElement.tagName}`, token.position?.start || 0);
      }
      state.stack.pop(); // Remove the matched tag
      found = true;
      break;
    }
  }

  if (!found) {
    addError(state, `Unexpected closing tag: ${tagName}`, token.position?.start || 0);
  }
}

/**
 * Parse text content
 */
function parseText(state: ParserState, token: Token): void {
  const content = token.value;
  const currentParent = getCurrentParent(state);

  // Skip empty text nodes (whitespace only) in certain contexts
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

/**
 * Parse comment
 */
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

/**
 * Parse CDATA section
 */
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

/**
 * Parse DOCTYPE declaration
 */
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

/**
 * Parse processing instruction
 */
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

/**
 * Handle auto-closing tags based on HTML rules
 */
function handleAutoClosing(state: ParserState, tagName: string): void {
  const autoCloseList = AUTO_CLOSE_RULES[tagName];
  if (!autoCloseList) return;

  // Check if current element should be auto-closed
  const currentElement = getCurrentElement(state);
  if (currentElement && currentElement.tagName && autoCloseList.includes(currentElement.tagName)) {
    // Auto-close the current element
    state.stack.pop();
  }
}

/**
 * Get current parent element from stack
 */
function getCurrentParent(state: ParserState): ASTNode {
  return state.stack[state.stack.length - 1]!;
}

/**
 * Get current element (not document root)
 */
function getCurrentElement(state: ParserState): ASTNode | null {
  for (let i = state.stack.length - 1; i >= 0; i--) {
    const element = state.stack[i]!;
    if (element.type === ASTNodeType.ELEMENT) {
      return element;
    }
  }
  return null;
}

/**
 * Get current token
 */
function getCurrentToken(state: ParserState): Token | null {
  return state.tokens[state.position] || null;
}

/**
 * Advance parser position
 */
function advance(state: ParserState): void {
  state.position++;
}

/**
 * Add parse error
 */
function addError(state: ParserState, message: string, position: number): void {
  state.errors.push({
    message,
    position,
    line: 0, // Could be calculated from position if needed
    column: 0,
    severity: 'error'
  });
}

/**
 * Check if whitespace should be skipped in current context
 */
function shouldSkipWhitespace(parent: ASTNode): boolean {
  // Skip whitespace in certain parent elements
  const skipWhitespaceIn = new Set([
    'html', 'head', 'body', 'table', 'tbody', 'thead', 'tfoot', 'tr',
    'ul', 'ol', 'dl', 'select', 'optgroup'
  ]);

  return parent.tagName ? skipWhitespaceIn.has(parent.tagName) : false;
}

/**
 * Utility function to traverse AST and execute callback on each node
 */
export function traverseAST(node: ASTNode, callback: (node: ASTNode) => void): void {
  callback(node);
  
  if (node.children) {
    for (const child of node.children) {
      traverseAST(child, callback);
    }
  }
}

/**
 * Utility function to find nodes by tag name
 */
export function findNodesByTagName(root: ASTNode, tagName: string): ASTNode[] {
  const results: ASTNode[] = [];
  
  traverseAST(root, (node) => {
    if (node.type === ASTNodeType.ELEMENT && node.tagName === tagName.toLowerCase()) {
      results.push(node);
    }
  });

  return results;
}

/**
 * Utility function to find nodes by attribute
 */
export function findNodesByAttribute(root: ASTNode, attrName: string, attrValue?: string): ASTNode[] {
  const results: ASTNode[] = [];
  
  traverseAST(root, (node) => {
    if (node.type === ASTNodeType.ELEMENT && node.attributes) {
      const hasAttr = attrName in node.attributes;
      const valueMatches = attrValue === undefined || node.attributes[attrName] === attrValue;
      
      if (hasAttr && valueMatches) {
        results.push(node);
      }
    }
  });

  return results;
}
