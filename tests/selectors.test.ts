import { describe, it, expect } from "bun:test";
import { querySelector, querySelectorAll } from "../src/css-selector";
import { parseHTML } from "../index";
import type { Element, Document } from "../src/dom-simulator";

describe("CSS Selectors", () => {
  const htmlContent = `
        <html>
            <body>
                <p id="intro" class="first">
                    <span class="highlight">Hello</span>
                </p>
                <p class="second">World</p>
                <div>
                    <p class="note">Note</p>
                </div>
            </body>
        </html>
    `;

  const doc: Document = parseHTML(htmlContent);

  describe("querySelectorAll", () => {
    it("should be a function", () => {
      expect(typeof querySelectorAll).toBe("function");
    });

    it("should find all elements by tag name", () => {
      const paragraphs = querySelectorAll(doc, "p");
      expect(paragraphs.length).toBe(3);
      expect(paragraphs[0]!.attributes.class).toBe("first");
      expect(paragraphs[1]!.attributes.class).toBe("second");
      expect(paragraphs[2]!.attributes.class).toBe("note");
    });

    it("should find all elements by class name", () => {
      const second = querySelectorAll(doc, ".second");
      expect(second.length).toBe(1);
      expect(second[0]!.tagName).toBe("P");
    });
  });

  describe("querySelector", () => {
    it("should be a function", () => {
      expect(typeof querySelector).toBe("function");
    });

    it("should find the first element by tag name", () => {
      const firstParagraph = querySelector(doc, "p");
      expect(firstParagraph).not.toBeNull();
      expect(firstParagraph?.attributes.id).toBe("intro");
    });

    it("should find an element by ID", () => {
      const intro = querySelector(doc, "#intro");
      expect(intro).not.toBeNull();
      expect(intro?.tagName).toBe("P");
    });

    it("should return null if no element is found", () => {
      const nonExistent = querySelector(doc, "#nonexistent");
      expect(nonExistent).toBeNull();
    });
  });

  describe("Element.matches", () => {
    it("should match by tag name", () => {
      const p = querySelector(doc, "p");
      expect(p?.matches("p")).toBe(true);
      expect(p?.matches("div")).toBe(false);
    });

    it("should match by id", () => {
      const intro = querySelector(doc, "#intro");
      expect(intro?.matches("#intro")).toBe(true);
      expect(intro?.matches("#other")).toBe(false);
    });

    it("should match by class", () => {
      const first = querySelector(doc, ".first");
      expect(first?.matches(".first")).toBe(true);
      expect(first?.matches(".second")).toBe(false);
    });

    it("should match by multiple classes", () => {
      const doc2 = parseHTML('<div class="foo bar baz">Test</div>');
      const div = doc2.querySelector("div");
      expect(div?.matches(".foo")).toBe(true);
      expect(div?.matches(".bar")).toBe(true);
      expect(div?.matches(".foo.bar")).toBe(true);
      expect(div?.matches(".foo.baz")).toBe(true);
      expect(div?.matches(".foo.bar.baz")).toBe(true);
      expect(div?.matches(".foo.missing")).toBe(false);
    });

    it("should match by attribute", () => {
      const intro = querySelector(doc, "#intro");
      expect(intro?.matches("[id]")).toBe(true);
      expect(intro?.matches('[id="intro"]')).toBe(true);
      expect(intro?.matches("[class]")).toBe(true);
      expect(intro?.matches("[title]")).toBe(false);
    });

    it("should match complex selectors", () => {
      const intro = querySelector(doc, "#intro");
      expect(intro?.matches("p#intro")).toBe(true);
      expect(intro?.matches("p.first")).toBe(true);
      expect(intro?.matches("div#intro")).toBe(false);
    });

    it("should match descendant selectors", () => {
      const span = querySelector(doc, "span");
      expect(span?.matches("p span")).toBe(true);
      expect(span?.matches("body span")).toBe(true);
      expect(span?.matches("div span")).toBe(false);
    });

    it("should return false for invalid selector", () => {
      const p = querySelector(doc, "p");
      expect(p?.matches("")).toBe(false);
    });

    it("should work with universal selector", () => {
      const p = querySelector(doc, "p");
      expect(p?.matches("*")).toBe(true);
    });
  });
});
