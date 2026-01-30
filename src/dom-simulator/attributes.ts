import { updateElementContent } from "./update-element-content.js";

export const getAttribute = (element: any, name: string): string | null => {
  return element.attributes[name] || null;
};

export const hasAttribute = (element: any, name: string): boolean => {
  return name in element.attributes;
};

export const setAttribute = (
  element: any,
  name: string,
  value: string,
): void => {
  element.attributes[name] = value;
  updateElementContent(element);
};

export const removeAttribute = (element: any, name: string): void => {
  delete element.attributes[name];
  updateElementContent(element);
};
