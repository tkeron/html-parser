import { tokenize } from './src/tokenizer.js';
import { parse } from './src/parser.js';
import {
  astToDOM,
} from './src/dom-simulator.js';

export function parseHTML(html: string = ""): Document {
  const tokens = tokenize(html);
  const ast = parse(tokens);
  // If parse already returns a DOM document, return it directly
  if (ast && typeof ast.nodeType === 'number' && ast.nodeType === 9) {
    return ast;
  }
  return astToDOM(ast);
}


