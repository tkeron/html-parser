import { describe, it, expect } from "bun:test";
import { parseHTML } from "../index";

describe("DOM Manipulation - appendChild", () => {
  describe("Basic appendChild functionality", () => {
    it("should append a node to an element", () => {
      const doc = parseHTML("<div><span>First</span></div>");
      const div = doc.querySelector("div");
      const newSpan = doc.createElement("span");
      newSpan.textContent = "Second";

      div!.appendChild(newSpan);

      expect(div!.childNodes.length).toBe(2);
      expect((div!.childNodes[1] as Element).tagName).toBe("SPAN");
      expect(div!.childNodes[1]!.textContent).toBe("Second");
      expect((newSpan.parentNode as Element).tagName).toBe("DIV");
    });

    it("should append multiple nodes sequentially", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");
      const span1 = doc.createElement("span");
      span1.textContent = "1";
      const span2 = doc.createElement("span");
      span2.textContent = "2";

      div!.appendChild(span1);
      div!.appendChild(span2);

      expect(div!.childNodes.length).toBe(2);
      expect((div!.childNodes[0] as Element).tagName).toBe("SPAN");
      expect(div!.childNodes[0]!.textContent).toBe("1");
      expect((div!.childNodes[1] as Element).tagName).toBe("SPAN");
      expect(div!.childNodes[1]!.textContent).toBe("2");
    });

    it("should handle appending text nodes", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");
      const textNode = doc.createTextNode("Hello");

      div!.appendChild(textNode);

      expect(div!.childNodes.length).toBe(1);
      expect(div!.childNodes[0]!.nodeType).toBe(3);
      expect(div!.childNodes[0]!.textContent).toBe("Hello");
      expect(div!.textContent).toBe("Hello");
    });

    it("should throw error when appending to itself", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      expect(() => div!.appendChild(div!)).toThrow();
    });

    it("should move node from another parent", () => {
      const doc = parseHTML("<div><span></span></div><p></p>");
      const div = doc.querySelector("div");
      const span = doc.querySelector("span");
      const p = doc.querySelector("p");

      p!.appendChild(span!);

      expect(div!.childNodes.length).toBe(0);
      expect(p!.childNodes.length).toBe(1);
      expect((p!.childNodes[0] as Element).tagName).toBe("SPAN");
      expect((span!.parentNode as Element).tagName).toBe("P");
    });

    it("should update sibling references", () => {
      const doc = parseHTML("<div><span>A</span></div>");
      const div = doc.querySelector("div");
      const spanA = div!.childNodes[0]!;
      const spanB = doc.createElement("span");
      spanB.textContent = "B";

      div!.appendChild(spanB);

      expect(spanA.nextSibling).toBe(spanB);
      expect(spanB.previousSibling).toBe(spanA);
    });

    it("should update firstChild and lastChild", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");
      const span = doc.createElement("span");

      div!.appendChild(span);

      expect(div!.firstChild).toBe(span);
      expect(div!.lastChild).toBe(span);

      const span2 = doc.createElement("span");
      div!.appendChild(span2);

      expect(div!.firstChild).toBe(span);
      expect(div!.lastChild).toBe(span2);
    });

    it("should return the appended node", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");
      const span = doc.createElement("span");

      const result = div!.appendChild(span);

      expect(result).toBe(span);
    });
  });

  describe("Appending different node types", () => {
    it("should append parsed comment nodes", () => {
      const doc = parseHTML("<div><!-- This is a comment --></div>");
      const div = doc.querySelector("div");
      const comment = div!.childNodes[0]!;
      const target = parseHTML("<p></p>").querySelector("p");

      target!.appendChild(comment);

      expect(target!.childNodes.length).toBe(1);
      expect(target!.childNodes[0]!.nodeType).toBe(8);
    });

    it("should append text node with empty string", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");
      const textNode = doc.createTextNode("");

      div!.appendChild(textNode);

      expect(div!.childNodes.length).toBe(1);
      expect(div!.textContent).toBe("");
    });

    it("should append text node with whitespace only", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");
      const textNode = doc.createTextNode("   \n\t  ");

      div!.appendChild(textNode);

      expect(div!.childNodes.length).toBe(1);
      expect(div!.childNodes[0]!.textContent).toBe("   \n\t  ");
    });

    it("should append deeply nested elements", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");
      const level1 = doc.createElement("div");
      const level2 = doc.createElement("div");
      const level3 = doc.createElement("span");
      level3.textContent = "Deep";
      level2.appendChild(level3);
      level1.appendChild(level2);

      div!.appendChild(level1);

      expect(
        div!.childNodes[0]!.childNodes[0]!.childNodes[0]!.textContent,
      ).toBe("Deep");
    });
  });

  describe("Hierarchy validation", () => {
    it("should throw when appending ancestor to descendant", () => {
      const doc = parseHTML("<div><span><em></em></span></div>");
      const div = doc.querySelector("div");
      const em = doc.querySelector("em");

      expect(() => em!.appendChild(div!)).toThrow();
    });

    it("should throw when creating circular reference", () => {
      const doc = parseHTML("<div><span></span></div>");
      const div = doc.querySelector("div");
      const span = doc.querySelector("span");

      expect(() => span!.appendChild(div!)).toThrow();
    });

    it("should allow appending sibling", () => {
      const doc = parseHTML("<div><span>A</span><em>B</em></div>");
      const span = doc.querySelector("span");
      const em = doc.querySelector("em");

      span!.appendChild(em!);

      expect(span!.childNodes.length).toBe(2);
      expect(span!.childNodes[1] ?? null).toBe(em);
    });
  });

  describe("Moving nodes", () => {
    it("should properly remove from original parent", () => {
      const doc = parseHTML("<div><span>Child</span></div><p></p>");
      const div = doc.querySelector("div");
      const p = doc.querySelector("p");
      const span = doc.querySelector("span");

      p!.appendChild(span!);

      expect(div!.childNodes.length).toBe(0);
      expect(div!.firstChild).toBe(null);
      expect(div!.lastChild).toBe(null);
    });

    it("should update children array when moving elements", () => {
      const doc = parseHTML("<div><span>1</span><span>2</span></div><p></p>");
      const div = doc.querySelector("div");
      const p = doc.querySelector("p");
      const span1 = div!.children[0]!;

      p!.appendChild(span1);

      expect(div!.children.length).toBe(1);
      expect(p!.children.length).toBe(1);
      expect(p!.children[0]!).toBe(span1);
    });

    it("should handle moving first child", () => {
      const doc = parseHTML("<div><span>A</span><span>B</span></div><p></p>");
      const div = doc.querySelector("div");
      const p = doc.querySelector("p");
      const spanA = div!.childNodes[0]!;
      const spanB = div!.childNodes[1]!;

      p!.appendChild(spanA);

      expect(div!.firstChild).toBe(spanB);
      expect(spanB.previousSibling).toBe(null);
    });

    it("should handle moving last child", () => {
      const doc = parseHTML("<div><span>A</span><span>B</span></div><p></p>");
      const div = doc.querySelector("div");
      const p = doc.querySelector("p");
      const spanA = div!.childNodes[0]!;
      const spanB = div!.childNodes[1]!;

      p!.appendChild(spanB);

      expect(div!.lastChild).toBe(spanA);
      expect(spanA.nextSibling).toBe(null);
    });

    it("should handle moving middle child", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div><p></p>",
      );
      const div = doc.querySelector("div");
      const p = doc.querySelector("p");
      const spanA = div!.childNodes[0]!;
      const spanB = div!.childNodes[1]!;
      const spanC = div!.childNodes[2]!;

      p!.appendChild(spanB);

      expect(div!.childNodes.length).toBe(2);
      expect(spanA.nextSibling).toBe(spanC);
      expect(spanC.previousSibling).toBe(spanA);
    });
  });

  describe("Edge cases", () => {
    it("should handle appending many nodes", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      for (let i = 0; i < 100; i++) {
        const span = doc.createElement("span");
        span.textContent = String(i);
        div!.appendChild(span);
      }

      expect(div!.childNodes.length).toBe(100);
      expect(div!.childNodes[0]!.textContent).toBe("0");
      expect(div!.childNodes[99]!.textContent).toBe("99");
    });

    it("should handle unicode content", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");
      const textNode = doc.createTextNode("日本語 🎉 émoji");

      div!.appendChild(textNode);

      expect(div!.textContent).toBe("日本語 🎉 émoji");
    });

    it("should handle special HTML characters in text nodes", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");
      const textNode = doc.createTextNode("<script>alert('xss')</script>");

      div!.appendChild(textNode);

      expect(div!.textContent).toBe("<script>alert('xss')</script>");
    });

    it("should handle appending to document fragment-like structure", () => {
      const doc = parseHTML("<div></div>");
      const container = doc.createElement("div");
      const span1 = doc.createElement("span");
      const span2 = doc.createElement("span");
      container.appendChild(span1);
      container.appendChild(span2);

      expect(container.childNodes.length).toBe(2);
    });
  });
});
