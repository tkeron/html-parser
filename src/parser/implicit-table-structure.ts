import { createElement, appendChild } from "../dom-simulator/index.js";

export const CELL_ELEMENTS = new Set(["td", "th"]);

export const TABLE_SECTION_ELEMENTS = new Set(["tbody", "thead", "tfoot"]);

export const shouldCreateImplicitTableStructure = (
  parentTagName: string,
  childTagName: string,
): boolean => {
  const parent = parentTagName.toLowerCase();
  const child = childTagName.toLowerCase();

  if (CELL_ELEMENTS.has(child)) {
    return parent === "table" || TABLE_SECTION_ELEMENTS.has(parent);
  }

  if (child === "tr") {
    return parent === "table";
  }

  return false;
};

export const createImplicitTableStructure = (
  stack: any[],
  parentTagName: string,
  childTagName: string,
): any => {
  const parent = parentTagName.toLowerCase();
  const child = childTagName.toLowerCase();
  const currentParent = stack[stack.length - 1];

  if (CELL_ELEMENTS.has(child)) {
    if (parent === "table") {
      const tbody = createElement("tbody", {});
      appendChild(currentParent, tbody);
      stack.push(tbody);

      const tr = createElement("tr", {});
      appendChild(tbody, tr);
      stack.push(tr);

      return tr;
    }

    if (TABLE_SECTION_ELEMENTS.has(parent)) {
      const tr = createElement("tr", {});
      appendChild(currentParent, tr);
      stack.push(tr);

      return tr;
    }
  }

  if (child === "tr" && parent === "table") {
    const tbody = createElement("tbody", {});
    appendChild(currentParent, tbody);
    stack.push(tbody);

    return tbody;
  }

  return currentParent;
};
