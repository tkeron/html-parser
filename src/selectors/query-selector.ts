import { querySelectorAll } from "./query-selector-all.js";

export const querySelector = (root: any, selector: string): any | null => {
  const results = querySelectorAll(root, selector);
  return results[0] || null;
};
