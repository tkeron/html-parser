import { tokenize } from './src/tokenizer.js';
import { parse } from './src/parser.js';
import {
  astToDOM,
} from './src/dom-simulator.js';

/**
 * Parse HTML string into DOM Document object
 * @param html The HTML string to parse
 * @returns A DOM Document object
 */
export function parseHTML(html: string): Document {
  const tokens = tokenize(html);
  const ast = parse(tokens);
  return <Document><unknown>astToDOM(ast);
}


