import { describe, it, expect } from "bun:test";
import { parseHTML } from "../index";

describe("DOM Attributes - getAttribute, setAttribute, removeAttribute, hasAttribute", () => {
  describe("Basic attribute operations", () => {
    it("should set and get attribute", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.setAttribute("data-test", "value");
      expect(div!.getAttribute("data-test")).toBe("value");
    });

    it("should return null for non-existent attribute", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      expect(div!.getAttribute("nonexistent")).toBeNull();
    });

    it("should check attribute existence with hasAttribute", () => {
      const doc = parseHTML("<div data-test='value'></div>");
      const div = doc.querySelector("div");

      expect(div!.hasAttribute("data-test")).toBe(true);
      expect(div!.hasAttribute("nonexistent")).toBe(false);
    });

    it("should remove attribute", () => {
      const doc = parseHTML("<div data-test='value'></div>");
      const div = doc.querySelector("div");

      div!.removeAttribute("data-test");
      expect(div!.hasAttribute("data-test")).toBe(false);
      expect(div!.getAttribute("data-test")).toBeNull();
    });

    it("should handle case insensitive attribute names", () => {
      const doc = parseHTML("<div DATA-TEST='value'></div>");
      const div = doc.querySelector("div");

      expect(div!.getAttribute("data-test")).toBe("value");
      expect(div!.hasAttribute("data-test")).toBe(true);
    });

    it("should overwrite existing attribute", () => {
      const doc = parseHTML("<div data-test='old'></div>");
      const div = doc.querySelector("div");

      div!.setAttribute("data-test", "new");
      expect(div!.getAttribute("data-test")).toBe("new");
    });

    it("should set multiple attributes", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.setAttribute("id", "myId");
      div!.setAttribute("class", "myClass");
      div!.setAttribute("data-value", "123");

      expect(div!.getAttribute("id")).toBe("myId");
      expect(div!.getAttribute("class")).toBe("myClass");
      expect(div!.getAttribute("data-value")).toBe("123");
    });
  });

  describe("Attribute values", () => {
    it("should handle empty string value", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.setAttribute("data-empty", "");
      expect(div!.hasAttribute("data-empty")).toBe(true);
    });

    it("should handle whitespace-only value", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.setAttribute("data-ws", "   ");
      expect(div!.getAttribute("data-ws")).toBe("   ");
    });

    it("should handle numeric values as strings", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.setAttribute("data-num", "42");
      expect(div!.getAttribute("data-num")).toBe("42");
    });

    it("should handle boolean-like values", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.setAttribute("data-bool", "true");
      expect(div!.getAttribute("data-bool")).toBe("true");

      div!.setAttribute("data-bool", "false");
      expect(div!.getAttribute("data-bool")).toBe("false");
    });

    it("should handle JSON-like values", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");
      const json = '{"key":"value","num":123}';

      div!.setAttribute("data-json", json);
      expect(div!.getAttribute("data-json")).toBe(json);
    });
  });

  describe("Special characters", () => {
    it("should handle special characters in values", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.setAttribute("data-special", 'value with "quotes" & <tags>');
      expect(div!.getAttribute("data-special")).toBe(
        'value with "quotes" & <tags>',
      );
    });

    it("should handle special characters in names", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.setAttribute("data_special-name", "value");
      expect(div!.getAttribute("data_special-name")).toBe("value");
    });

    it("should handle attribute names with colons (namespaces)", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.setAttribute("xmlns:test", "value");
      expect(div!.getAttribute("xmlns:test")).toBe("value");
    });

    it("should handle newlines in values", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.setAttribute("data-multiline", "line1\nline2\nline3");
      expect(div!.getAttribute("data-multiline")).toBe("line1\nline2\nline3");
    });

    it("should handle tabs in values", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.setAttribute("data-tabs", "col1\tcol2\tcol3");
      expect(div!.getAttribute("data-tabs")).toBe("col1\tcol2\tcol3");
    });

    it("should handle unicode characters", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.setAttribute("data-unicode", "日本語 🎉 émoji");
      expect(div!.getAttribute("data-unicode")).toBe("日本語 🎉 émoji");
    });

    it("should handle HTML entities in values", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.setAttribute("data-entities", "&lt;div&gt;");
      expect(div!.getAttribute("data-entities")).toBe("&lt;div&gt;");
    });

    it("should handle single quotes in values", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.setAttribute("data-quotes", "it's a test");
      expect(div!.getAttribute("data-quotes")).toBe("it's a test");
    });
  });

  describe("Long values", () => {
    it("should handle long attribute values", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");
      const longValue = "a".repeat(10000);

      div!.setAttribute("data-long", longValue);
      expect(div!.getAttribute("data-long")).toBe(longValue);
    });

    it("should handle very long attribute names", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");
      const longName = "data-" + "x".repeat(1000);

      div!.setAttribute(longName, "value");
      expect(div!.getAttribute(longName)).toBe("value");
    });
  });

  describe("removeAttribute edge cases", () => {
    it("should handle removing non-existent attribute gracefully", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      expect(() => div!.removeAttribute("nonexistent")).not.toThrow();
      expect(div!.hasAttribute("nonexistent")).toBe(false);
    });

    it("should handle removing same attribute twice", () => {
      const doc = parseHTML("<div data-test='value'></div>");
      const div = doc.querySelector("div");

      div!.removeAttribute("data-test");
      div!.removeAttribute("data-test");

      expect(div!.hasAttribute("data-test")).toBe(false);
    });

    it("should allow re-setting after remove", () => {
      const doc = parseHTML("<div data-test='old'></div>");
      const div = doc.querySelector("div");

      div!.removeAttribute("data-test");
      div!.setAttribute("data-test", "new");

      expect(div!.getAttribute("data-test")).toBe("new");
    });
  });

  describe("Standard HTML attributes", () => {
    it("should handle id attribute", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.setAttribute("id", "myId");
      expect(div!.getAttribute("id")).toBe("myId");
      expect(div!.id).toBe("myId");
    });

    it("should handle class attribute", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.setAttribute("class", "class1 class2");
      expect(div!.getAttribute("class")).toBe("class1 class2");
      expect(div!.className).toBe("class1 class2");
    });

    it("should handle style attribute", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.setAttribute("style", "color: red; font-size: 12px;");
      expect(div!.getAttribute("style")).toBe("color: red; font-size: 12px;");
    });

    it("should handle href attribute", () => {
      const doc = parseHTML("<a></a>");
      const a = doc.querySelector("a");

      a!.setAttribute("href", "https://example.com/path?query=1&other=2");
      expect(a!.getAttribute("href")).toBe(
        "https://example.com/path?query=1&other=2",
      );
    });

    it("should handle src attribute", () => {
      const doc = parseHTML("<img>");
      const img = doc.querySelector("img");

      img!.setAttribute("src", "/images/photo.jpg");
      expect(img!.getAttribute("src")).toBe("/images/photo.jpg");
    });
  });

  describe("Parsed attributes", () => {
    it("should get attribute from parsed HTML", () => {
      const doc = parseHTML(
        '<div id="test" class="myClass" data-value="123"></div>',
      );
      const div = doc.querySelector("div");

      expect(div!.getAttribute("id")).toBe("test");
      expect(div!.getAttribute("class")).toBe("myClass");
      expect(div!.getAttribute("data-value")).toBe("123");
    });

    it("should get boolean attribute from parsed HTML", () => {
      const doc = parseHTML("<input disabled>");
      const input = doc.querySelector("input");

      expect(input!.hasAttribute("disabled")).toBe(true);
    });

    it("should get attribute with empty value from parsed HTML", () => {
      const doc = parseHTML('<div data-empty=""></div>');
      const div = doc.querySelector("div");

      expect(div!.hasAttribute("data-empty")).toBe(true);
    });

    it("should get attribute with special chars from parsed HTML", () => {
      const doc = parseHTML('<div data-special="&lt;tag&gt;"></div>');
      const div = doc.querySelector("div");

      expect(div!.getAttribute("data-special")).toBe("<tag>");
    });
  });

  describe("Multiple elements", () => {
    it("should set attributes independently on different elements", () => {
      const doc = parseHTML("<div></div><span></span>");
      const div = doc.querySelector("div");
      const span = doc.querySelector("span");

      div!.setAttribute("data-test", "div-value");
      span!.setAttribute("data-test", "span-value");

      expect(div!.getAttribute("data-test")).toBe("div-value");
      expect(span!.getAttribute("data-test")).toBe("span-value");
    });

    it("should not affect parent when setting child attribute", () => {
      const doc = parseHTML("<div><span></span></div>");
      const div = doc.querySelector("div");
      const span = doc.querySelector("span");

      span!.setAttribute("data-test", "value");

      expect(span!.getAttribute("data-test")).toBe("value");
      expect(div!.getAttribute("data-test")).toBeNull();
    });
  });
});
