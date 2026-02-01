import { describe, it, expect } from "bun:test";
import { parseHTML } from "../index";

describe("DOM Content - innerHTML setter", () => {
  describe("Basic innerHTML setter functionality", () => {
    it("should set innerHTML and replace all children", () => {
      const doc = parseHTML("<div><span>Old</span></div>");
      const div = doc.querySelector("div");

      div!.innerHTML = "<p>New</p>";

      expect(div!.childNodes.length).toBe(1);
      expect(div!.children[0]!.tagName).toBe("P");
      expect(div!.children[0]!.textContent).toBe("New");
    });

    it("should handle empty string", () => {
      const doc = parseHTML("<div><span>Content</span></div>");
      const div = doc.querySelector("div");

      div!.innerHTML = "";

      expect(div!.childNodes.length).toBe(0);
      expect(div!.innerHTML).toBe("");
    });

    it("should handle text content", () => {
      const doc = parseHTML("<div><span>Old</span></div>");
      const div = doc.querySelector("div");

      div!.innerHTML = "Just text";

      expect(div!.childNodes.length).toBe(1);
      expect(div!.childNodes[0]!.nodeType).toBe(3);
      expect(div!.textContent).toBe("Just text");
    });

    it("should handle malformed HTML gracefully", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.innerHTML = "<p>Unclosed<p>Another";

      expect(div!.childNodes.length).toBe(2);
      expect(div!.children[0]!.tagName).toBe("P");
      expect(div!.children[1]!.tagName).toBe("P");
    });

    it("should handle special characters", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.innerHTML = "<p>&lt;script&gt;alert('xss')&lt;/script&gt;</p>";

      expect(div!.innerHTML).toContain("&lt;script&gt;");
      expect(div!.textContent).toBe("<script>alert('xss')</script>");
    });

    it("should handle nested elements", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.innerHTML = "<div><span>Inner</span></div>";

      expect(div!.childNodes.length).toBe(1);
      expect(div!.children[0]!.tagName).toBe("DIV");
      expect(div!.children[0]!.children[0]!.tagName).toBe("SPAN");
    });

    it("should clear all existing children", () => {
      const doc = parseHTML(
        "<div><span>1</span><span>2</span><span>3</span></div>",
      );
      const div = doc.querySelector("div");

      div!.innerHTML = "<p>New</p>";

      expect(div!.childNodes.length).toBe(1);
      expect(div!.children.length).toBe(1);
    });

    it("should update firstChild and lastChild", () => {
      const doc = parseHTML("<div><span>Old</span></div>");
      const div = doc.querySelector("div");

      div!.innerHTML = "<p>First</p><p>Last</p>";

      expect(div!.firstChild!.textContent).toBe("First");
      expect(div!.lastChild!.textContent).toBe("Last");
    });

    it("should update children array", () => {
      const doc = parseHTML("<div><span>Old</span></div>");
      const div = doc.querySelector("div");

      div!.innerHTML = "<p>1</p><p>2</p><p>3</p>";

      expect(div!.children.length).toBe(3);
      expect(div!.children[0]!.tagName).toBe("P");
      expect(div!.children[1]!.tagName).toBe("P");
      expect(div!.children[2]!.tagName).toBe("P");
    });
  });

  describe("innerHTML with various HTML structures", () => {
    it("should handle multiple sibling elements", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.innerHTML = "<span>1</span><span>2</span><span>3</span>";

      expect(div!.children.length).toBe(3);
    });

    it("should handle mixed content", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.innerHTML = "Text <span>Element</span> More text";

      expect(div!.childNodes.length).toBe(3);
      expect(div!.childNodes[0]!.nodeType).toBe(3);
      expect(div!.childNodes[1]!.nodeType).toBe(1);
      expect(div!.childNodes[2]!.nodeType).toBe(3);
    });

    it("should handle deeply nested content", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.innerHTML = "<div><div><div><span>Deep</span></div></div></div>";

      const deep = div!.querySelector("span");
      expect(deep!.textContent).toBe("Deep");
    });

    it("should handle comments", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.innerHTML = "<!-- comment --><span>Content</span>";

      expect(div!.childNodes.length).toBe(2);
      expect(div!.childNodes[0]!.nodeType).toBe(8);
    });

    it("should handle void elements", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.innerHTML = "<input type='text'><br><hr>";

      expect(div!.children.length).toBe(3);
      expect(div!.children[0]!.tagName).toBe("INPUT");
      expect(div!.children[1]!.tagName).toBe("BR");
      expect(div!.children[2]!.tagName).toBe("HR");
    });

    it("should handle script tags (as parsed structure, not executed)", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.innerHTML = "<script>var x = 1;</script>";

      expect(div!.children.length).toBe(1);
      expect(div!.children[0]!.tagName).toBe("SCRIPT");
      expect(div!.children[0]!.textContent).toBe("var x = 1;");
    });

    it("should handle style tags", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.innerHTML = "<style>.class { color: red; }</style>";

      expect(div!.children.length).toBe(1);
      expect(div!.children[0]!.tagName).toBe("STYLE");
    });

    it("should handle table structure", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.innerHTML = "<table><tr><td>Cell</td></tr></table>";

      const table = div!.querySelector("table");
      expect(table).not.toBeNull();
    });

    it("should handle lists", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.innerHTML = "<ul><li>Item 1</li><li>Item 2</li></ul>";

      const items = div!.querySelectorAll("li");
      expect(items.length).toBe(2);
    });
  });

  describe("innerHTML special content", () => {
    it("should handle unicode content", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.innerHTML = "<span>日本語 🎉</span>";

      expect(div!.textContent).toBe("日本語 🎉");
    });

    it("should handle whitespace-only content (trimmed by parser)", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.innerHTML = "   \n\t  ";

      expect(div!.childNodes.length).toBe(0);
    });

    it("should handle attributes with special characters", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.innerHTML =
        '<span data-test="value with &quot;quotes&quot;">Content</span>';

      const span = div!.querySelector("span");
      expect(span).not.toBeNull();
    });

    it("should handle multiple attributes", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.innerHTML =
        '<span id="myId" class="myClass" data-value="123">Content</span>';

      const span = div!.querySelector("span");
      expect(span!.id).toBe("myId");
      expect(span!.className).toBe("myClass");
      expect(span!.getAttribute("data-value")).toBe("123");
    });
  });

  describe("innerHTML getter", () => {
    it("should return empty string for empty element", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      expect(div!.innerHTML).toBe("");
    });

    it("should return text content for text-only", () => {
      const doc = parseHTML("<div>Hello</div>");
      const div = doc.querySelector("div");

      expect(div!.innerHTML).toBe("Hello");
    });

    it("should return serialized HTML for elements", () => {
      const doc = parseHTML("<div><span>Content</span></div>");
      const div = doc.querySelector("div");

      expect(div!.innerHTML).toContain("<span>");
      expect(div!.innerHTML).toContain("</span>");
    });
  });
});

describe("DOM Content - outerHTML setter", () => {
  describe("Basic outerHTML setter functionality", () => {
    it("should replace element with new HTML", () => {
      const doc = parseHTML("<div><p id='test'>Old</p></div>");
      const p = doc.querySelector("#test");

      p!.outerHTML = "<span>New</span>";

      const span = doc.querySelector("span");
      expect(span).not.toBeNull();
      expect(span!.textContent).toBe("New");
      expect(doc.querySelector("#test")).toBeNull();
    });

    it("should handle multiple elements", () => {
      const doc = parseHTML("<div><p>Test</p></div>");
      const p = doc.querySelector("p");

      p!.outerHTML = "<span>One</span><em>Two</em>";

      expect(doc.querySelector("span")).not.toBeNull();
      expect(doc.querySelector("em")).not.toBeNull();
      expect(doc.querySelector("p")).toBeNull();
    });

    it("should handle text content", () => {
      const doc = parseHTML("<div><p>Test</p></div>");
      const p = doc.querySelector("p");

      p!.outerHTML = "Just text";

      const div = doc.querySelector("div");
      expect(div!.childNodes.length).toBe(1);
      expect(div!.childNodes[0]!.nodeType).toBe(3);
    });

    it("should update parent references", () => {
      const doc = parseHTML("<div><p>Old</p></div>");
      const div = doc.querySelector("div");
      const p = doc.querySelector("p");

      p!.outerHTML = "<span>New</span>";

      expect(div!.childNodes.length).toBe(1);
      expect(div!.children[0]!.tagName).toBe("SPAN");
    });

    it("should handle special characters", () => {
      const doc = parseHTML("<div><p>Test</p></div>");
      const p = doc.querySelector("p");

      p!.outerHTML = "<span>&amp;</span>";

      const span = doc.querySelector("span");
      expect(span!.innerHTML).toBe("&amp;");
    });

    it("should throw when element has no parent", () => {
      const doc = parseHTML("<div></div>");
      const orphan = doc.createElement("span");

      expect(() => {
        orphan.outerHTML = "<p>Test</p>";
      }).toThrow();
    });
  });

  describe("outerHTML with siblings", () => {
    it("should preserve previous siblings", () => {
      const doc = parseHTML("<div><span>Before</span><p>Replace</p></div>");
      const p = doc.querySelector("p");

      p!.outerHTML = "<em>New</em>";

      const div = doc.querySelector("div");
      expect(div!.children[0]!.tagName).toBe("SPAN");
      expect(div!.children[1]!.tagName).toBe("EM");
    });

    it("should preserve next siblings", () => {
      const doc = parseHTML("<div><p>Replace</p><span>After</span></div>");
      const p = doc.querySelector("p");

      p!.outerHTML = "<em>New</em>";

      const div = doc.querySelector("div");
      expect(div!.children[0]!.tagName).toBe("EM");
      expect(div!.children[1]!.tagName).toBe("SPAN");
    });

    it("should update sibling references", () => {
      const doc = parseHTML("<div><span>A</span><p>B</p><span>C</span></div>");
      const p = doc.querySelector("p");

      p!.outerHTML = "<em>New</em>";

      const div = doc.querySelector("div");
      const em = doc.querySelector("em");
      expect(div!.children[0]!.nextElementSibling).toBe(em);
      expect(div!.children[2]!.previousElementSibling).toBe(em);
    });

    it("should handle replacing with multiple elements among siblings", () => {
      const doc = parseHTML("<div><span>A</span><p>B</p><span>C</span></div>");
      const p = doc.querySelector("p");

      p!.outerHTML = "<em>1</em><em>2</em>";

      const div = doc.querySelector("div");
      expect(div!.children.length).toBe(4);
    });
  });

  describe("outerHTML with empty content", () => {
    it("should remove element when set to empty string", () => {
      const doc = parseHTML("<div><p>Remove me</p></div>");
      const p = doc.querySelector("p");

      p!.outerHTML = "";

      expect(doc.querySelector("p")).toBeNull();
      const div = doc.querySelector("div");
      expect(div!.childNodes.length).toBe(0);
    });

    it("should remove element and preserve siblings", () => {
      const doc = parseHTML(
        "<div><span>A</span><p>Remove</p><span>B</span></div>",
      );
      const p = doc.querySelector("p");

      p!.outerHTML = "";

      const div = doc.querySelector("div");
      expect(div!.children.length).toBe(2);
      expect(div!.children[0]?.nextElementSibling).toBe(
        div!.children[1] ?? null,
      );
    });
  });

  describe("outerHTML replaced element state", () => {
    it("should detach replaced element", () => {
      const doc = parseHTML("<div><p>Old</p></div>");
      const p = doc.querySelector("p");

      p!.outerHTML = "<span>New</span>";

      expect(p!.parentNode).toBe(null);
      expect(p!.previousSibling).toBe(null);
      expect(p!.nextSibling).toBe(null);
    });

    it("should preserve replaced element children", () => {
      const doc = parseHTML("<div><p><span>Child</span></p></div>");
      const p = doc.querySelector("p");

      p!.outerHTML = "<em>New</em>";

      expect(p!.childNodes.length).toBe(1);
      expect((p!.childNodes[0] as Element).tagName).toBe("SPAN");
    });
  });

  describe("outerHTML getter", () => {
    it("should return serialized element", () => {
      const doc = parseHTML("<div><span>Content</span></div>");
      const span = doc.querySelector("span");

      expect(span!.outerHTML).toContain("<span>");
      expect(span!.outerHTML).toContain("</span>");
      expect(span!.outerHTML).toContain("Content");
    });

    it("should include attributes", () => {
      const doc = parseHTML(
        '<div><span id="test" class="myClass">Content</span></div>',
      );
      const span = doc.querySelector("span");

      expect(span!.outerHTML).toContain('id="test"');
      expect(span!.outerHTML).toContain('class="myClass"');
    });

    it("should handle void elements", () => {
      const doc = parseHTML("<div><br></div>");
      const br = doc.querySelector("br");

      expect(br!.outerHTML).toBe("<br>");
    });
  });
});
