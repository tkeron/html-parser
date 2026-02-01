import { tokenize } from "./src/tokenizer/index.js";
import { parse, parseFragment } from "./src/parser/index.js";
import { astToDOM } from "./src/dom-simulator.js";

export function parseHTML(html: string = ""): Document {
  const tokens = tokenize(html);
  const ast = parse(tokens);
  if (ast && typeof ast.nodeType === "number" && ast.nodeType === 9) {
    return ast;
  }
  return astToDOM(ast);
}

export function parseHTMLFragment(html: string, contextTagName: string): any[] {
  const tokens = tokenize(html);
  return parseFragment(tokens, contextTagName);
}
