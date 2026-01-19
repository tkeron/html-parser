import type { Token } from './tokenizer.js';
import { TokenType } from './tokenizer.js';
import { createDocument, createElement, createTextNode, createComment, createDoctype, appendChild } from './dom-simulator.js';

export interface ParserState {
  tokens: Token[];
  position: number;
  length: number;
  stack: any[]; // DOM elements
  root: any; // Document
  insertionMode: InsertionMode;
  errors: ParseError[];
}

export interface ParseError {
  message: string;
  position: number;
  line: number;
  column: number;
  severity: 'error' | 'warning';
}

export enum InsertionMode {
  Initial = 'initial',
  BeforeHtml = 'beforeHtml',
  BeforeHead = 'beforeHead',
  InHead = 'inHead',
  AfterHead = 'afterHead',
  InBody = 'inBody'
}

export enum ASTNodeType {
  Document = 'document',
  Element = 'element',
  Text = 'text',
  Comment = 'comment',
  Doctype = 'doctype',
  CDATA = 'cdata'
}

export interface ASTNode {
  type: ASTNodeType;
  tagName?: string;
  value?: string;
  attributes?: Record<string, string>;
  children?: ASTNode[];
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
  'address': ['p'],
  'article': ['p'],
  'aside': ['p'],
  'blockquote': ['p'],
  'center': ['p'],
  'details': ['p'],
  'dialog': ['p'],
  'dir': ['p'],
  'div': ['p'],
  'dl': ['p'],
  'fieldset': ['p'],
  'figcaption': ['p'],
  'figure': ['p'],
  'footer': ['p'],
  'form': ['p'],
  'h1': ['p'],
  'h2': ['p'],
  'h3': ['p'],
  'h4': ['p'],
  'h5': ['p'],
  'h6': ['p'],
  'header': ['p'],
  'hgroup': ['p'],
  'hr': ['p'],
  'listing': ['p'],
  'main': ['p'],
  'menu': ['p'],
  'nav': ['p'],
  'ol': ['p'],
  'p': ['p'],
  'pre': ['p'],
  'section': ['p'],
  'summary': ['p'],
  'table': ['p'],
  'ul': ['p'],
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

export function parse(tokens: Token[]): any {
  const state = createParserState(tokens);
  
  while (state.position < state.length) {
    const token = getCurrentToken(state);
    
    if (!token || token.type === TokenType.EOF) {
      break;
    }

    parseToken(state, token);
    advance(state);
  }

  // Create implicit html, head, body if needed
  if (state.root.childNodes && state.root.childNodes.length > 0) {
    let hasHtml = false;
    for (const child of state.root.childNodes) {
      if (child.nodeType === 1 && child.tagName === 'HTML') {
        hasHtml = true;
        state.root.documentElement = child;
        break;
      }
    }
    if (!hasHtml) {
      const html = createElement('html', {});
      const head = createElement('head', {});
      const body = createElement('body', {});
      appendChild(html, head);
      appendChild(html, body);
      
      const doctypes: any[] = [];
      const commentsBeforeHtml: any[] = [];
      const bodyContent: any[] = [];
      const children = [...state.root.childNodes];
      
      let foundElement = false;
      for (const child of children) {
        if (child.nodeType === 10) {
          doctypes.push(child);
        } else if (child.nodeType === 8 && !foundElement) {
          commentsBeforeHtml.push(child);
        } else {
          if (child.nodeType === 1) foundElement = true;
          bodyContent.push(child);
        }
      }
      
      for (const content of bodyContent) {
        appendChild(body, content);
      }
      
      state.root.childNodes = [];
      for (const doctype of doctypes) {
        doctype.parentNode = null;
        appendChild(state.root, doctype);
      }
      for (const comment of commentsBeforeHtml) {
        comment.parentNode = null;
        appendChild(state.root, comment);
      }
      appendChild(state.root, html);
      state.root.documentElement = html;
      state.root.head = head;
      state.root.body = body;
    }
  }

  while (state.stack.length > 1) {
    const unclosedElement = state.stack.pop()!;
    const currentToken = getCurrentToken(state);
    addError(state, `Unclosed tag: ${unclosedElement.tagName}`, currentToken?.position?.offset || 0);
  }

  return state.root;
}

export function domToAST(dom: any): ASTNode {
  function convert(node: any): ASTNode | null {
    if (!node) return null;
    
    if (node.nodeType === 9) {
      const children: ASTNode[] = [];
      if (node.childNodes) {
        for (const child of node.childNodes) {
          const converted = convert(child);
          if (converted) children.push(converted);
        }
      }
      return {
        type: ASTNodeType.Document,
        children
      };
    }
    
    if (node.nodeType === 1) {
      const children: ASTNode[] = [];
      if (node.childNodes) {
        for (const child of node.childNodes) {
          const converted = convert(child);
          if (converted) children.push(converted);
        }
      }
      const tagName = node.tagName?.toLowerCase();
      return {
        type: ASTNodeType.Element,
        tagName,
        attributes: node.attributes || {},
        children,
        isSelfClosing: VOID_ELEMENTS.has(tagName)
      } as ASTNode & { isSelfClosing: boolean };
    }
    
    if (node.nodeType === 3) {
      return {
        type: ASTNodeType.Text,
        content: node.nodeValue || ''
      } as ASTNode & { content: string };
    }
    
    if (node.nodeType === 8) {
      return {
        type: ASTNodeType.Comment,
        content: node.nodeValue || ''
      } as ASTNode & { content: string };
    }
    
    if (node.nodeType === 10) {
      return {
        type: ASTNodeType.Doctype,
        content: node.name || 'html'
      } as ASTNode & { content: string };
    }
    
    return null;
  }
  
  return convert(dom) || { type: ASTNodeType.Document, children: [] };
}

function createParserState(tokens: Token[]): ParserState {
  const root = createDocument();

  return {
    tokens,
    position: 0,
    length: tokens.length,
    stack: [root],
    root,
    insertionMode: InsertionMode.Initial,
    errors: []
  };
}

function parseToken(state: ParserState, token: Token): void {
  switch (state.insertionMode) {
    case InsertionMode.Initial:
      parseTokenInInitialMode(state, token);
      break;
    case InsertionMode.BeforeHtml:
      parseTokenInBeforeHtmlMode(state, token);
      break;
    case InsertionMode.BeforeHead:
      parseTokenInBeforeHeadMode(state, token);
      break;
    case InsertionMode.InHead:
      parseTokenInInHeadMode(state, token);
      break;
    case InsertionMode.AfterHead:
      parseTokenInAfterHeadMode(state, token);
      break;
    case InsertionMode.InBody:
      parseTokenInInBodyMode(state, token);
      break;
    default:
      parseTokenInInBodyMode(state, token); // fallback
  }
}

function parseTokenInInitialMode(state: ParserState, token: Token): void {
  if (token.type === TokenType.DOCTYPE) {
    // TODO: Create DOCTYPE node
    parseDoctype(state, token);
    state.insertionMode = InsertionMode.BeforeHtml;
  } else if (token.type === TokenType.COMMENT) {
    parseComment(state, token);
  } else if (token.type === TokenType.TEXT && token.value.trim() === '') {
    // Ignore whitespace
  } else {
    // No DOCTYPE, create implicit DOCTYPE and switch to BeforeHtml
    const doctype = createDoctype('html');
    appendChild(state.root, doctype);
    state.insertionMode = InsertionMode.BeforeHtml;
    parseToken(state, token); // Re-parse in new mode
  }
}

function parseTokenInBeforeHtmlMode(state: ParserState, token: Token): void {
  if (token.type === TokenType.TAG_OPEN && token.value.toLowerCase() === 'html') {
    const html = createElement('html', token.attributes || {});
    appendChild(state.root, html);
    state.root.documentElement = html;
    state.stack.push(html);
    state.insertionMode = InsertionMode.BeforeHead;
  } else if (token.type === TokenType.COMMENT) {
    parseComment(state, token);
  } else if (token.type === TokenType.DOCTYPE) {
    // Ignore
  } else if (token.type === TokenType.TEXT && token.value.trim() === '') {
    // Ignore whitespace
  } else {
    const html = createElement('html', {});
    appendChild(state.root, html);
    state.root.documentElement = html;
    state.stack.push(html);
    state.insertionMode = InsertionMode.BeforeHead;
    parseToken(state, token);
  }
}

function parseTokenInBeforeHeadMode(state: ParserState, token: Token): void {
  if (token.type === TokenType.TAG_OPEN && token.value.toLowerCase() === 'head') {
    const head = createElement('head', token.attributes || {});
    appendChild(getCurrentParent(state), head);
    state.root.head = head;
    state.stack.push(head);
    state.insertionMode = InsertionMode.InHead;
  } else if (token.type === TokenType.COMMENT) {
    parseComment(state, token);
  } else if (token.type === TokenType.TEXT && token.value.trim() === '') {
    // Ignore whitespace
  } else {
    const head = createElement('head', {});
    appendChild(getCurrentParent(state), head);
    state.root.head = head;
    state.stack.push(head);
    state.insertionMode = InsertionMode.InHead;
    parseToken(state, token);
  }
}

function parseOpenTag(state: ParserState, token: Token): void {
  const tagName = token.value.toLowerCase();
  const currentParent = getCurrentParent(state);
  const element = createElement(tagName, token.attributes || {});
  appendChild(currentParent, element);
  
  if (!token.isSelfClosing && !VOID_ELEMENTS.has(tagName)) {
    state.stack.push(element);
  }
}

function parseTokenInInHeadMode(state: ParserState, token: Token): void {
  const currentElement = getCurrentElement(state);
  const currentTagName = currentElement?.tagName?.toLowerCase();
  
  if (RAW_TEXT_ELEMENTS.has(currentTagName)) {
    if (token.type === TokenType.TEXT) {
      parseText(state, token);
      return;
    } else if (token.type === TokenType.TAG_CLOSE && token.value.toLowerCase() === currentTagName) {
      state.stack.pop();
      return;
    }
  }
  
  if (token.type === TokenType.TAG_OPEN) {
    const tagName = token.value.toLowerCase();
    if (tagName === 'title' || tagName === 'style' || tagName === 'script' || tagName === 'noscript') {
      parseOpenTag(state, token);
    } else if (tagName === 'meta' || tagName === 'link' || tagName === 'base') {
      parseOpenTag(state, token);
    } else if (tagName === 'head') {
      // Ignore duplicate <head> tags
    } else if (tagName.includes('-')) {
      // Custom elements (tags with hyphens) are valid in <head>
      parseOpenTag(state, token);
    } else {
      state.stack.pop();
      state.insertionMode = InsertionMode.AfterHead;
      parseToken(state, token);
    }
  } else if (token.type === TokenType.TAG_CLOSE) {
    const tagName = token.value.toLowerCase();
    if (tagName === 'head') {
      state.stack.pop();
      state.insertionMode = InsertionMode.AfterHead;
    } else if (tagName === 'title' || tagName === 'style' || tagName === 'script' || tagName === 'noscript') {
      if (currentTagName === tagName) {
        state.stack.pop();
      }
    } else if (tagName.includes('-') && currentTagName === tagName) {
      // Handle closing tags for custom elements in <head>
      state.stack.pop();
    }
  } else if (token.type === TokenType.COMMENT) {
    parseComment(state, token);
  } else if (token.type === TokenType.TEXT && token.value.trim() === '') {
  } else {
    state.stack.pop();
    state.insertionMode = InsertionMode.AfterHead;
    parseToken(state, token);
  }
}

function parseTokenInAfterHeadMode(state: ParserState, token: Token): void {
  if (token.type === TokenType.TAG_OPEN && token.value.toLowerCase() === 'body') {
    const body = createElement('body', token.attributes || {});
    appendChild(getCurrentParent(state), body);
    state.root.body = body;
    state.stack.push(body);
    state.insertionMode = InsertionMode.InBody;
  } else if (token.type === TokenType.COMMENT) {
    parseComment(state, token);
  } else if (token.type === TokenType.TEXT && token.value.trim() === '') {
    // Ignore whitespace
  } else {
    const body = createElement('body', {});
    appendChild(getCurrentParent(state), body);
    state.root.body = body;
    state.stack.push(body);
    state.insertionMode = InsertionMode.InBody;
    parseToken(state, token);
  }
}

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';

function parseTokenInInBodyMode(state: ParserState, token: Token): void {
  if (token.type === TokenType.TAG_OPEN) {
    const tagName = token.value.toLowerCase();

    handleAutoClosing(state, tagName);

    const currentParent = getCurrentParent(state);

    let namespaceURI: string | undefined;
    if (tagName === 'svg') {
      namespaceURI = SVG_NAMESPACE;
    } else if (tagName === 'math') {
      namespaceURI = MATHML_NAMESPACE;
    }

    const element = createElement(tagName, token.attributes || {}, namespaceURI);

    appendChild(currentParent, element);

    if (!token.isSelfClosing && !VOID_ELEMENTS.has(tagName)) {
      state.stack.push(element);
    }
  } else if (token.type === TokenType.TAG_CLOSE) {
    const tagName = token.value.toLowerCase();
    
    // Generate implied end tags
    const impliedEndTags = ['dd', 'dt', 'li', 'option', 'optgroup', 'p', 'rb', 'rp', 'rt', 'rtc'];
    while (state.stack.length > 1) { // Don't pop document
      const currentElement = getCurrentElement(state);
      if (!currentElement || !impliedEndTags.includes(currentElement.tagName.toLowerCase()) || currentElement.tagName.toLowerCase() === tagName) {
        break;
      }
      state.stack.pop();
      addError(state, `Implied end tag: ${currentElement.tagName}`, token.position?.offset || 0);
    }
    
    const currentElement = getCurrentElement(state);
    if (currentElement && currentElement.tagName.toLowerCase() === tagName) {
      state.stack.pop();
    } else {
      // For now, just ignore unmatched closing tags
      // TODO: Implement full adoption agency algorithm
      addError(state, `Unmatched closing tag: ${tagName}`, token.position?.offset || 0);
    }
  } else if (token.type === TokenType.TEXT) {
    parseText(state, token);
  } else if (token.type === TokenType.COMMENT) {
    parseComment(state, token);
  } else if (token.type === TokenType.CDATA) {
    parseCDATA(state, token);
  } else if (token.type === TokenType.DOCTYPE) {
    // Ignore
  } else if (token.type === TokenType.PROCESSING_INSTRUCTION) {
    parseProcessingInstruction(state, token);
  }
}

function parseText(state: ParserState, token: Token): void {
  const content = token.value;
  const currentParent = getCurrentParent(state);

  if (content.trim() === '' && shouldSkipWhitespace(currentParent)) {
    return;
  }

  const textNode = createTextNode(content);
  appendChild(currentParent, textNode);
}

function parseComment(state: ParserState, token: Token): void {
  const currentParent = getCurrentParent(state);

  const commentNode = createComment(token.value);
  appendChild(currentParent, commentNode);
}

function parseCDATA(state: ParserState, token: Token): void {
  // TODO: implement CDATA
}

function parseDoctype(state: ParserState, token: Token): void {
  const doctype = createDoctype(token.value || 'html');
  appendChild(state.root, doctype);
  state.root.doctype = doctype;
}

function parseProcessingInstruction(state: ParserState, token: Token): void {
  // TODO: implement ProcessingInstruction
}

function runAdoptionAgencyAlgorithm(state: ParserState, tagName: string, token: Token): void {
  // HTML5 Adoption Agency Algorithm - simplified but more correct implementation
  
  // 1. If the current node is an HTML element whose tag name matches the token's tag name, 
  // then pop the current node off the stack of open elements and abort these steps.
  const currentElement = getCurrentElement(state);
  if (currentElement && currentElement.tagName.toLowerCase() === tagName) {
    state.stack.pop();
    return;
  }
  
  // 2. Let outer loop counter be 0
  let outerLoopCounter = 0;
  const formattingElements = ['a', 'b', 'big', 'code', 'em', 'font', 'i', 'nobr', 's', 'small', 'strike', 'strong', 'tt', 'u'];
  
  while (outerLoopCounter < 8) { // Prevent infinite loops
    outerLoopCounter++;
    
    // 3. Let the formatting element be the last element in the list of active formatting elements 
    // that is between the end of the list and the last scope marker or the start of the list, 
    // if any, that has the same tag name as the token.
    
    // For simplicity, find the innermost element with matching tag name
    let formattingElementIndex = -1;
    for (let i = state.stack.length - 1; i >= 0; i--) {
      const element = state.stack[i];
      if (element.tagName && element.tagName.toLowerCase() === tagName && formattingElements.includes(tagName)) {
        formattingElementIndex = i;
        break;
      }
    }
    
    if (formattingElementIndex === -1) {
      // No formatting element found, just find any element with matching tag name
      for (let i = state.stack.length - 1; i >= 0; i--) {
        const element = state.stack[i];
        if (element.tagName && element.tagName.toLowerCase() === tagName) {
          formattingElementIndex = i;
          break;
        }
      }
    }
    
    if (formattingElementIndex === -1) {
      // No matching element found, ignore the token
      addError(state, `Stray end tag: ${tagName}`, token.position?.offset || 0);
      return;
    }
    
    const formattingElement = state.stack[formattingElementIndex];
    
    // 4. If there is no element in the stack of open elements that has the same tag name as the 
    // formatting element, then remove the element from the list of active formatting elements 
    // and abort these steps.
    let openElementIndex = -1;
    for (let i = state.stack.length - 1; i >= 0; i--) {
      if (state.stack[i] === formattingElement) {
        openElementIndex = i;
        break;
      }
    }
    
    if (openElementIndex === -1) {
      // Element not in stack, ignore
      return;
    }
    
    // 5. If the element is not in the stack of open elements, then this is a parse error; 
    // remove the element from the list of active formatting elements and abort these steps.
    // (Already checked above)
    
    // 6. Let the furthest block be the topmost node in the stack of open elements that is lower 
    // in the stack than the formatting element, and is an element in the special category.
    const specialElements = ['address', 'article', 'aside', 'blockquote', 'center', 'details', 'dialog', 'dir', 'div', 'dl', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'li', 'listing', 'main', 'menu', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul', 'xmp'];
    
    let furthestBlockIndex = -1;
    for (let i = openElementIndex + 1; i < state.stack.length; i++) {
      const element = state.stack[i];
      if (element.tagName && specialElements.includes(element.tagName.toLowerCase())) {
        furthestBlockIndex = i;
        break;
      }
    }
    
    if (furthestBlockIndex === -1) {
      // No special element found, just pop elements until we reach the formatting element
      while (state.stack.length > openElementIndex + 1) {
        state.stack.pop();
      }
      state.stack.pop(); // Pop the formatting element
      return;
    }
    
    // 7. Simplified: just pop everything until the formatting element
    while (state.stack.length > openElementIndex + 1) {
      state.stack.pop();
    }
    state.stack.pop(); // Pop the formatting element
    return;
  }
  
  // If we get here, something went wrong, ignore the token
  addError(state, `Adoption agency gave up on: ${tagName}`, token.position?.offset || 0);
}

function handleAutoClosing(state: ParserState, tagName: string): void {
  const autoCloseList = AUTO_CLOSE_RULES[tagName];
  if (!autoCloseList) return;

  const currentElement = getCurrentElement(state);
  if (currentElement && currentElement.tagName && autoCloseList.includes(currentElement.tagName.toLowerCase())) {
    state.stack.pop();
  }
}

function getCurrentParent(state: ParserState): any {
  return state.stack[state.stack.length - 1];
}

function getCurrentElement(state: ParserState): any {
  for (let i = state.stack.length - 1; i >= 0; i--) {
    const element = state.stack[i];
    if (element.nodeType === 1) { // ELEMENT_NODE
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

function shouldSkipWhitespace(parent: any): boolean {
  const skipWhitespaceIn = new Set([
    'html', 'head', 'body', 'table', 'tbody', 'thead', 'tfoot', 'tr',
    'ul', 'ol', 'dl', 'select', 'optgroup'
  ]);

  return parent.tagName ? skipWhitespaceIn.has(parent.tagName) : false;
}
