import { querySelectorAll } from "./query-selector-all.ts";

export const querySelector = (root: any, selector: string): any | null => {
  const results = querySelectorAll(root, selector);
  return results[0] || null;
};
