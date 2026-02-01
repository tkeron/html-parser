import { describe, it, expect } from "bun:test";
import { parseHTML } from "../index";

describe("querySelector with underscore IDs", () => {
  it("should find element with ID starting with single underscore", () => {
    const doc = parseHTML(
      "<html><body><div id='_test'>Content</div></body></html>",
    );
    const result = doc.querySelector("#_test");
    expect(result).not.toBeNull();
    expect(result?.tagName).toBe("DIV");
    expect(result?.id).toBe("_test");
  });

  it("should find element with ID starting with double underscore", () => {
    const doc = parseHTML(
      "<html><body><div id='__test'>Content</div></body></html>",
    );
    const result = doc.querySelector("#__test");
    expect(result).not.toBeNull();
    expect(result?.tagName).toBe("DIV");
    expect(result?.id).toBe("__test");
  });

  it("should find element with complex underscore ID", () => {
    const doc = parseHTML(
      "<html><body><div id='__tkeron_component_root__'>Content</div></body></html>",
    );
    const result = doc.querySelector("#__tkeron_component_root__");
    expect(result).not.toBeNull();
    expect(result?.tagName).toBe("DIV");
    expect(result?.id).toBe("__tkeron_component_root__");
  });

  it("should find underscore ID from child element context", () => {
    const doc = parseHTML(
      "<html><body><div id='__root'><p>Nested</p></div></body></html>",
    );
    const body = doc.querySelector("body");
    const result = body?.querySelector("#__root");
    expect(result).not.toBeNull();
    expect(result?.tagName).toBe("DIV");
  });

  it("should find nested element with underscore ID", () => {
    const doc = parseHTML(
      "<html><body><div><span id='_nested'>Text</span></div></body></html>",
    );
    const result = doc.querySelector("#_nested");
    expect(result).not.toBeNull();
    expect(result?.tagName).toBe("SPAN");
  });

  it("should return null for non-existent underscore ID", () => {
    const doc = parseHTML(
      "<html><body><div id='other'>Content</div></body></html>",
    );
    const result = doc.querySelector("#_nonexistent");
    expect(result).toBeNull();
  });

  it("should work with querySelectorAll for underscore IDs", () => {
    const doc = parseHTML(
      "<html><body><div id='_a'>A</div><div id='_b'>B</div></body></html>",
    );
    const resultA = doc.querySelectorAll("#_a");
    const resultB = doc.querySelectorAll("#_b");
    expect(resultA.length).toBe(1);
    expect(resultB.length).toBe(1);
  });

  it("should find ID starting with hyphen", () => {
    const doc = parseHTML(
      "<html><body><div id='-test'>Content</div></body></html>",
    );
    const result = doc.querySelector("#-test");
    expect(result).not.toBeNull();
    expect(result?.tagName).toBe("DIV");
    expect(result?.id).toBe("-test");
  });

  it("should find ID with mixed underscore and hyphen at start", () => {
    const doc = parseHTML(
      "<html><body><div id='_-mixed'>Content</div></body></html>",
    );
    const result = doc.querySelector("#_-mixed");
    expect(result).not.toBeNull();
    expect(result?.id).toBe("_-mixed");
  });
});
