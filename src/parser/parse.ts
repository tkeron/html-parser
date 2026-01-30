import type { Token } from "../tokenizer/index";
import { TokenType } from "../tokenizer/index";
import {
  createDocument,
  createElement,
  createTextNode,
  createComment,
  createCDATA,
  createProcessingInstruction,
  createDoctype,
  appendChild,
} from "../dom-simulator/index.js";
import type { ParserState } from "./types";
import { InsertionMode } from "./types";
import {
  VOID_ELEMENTS,
  RAW_TEXT_ELEMENTS,
  AUTO_CLOSE_RULES,
} from "./constants";

export const parse = (tokens: Token[]): any => {
  const state = createParserState(tokens);

  while (state.position < state.length) {
    const token = getCurrentToken(state);

    if (!token || token.type === TokenType.EOF) {
      break;
    }

    parseToken(state, token);
    advance(state);
  }

  let hasHtml = false;
  for (const child of state.root.childNodes) {
    if (child.nodeType === 1 && child.tagName === "HTML") {
      hasHtml = true;
      state.root.documentElement = child;
      break;
    }
  }
  if (!hasHtml) {
    const html = createElement("html", {});
    const head = createElement("head", {});
    const body = createElement("body", {});
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

  while (state.stack.length > 1) {
    const unclosedElement = state.stack.pop()!;
    const currentToken = getCurrentToken(state);
    addError(
      state,
      `Unclosed tag: ${unclosedElement.tagName}`,
      currentToken?.position?.offset || 0,
    );
  }

  return state.root;
};

const createParserState = (tokens: Token[]): ParserState => {
  const root = createDocument();

  return {
    tokens,
    position: 0,
    length: tokens.length,
    stack: [root],
    root,
    insertionMode: InsertionMode.Initial,
    errors: [],
  };
};

const parseToken = (state: ParserState, token: Token): void => {
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
      parseTokenInInBodyMode(state, token);
  }
};

const parseTokenInInitialMode = (state: ParserState, token: Token): void => {
  if (token.type === TokenType.DOCTYPE) {
    parseDoctype(state, token);
    state.insertionMode = InsertionMode.BeforeHtml;
  } else if (token.type === TokenType.COMMENT) {
    parseComment(state, token);
  } else if (token.type === TokenType.TEXT && token.value.trim() === "") {
  } else {
    const doctype = createDoctype("html");
    appendChild(state.root, doctype);
    state.insertionMode = InsertionMode.BeforeHtml;
    parseToken(state, token);
  }
};

const parseTokenInBeforeHtmlMode = (state: ParserState, token: Token): void => {
  if (
    token.type === TokenType.TAG_OPEN &&
    token.value.toLowerCase() === "html"
  ) {
    const html = createElement("html", token.attributes || {});
    appendChild(state.root, html);
    state.root.documentElement = html;
    state.stack.push(html);
    state.insertionMode = InsertionMode.BeforeHead;
  } else if (token.type === TokenType.COMMENT) {
    parseComment(state, token);
  } else if (token.type === TokenType.DOCTYPE) {
  } else if (token.type === TokenType.TEXT && token.value.trim() === "") {
  } else {
    const html = createElement("html", {});
    appendChild(state.root, html);
    state.root.documentElement = html;
    state.stack.push(html);
    state.insertionMode = InsertionMode.BeforeHead;
    parseToken(state, token);
  }
};

const parseTokenInBeforeHeadMode = (state: ParserState, token: Token): void => {
  if (
    token.type === TokenType.TAG_OPEN &&
    token.value.toLowerCase() === "head"
  ) {
    const head = createElement("head", token.attributes || {});
    appendChild(getCurrentParent(state), head);
    state.root.head = head;
    state.stack.push(head);
    state.insertionMode = InsertionMode.InHead;
    state.explicitHead = true;
  } else if (token.type === TokenType.COMMENT) {
    parseComment(state, token);
  } else if (token.type === TokenType.TEXT && token.value.trim() === "") {
  } else {
    const head = createElement("head", {});
    appendChild(getCurrentParent(state), head);
    state.root.head = head;
    state.stack.push(head);
    state.insertionMode = InsertionMode.InHead;
    state.explicitHead = false;
    parseToken(state, token);
  }
};

const parseOpenTag = (state: ParserState, token: Token): void => {
  const tagName = token.value.toLowerCase();
  const currentParent = getCurrentParent(state);
  const element = createElement(
    tagName,
    token.attributes || {},
    undefined,
    token.isSelfClosing,
  );
  appendChild(currentParent, element);

  if (!token.isSelfClosing && !VOID_ELEMENTS.has(tagName)) {
    state.stack.push(element);
  }
};

const parseTokenInInHeadMode = (state: ParserState, token: Token): void => {
  const currentElement = getCurrentElement(state);
  const currentTagName = currentElement?.tagName?.toLowerCase();

  if (RAW_TEXT_ELEMENTS.has(currentTagName)) {
    if (token.type === TokenType.TEXT) {
      parseText(state, token);
      return;
    } else if (
      token.type === TokenType.TAG_CLOSE &&
      token.value.toLowerCase() === currentTagName
    ) {
      state.stack.pop();
      return;
    }
  }

  if (token.type === TokenType.TAG_OPEN) {
    const tagName = token.value.toLowerCase();
    if (
      tagName === "title" ||
      tagName === "style" ||
      tagName === "script" ||
      tagName === "noscript"
    ) {
      parseOpenTag(state, token);
    } else if (tagName === "meta" || tagName === "link" || tagName === "base") {
      parseOpenTag(state, token);
    } else if (tagName === "head") {
    } else if (tagName.includes("-")) {
      if (state.explicitHead) {
        parseOpenTag(state, token);
      } else {
        state.stack.pop();
        state.insertionMode = InsertionMode.AfterHead;
        parseToken(state, token);
      }
    } else {
      state.stack.pop();
      state.insertionMode = InsertionMode.AfterHead;
      parseToken(state, token);
    }
  } else if (token.type === TokenType.TAG_CLOSE) {
    const tagName = token.value.toLowerCase();
    if (tagName === "head") {
      state.stack.pop();
      state.insertionMode = InsertionMode.AfterHead;
    } else if (
      tagName === "title" ||
      tagName === "style" ||
      tagName === "script" ||
      tagName === "noscript"
    ) {
      if (currentTagName === tagName) {
        state.stack.pop();
      }
    } else if (tagName.includes("-") && currentTagName === tagName) {
      state.stack.pop();
    }
  } else if (token.type === TokenType.COMMENT) {
    parseComment(state, token);
  } else if (token.type === TokenType.TEXT && token.value.trim() === "") {
  } else {
    state.stack.pop();
    state.insertionMode = InsertionMode.AfterHead;
    parseToken(state, token);
  }
};

const parseTokenInAfterHeadMode = (state: ParserState, token: Token): void => {
  if (
    token.type === TokenType.TAG_OPEN &&
    token.value.toLowerCase() === "body"
  ) {
    const body = createElement("body", token.attributes || {});
    appendChild(getCurrentParent(state), body);
    state.root.body = body;
    state.stack.push(body);
    state.insertionMode = InsertionMode.InBody;
  } else if (token.type === TokenType.COMMENT) {
    parseComment(state, token);
  } else if (token.type === TokenType.TEXT && token.value.trim() === "") {
  } else {
    const body = createElement("body", {});
    appendChild(getCurrentParent(state), body);
    state.root.body = body;
    state.stack.push(body);
    state.insertionMode = InsertionMode.InBody;
    parseToken(state, token);
  }
};

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const MATHML_NAMESPACE = "http://www.w3.org/1998/Math/MathML";

const parseTokenInInBodyMode = (state: ParserState, token: Token): void => {
  if (token.type === TokenType.TAG_OPEN) {
    const tagName = token.value.toLowerCase();

    handleAutoClosing(state, tagName);

    const currentParent = getCurrentParent(state);

    let namespaceURI: string | undefined;
    if (tagName === "svg") {
      namespaceURI = SVG_NAMESPACE;
    } else if (tagName === "math") {
      namespaceURI = MATHML_NAMESPACE;
    }

    const element = createElement(
      tagName,
      token.attributes || {},
      namespaceURI,
    );

    appendChild(currentParent, element);

    if (!token.isSelfClosing && !VOID_ELEMENTS.has(tagName)) {
      state.stack.push(element);
    }
  } else if (token.type === TokenType.TAG_CLOSE) {
    const tagName = token.value.toLowerCase();

    const impliedEndTags = [
      "dd",
      "dt",
      "li",
      "option",
      "optgroup",
      "p",
      "rb",
      "rp",
      "rt",
      "rtc",
    ];
    while (state.stack.length > 1) {
      const currentElement = getCurrentElement(state);
      if (
        !currentElement ||
        !impliedEndTags.includes(currentElement.tagName.toLowerCase()) ||
        currentElement.tagName.toLowerCase() === tagName
      ) {
        break;
      }
      state.stack.pop();
      addError(
        state,
        `Implied end tag: ${currentElement.tagName}`,
        token.position?.offset || 0,
      );
    }

    const currentElement = getCurrentElement(state);
    if (currentElement && currentElement.tagName.toLowerCase() === tagName) {
      state.stack.pop();
    } else {
      addError(
        state,
        `Unmatched closing tag: ${tagName}`,
        token.position?.offset || 0,
      );
    }
  } else if (token.type === TokenType.TEXT) {
    parseText(state, token);
  } else if (token.type === TokenType.COMMENT) {
    parseComment(state, token);
  } else if (token.type === TokenType.CDATA) {
    parseCDATA(state, token);
  } else if (token.type === TokenType.DOCTYPE) {
  } else if (token.type === TokenType.PROCESSING_INSTRUCTION) {
    parseProcessingInstruction(state, token);
  }
};

const parseText = (state: ParserState, token: Token): void => {
  const content = token.value;
  const currentParent = getCurrentParent(state);

  if (content.trim() === "" && shouldSkipWhitespace(currentParent)) {
    return;
  }

  const textNode = createTextNode(content);
  appendChild(currentParent, textNode);
};

const parseComment = (state: ParserState, token: Token): void => {
  const currentParent = getCurrentParent(state);

  const commentNode = createComment(token.value);
  appendChild(currentParent, commentNode);
};

const parseCDATA = (state: ParserState, token: Token): void => {
  const currentParent = getCurrentParent(state);
  const cdataNode = createCDATA(token.value);
  appendChild(currentParent, cdataNode);
};

const parseDoctype = (state: ParserState, token: Token): void => {
  const doctype = createDoctype(token.value || "html");
  appendChild(state.root, doctype);
  state.root.doctype = doctype;
};

const parseProcessingInstruction = (state: ParserState, token: Token): void => {
  const currentParent = getCurrentParent(state);
  const piNode = createProcessingInstruction(token.value);
  appendChild(currentParent, piNode);
};

const handleAutoClosing = (state: ParserState, tagName: string): void => {
  const autoCloseList = AUTO_CLOSE_RULES[tagName];
  if (!autoCloseList) return;

  const currentElement = getCurrentElement(state);
  if (
    currentElement &&
    currentElement.tagName &&
    autoCloseList.includes(currentElement.tagName.toLowerCase())
  ) {
    state.stack.pop();
  }
};

const getCurrentParent = (state: ParserState): any => {
  return state.stack[state.stack.length - 1];
};

const getCurrentElement = (state: ParserState): any => {
  for (let i = state.stack.length - 1; i >= 0; i--) {
    const element = state.stack[i];
    if (element.nodeType === 1) {
      return element;
    }
  }
  return null;
};

const getCurrentToken = (state: ParserState): Token | null => {
  return state.tokens[state.position] || null;
};

const advance = (state: ParserState): void => {
  state.position++;
};

const addError = (
  state: ParserState,
  message: string,
  position: number,
): void => {
  state.errors.push({
    message,
    position,
    line: 0,
    column: 0,
    severity: "error",
  });
};

const shouldSkipWhitespace = (parent: any): boolean => {
  const skipWhitespaceIn = new Set([
    "html",
    "head",
    "body",
    "table",
    "tbody",
    "thead",
    "tfoot",
    "tr",
    "ul",
    "ol",
    "dl",
    "select",
    "optgroup",
  ]);

  return parent.tagName ? skipWhitespaceIn.has(parent.tagName) : false;
};
