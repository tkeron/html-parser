import { SelectorToken } from "./types.ts";
import { matchesToken } from "./matches-token.ts";

export const matchesSelector = (
  element: any,
  tokens: SelectorToken[],
): boolean => {
  if (tokens.length === 0) {
    return true;
  }
  return tokens.every((token) => matchesToken(element, token));
};
