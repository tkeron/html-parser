import { createElement } from "../dom-simulator/index.js";

const SPECIAL_ELEMENTS = new Set([
  "address",
  "applet",
  "area",
  "article",
  "aside",
  "base",
  "basefont",
  "bgsound",
  "blockquote",
  "body",
  "br",
  "button",
  "caption",
  "center",
  "col",
  "colgroup",
  "dd",
  "details",
  "dir",
  "div",
  "dl",
  "dt",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "iframe",
  "img",
  "input",
  "li",
  "link",
  "listing",
  "main",
  "marquee",
  "menu",
  "meta",
  "nav",
  "noembed",
  "noframes",
  "noscript",
  "object",
  "ol",
  "p",
  "param",
  "plaintext",
  "pre",
  "script",
  "section",
  "select",
  "source",
  "style",
  "summary",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "title",
  "tr",
  "track",
  "ul",
  "wbr",
  "xmp",
]);

type StackSearchResult = {
  element: any;
  index: number;
};

export const findFormattingElementInStack = (
  stack: any[],
  tagName: string,
): StackSearchResult | null => {
  const lowerTagName = tagName.toLowerCase();
  for (let i = stack.length - 1; i >= 0; i--) {
    const element = stack[i];
    if (element.tagName && element.tagName.toLowerCase() === lowerTagName) {
      return { element, index: i };
    }
  }
  return null;
};

export const findFurthestBlock = (
  stack: any[],
  formattingElementIndex: number,
): StackSearchResult | null => {
  for (let i = formattingElementIndex + 1; i < stack.length; i++) {
    const element = stack[i];
    if (isSpecialElement(element.tagName)) {
      return { element, index: i };
    }
  }
  return null;
};

export const getCommonAncestor = (
  stack: any[],
  formattingElementIndex: number,
): any | null => {
  if (formattingElementIndex <= 0) {
    return null;
  }
  return stack[formattingElementIndex - 1];
};

export const isSpecialElement = (tagName: string): boolean => {
  if (!tagName) return false;
  return SPECIAL_ELEMENTS.has(tagName.toLowerCase());
};

export const cloneFormattingElement = (element: any): any => {
  const attributes = element.attributes ? { ...element.attributes } : {};
  return createElement(element.tagName.toLowerCase(), attributes);
};

export const reparentChildren = (source: any, target: any): void => {
  while (source.childNodes.length > 0) {
    const child = source.childNodes.shift();
    child.parentNode = target;
    target.childNodes.push(child);
  }
};
