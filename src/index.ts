import { tokenize } from "./tokenizer/index.js";
import { parse } from "./parser/index.js";

export const parseHTML = (html: string): any => {
  const tokens = tokenize(html);
  return parse(tokens);
};

export { parse } from "./parser/index.js";
