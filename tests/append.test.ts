import { describe, it, expect } from "bun:test";
import { parseHTML } from "../index";

describe("DOM Manipulation - append", () => {
  describe("Basic append functionality", () => {
    it("should append a node to an element", () => {
      const doc = parseHTML("<div><span>Existing</span></div>");
      const div = doc.querySelector("div");
      const newSpan = doc.createElement("span");
      newSpan.textContent = "New";

      div!.append(newSpan);

      expect(div!.childNodes.length).toBe(2);
      expect(div!.childNodes[0]!.textContent).toBe("Existing");
      expect(div!.childNodes[1]!.textContent).toBe("New");
    });

    it("should append multiple nodes", () => {
      const doc = parseHTML("<div><span>Existing</span></div>");
      const div = doc.querySelector("div");
      const span1 = doc.createElement("span");
      span1.textContent = "1";
      const span2 = doc.createElement("span");
      span2.textContent = "2";

      div!.append(span1, span2);

      expect(div!.childNodes.length).toBe(3);
      expect(div!.childNodes[0]!.textContent).toBe("Existing");
      expect(div!.childNodes[1]!.textContent).toBe("1");
      expect(div!.childNodes[2]!.textContent).toBe("2");
    });

    it("should append to empty element", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");
      const newSpan = doc.createElement("span");
      newSpan.textContent = "First";

      div!.append(newSpan);

      expect(div!.childNodes.length).toBe(1);
      expect(div!.childNodes[0]!.textContent).toBe("First");
    });

    it("should update parent reference of appended node", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");
      const span = doc.createElement("span");

      div!.append(span);

      expect(span.parentNode).toBe(div);
    });

    it("should update lastChild reference", () => {
      const doc = parseHTML("<div><span>First</span></div>");
      const div = doc.querySelector("div");
      const newSpan = doc.createElement("span");
      newSpan.textContent = "Last";

      div!.append(newSpan);

      expect(div!.lastChild).toBe(newSpan);
    });
  });

  describe("Appending strings", () => {
    it("should append a string as text node", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.append("Hello");

      expect(div!.childNodes.length).toBe(1);
      expect(div!.childNodes[0]!.nodeType).toBe(3);
      expect(div!.textContent).toBe("Hello");
    });

    it("should append multiple strings", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.append("Hello", " ", "World");

      expect(div!.childNodes.length).toBe(3);
      expect(div!.textContent).toBe("Hello World");
    });

    it("should append empty string", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.append("");

      expect(div!.childNodes.length).toBe(1);
      expect(div!.textContent).toBe("");
    });

    it("should append mixed nodes and strings", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");
      const span = doc.createElement("span");
      span.textContent = "Element";

      div!.append("Text ", span, " More text");

      expect(div!.childNodes.length).toBe(3);
      expect(div!.childNodes[0]!.nodeType).toBe(3);
      expect((div!.childNodes[1] as Element).tagName).toBe("SPAN");
      expect(div!.childNodes[2]!.nodeType).toBe(3);
    });

    it("should append string with special characters", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.append("<script>alert('xss')</script>");

      expect(div!.childNodes.length).toBe(1);
      expect(div!.childNodes[0]!.nodeType).toBe(3);
      expect(div!.textContent).toBe("<script>alert('xss')</script>");
    });

    it("should append string with unicode characters", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      div!.append("日本語 🎉 émoji");

      expect(div!.textContent).toBe("日本語 🎉 émoji");
    });
  });

  describe("Moving nodes (node already has parent)", () => {
    it("should move node from one parent to another", () => {
      const doc = parseHTML("<div><span>Child</span></div><p></p>");
      const div = doc.querySelector("div");
      const p = doc.querySelector("p");
      const span = doc.querySelector("span");

      p!.append(span!);

      expect(div!.childNodes.length).toBe(0);
      expect(p!.childNodes.length).toBe(1);
      expect(span!.parentNode).toBe(p);
    });

    it("should update sibling references when moving node", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div><p></p>",
      );
      const div = doc.querySelector("div");
      const p = doc.querySelector("p");
      const spanB = div!.childNodes[1]!;

      p!.append(spanB);

      expect(div!.childNodes.length).toBe(2);
      expect(div!.childNodes[0]?.nextSibling).toBe(div!.childNodes[1] ?? null);
      expect(div!.childNodes[1]?.previousSibling).toBe(
        div!.childNodes[0] ?? null,
      );
    });

    it("should handle moving multiple nodes in sequence", () => {
      const doc = parseHTML("<div><span>1</span><span>2</span></div><p></p>");
      const div = doc.querySelector("div");
      const p = doc.querySelector("p");
      const span1 = div!.childNodes[0]!;
      const span2 = div!.childNodes[1]!;

      p!.append(span1, span2);

      expect(div!.childNodes.length).toBe(0);
      expect(p!.childNodes.length).toBe(2);
    });
  });

  describe("Edge cases", () => {
    it("should handle no arguments", () => {
      const doc = parseHTML("<div><span>Existing</span></div>");
      const div = doc.querySelector("div");

      div!.append();

      expect(div!.childNodes.length).toBe(1);
    });

    it("should handle deeply nested elements", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");
      const level1 = doc.createElement("div");
      const level2 = doc.createElement("div");
      const level3 = doc.createElement("div");
      level2.append(level3);
      level1.append(level2);

      div!.append(level1);

      expect(div!.childNodes.length).toBe(1);
      expect(div!.childNodes[0]!.childNodes[0]!.childNodes[0]).toBe(level3);
    });

    it("should append parsed comment nodes", () => {
      const doc = parseHTML("<div><!-- existing --></div>");
      const div = doc.querySelector("div");
      const comment = div!.childNodes[0]!;
      const target = parseHTML("<p></p>").querySelector("p");

      target!.append(comment);

      expect(target!.childNodes.length).toBe(1);
      expect(target!.childNodes[0]!.nodeType).toBe(8);
    });

    it("should maintain order when appending many nodes", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");
      const nodes: any[] = [];
      for (let i = 0; i < 100; i++) {
        const span = doc.createElement("span");
        span.textContent = String(i);
        nodes.push(span);
      }

      div!.append(...nodes);

      expect(div!.childNodes.length).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(div!.childNodes[i]!.textContent).toBe(String(i));
      }
    });

    it("should handle appending to void-like elements", () => {
      const doc = parseHTML("<div></div>");
      const input = doc.createElement("input");
      const span = doc.createElement("span");

      input.append(span);

      expect(input.childNodes.length).toBe(1);
    });
  });
});
