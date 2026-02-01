import { describe, it, expect } from "bun:test";
import { parseHTML } from "../index";

describe("DOM Manipulation - replaceChild", () => {
  describe("Basic replaceChild functionality", () => {
    it("should replace a child node", () => {
      const doc = parseHTML("<div><span>Old</span></div>");
      const div = doc.querySelector("div");
      const oldSpan = div!.childNodes[0]!;
      const newSpan = doc.createElement("span");
      newSpan.textContent = "New";

      const replaced = div!.replaceChild(newSpan, oldSpan);

      expect(replaced.textContent).toBe("Old");
      expect(div!.childNodes.length).toBe(1);
      expect(div!.childNodes[0]!.textContent).toBe("New");
      expect((newSpan.parentNode as Element).tagName).toBe("DIV");
      expect(oldSpan.parentNode).toBe(null);
    });

    it("should replace the only child", () => {
      const doc = parseHTML("<div><span>Only</span></div>");
      const div = doc.querySelector("div");
      const oldSpan = div!.childNodes[0]!;
      const newSpan = doc.createElement("span");
      newSpan.textContent = "New";

      div!.replaceChild(newSpan, oldSpan);

      expect(div!.childNodes.length).toBe(1);
      expect(div!.childNodes[0]!.textContent).toBe("New");
    });

    it("should update sibling references", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div>",
      );
      const div = doc.querySelector("div");
      const spanB = div!.childNodes[1]!;
      const newSpan = doc.createElement("span");
      newSpan.textContent = "New";

      div!.replaceChild(newSpan, spanB);

      expect(div!.childNodes.length).toBe(3);
      expect(div!.childNodes[1]!.textContent).toBe("New");
      expect(div!.childNodes[0]!.nextSibling!.textContent).toBe("New");
      expect(div!.childNodes[2]!.previousSibling!.textContent).toBe("New");
    });

    it("should throw error when old child is not a child", () => {
      const doc = parseHTML("<div></div><p><span></span></p>");
      const div = doc.querySelector("div");
      const pSpan = doc.querySelector("span");
      const newSpan = doc.createElement("span");

      expect(() => div!.replaceChild(newSpan, pSpan!)).toThrow();
    });

    it("should handle replacing with the same node", () => {
      const doc = parseHTML("<div><span>Test</span></div>");
      const div = doc.querySelector("div");
      const span = div!.childNodes[0]!;

      const replaced = div!.replaceChild(span, span);

      expect(replaced.textContent).toBe("Test");
      expect(div!.childNodes.length).toBe(1);
      expect(div!.childNodes[0]!.textContent).toBe("Test");
    });

    it("should return the replaced node", () => {
      const doc = parseHTML("<div><span>Old</span></div>");
      const div = doc.querySelector("div");
      const oldSpan = div!.childNodes[0]!;
      const newSpan = doc.createElement("span");

      const result = div!.replaceChild(newSpan, oldSpan);

      expect(result).toBe(oldSpan);
    });
  });

  describe("Replacing different node types", () => {
    it("should replace element with text node", () => {
      const doc = parseHTML("<div><span>Old</span></div>");
      const div = doc.querySelector("div");
      const span = div!.childNodes[0]!;
      const textNode = doc.createTextNode("New text");

      div!.replaceChild(textNode, span);

      expect(div!.childNodes.length).toBe(1);
      expect(div!.childNodes[0]!.nodeType).toBe(3);
      expect(div!.textContent).toBe("New text");
    });

    it("should replace text node with element", () => {
      const doc = parseHTML("<div>Old text</div>");
      const div = doc.querySelector("div");
      const textNode = div!.childNodes[0]!;
      const span = doc.createElement("span");
      span.textContent = "New";

      div!.replaceChild(span, textNode);

      expect(div!.childNodes.length).toBe(1);
      expect((div!.childNodes[0] as Element).tagName).toBe("SPAN");
    });

    it("should replace element with parsed comment", () => {
      const doc = parseHTML("<div><span>Old</span></div>");
      const commentDoc = parseHTML("<p><!-- replaced --></p>");
      const div = doc.querySelector("div");
      const span = div!.childNodes[0]!;
      const comment = commentDoc.querySelector("p")!.childNodes[0]!;

      div!.replaceChild(comment, span);

      expect(div!.childNodes.length).toBe(1);
      expect(div!.childNodes[0]!.nodeType).toBe(8);
    });

    it("should replace comment with element", () => {
      const doc = parseHTML("<div><!-- old --></div>");
      const div = doc.querySelector("div");
      const comment = div!.childNodes[0]!;
      const span = doc.createElement("span");
      span.textContent = "New";

      div!.replaceChild(span, comment);

      expect(div!.childNodes.length).toBe(1);
      expect((div!.childNodes[0] as Element).tagName).toBe("SPAN");
    });
  });

  describe("Element sibling references", () => {
    it("should update nextElementSibling when replacing", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div>",
      );
      const div = doc.querySelector("div");
      const spanA = div!.children[0]!;
      const spanB = div!.children[1]!;
      const spanC = div!.children[2]!;
      const newSpan = doc.createElement("span");
      newSpan.textContent = "New";

      div!.replaceChild(newSpan, spanB);

      expect(spanA.nextElementSibling).toBe(newSpan);
      expect(newSpan.nextElementSibling).toBe(spanC);
    });

    it("should update previousElementSibling when replacing", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div>",
      );
      const div = doc.querySelector("div");
      const spanA = div!.children[0]!;
      const spanB = div!.children[1]!;
      const spanC = div!.children[2]!;
      const newSpan = doc.createElement("span");

      div!.replaceChild(newSpan, spanB);

      expect(newSpan.previousElementSibling).toBe(spanA);
      expect(spanC.previousElementSibling).toBe(newSpan);
    });

    it("should update firstElementChild when replacing first", () => {
      const doc = parseHTML("<div><span>A</span><span>B</span></div>");
      const div = doc.querySelector("div");
      const spanA = div!.children[0]!;
      const newSpan = doc.createElement("span");
      newSpan.textContent = "New";

      div!.replaceChild(newSpan, spanA);

      expect(div!.firstElementChild).toBe(newSpan);
    });

    it("should update lastElementChild when replacing last", () => {
      const doc = parseHTML("<div><span>A</span><span>B</span></div>");
      const div = doc.querySelector("div");
      const spanB = div!.children[1]!;
      const newSpan = doc.createElement("span");
      newSpan.textContent = "New";

      div!.replaceChild(newSpan, spanB);

      expect(div!.lastElementChild).toBe(newSpan);
    });

    it("should update children array", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div>",
      );
      const div = doc.querySelector("div");
      const spanB = div!.children[1]!;
      const newSpan = doc.createElement("span");
      newSpan.textContent = "New";

      div!.replaceChild(newSpan, spanB);

      expect(div!.children.length).toBe(3);
      expect(div!.children[1]).toBe(newSpan);
    });

    it("should remove from children when replacing element with non-element", () => {
      const doc = parseHTML("<div><span>A</span><span>B</span></div>");
      const div = doc.querySelector("div");
      const spanB = div!.children[1]!;
      const textNode = doc.createTextNode("text");

      div!.replaceChild(textNode, spanB);

      expect(div!.children.length).toBe(1);
      expect(div!.childNodes.length).toBe(2);
    });
  });

  describe("Hierarchy validation", () => {
    it("should throw when replacing with ancestor", () => {
      const doc = parseHTML("<div><span><em></em></span></div>");
      const div = doc.querySelector("div");
      const span = doc.querySelector("span");
      const em = doc.querySelector("em");

      expect(() => span!.replaceChild(div!, em!)).toThrow();
    });

    it("should throw when creating circular reference", () => {
      const doc = parseHTML("<div><span></span></div>");
      const div = doc.querySelector("div");
      const span = doc.querySelector("span");

      expect(() => span!.replaceChild(div!, span!)).toThrow();
    });
  });

  describe("Moving nodes during replace", () => {
    it("should move new node from its current parent", () => {
      const doc = parseHTML(
        "<div><span>Child</span></div><p><em>To move</em></p>",
      );
      const div = doc.querySelector("div");
      const p = doc.querySelector("p");
      const span = doc.querySelector("span");
      const em = doc.querySelector("em");

      div!.replaceChild(em!, span!);

      expect(p!.childNodes.length).toBe(0);
      expect(div!.childNodes.length).toBe(1);
      expect(div!.childNodes[0] ?? null).toBe(em);
    });

    it("should handle replacing with node from different parent", () => {
      const doc = parseHTML("<div><span>A</span></div><p><em>B</em></p>");
      const div = doc.querySelector("div");
      const p = doc.querySelector("p");
      const span = div!.childNodes[0]!;
      const em = p!.childNodes[0]!;

      div!.replaceChild(em, span);

      expect(div!.childNodes.length).toBe(1);
      expect(div!.childNodes[0]).toBe(em);
      expect(p!.childNodes.length).toBe(0);
    });
  });

  describe("Replaced node state", () => {
    it("should clear parentNode of replaced node", () => {
      const doc = parseHTML("<div><span>Old</span></div>");
      const div = doc.querySelector("div");
      const span = div!.childNodes[0]!;
      const newSpan = doc.createElement("span");

      div!.replaceChild(newSpan, span);

      expect(span.parentNode).toBe(null);
    });

    it("should clear sibling references of replaced node", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div>",
      );
      const div = doc.querySelector("div");
      const spanB = div!.childNodes[1]!;
      const newSpan = doc.createElement("span");

      div!.replaceChild(newSpan, spanB);

      expect(spanB.previousSibling).toBe(null);
      expect(spanB.nextSibling).toBe(null);
    });

    it("should preserve replaced node children", () => {
      const doc = parseHTML("<div><span><em>Deep</em></span></div>");
      const div = doc.querySelector("div");
      const span = doc.querySelector("span");
      const newSpan = doc.createElement("span");

      div!.replaceChild(newSpan, span!);

      expect(span!.childNodes.length).toBe(1);
      expect((span!.childNodes[0] as Element).tagName).toBe("EM");
    });
  });

  describe("Edge cases", () => {
    it("should handle replacing first child", () => {
      const doc = parseHTML("<div><span>A</span><span>B</span></div>");
      const div = doc.querySelector("div");
      const spanA = div!.childNodes[0]!;
      const spanB = div!.childNodes[1]!;
      const newSpan = doc.createElement("span");
      newSpan.textContent = "New";

      div!.replaceChild(newSpan, spanA);

      expect(div!.firstChild).toBe(newSpan);
      expect(newSpan.previousSibling).toBe(null);
      expect(newSpan.nextSibling).toBe(spanB);
    });

    it("should handle replacing last child", () => {
      const doc = parseHTML("<div><span>A</span><span>B</span></div>");
      const div = doc.querySelector("div");
      const spanA = div!.childNodes[0]!;
      const spanB = div!.childNodes[1]!;
      const newSpan = doc.createElement("span");
      newSpan.textContent = "New";

      div!.replaceChild(newSpan, spanB);

      expect(div!.lastChild).toBe(newSpan);
      expect(newSpan.nextSibling).toBe(null);
      expect(newSpan.previousSibling).toBe(spanA);
    });

    it("should allow re-using replaced node", () => {
      const doc = parseHTML("<div><span>A</span></div><p></p>");
      const div = doc.querySelector("div");
      const p = doc.querySelector("p");
      const span = doc.querySelector("span");
      const newSpan = doc.createElement("span");
      newSpan.textContent = "New";

      div!.replaceChild(newSpan, span!);
      p!.appendChild(span!);

      expect(p!.childNodes[0] ?? null).toBe(span);
      expect(span!.parentNode).toBe(p);
    });

    it("should handle deeply nested replacement", () => {
      const doc = parseHTML(
        "<div><span><em><strong>Deep</strong></em></span></div>",
      );
      const em = doc.querySelector("em");
      const strong = doc.querySelector("strong");
      const newStrong = doc.createElement("strong");
      newStrong.textContent = "New";

      em!.replaceChild(newStrong, strong!);

      expect(em!.childNodes[0]).toBe(newStrong);
    });
  });
});
