import { describe, it, expect } from "bun:test";
import { parseHTML } from "../index";

describe("DOM Manipulation - prepend", () => {
  describe("Basic prepend functionality", () => {
    it("should prepend a node to an element", () => {
      const doc = parseHTML("<div><span>Existing</span></div>");
      const div = doc.querySelector("div");
      const newSpan = doc.createElement("span");
      newSpan.textContent = "New";

      div!.prepend(newSpan);

      expect(div!.childNodes.length).toBe(2);
      expect(div!.childNodes[0]!.textContent).toBe("New");
      expect(div!.childNodes[1]!.textContent).toBe("Existing");
      expect((newSpan.parentNode as Element).tagName).toBe("DIV");
    });

    it("should prepend multiple nodes", () => {
      const doc = parseHTML("<div><span>Existing</span></div>");
      const div = doc.querySelector("div");
      const span1 = doc.createElement("span");
      span1.textContent = "1";
      const span2 = doc.createElement("span");
      span2.textContent = "2";

      div!.prepend(span1, span2);

      expect(div!.childNodes.length).toBe(3);
      expect(div!.childNodes[0]!.textContent).toBe("1");
      expect(div!.childNodes[1]!.textContent).toBe("2");
      expect(div!.childNodes[2]!.textContent).toBe("Existing");
    });

    it("should prepend to empty element", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");
      const newSpan = doc.createElement("span");
      newSpan.textContent = "First";

      div!.prepend(newSpan);

      expect(div!.childNodes.length).toBe(1);
      expect(div!.childNodes[0]!.textContent).toBe("First");
    });

    it("should update firstChild reference", () => {
      const doc = parseHTML("<div><span>Old first</span></div>");
      const div = doc.querySelector("div");
      const newSpan = doc.createElement("span");
      newSpan.textContent = "New first";

      div!.prepend(newSpan);

      expect(div!.firstChild).toBe(newSpan);
    });

    it("should update sibling references correctly", () => {
      const doc = parseHTML("<div><span>Existing</span></div>");
      const div = doc.querySelector("div");
      const existingSpan = div!.childNodes[0]!;
      const newSpan = doc.createElement("span");

      div!.prepend(newSpan);

      expect(newSpan.nextSibling).toBe(existingSpan);
      expect(existingSpan.previousSibling).toBe(newSpan);
    });
  });

  describe("Prepending strings", () => {
    it("should prepend a string as text node", () => {
      const doc = parseHTML("<div><span>Existing</span></div>");
      const div = doc.querySelector("div");

      div!.prepend("Hello ");

      expect(div!.childNodes.length).toBe(2);
      expect(div!.childNodes[0]!.nodeType).toBe(3);
      expect(div!.childNodes[0]!.textContent).toBe("Hello ");
    });

    it("should prepend multiple strings", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.prepend("A", "B", "C");

      expect(div!.childNodes.length).toBe(3);
      expect(div!.textContent).toBe("ABC");
    });

    it("should prepend empty string", () => {
      const doc = parseHTML("<div><span>Existing</span></div>");
      const div = doc.querySelector("div");

      div!.prepend("");

      expect(div!.childNodes.length).toBe(2);
      expect(div!.childNodes[0]!.nodeType).toBe(3);
    });

    it("should prepend mixed nodes and strings", () => {
      const doc = parseHTML("<div><span>Existing</span></div>");
      const div = doc.querySelector("div");
      const p = doc.createElement("p");
      p.textContent = "P";

      div!.prepend("Text", p);

      expect(div!.childNodes.length).toBe(3);
      expect(div!.childNodes[0]!.nodeType).toBe(3);
      expect((div!.childNodes[1] as Element).tagName).toBe("P");
      expect((div!.childNodes[2] as Element).tagName).toBe("SPAN");
    });

    it("should prepend string with HTML special characters", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.prepend("<b>bold</b> & 'quoted'");

      expect(div!.textContent).toBe("<b>bold</b> & 'quoted'");
      expect(div!.childNodes[0]!.nodeType).toBe(3);
    });
  });

  describe("Moving nodes (node already has parent)", () => {
    it("should move node from one parent to another", () => {
      const doc = parseHTML("<div><span>Child</span></div><p><em>Em</em></p>");
      const div = doc.querySelector("div");
      const p = doc.querySelector("p");
      const span = doc.querySelector("span");

      p!.prepend(span!);

      expect(div!.childNodes.length).toBe(0);
      expect(p!.childNodes.length).toBe(2);
      expect(p!.childNodes[0] ?? null).toBe(span);
      expect(span!.parentNode).toBe(p);
    });

    it("should update original parent sibling references", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div><p></p>",
      );
      const div = doc.querySelector("div");
      const p = doc.querySelector("p");
      const spanB = div!.childNodes[1]!;

      p!.prepend(spanB);

      expect(div!.childNodes.length).toBe(2);
      expect(div!.childNodes[0]?.nextSibling).toBe(div!.childNodes[1] ?? null);
    });
  });

  describe("Edge cases", () => {
    it("should handle no arguments", () => {
      const doc = parseHTML("<div><span>Existing</span></div>");
      const div = doc.querySelector("div");

      div!.prepend();

      expect(div!.childNodes.length).toBe(1);
    });

    it("should prepend text node", () => {
      const doc = parseHTML("<div><span>Existing</span></div>");
      const div = doc.querySelector("div");
      const textNode = doc.createTextNode("Hello");

      div!.prepend(textNode);

      expect(div!.childNodes.length).toBe(2);
      expect(div!.childNodes[0]!).toBe(textNode);
    });

    it("should prepend parsed comment node", () => {
      const doc = parseHTML("<div><!-- comment --></div>");
      const div = doc.querySelector("div");
      const comment = div!.childNodes[0]!;
      const target = parseHTML("<p><span>Existing</span></p>").querySelector(
        "p",
      );

      target!.prepend(comment);

      expect(target!.childNodes.length).toBe(2);
      expect(target!.childNodes[0]!.nodeType).toBe(8);
    });

    it("should handle deeply nested structure", () => {
      const doc = parseHTML("<div><span>Deep</span></div>");
      const div = doc.querySelector("div");
      const wrapper = doc.createElement("div");
      const inner = doc.createElement("div");
      const deepest = doc.createElement("span");
      deepest.textContent = "Deepest";
      inner.append(deepest);
      wrapper.append(inner);

      div!.prepend(wrapper);

      expect(
        div!.childNodes[0]!.childNodes[0]!.childNodes[0]!.textContent,
      ).toBe("Deepest");
    });

    it("should maintain order with many nodes", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");
      const nodes: any[] = [];
      for (let i = 0; i < 50; i++) {
        nodes.push(String(i));
      }

      div!.prepend(...nodes);

      expect(div!.childNodes.length).toBe(50);
      expect(div!.childNodes[0]!.textContent).toBe("0");
      expect(div!.childNodes[49]!.textContent).toBe("49");
    });

    it("should handle unicode strings", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.prepend("🚀 日本語");

      expect(div!.textContent).toBe("🚀 日本語");
    });
  });
});
