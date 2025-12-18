import { tokenize } from './src/tokenizer.js';
import { parse } from './src/parser.js';
import {
  astToDOM,
} from './src/dom-simulator.js';

export function parseHTML(html: string = ""): Document {
  const tokens = tokenize(html);
  const ast = parse(tokens);
  return astToDOM(ast);
}


