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
  FORMATTING_ELEMENTS,
  TABLE_CONTEXT_ELEMENTS,
  VALID_TABLE_CHILDREN,
  VALID_TABLE_SECTION_CHILDREN,
  VALID_TR_CHILDREN,
  BUTTON_SCOPE_TERMINATORS,
} from "./constants";
import {
  findFurthestBlock,
  getCommonAncestor,
  cloneFormattingElement,
  reparentChildren,
} from "./adoption-agency-helpers.js";
import {
  shouldCreateImplicitTableStructure,
  createImplicitTableStructure,
  CELL_ELEMENTS,
} from "./implicit-table-structure.js";
import { mergeAdjacentTextNodes } from "./foster-parenting-helpers.js";

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
    activeFormattingElements: [],
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

    if (tagName === "a") {
      const existingA = state.activeFormattingElements.find(
        (el) => el && el.tagName && el.tagName.toLowerCase() === "a",
      );
      if (existingA) {
        runAdoptionAgencyAlgorithm(state, "a");
      }
    }

    const closedParagraph = handleAutoClosing(state, tagName);

    const inTableContext = isInTableContext(state);
    const isTableStructureElement =
      CELL_ELEMENTS.has(tagName) ||
      tagName === "tr" ||
      tagName === "tbody" ||
      tagName === "thead" ||
      tagName === "tfoot";
    const currentStackParent = getCurrentParent(state);
    const currentStackParentTag =
      currentStackParent.tagName?.toLowerCase() || "";
    const parentIsTableContext = TABLE_CONTEXT_ELEMENTS.has(
      currentStackParentTag,
    );

    if (inTableContext && isTableStructureElement) {
      const tableParent = findTableContextParent(state);
      if (tableParent) {
        popStackUntilTableContext(state);
      }
    } else if (!parentIsTableContext && !closedParagraph) {
      reconstructActiveFormattingElements(state);
    }

    let currentParent = getCurrentParent(state);

    let namespaceURI: string | undefined;
    if (tagName === "svg") {
      namespaceURI = SVG_NAMESPACE;
    } else if (tagName === "math") {
      namespaceURI = MATHML_NAMESPACE;
    } else {
      namespaceURI = getCurrentNamespace(state);
    }

    const element = createElement(
      tagName,
      token.attributes || {},
      namespaceURI,
    );

    let parentTagName = currentParent.tagName || "";

    const isValidForParent = isValidChildForTableParent(parentTagName, tagName);
    const isHiddenInput =
      tagName === "input" &&
      token.attributes &&
      token.attributes.type &&
      token.attributes.type.toLowerCase() === "hidden";
    const isFormInTable = tagName === "form" && inTableContext;

    const needsImplicitStructure =
      inTableContext &&
      shouldCreateImplicitTableStructure(parentTagName, tagName);

    const needsFosterParenting =
      inTableContext &&
      TABLE_CONTEXT_ELEMENTS.has(parentTagName.toLowerCase()) &&
      !isValidForParent &&
      !isHiddenInput &&
      !isFormInTable &&
      !needsImplicitStructure;

    if (needsImplicitStructure) {
      createImplicitTableStructure(state.stack, parentTagName, tagName);
      appendChild(getCurrentParent(state), element);
    } else if (needsFosterParenting) {
      insertWithFosterParenting(state, element);
    } else {
      appendChild(currentParent, element);
    }

    const wasFosterParented = needsFosterParenting;
    const isFormattingElement = FORMATTING_ELEMENTS.has(tagName);

    if (!token.isSelfClosing && !VOID_ELEMENTS.has(tagName)) {
      if (!isFormInTable && !(wasFosterParented && isFormattingElement)) {
        state.stack.push(element);
      }

      if (isFormattingElement) {
        pushToActiveFormattingElements(state, element);
      }
    }
  } else if (token.type === TokenType.TAG_CLOSE) {
    const tagName = token.value.toLowerCase();

    if (FORMATTING_ELEMENTS.has(tagName) && !isInForeignContent(state)) {
      runAdoptionAgencyAlgorithm(state, tagName);
      return;
    }

    if (tagName === "p") {
      closeParagraphElement(state);
      return;
    }

    const impliedEndTags = [
      "dd",
      "dt",
      "li",
      "option",
      "optgroup",
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

const runAdoptionAgencyAlgorithm = (
  state: ParserState,
  tagName: string,
): void => {
  const maxIterations = 8;

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const formattingElementIndex = state.activeFormattingElements.findIndex(
      (el) =>
        el && el.tagName && el.tagName.toLowerCase() === tagName.toLowerCase(),
    );

    if (formattingElementIndex === -1) {
      return;
    }

    const formattingElement =
      state.activeFormattingElements[formattingElementIndex];
    const stackIndex = state.stack.indexOf(formattingElement);

    if (stackIndex === -1) {
      state.activeFormattingElements.splice(formattingElementIndex, 1);
      return;
    }

    const currentElement = getCurrentElement(state);
    if (currentElement === formattingElement) {
      state.stack.pop();
      removeFromActiveFormattingElements(state, formattingElement);
      return;
    }

    const fbResult = findFurthestBlock(state.stack, stackIndex);

    if (!fbResult) {
      while (state.stack.length > stackIndex) {
        state.stack.pop();
      }
      removeFromActiveFormattingElements(state, formattingElement);
      return;
    }

    const { element: furthestBlock, index: furthestBlockIndex } = fbResult;
    const commonAncestor = getCommonAncestor(state.stack, stackIndex);

    if (!commonAncestor) {
      return;
    }

    let lastNode = furthestBlock;
    const clonedNodes: any[] = [];
    const nodesToRemoveFromStack: any[] = [];
    let innerLoopCounter = 0;
    let nodeIndex = furthestBlockIndex;

    while (true) {
      innerLoopCounter++;
      nodeIndex--;
      const node = state.stack[nodeIndex];

      if (node === formattingElement) {
        break;
      }

      if (
        innerLoopCounter > 3 &&
        state.activeFormattingElements.includes(node)
      ) {
        removeFromActiveFormattingElements(state, node);
      }

      if (!state.activeFormattingElements.includes(node)) {
        nodesToRemoveFromStack.push(node);
        continue;
      }

      const nodeClone = cloneFormattingElement(node);
      clonedNodes.unshift(nodeClone);

      replaceInActiveFormattingElements(state, node, nodeClone);

      const nodeChildIdx = node.childNodes.indexOf(lastNode);
      if (nodeChildIdx !== -1) {
        node.childNodes.splice(nodeChildIdx, 1);
      }

      appendChild(nodeClone, lastNode);
      lastNode = nodeClone;
    }

    for (const node of nodesToRemoveFromStack) {
      const idx = state.stack.indexOf(node);
      if (idx !== -1) {
        state.stack.splice(idx, 1);
      }
    }

    const fbIdx = formattingElement.childNodes.indexOf(furthestBlock);
    if (fbIdx !== -1) {
      formattingElement.childNodes.splice(fbIdx, 1);
      furthestBlock.parentNode = null;
    }

    appendChild(commonAncestor, lastNode);

    const newFormattingElement = cloneFormattingElement(formattingElement);
    reparentChildren(furthestBlock, newFormattingElement);
    appendChild(furthestBlock, newFormattingElement);

    removeFromActiveFormattingElements(state, formattingElement);
    state.activeFormattingElements.splice(
      formattingElementIndex,
      0,
      newFormattingElement,
    );

    const elementsAfterFurthestBlock = state.stack.slice(
      furthestBlockIndex + 1,
    );

    state.stack.length = stackIndex;
    for (const clonedNode of clonedNodes) {
      state.stack.push(clonedNode);
    }
    state.stack.push(furthestBlock);
    state.stack.push(newFormattingElement);
    for (const element of elementsAfterFurthestBlock) {
      state.stack.push(element);
    }
  }
};

const removeFromActiveFormattingElements = (
  state: ParserState,
  element: any,
): void => {
  const index = state.activeFormattingElements.indexOf(element);
  if (index !== -1) {
    state.activeFormattingElements.splice(index, 1);
  }
};

const replaceInActiveFormattingElements = (
  state: ParserState,
  oldElement: any,
  newElement: any,
): void => {
  const index = state.activeFormattingElements.indexOf(oldElement);
  if (index !== -1) {
    state.activeFormattingElements[index] = newElement;
  }
};

const pushToActiveFormattingElements = (
  state: ParserState,
  element: any,
): void => {
  const list = state.activeFormattingElements;
  const tagName = element.tagName?.toLowerCase();

  let count = 0;
  let oldestMatchIndex = -1;

  for (let i = list.length - 1; i >= 0; i--) {
    const entry = list[i];
    if (entry === null) {
      break;
    }

    if (
      entry.tagName?.toLowerCase() === tagName &&
      attributesMatch(entry, element)
    ) {
      if (oldestMatchIndex === -1) {
        oldestMatchIndex = i;
      }
      count++;
      if (count >= 3) {
        list.splice(oldestMatchIndex, 1);
        break;
      }
      oldestMatchIndex = i;
    }
  }

  list.push(element);
};

const attributesMatch = (el1: any, el2: any): boolean => {
  const attrs1 = el1.attributes || {};
  const attrs2 = el2.attributes || {};
  const keys1 = Object.keys(attrs1);
  const keys2 = Object.keys(attrs2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (attrs1[key] !== attrs2[key]) {
      return false;
    }
  }

  return true;
};

const parseText = (state: ParserState, token: Token): void => {
  const content = token.value;

  const preParent = getCurrentParent(state);
  if (content.trim() === "" && shouldSkipWhitespace(preParent)) {
    return;
  }

  const textNode = createTextNode(content);

  const inTableContext = isInTableContext(state);
  const currentParent = getCurrentParent(state);
  if (
    inTableContext &&
    currentParent.tagName &&
    TABLE_CONTEXT_ELEMENTS.has(currentParent.tagName.toLowerCase())
  ) {
    insertWithFosterParentingAndReconstruct(state, textNode);
  } else {
    reconstructActiveFormattingElements(state);
    appendChild(getCurrentParent(state), textNode);
  }
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

const closeParagraphElement = (state: ParserState): void => {
  let pIndex = -1;
  for (let i = state.stack.length - 1; i >= 0; i--) {
    const element = state.stack[i];
    const elementTag = element.tagName?.toLowerCase();

    if (elementTag === "p") {
      pIndex = i;
      break;
    }

    if (elementTag && BUTTON_SCOPE_TERMINATORS.has(elementTag)) {
      return;
    }
  }

  if (pIndex === -1) {
    return;
  }

  while (state.stack.length > pIndex) {
    state.stack.pop();
  }
};

const handleAutoClosing = (state: ParserState, tagName: string): boolean => {
  const autoCloseList = AUTO_CLOSE_RULES[tagName];
  if (!autoCloseList) return false;

  let targetIndex = -1;
  for (let i = state.stack.length - 1; i >= 0; i--) {
    const element = state.stack[i];
    const elementTag = element.tagName?.toLowerCase();

    if (elementTag && autoCloseList.includes(elementTag)) {
      targetIndex = i;
      break;
    }

    if (elementTag && BUTTON_SCOPE_TERMINATORS.has(elementTag)) {
      return false;
    }
  }

  if (targetIndex === -1) return false;

  while (state.stack.length > targetIndex) {
    state.stack.pop();
  }

  return true;
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

const reconstructActiveFormattingElements = (state: ParserState): void => {
  const list = state.activeFormattingElements;
  if (list.length === 0) {
    return;
  }

  let entryIndex = list.length - 1;
  let entry = list[entryIndex];

  if (entry === null || isInStack(state.stack, entry)) {
    return;
  }

  while (entryIndex > 0) {
    entryIndex--;
    entry = list[entryIndex];
    if (entry === null || isInStack(state.stack, entry)) {
      entryIndex++;
      break;
    }
  }

  for (; entryIndex < list.length; entryIndex++) {
    entry = list[entryIndex];
    if (entry === null) {
      continue;
    }

    const newElement = cloneFormattingElement(entry);
    appendChild(getCurrentParent(state), newElement);
    state.stack.push(newElement);
    list[entryIndex] = newElement;
  }
};

const isInStack = (stack: any[], element: any): boolean => {
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i] === element) {
      return true;
    }
  }
  return false;
};

const isInTableContext = (state: ParserState): boolean => {
  for (let i = state.stack.length - 1; i >= 0; i--) {
    const el = state.stack[i];
    if (el.tagName && TABLE_CONTEXT_ELEMENTS.has(el.tagName.toLowerCase())) {
      return true;
    }
    if (el.tagName && el.tagName.toLowerCase() === "html") {
      return false;
    }
  }
  return false;
};

const isInForeignContent = (state: ParserState): boolean => {
  for (let i = state.stack.length - 1; i >= 0; i--) {
    const el = state.stack[i];
    if (
      el.namespaceURI === SVG_NAMESPACE ||
      el.namespaceURI === MATHML_NAMESPACE
    ) {
      return true;
    }
    if (el.tagName && el.tagName.toLowerCase() === "html") {
      return false;
    }
  }
  return false;
};

const getCurrentNamespace = (state: ParserState): string | undefined => {
  for (let i = state.stack.length - 1; i >= 0; i--) {
    const el = state.stack[i];
    if (el.namespaceURI) {
      return el.namespaceURI;
    }
  }
  return undefined;
};

const findTableContextParent = (state: ParserState): any | null => {
  for (let i = state.stack.length - 1; i >= 0; i--) {
    const el = state.stack[i];
    if (el.tagName && TABLE_CONTEXT_ELEMENTS.has(el.tagName.toLowerCase())) {
      return el;
    }
  }
  return null;
};

const popStackUntilTableContext = (state: ParserState): void => {
  while (state.stack.length > 1) {
    const el = getCurrentElement(state);
    if (
      el &&
      el.tagName &&
      TABLE_CONTEXT_ELEMENTS.has(el.tagName.toLowerCase())
    ) {
      break;
    }
    state.stack.pop();
  }
  state.activeFormattingElements.push(null);
};

const isValidChildForTableParent = (
  parentTagName: string,
  childTagName: string,
): boolean => {
  const parent = parentTagName.toLowerCase();
  const child = childTagName.toLowerCase();

  if (parent === "table") {
    return VALID_TABLE_CHILDREN.has(child);
  }
  if (parent === "tbody" || parent === "thead" || parent === "tfoot") {
    return VALID_TABLE_SECTION_CHILDREN.has(child);
  }
  if (parent === "tr") {
    return VALID_TR_CHILDREN.has(child);
  }
  return true;
};

const findFosterParentTarget = (
  state: ParserState,
): { parent: any; before: any } | null => {
  for (let i = state.stack.length - 1; i >= 0; i--) {
    const el = state.stack[i];
    if (el.tagName && el.tagName.toLowerCase() === "table") {
      if (el.parentNode) {
        return { parent: el.parentNode, before: el };
      }
      return { parent: state.stack[i - 1] || state.root, before: null };
    }
  }
  return null;
};

const insertWithFosterParenting = (state: ParserState, node: any): void => {
  const currentParent = getCurrentParent(state);
  const inTableContext = isInTableContext(state);

  if (
    inTableContext &&
    currentParent.tagName &&
    TABLE_CONTEXT_ELEMENTS.has(currentParent.tagName.toLowerCase())
  ) {
    const target = findFosterParentTarget(state);
    if (target) {
      if (target.before) {
        const idx = target.parent.childNodes.indexOf(target.before);
        if (idx !== -1) {
          node.parentNode = target.parent;
          target.parent.childNodes.splice(idx, 0, node);
          if (node.nodeType === 3) {
            mergeAdjacentTextNodes(target.parent, idx);
          }
          return;
        }
      }
      appendChild(target.parent, node);
      if (node.nodeType === 3) {
        const insertedIdx = target.parent.childNodes.indexOf(node);
        if (insertedIdx !== -1) {
          mergeAdjacentTextNodes(target.parent, insertedIdx);
        }
      }
      return;
    }
  }

  appendChild(currentParent, node);
};

const insertWithFosterParentingAndReconstruct = (
  state: ParserState,
  node: any,
): void => {
  const target = findFosterParentTarget(state);
  if (!target) {
    appendChild(getCurrentParent(state), node);
    return;
  }

  const activeElements = getActiveFormattingElementsBeforeMarker(state);

  if (activeElements.length === 0) {
    if (target.before) {
      const idx = target.parent.childNodes.indexOf(target.before);
      if (idx !== -1) {
        node.parentNode = target.parent;
        target.parent.childNodes.splice(idx, 0, node);
        if (node.nodeType === 3) {
          mergeAdjacentTextNodes(target.parent, idx);
        }
        return;
      }
    }
    appendChild(target.parent, node);
    if (node.nodeType === 3) {
      const insertedIdx = target.parent.childNodes.indexOf(node);
      if (insertedIdx !== -1) {
        mergeAdjacentTextNodes(target.parent, insertedIdx);
      }
    }
    return;
  }

  const hasMarker = state.activeFormattingElements.includes(null);
  const lastFormatEl = activeElements[activeElements.length - 1];

  if (
    !hasMarker &&
    lastFormatEl.parentNode === target.parent &&
    target.parent.childNodes.indexOf(lastFormatEl) <
      target.parent.childNodes.indexOf(target.before)
  ) {
    appendChild(lastFormatEl, node);
    return;
  }

  let currentNode = node;
  for (let i = activeElements.length - 1; i >= 0; i--) {
    const formatEl = activeElements[i];
    const clone = cloneFormattingElement(formatEl);
    appendChild(clone, currentNode);
    currentNode = clone;
  }

  if (target.before) {
    const idx = target.parent.childNodes.indexOf(target.before);
    if (idx !== -1) {
      currentNode.parentNode = target.parent;
      target.parent.childNodes.splice(idx, 0, currentNode);
      return;
    }
  }
  appendChild(target.parent, currentNode);
};

const getActiveFormattingElementsBeforeMarker = (state: ParserState): any[] => {
  const result: any[] = [];
  for (let i = 0; i < state.activeFormattingElements.length; i++) {
    const el = state.activeFormattingElements[i];
    if (el === null) {
      continue;
    }
    if (!isInStack(state.stack, el)) {
      result.push(el);
    }
  }
  return result;
};
