import { tokenize } from "./tokenizer.js";
import { parse } from "./parser.js";

export function parseHTML(html: string): any {
  const tokens = tokenize(html);
  return parse(tokens);
}

export { parse } from "./parser";
