import { createElement } from "./create-element.js";

export const createTempParent = (element: any): any => {
  const temp = createElement("div");
  temp.childNodes.push(element);
  temp.children.push(element);
  element._tempParent = temp;
  return temp;
};
