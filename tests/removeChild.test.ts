import { describe, it, expect } from "bun:test";
import { parseHTML } from "../index";

describe("DOM Manipulation - removeChild", () => {
  describe("Basic removeChild functionality", () => {
    it("should remove a child node", () => {
      const doc = parseHTML("<div><span>First</span><span>Second</span></div>");
      const div = doc.querySelector("div");
      const firstSpan = div!.childNodes[0]!;

      const removed = div!.removeChild(firstSpan);

      expect(removed.textContent).toBe("First");
      expect(div!.childNodes.length).toBe(1);
      expect(div!.childNodes[0]!.textContent).toBe("Second");
      expect(firstSpan.parentNode).toBe(null);
    });

    it("should throw error when removing non-child node", () => {
      const doc = parseHTML("<div><span></span></div><p><span></span></p>");
      const div = doc.querySelector("div");
      const pSpan = doc.querySelector("p span");

      expect(() => div!.removeChild(pSpan!)).toThrow();
    });

    it("should remove the last child", () => {
      const doc = parseHTML("<div><span>Only</span></div>");
      const div = doc.querySelector("div");
      const span = div!.childNodes[0]!;

      const removed = div!.removeChild(span);

      expect(removed.textContent).toBe("Only");
      expect(div!.childNodes.length).toBe(0);
      expect(span.parentNode).toBe(null);
    });

    it("should update sibling references", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div>",
      );
      const div = doc.querySelector("div");
      const spanB = div!.childNodes[1]!;

      div!.removeChild(spanB);

      expect(div!.childNodes.length).toBe(2);
      expect(div!.childNodes[0]!.textContent).toBe("A");
      expect(div!.childNodes[1]!.textContent).toBe("C");
      expect(div!.childNodes[0]!.nextSibling!.textContent).toBe("C");
      expect(div!.childNodes[1]!.previousSibling!.textContent).toBe("A");
    });

    it("should return the removed node", () => {
      const doc = parseHTML("<div><span>Child</span></div>");
      const div = doc.querySelector("div");
      const span = div!.childNodes[0]!;

      const result = div!.removeChild(span);

      expect(result).toBe(span);
    });

    it("should update firstChild when removing first", () => {
      const doc = parseHTML("<div><span>A</span><span>B</span></div>");
      const div = doc.querySelector("div");
      const spanA = div!.childNodes[0]!;
      const spanB = div!.childNodes[1]!;

      div!.removeChild(spanA);

      expect(div!.firstChild).toBe(spanB);
    });

    it("should update lastChild when removing last", () => {
      const doc = parseHTML("<div><span>A</span><span>B</span></div>");
      const div = doc.querySelector("div");
      const spanA = div!.childNodes[0]!;
      const spanB = div!.childNodes[1]!;

      div!.removeChild(spanB);

      expect(div!.lastChild).toBe(spanA);
    });

    it("should set firstChild and lastChild to null when empty", () => {
      const doc = parseHTML("<div><span>Only</span></div>");
      const div = doc.querySelector("div");
      const span = div!.childNodes[0]!;

      div!.removeChild(span);

      expect(div!.firstChild).toBe(null);
      expect(div!.lastChild).toBe(null);
    });
  });

  describe("Removing different node types", () => {
    it("should remove text nodes", () => {
      const doc = parseHTML("<div>Hello World</div>");
      const div = doc.querySelector("div");
      const textNode = div!.childNodes[0]!;

      div!.removeChild(textNode);

      expect(div!.childNodes.length).toBe(0);
      expect(div!.textContent).toBe("");
    });

    it("should remove comment nodes", () => {
      const doc = parseHTML("<div><!-- comment --><span>Content</span></div>");
      const div = doc.querySelector("div");
      const comment = div!.childNodes[0]!;

      expect(comment.nodeType).toBe(8);
      div!.removeChild(comment);

      expect(div!.childNodes.length).toBe(1);
      expect((div!.childNodes[0] as Element).tagName).toBe("SPAN");
    });

    it("should remove whitespace text nodes", () => {
      const doc = parseHTML("<div>   </div>");
      const div = doc.querySelector("div");
      const whitespace = div!.childNodes[0]!;

      div!.removeChild(whitespace);

      expect(div!.childNodes.length).toBe(0);
    });
  });

  describe("Element sibling references", () => {
    it("should update nextElementSibling", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div>",
      );
      const div = doc.querySelector("div");
      const spanA = div!.children[0]!;
      const spanB = div!.children[1]!;
      const spanC = div!.children[2]!;

      div!.removeChild(spanB);

      expect(spanA.nextElementSibling).toBe(spanC);
    });

    it("should update previousElementSibling", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div>",
      );
      const div = doc.querySelector("div");
      const spanA = div!.children[0]!;
      const spanB = div!.children[1]!;
      const spanC = div!.children[2]!;

      div!.removeChild(spanB);

      expect(spanC.previousElementSibling).toBe(spanA);
    });

    it("should update firstElementChild", () => {
      const doc = parseHTML("<div><span>A</span><span>B</span></div>");
      const div = doc.querySelector("div");
      const spanA = div!.children[0]!;
      const spanB = div!.children[1]!;

      div!.removeChild(spanA);

      expect(div!.firstElementChild).toBe(spanB);
    });

    it("should update lastElementChild", () => {
      const doc = parseHTML("<div><span>A</span><span>B</span></div>");
      const div = doc.querySelector("div");
      const spanA = div!.children[0]!;
      const spanB = div!.children[1]!;

      div!.removeChild(spanB);

      expect(div!.lastElementChild).toBe(spanA);
    });

    it("should update children array", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div>",
      );
      const div = doc.querySelector("div");
      const spanB = div!.children[1]!;

      div!.removeChild(spanB);

      expect(div!.children.length).toBe(2);
      expect(div!.children[0]!.textContent).toBe("A");
      expect(div!.children[1]!.textContent).toBe("C");
    });
  });

  describe("Removed node state", () => {
    it("should clear parentNode", () => {
      const doc = parseHTML("<div><span>Child</span></div>");
      const div = doc.querySelector("div");
      const span = div!.childNodes[0]!;

      div!.removeChild(span);

      expect(span.parentNode).toBe(null);
    });

    it("should clear parentElement for elements", () => {
      const doc = parseHTML("<div><span>Child</span></div>");
      const div = doc.querySelector("div");
      const span = doc.querySelector("span");

      div!.removeChild(span!);

      expect(span!.parentElement).toBe(null);
    });

    it("should clear sibling references", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div>",
      );
      const div = doc.querySelector("div");
      const spanB = div!.childNodes[1]!;

      div!.removeChild(spanB);

      expect(spanB.previousSibling).toBe(null);
      expect(spanB.nextSibling).toBe(null);
    });

    it("should clear element sibling references", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div>",
      );
      const div = doc.querySelector("div");
      const spanB = div!.children[1]!;

      div!.removeChild(spanB);

      expect(spanB.previousElementSibling).toBe(null);
      expect(spanB.nextElementSibling).toBe(null);
    });

    it("should preserve removed node children", () => {
      const doc = parseHTML("<div><span><em>Deep</em></span></div>");
      const div = doc.querySelector("div");
      const span = doc.querySelector("span");

      div!.removeChild(span!);

      expect(span!.childNodes.length).toBe(1);
      expect((span!.childNodes[0] as Element).tagName).toBe("EM");
    });
  });

  describe("Edge cases", () => {
    it("should handle removing from deeply nested structure", () => {
      const doc = parseHTML(
        "<div><span><em><strong>Deep</strong></em></span></div>",
      );
      const em = doc.querySelector("em");
      const strong = doc.querySelector("strong");

      em!.removeChild(strong!);

      expect(em!.childNodes.length).toBe(0);
    });

    it("should allow re-appending removed node", () => {
      const doc = parseHTML("<div><span>Child</span></div><p></p>");
      const div = doc.querySelector("div");
      const p = doc.querySelector("p");
      const span = doc.querySelector("span");

      div!.removeChild(span!);
      p!.appendChild(span!);

      expect(div!.childNodes.length).toBe(0);
      expect(p!.childNodes.length).toBe(1);
      expect(span!.parentNode).toBe(p);
    });

    it("should handle consecutive removes", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div>",
      );
      const div = doc.querySelector("div");

      while (div!.childNodes.length > 0) {
        div!.removeChild(div!.childNodes[0]!);
      }

      expect(div!.childNodes.length).toBe(0);
    });

    it("should handle removing all children in reverse order", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div>",
      );
      const div = doc.querySelector("div");

      while (div!.childNodes.length > 0) {
        div!.removeChild(div!.lastChild!);
      }

      expect(div!.childNodes.length).toBe(0);
    });
  });
});
