import { describe, it, expect } from "bun:test";
import {
  findFormattingElementInStack,
  findFurthestBlock,
  getCommonAncestor,
  isSpecialElement,
  cloneFormattingElement,
  reparentChildren,
} from "../src/parser/adoption-agency-helpers.js";
import { createElement, createDocument } from "../src/dom-simulator/index.js";

describe("findFormattingElementInStack", () => {
  it("returns null for empty stack", () => {
    const result = findFormattingElementInStack([], "b");
    expect(result).toBeNull();
  });

  it("returns null when formatting element not found", () => {
    const div = createElement("div", {});
    const span = createElement("span", {});
    const stack = [div, span];
    const result = findFormattingElementInStack(stack, "b");
    expect(result).toBeNull();
  });

  it("finds formatting element at top of stack", () => {
    const div = createElement("div", {});
    const b = createElement("b", {});
    const stack = [div, b];
    const result = findFormattingElementInStack(stack, "b");
    expect(result).toEqual({ element: b, index: 1 });
  });

  it("finds formatting element in middle of stack", () => {
    const div = createElement("div", {});
    const b = createElement("b", {});
    const span = createElement("span", {});
    const stack = [div, b, span];
    const result = findFormattingElementInStack(stack, "b");
    expect(result).toEqual({ element: b, index: 1 });
  });

  it("finds last matching element (most recent)", () => {
    const div = createElement("div", {});
    const b1 = createElement("b", {});
    const b2 = createElement("b", {});
    const stack = [div, b1, b2];
    const result = findFormattingElementInStack(stack, "b");
    expect(result).toEqual({ element: b2, index: 2 });
  });

  it("is case insensitive", () => {
    const div = createElement("div", {});
    const B = createElement("B", {});
    const stack = [div, B];
    const result = findFormattingElementInStack(stack, "b");
    expect(result).toEqual({ element: B, index: 1 });
  });
});

describe("findFurthestBlock", () => {
  it("returns null when no special elements after formatting element", () => {
    const doc = createDocument();
    const div = createElement("div", {});
    const b = createElement("b", {});
    const span = createElement("span", {});
    const stack = [doc, div, b, span];
    const result = findFurthestBlock(stack, 2);
    expect(result).toBeNull();
  });

  it("finds first special element after formatting element", () => {
    const doc = createDocument();
    const body = createElement("body", {});
    const b = createElement("b", {});
    const p = createElement("p", {});
    const stack = [doc, body, b, p];
    const result = findFurthestBlock(stack, 2);
    expect(result).toEqual({ element: p, index: 3 });
  });

  it("finds first special element, not the last", () => {
    const doc = createDocument();
    const body = createElement("body", {});
    const b = createElement("b", {});
    const p = createElement("p", {});
    const div = createElement("div", {});
    const stack = [doc, body, b, p, div];
    const result = findFurthestBlock(stack, 2);
    expect(result).toEqual({ element: p, index: 3 });
  });

  it("returns null when formatting element is at end of stack", () => {
    const doc = createDocument();
    const body = createElement("body", {});
    const b = createElement("b", {});
    const stack = [doc, body, b];
    const result = findFurthestBlock(stack, 2);
    expect(result).toBeNull();
  });

  it("skips non-special elements before finding special element", () => {
    const doc = createDocument();
    const body = createElement("body", {});
    const b = createElement("b", {});
    const em = createElement("em", {});
    const span = createElement("span", {});
    const div = createElement("div", {});
    const stack = [doc, body, b, em, span, div];
    const result = findFurthestBlock(stack, 2);
    expect(result).toEqual({ element: div, index: 5 });
  });
});

describe("getCommonAncestor", () => {
  it("returns element before formatting element index", () => {
    const doc = createDocument();
    const body = createElement("body", {});
    const b = createElement("b", {});
    const stack = [doc, body, b];
    const result = getCommonAncestor(stack, 2);
    expect(result).toBe(body);
  });

  it("returns doc when formatting element is first after doc", () => {
    const doc = createDocument();
    const b = createElement("b", {});
    const stack = [doc, b];
    const result = getCommonAncestor(stack, 1);
    expect(result).toBe(doc);
  });

  it("returns null for invalid index 0", () => {
    const doc = createDocument();
    const stack = [doc];
    const result = getCommonAncestor(stack, 0);
    expect(result).toBeNull();
  });

  it("returns null for negative index", () => {
    const doc = createDocument();
    const stack = [doc];
    const result = getCommonAncestor(stack, -1);
    expect(result).toBeNull();
  });
});

describe("isSpecialElement", () => {
  it("returns true for div", () => {
    expect(isSpecialElement("div")).toBe(true);
  });

  it("returns true for p", () => {
    expect(isSpecialElement("p")).toBe(true);
  });

  it("returns true for table", () => {
    expect(isSpecialElement("table")).toBe(true);
  });

  it("returns true for body", () => {
    expect(isSpecialElement("body")).toBe(true);
  });

  it("returns true for html", () => {
    expect(isSpecialElement("html")).toBe(true);
  });

  it("returns false for b", () => {
    expect(isSpecialElement("b")).toBe(false);
  });

  it("returns false for i", () => {
    expect(isSpecialElement("i")).toBe(false);
  });

  it("returns false for span", () => {
    expect(isSpecialElement("span")).toBe(false);
  });

  it("returns false for a", () => {
    expect(isSpecialElement("a")).toBe(false);
  });

  it("returns false for em", () => {
    expect(isSpecialElement("em")).toBe(false);
  });

  it("is case insensitive for DIV", () => {
    expect(isSpecialElement("DIV")).toBe(true);
  });

  it("is case insensitive for SPAN", () => {
    expect(isSpecialElement("SPAN")).toBe(false);
  });
});

describe("cloneFormattingElement", () => {
  it("clones element with same tagName", () => {
    const original = createElement("b", {});
    const clone = cloneFormattingElement(original);
    expect(clone.tagName.toLowerCase()).toBe("b");
  });

  it("clones element with attributes", () => {
    const original = createElement("b", { class: "bold", id: "test" });
    const clone = cloneFormattingElement(original);
    expect(clone.getAttribute("class")).toBe("bold");
    expect(clone.getAttribute("id")).toBe("test");
  });

  it("creates new element instance", () => {
    const original = createElement("b", {});
    const clone = cloneFormattingElement(original);
    expect(clone).not.toBe(original);
  });

  it("does not clone children", () => {
    const original = createElement("b", {});
    const child = createElement("span", {});
    original.childNodes.push(child);
    child.parentNode = original;
    const clone = cloneFormattingElement(original);
    expect(clone.childNodes.length).toBe(0);
  });

  it("has no parent", () => {
    const parent = createElement("div", {});
    const original = createElement("b", {});
    original.parentNode = parent;
    const clone = cloneFormattingElement(original);
    expect(clone.parentNode).toBeNull();
  });
});

describe("reparentChildren", () => {
  it("moves all children from source to target", () => {
    const source = createElement("b", {});
    const target = createElement("b", {});
    const child1 = createElement("span", {});
    const child2 = createElement("em", {});

    source.childNodes.push(child1, child2);
    child1.parentNode = source;
    child2.parentNode = source;

    reparentChildren(source, target);

    expect(source.childNodes.length).toBe(0);
    expect(target.childNodes.length).toBe(2);
    expect(target.childNodes[0]).toBe(child1);
    expect(target.childNodes[1]).toBe(child2);
    expect(child1.parentNode).toBe(target);
    expect(child2.parentNode).toBe(target);
  });

  it("handles empty source", () => {
    const source = createElement("b", {});
    const target = createElement("b", {});

    reparentChildren(source, target);

    expect(source.childNodes.length).toBe(0);
    expect(target.childNodes.length).toBe(0);
  });

  it("preserves order of children", () => {
    const source = createElement("b", {});
    const target = createElement("b", {});
    const child1 = createElement("span", {});
    const child2 = createElement("em", {});
    const child3 = createElement("strong", {});

    source.childNodes.push(child1, child2, child3);
    child1.parentNode = source;
    child2.parentNode = source;
    child3.parentNode = source;

    reparentChildren(source, target);

    expect(target.childNodes[0]).toBe(child1);
    expect(target.childNodes[1]).toBe(child2);
    expect(target.childNodes[2]).toBe(child3);
  });

  it("appends to existing children in target", () => {
    const source = createElement("b", {});
    const target = createElement("b", {});
    const existingChild = createElement("pre", {});
    const child1 = createElement("span", {});

    target.childNodes.push(existingChild);
    existingChild.parentNode = target;

    source.childNodes.push(child1);
    child1.parentNode = source;

    reparentChildren(source, target);

    expect(target.childNodes.length).toBe(2);
    expect(target.childNodes[0]).toBe(existingChild);
    expect(target.childNodes[1]).toBe(child1);
  });
});
