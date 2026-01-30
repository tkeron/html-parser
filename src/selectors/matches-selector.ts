import type { SelectorToken } from "./types.js";
import { matchesToken } from "./matches-token.js";

export const matchesSelector = (
  element: any,
  tokens: SelectorToken[],
): boolean => {
  if (tokens.length === 0) {
    return true;
  }
  return tokens.every((token) => matchesToken(element, token));
};
