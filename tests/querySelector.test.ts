import { describe, it, expect } from "bun:test";
import { parseHTML } from "../index";

describe("DOM Query - querySelector", () => {
  describe("Tag name selectors", () => {
    it("should find element by tag name", () => {
      const doc = parseHTML("<div><p>Test</p></div>");
      const result = doc.querySelector("p");
      expect(result).not.toBeNull();
      expect(result?.tagName).toBe("P");
    });

    it("should find first element when multiple exist", () => {
      const doc = parseHTML("<div><p>First</p><p>Second</p></div>");
      const result = doc.querySelector("p");
      expect(result?.textContent).toBe("First");
    });

    it("should be case insensitive for tag names", () => {
      const doc = parseHTML("<DIV><P>Test</P></DIV>");
      const result = doc.querySelector("p");
      expect(result).not.toBeNull();
    });

    it("should find nested elements", () => {
      const doc = parseHTML("<div><span><em>Deep</em></span></div>");
      const result = doc.querySelector("em");
      expect(result).not.toBeNull();
      expect(result?.textContent).toBe("Deep");
    });
  });

  describe("ID selectors", () => {
    it("should find element by ID", () => {
      const doc = parseHTML("<div id='test'>Content</div>");
      const result = doc.querySelector("#test");
      expect(result).not.toBeNull();
      expect(result?.id).toBe("test");
    });

    it("should return first when multiple elements have same ID", () => {
      const doc = parseHTML(
        "<div id='dup'>First</div><div id='dup'>Second</div>",
      );
      const result = doc.querySelector("#dup");
      expect(result?.textContent).toBe("First");
    });

    it("should handle IDs with hyphens", () => {
      const doc = parseHTML("<div id='my-test-id'>Content</div>");
      const result = doc.querySelector("#my-test-id");
      expect(result).not.toBeNull();
    });

    it("should handle IDs with underscores", () => {
      const doc = parseHTML("<div id='my_test_id'>Content</div>");
      const result = doc.querySelector("#my_test_id");
      expect(result).not.toBeNull();
    });

    it("should handle IDs starting with letter", () => {
      const doc = parseHTML("<div id='a123'>Content</div>");
      const result = doc.querySelector("#a123");
      expect(result).not.toBeNull();
    });
  });

  describe("Class selectors", () => {
    it("should find element by class", () => {
      const doc = parseHTML("<div class='test'>Content</div>");
      const result = doc.querySelector(".test");
      expect(result).not.toBeNull();
      expect(result?.className).toBe("test");
    });

    it("should find element with multiple classes", () => {
      const doc = parseHTML("<div class='a b c'>Content</div>");
      const result = doc.querySelector(".b");
      expect(result).not.toBeNull();
    });

    it("should handle multiple class selector", () => {
      const doc = parseHTML("<div class='a b'>Content</div>");
      const result = doc.querySelector(".a.b");
      expect(result).not.toBeNull();
    });

    it("should not match partial class name", () => {
      const doc = parseHTML("<div class='testing'>Content</div>");
      const result = doc.querySelector(".test");
      expect(result).toBeNull();
    });

    it("should handle classes with hyphens", () => {
      const doc = parseHTML("<div class='my-class'>Content</div>");
      const result = doc.querySelector(".my-class");
      expect(result).not.toBeNull();
    });

    it("should handle classes with underscores", () => {
      const doc = parseHTML("<div class='my_class'>Content</div>");
      const result = doc.querySelector(".my_class");
      expect(result).not.toBeNull();
    });
  });

  describe("Attribute selectors", () => {
    it("should find element by attribute presence", () => {
      const doc = parseHTML("<div data-test='value'>Content</div>");
      const result = doc.querySelector("[data-test]");
      expect(result).not.toBeNull();
      expect(result?.getAttribute("data-test")).toBe("value");
    });

    it("should find element by attribute value", () => {
      const doc = parseHTML("<div data-test='value'>Content</div>");
      const result = doc.querySelector("[data-test='value']");
      expect(result).not.toBeNull();
    });

    it("should handle attribute selectors with special characters in value", () => {
      const doc = parseHTML("<div data-value='hello-world'>Content</div>");
      const result = doc.querySelector("[data-value='hello-world']");
      expect(result).not.toBeNull();
    });

    it("should handle double quotes in selector", () => {
      const doc = parseHTML('<div data-test="value">Content</div>');
      const result = doc.querySelector('[data-test="value"]');
      expect(result).not.toBeNull();
    });

    it("should handle boolean attributes", () => {
      const doc = parseHTML("<input disabled>");
      const result = doc.querySelector("[disabled]");
      expect(result).not.toBeNull();
    });

    it("should handle empty attribute value", () => {
      const doc = parseHTML('<div data-empty="">Content</div>');
      const result = doc.querySelector("[data-empty]");
      expect(result).not.toBeNull();
    });

    it("should handle attribute with numeric value", () => {
      const doc = parseHTML("<div data-count='123'>Content</div>");
      const result = doc.querySelector("[data-count='123']");
      expect(result).not.toBeNull();
    });
  });

  describe("Descendant selectors", () => {
    it("should handle simple descendant selector", () => {
      const doc = parseHTML(
        "<div class='container'><p class='text'>Hello</p></div>",
      );
      const result = doc.querySelector("div.container p.text");
      expect(result).not.toBeNull();
      expect(result?.tagName).toBe("P");
    });

    it("should handle deep descendant", () => {
      const doc = parseHTML(
        "<div><span><em><strong>Deep</strong></em></span></div>",
      );
      const result = doc.querySelector("div strong");
      expect(result).not.toBeNull();
    });

    it("should handle multiple descendant levels", () => {
      const doc = parseHTML("<div><ul><li><a>Link</a></li></ul></div>");
      const result = doc.querySelector("div ul li a");
      expect(result).not.toBeNull();
    });
  });

  describe("Null returns", () => {
    it("should return null when no match", () => {
      const doc = parseHTML("<div>Content</div>");
      const result = doc.querySelector("p");
      expect(result).toBeNull();
    });

    it("should return null for non-existent ID", () => {
      const doc = parseHTML("<div id='other'>Content</div>");
      const result = doc.querySelector("#nonexistent");
      expect(result).toBeNull();
    });

    it("should return null for non-existent class", () => {
      const doc = parseHTML("<div class='other'>Content</div>");
      const result = doc.querySelector(".nonexistent");
      expect(result).toBeNull();
    });

    it("should return null for invalid selector", () => {
      const doc = parseHTML("<div>Content</div>");
      const result = doc.querySelector("invalid[selector");
      expect(result).toBeNull();
    });
  });

  describe("Element context", () => {
    it("should search within element context", () => {
      const doc = parseHTML(
        "<div id='a'><span>A</span></div><div id='b'><span>B</span></div>",
      );
      const divB = doc.querySelector("#b");
      const result = divB!.querySelector("span");
      expect(result?.textContent).toBe("B");
    });

    it("should not find elements outside context", () => {
      const doc = parseHTML(
        "<div id='a'><span>A</span></div><div id='b'></div>",
      );
      const divB = doc.querySelector("#b");
      const result = divB!.querySelector("span");
      expect(result).toBeNull();
    });
  });
});

describe("DOM Query - querySelectorAll", () => {
  describe("Basic querySelectorAll functionality", () => {
    it("should find all elements by tag name", () => {
      const doc = parseHTML("<div><p>First</p><p>Second</p></div>");
      const results = doc.querySelectorAll("p");
      expect(results.length).toBe(2);
      expect(results[0]!.textContent).toBe("First");
      expect(results[1]!.textContent).toBe("Second");
    });

    it("should find all elements by class", () => {
      const doc = parseHTML(
        "<div><span class='test'>1</span><span class='test'>2</span></div>",
      );
      const results = doc.querySelectorAll(".test");
      expect(results.length).toBe(2);
    });

    it("should return empty array when no matches", () => {
      const doc = parseHTML("<div>Content</div>");
      const results = doc.querySelectorAll("p");
      expect(results.length).toBe(0);
    });

    it("should handle complex selectors", () => {
      const doc = parseHTML(
        "<div class='container'><p class='text'>1</p><span class='text'>2</span></div>",
      );
      const results = doc.querySelectorAll(".container .text");
      expect(results.length).toBe(2);
    });

    it("should handle attribute selectors", () => {
      const doc = parseHTML(
        "<div data-type='a'>1</div><div data-type='b'>2</div>",
      );
      const results = doc.querySelectorAll("[data-type]");
      expect(results.length).toBe(2);
    });

    it("should handle attribute value selectors", () => {
      const doc = parseHTML(
        "<div data-type='a'>1</div><div data-type='b'>2</div>",
      );
      const results = doc.querySelectorAll("[data-type='a']");
      expect(results.length).toBe(1);
      expect(results[0]!.textContent).toBe("1");
    });

    it("should handle multiple classes selector", () => {
      const doc = parseHTML("<div class='a b'>1</div><div class='a'>2</div>");
      const results = doc.querySelectorAll(".a.b");
      expect(results.length).toBe(1);
    });

    it("should return empty for invalid selector", () => {
      const doc = parseHTML("<div>Content</div>");
      const results = doc.querySelectorAll("invalid[selector");
      expect(results.length).toBe(0);
    });
  });

  describe("querySelectorAll order", () => {
    it("should return elements in document order", () => {
      const doc = parseHTML("<div><p>1</p><div><p>2</p></div><p>3</p></div>");
      const results = doc.querySelectorAll("p");
      expect(results.length).toBe(3);
      expect(results[0]!.textContent).toBe("1");
      expect(results[1]!.textContent).toBe("2");
      expect(results[2]!.textContent).toBe("3");
    });

    it("should include deeply nested elements", () => {
      const doc = parseHTML(
        "<div><div><div><span>Deep</span></div></div></div>",
      );
      const results = doc.querySelectorAll("span");
      expect(results.length).toBe(1);
    });
  });

  describe("querySelectorAll with many elements", () => {
    it("should handle many matches", () => {
      let html = "<div>";
      for (let i = 0; i < 100; i++) {
        html += `<span class="item">${i}</span>`;
      }
      html += "</div>";

      const doc = parseHTML(html);
      const results = doc.querySelectorAll(".item");
      expect(results.length).toBe(100);
    });
  });
});

describe("DOM Query - matches", () => {
  describe("Basic matches functionality", () => {
    it("should return true for matching selector", () => {
      const doc = parseHTML("<div class='test'>Content</div>");
      const div = doc.querySelector("div");

      const result = div!.matches(".test");
      expect(result).toBe(true);
    });

    it("should return false for non-matching selector", () => {
      const doc = parseHTML("<div class='test'>Content</div>");
      const div = doc.querySelector("div");

      const result = div!.matches(".other");
      expect(result).toBe(false);
    });

    it("should match tag name", () => {
      const doc = parseHTML("<div>Content</div>");
      const div = doc.querySelector("div");

      const result = div!.matches("div");
      expect(result).toBe(true);
    });

    it("should match ID", () => {
      const doc = parseHTML("<div id='test'>Content</div>");
      const div = doc.querySelector("div");

      const result = div!.matches("#test");
      expect(result).toBe(true);
    });

    it("should match attribute", () => {
      const doc = parseHTML("<div data-type='value'>Content</div>");
      const div = doc.querySelector("div");

      const result = div!.matches("[data-type]");
      expect(result).toBe(true);
    });

    it("should match attribute value", () => {
      const doc = parseHTML("<div data-type='value'>Content</div>");
      const div = doc.querySelector("div");

      const result = div!.matches("[data-type='value']");
      expect(result).toBe(true);
    });

    it("should match multiple classes", () => {
      const doc = parseHTML("<div class='a b'>Content</div>");
      const div = doc.querySelector("div");

      const result = div!.matches(".a.b");
      expect(result).toBe(true);
    });

    it("should handle complex selectors", () => {
      const doc = parseHTML(
        "<div class='container'><p class='text'>Hello</p></div>",
      );
      const p = doc.querySelector("p");

      const result = p!.matches("p.text");
      expect(result).toBe(true);
    });

    it("should return false for invalid selector", () => {
      const doc = parseHTML("<div>Content</div>");
      const div = doc.querySelector("div");

      const result = div!.matches("invalid[selector");
      expect(result).toBe(false);
    });
  });

  describe("matches with combined selectors", () => {
    it("should match tag and class", () => {
      const doc = parseHTML("<div class='test'>Content</div>");
      const div = doc.querySelector("div");

      expect(div!.matches("div.test")).toBe(true);
      expect(div!.matches("span.test")).toBe(false);
    });

    it("should match tag and ID", () => {
      const doc = parseHTML("<div id='test'>Content</div>");
      const div = doc.querySelector("div");

      expect(div!.matches("div#test")).toBe(true);
      expect(div!.matches("span#test")).toBe(false);
    });

    it("should match tag and attribute", () => {
      const doc = parseHTML("<div data-test='value'>Content</div>");
      const div = doc.querySelector("div");

      expect(div!.matches("div[data-test]")).toBe(true);
      expect(div!.matches("span[data-test]")).toBe(false);
    });
  });

  describe("matches with descendant context", () => {
    it("should match descendant selector", () => {
      const doc = parseHTML(
        "<div class='parent'><span class='child'>Content</span></div>",
      );
      const span = doc.querySelector("span");

      expect(span!.matches(".parent .child")).toBe(true);
    });

    it("should not match when not descendant", () => {
      const doc = parseHTML(
        "<div class='other'><span class='child'>Content</span></div>",
      );
      const span = doc.querySelector("span");

      expect(span!.matches(".parent .child")).toBe(false);
    });
  });

  describe("matches edge cases", () => {
    it("should handle empty string selector", () => {
      const doc = parseHTML("<div>Content</div>");
      const div = doc.querySelector("div");

      expect(div!.matches("")).toBe(false);
    });

    it("should match on deeply nested element", () => {
      const doc = parseHTML(
        "<div><span><em><strong class='deep'>Text</strong></em></span></div>",
      );
      const strong = doc.querySelector("strong");

      expect(strong!.matches(".deep")).toBe(true);
      expect(strong!.matches("div .deep")).toBe(true);
    });
  });
});
