import { describe, it, expect } from "bun:test";
import { parseHTML } from "../index";
import { NodeType } from "../src/dom-simulator";

describe("DOM Manipulation - insertBefore", () => {
  describe("Basic insertBefore functionality", () => {
    it("should insert a node before another node in the middle", () => {
      const doc = parseHTML("<div><span>First</span><span>Third</span></div>");
      const div = doc.querySelector("div");
      const firstSpan = div.childNodes[0];
      const thirdSpan = div.childNodes[1];

      const newSpan = doc.createElement("span");
      newSpan.textContent = "Second";

      div.insertBefore(newSpan, thirdSpan);

      expect(div.childNodes.length).toBe(3);
      expect(div.childNodes[0]).toBe(firstSpan);
      expect(div.childNodes[1]).toBe(newSpan);
      expect(div.childNodes[2]).toBe(thirdSpan);
    });

    it("should insert a node at the beginning", () => {
      const doc = parseHTML("<div><span>Second</span><span>Third</span></div>");
      const div = doc.querySelector("div");
      const secondSpan = div.childNodes[0];

      const newSpan = doc.createElement("span");
      newSpan.textContent = "First";

      div.insertBefore(newSpan, secondSpan);

      expect(div.childNodes.length).toBe(3);
      expect(div.childNodes[0]).toBe(newSpan);
      expect(div.childNodes[1]).toBe(secondSpan);
      expect(div.firstChild).toBe(newSpan);
    });

    it("should append when reference node is null", () => {
      const doc = parseHTML("<div><span>First</span></div>");
      const div = doc.querySelector("div");

      const newSpan = doc.createElement("span");
      newSpan.textContent = "Last";

      div.insertBefore(newSpan, null);

      expect(div.childNodes.length).toBe(2);
      expect(div.childNodes[1]).toBe(newSpan);
      expect(div.lastChild).toBe(newSpan);
    });

    it("should throw error when reference node is not a child", () => {
      const doc = parseHTML("<div><span>Child</span></div>");
      const div = doc.querySelector("div");
      const otherSpan = doc.createElement("span");
      const newSpan = doc.createElement("span");

      expect(() => {
        div.insertBefore(newSpan, otherSpan);
      }).toThrow("Reference node is not a child of this node");
    });
  });

  describe("insertBefore with text nodes", () => {
    it("should insert text node before element node", () => {
      const doc = parseHTML("<div><span>Element</span></div>");
      const div = doc.querySelector("div");
      const span = div.childNodes[0];

      const textNode = doc.createTextNode("Text before ");

      div.insertBefore(textNode, span);

      expect(div.childNodes.length).toBe(2);
      expect(div.childNodes[0]).toBe(textNode);
      expect(div.childNodes[1]).toBe(span);
      expect(div.firstChild).toBe(textNode);
    });

    it("should insert element node before text node", () => {
      const doc = parseHTML("<div>Some text</div>");
      const div = doc.querySelector("div");
      const textNode = div.childNodes[0];

      const span = doc.createElement("span");
      span.textContent = "Element";

      div.insertBefore(span, textNode);

      expect(div.childNodes.length).toBe(2);
      expect(div.childNodes[0]).toBe(span);
      expect(div.childNodes[1]).toBe(textNode);
    });
  });

  describe("insertBefore sibling relationships", () => {
    it("should update nextSibling and previousSibling correctly", () => {
      const doc = parseHTML("<div><span>A</span><span>C</span></div>");
      const div = doc.querySelector("div");
      const spanA = div.childNodes[0];
      const spanC = div.childNodes[1];

      const spanB = doc.createElement("span");
      spanB.textContent = "B";

      div.insertBefore(spanB, spanC);

      expect(spanA.nextSibling).toBe(spanB);
      expect(spanB.previousSibling).toBe(spanA);
      expect(spanB.nextSibling).toBe(spanC);
      expect(spanC.previousSibling).toBe(spanB);
    });

    it("should update firstChild when inserting at beginning", () => {
      const doc = parseHTML("<div><span>Second</span></div>");
      const div = doc.querySelector("div");
      const secondSpan = div.childNodes[0];

      const firstSpan = doc.createElement("span");
      firstSpan.textContent = "First";

      div.insertBefore(firstSpan, secondSpan);

      expect(div.firstChild).toBe(firstSpan);
      expect(firstSpan.previousSibling).toBeNull();
      expect(firstSpan.nextSibling).toBe(secondSpan);
    });

    it("should not change lastChild when inserting before last", () => {
      const doc = parseHTML("<div><span>A</span><span>C</span></div>");
      const div = doc.querySelector("div");
      const spanC = div.childNodes[1];

      const spanB = doc.createElement("span");
      div.insertBefore(spanB, spanC);

      expect(div.lastChild).toBe(spanC);
    });
  });

  describe("insertBefore element-specific relationships", () => {
    it("should update children array correctly", () => {
      const doc = parseHTML("<div><span>A</span><span>C</span></div>");
      const div = doc.querySelector("div");
      const spanC = div.children[1];

      const spanB = doc.createElement("span");
      spanB.textContent = "B";

      div.insertBefore(spanB, spanC);

      expect(div.children.length).toBe(3);
      expect(div.children[0].textContent).toBe("A");
      expect(div.children[1]).toBe(spanB);
      expect(div.children[2]).toBe(spanC);
    });

    it("should update nextElementSibling and previousElementSibling", () => {
      const doc = parseHTML("<div><span>A</span><span>C</span></div>");
      const div = doc.querySelector("div");
      const spanA = div.children[0];
      const spanC = div.children[1];

      const spanB = doc.createElement("span");
      div.insertBefore(spanB, spanC);

      expect(spanA.nextElementSibling).toBe(spanB);
      expect(spanB.previousElementSibling).toBe(spanA);
      expect(spanB.nextElementSibling).toBe(spanC);
      expect(spanC.previousElementSibling).toBe(spanB);
    });

    it("should update firstElementChild when inserting element at beginning", () => {
      const doc = parseHTML("<div><span>Second</span></div>");
      const div = doc.querySelector("div");
      const secondSpan = div.childNodes[0];

      const firstSpan = doc.createElement("span");
      div.insertBefore(firstSpan, secondSpan);

      expect(div.firstElementChild).toBe(firstSpan);
    });

    it("should handle inserting element before text node", () => {
      const doc = parseHTML("<div>Text<span>After</span></div>");
      const div = doc.querySelector("div");
      const textNode = div.childNodes[0];
      const spanAfter = div.childNodes[1];

      const spanBefore = doc.createElement("span");
      spanBefore.textContent = "Before";

      div.insertBefore(spanBefore, textNode);

      expect(div.children.length).toBe(2);
      expect(div.children[0]).toBe(spanBefore);
      expect(div.children[1]).toBe(spanAfter);
      expect(div.firstElementChild).toBe(spanBefore);
      expect(spanBefore.nextElementSibling).toBe(spanAfter);
    });
  });

  describe("insertBefore synchronization", () => {
    it("should update innerHTML after inserting node", () => {
      const doc = parseHTML("<div><span>A</span><span>C</span></div>");
      const div = doc.querySelector("div");
      const spanC = div.childNodes[1];

      const spanB = doc.createElement("span");
      spanB.textContent = "B";

      div.insertBefore(spanB, spanC);

      expect(div.innerHTML).toBe("<span>A</span><span>B</span><span>C</span>");
    });

    it("should update outerHTML of parent after inserting node", () => {
      const doc = parseHTML("<div><span>A</span></div>");
      const div = doc.querySelector("div");
      const spanA = div.childNodes[0];

      const spanB = doc.createElement("span");
      spanB.textContent = "B";

      div.insertBefore(spanB, spanA);

      expect(div.outerHTML).toBe("<div><span>B</span><span>A</span></div>");
    });

    it("should update textContent correctly", () => {
      const doc = parseHTML("<div><span>World</span></div>");
      const div = doc.querySelector("div");
      const spanWorld = div.childNodes[0];

      const textNode = doc.createTextNode("Hello ");
      div.insertBefore(textNode, spanWorld);

      expect(div.textContent).toBe("Hello World");
    });

    it("should set parentNode correctly", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      const span = doc.createElement("span");
      div.insertBefore(span, null);

      expect(span.parentNode).toBe(div);
      expect(span.parentElement).toBe(div);
    });
  });

  describe("insertBefore with node relocation", () => {
    it("should remove node from previous parent when inserting", () => {
      const doc = parseHTML(
        "<div id='parent1'><span>Child</span></div><div id='parent2'></div>"
      );
      const parent1 = doc.querySelector("#parent1");
      const parent2 = doc.querySelector("#parent2");
      const child = parent1.querySelector("span");

      parent2.insertBefore(child, null);

      expect(parent1.childNodes.length).toBe(0);
      expect(parent2.childNodes.length).toBe(1);
      expect(child.parentNode).toBe(parent2);
    });

    it("should update all relationships when moving node between parents", () => {
      const doc = parseHTML(
        "<div id='p1'><span>A</span><span>B</span></div><div id='p2'><span>C</span></div>"
      );
      const parent1 = doc.querySelector("#p1");
      const parent2 = doc.querySelector("#p2");
      const spanB = parent1.children[1];
      const spanC = parent2.children[0];

      parent2.insertBefore(spanB, spanC);

      expect(parent1.children.length).toBe(1);
      expect(parent2.children.length).toBe(2);
      expect(spanB.parentNode).toBe(parent2);
      expect(spanB.nextElementSibling).toBe(spanC);
      expect(spanC.previousElementSibling).toBe(spanB);
    });
  });
});

describe("DOM Manipulation - replaceChild", () => {
  describe("Basic replaceChild functionality", () => {
    it("should replace a child node with a new node", () => {
      const doc = parseHTML("<div><span>Old</span></div>");
      const div = doc.querySelector("div");
      const oldSpan = div.childNodes[0];

      const newSpan = doc.createElement("span");
      newSpan.textContent = "New";

      const returned = div.replaceChild(newSpan, oldSpan);

      expect(returned).toBe(oldSpan);
      expect(div.childNodes.length).toBe(1);
      expect(div.childNodes[0]).toBe(newSpan);
      expect(div.childNodes[0]).not.toBe(oldSpan);
    });

    it("should throw error when old child is not a child of parent", () => {
      const doc = parseHTML("<div><span>Child</span></div>");
      const div = doc.querySelector("div");
      const notAChild = doc.createElement("span");
      const newSpan = doc.createElement("span");

      expect(() => {
        div.replaceChild(newSpan, notAChild);
      }).toThrow("Old child is not a child of this node");
    });

    it("should replace middle child in multiple children", () => {
      const doc = parseHTML(
        "<div><span>First</span><span>Old</span><span>Third</span></div>"
      );
      const div = doc.querySelector("div");
      const oldSpan = div.childNodes[1];

      const newSpan = doc.createElement("span");
      newSpan.textContent = "New";

      div.replaceChild(newSpan, oldSpan);

      expect(div.childNodes.length).toBe(3);
      expect(div.childNodes[1]).toBe(newSpan);
      expect(div.childNodes[1].textContent).toBe("New");
    });
  });

  describe("replaceChild with different node types", () => {
    it("should replace element with text node", () => {
      const doc = parseHTML("<div><span>Element</span></div>");
      const div = doc.querySelector("div");
      const span = div.childNodes[0];

      const textNode = doc.createTextNode("Just text");
      div.replaceChild(textNode, span);

      expect(div.childNodes.length).toBe(1);
      expect(div.childNodes[0].nodeType).toBe(NodeType.TEXT_NODE);
      expect(div.childNodes[0].textContent).toBe("Just text");
      expect(div.children.length).toBe(0);
    });

    it("should replace text node with element", () => {
      const doc = parseHTML("<div>Text</div>");
      const div = doc.querySelector("div");
      const textNode = div.childNodes[0];

      const span = doc.createElement("span");
      span.textContent = "Element";

      div.replaceChild(span, textNode);

      expect(div.childNodes.length).toBe(1);
      expect(div.childNodes[0].nodeType).toBe(NodeType.ELEMENT_NODE);
      expect(div.children.length).toBe(1);
      expect(div.children[0]).toBe(span);
    });

    it("should replace text node with text node", () => {
      const doc = parseHTML("<div>Old text</div>");
      const div = doc.querySelector("div");
      const oldText = div.childNodes[0];

      const newText = doc.createTextNode("New text");
      div.replaceChild(newText, oldText);

      expect(div.childNodes.length).toBe(1);
      expect(div.childNodes[0]).toBe(newText);
      expect(div.textContent).toBe("New text");
    });
  });

  describe("replaceChild sibling relationships", () => {
    it("should transfer sibling relationships to new node", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>Old</span><span>C</span></div>"
      );
      const div = doc.querySelector("div");
      const spanA = div.childNodes[0];
      const oldSpan = div.childNodes[1];
      const spanC = div.childNodes[2];

      const newSpan = doc.createElement("span");
      newSpan.textContent = "B";

      div.replaceChild(newSpan, oldSpan);

      expect(spanA.nextSibling).toBe(newSpan);
      expect(newSpan.previousSibling).toBe(spanA);
      expect(newSpan.nextSibling).toBe(spanC);
      expect(spanC.previousSibling).toBe(newSpan);
    });

    it("should update firstChild when replacing first child", () => {
      const doc = parseHTML("<div><span>Old</span><span>Second</span></div>");
      const div = doc.querySelector("div");
      const oldSpan = div.childNodes[0];

      const newSpan = doc.createElement("span");
      newSpan.textContent = "New";

      div.replaceChild(newSpan, oldSpan);

      expect(div.firstChild).toBe(newSpan);
      expect(newSpan.previousSibling).toBeNull();
    });

    it("should update lastChild when replacing last child", () => {
      const doc = parseHTML("<div><span>First</span><span>Old</span></div>");
      const div = doc.querySelector("div");
      const oldSpan = div.childNodes[1];

      const newSpan = doc.createElement("span");
      newSpan.textContent = "New";

      div.replaceChild(newSpan, oldSpan);

      expect(div.lastChild).toBe(newSpan);
      expect(newSpan.nextSibling).toBeNull();
    });

    it("should clear old child's relationships", () => {
      const doc = parseHTML("<div><span>A</span><span>Old</span><span>C</span></div>");
      const div = doc.querySelector("div");
      const oldSpan = div.childNodes[1];

      const newSpan = doc.createElement("span");
      div.replaceChild(newSpan, oldSpan);

      expect(oldSpan.parentNode).toBeNull();
      expect(oldSpan.parentElement).toBeNull();
      expect(oldSpan.previousSibling).toBeNull();
      expect(oldSpan.nextSibling).toBeNull();
    });
  });

  describe("replaceChild element-specific relationships", () => {
    it("should update children array when replacing element with element", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>Old</span><span>C</span></div>"
      );
      const div = doc.querySelector("div");
      const oldSpan = div.children[1];

      const newSpan = doc.createElement("span");
      newSpan.textContent = "B";

      div.replaceChild(newSpan, oldSpan);

      expect(div.children.length).toBe(3);
      expect(div.children[1]).toBe(newSpan);
      expect(div.children[1].textContent).toBe("B");
    });

    it("should update element sibling relationships", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>Old</span><span>C</span></div>"
      );
      const div = doc.querySelector("div");
      const spanA = div.children[0];
      const oldSpan = div.children[1];
      const spanC = div.children[2];

      const newSpan = doc.createElement("span");
      div.replaceChild(newSpan, oldSpan);

      expect(spanA.nextElementSibling).toBe(newSpan);
      expect(newSpan.previousElementSibling).toBe(spanA);
      expect(newSpan.nextElementSibling).toBe(spanC);
      expect(spanC.previousElementSibling).toBe(newSpan);
    });

    it("should update firstElementChild when replacing first element", () => {
      const doc = parseHTML("<div><span>Old</span><span>Second</span></div>");
      const div = doc.querySelector("div");
      const oldSpan = div.children[0];

      const newSpan = doc.createElement("span");
      div.replaceChild(newSpan, oldSpan);

      expect(div.firstElementChild).toBe(newSpan);
    });

    it("should update lastElementChild when replacing last element", () => {
      const doc = parseHTML("<div><span>First</span><span>Old</span></div>");
      const div = doc.querySelector("div");
      const oldSpan = div.children[1];

      const newSpan = doc.createElement("span");
      div.replaceChild(newSpan, oldSpan);

      expect(div.lastElementChild).toBe(newSpan);
    });

    it("should remove from children array when replacing element with text", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>Old</span><span>C</span></div>"
      );
      const div = doc.querySelector("div");
      const spanA = div.children[0];
      const oldSpan = div.children[1];
      const spanC = div.children[2];

      const textNode = doc.createTextNode("Text");
      div.replaceChild(textNode, oldSpan);

      expect(div.children.length).toBe(2);
      expect(div.children[0]).toBe(spanA);
      expect(div.children[1]).toBe(spanC);
      expect(spanA.nextElementSibling).toBe(spanC);
      expect(spanC.previousElementSibling).toBe(spanA);
    });

    it("should add to children array when replacing text with element", () => {
      const doc = parseHTML("<div><span>A</span>Text<span>C</span></div>");
      const div = doc.querySelector("div");
      const textNode = div.childNodes[1];

      const newSpan = doc.createElement("span");
      newSpan.textContent = "B";

      div.replaceChild(newSpan, textNode);

      expect(div.children.length).toBe(3);
      expect(div.children[1]).toBe(newSpan);
      expect(div.children[0].nextElementSibling).toBe(newSpan);
      expect(div.children[2].previousElementSibling).toBe(newSpan);
    });
  });

  describe("replaceChild synchronization", () => {
    it("should update innerHTML after replacement", () => {
      const doc = parseHTML("<div><span>Old</span></div>");
      const div = doc.querySelector("div");
      const oldSpan = div.childNodes[0];

      const newSpan = doc.createElement("span");
      newSpan.textContent = "New";

      div.replaceChild(newSpan, oldSpan);

      expect(div.innerHTML).toBe("<span>New</span>");
    });

    it("should update outerHTML after replacement", () => {
      const doc = parseHTML("<div><span>Old</span></div>");
      const div = doc.querySelector("div");
      const oldSpan = div.childNodes[0];

      const newSpan = doc.createElement("b");
      newSpan.textContent = "Bold";

      div.replaceChild(newSpan, oldSpan);

      expect(div.outerHTML).toBe("<div><b>Bold</b></div>");
    });

    it("should update textContent correctly", () => {
      const doc = parseHTML("<div><span>Old</span></div>");
      const div = doc.querySelector("div");
      const oldSpan = div.childNodes[0];

      const newSpan = doc.createElement("span");
      newSpan.textContent = "New Text";

      div.replaceChild(newSpan, oldSpan);

      expect(div.textContent).toBe("New Text");
    });
  });

  describe("replaceChild with node relocation", () => {
    it("should remove node from previous parent before replacing", () => {
      const doc = parseHTML(
        "<div id='p1'><span>Moving</span></div><div id='p2'><span>Old</span></div>"
      );
      const parent1 = doc.querySelector("#p1");
      const parent2 = doc.querySelector("#p2");
      const movingSpan = parent1.querySelector("span");
      const oldSpan = parent2.querySelector("span");

      parent2.replaceChild(movingSpan, oldSpan);

      expect(parent1.childNodes.length).toBe(0);
      expect(parent2.childNodes.length).toBe(1);
      expect(movingSpan.parentNode).toBe(parent2);
    });
  });
});

describe("DOM Manipulation - insertAfter", () => {
  describe("Basic insertAfter functionality", () => {
    it("should insert node after reference node", () => {
      const doc = parseHTML("<div><span>First</span><span>Third</span></div>");
      const div = doc.querySelector("div");
      const firstSpan = div.childNodes[0];

      const secondSpan = doc.createElement("span");
      secondSpan.textContent = "Second";

      div.insertAfter(secondSpan, firstSpan);

      expect(div.childNodes.length).toBe(3);
      expect(div.childNodes[0]).toBe(firstSpan);
      expect(div.childNodes[1]).toBe(secondSpan);
      expect(firstSpan.nextSibling).toBe(secondSpan);
    });

    it("should insert at end when reference node is last child", () => {
      const doc = parseHTML("<div><span>First</span></div>");
      const div = doc.querySelector("div");
      const firstSpan = div.childNodes[0];

      const secondSpan = doc.createElement("span");
      secondSpan.textContent = "Second";

      div.insertAfter(secondSpan, firstSpan);

      expect(div.childNodes.length).toBe(2);
      expect(div.lastChild).toBe(secondSpan);
      expect(firstSpan.nextSibling).toBe(secondSpan);
    });

    it("should insert at beginning when reference node is null", () => {
      const doc = parseHTML("<div><span>Second</span></div>");
      const div = doc.querySelector("div");

      const firstSpan = doc.createElement("span");
      firstSpan.textContent = "First";

      div.insertAfter(firstSpan, null);

      expect(div.childNodes.length).toBe(2);
      expect(div.firstChild).toBe(firstSpan);
    });

    it("should throw error when reference node is not a child", () => {
      const doc = parseHTML("<div><span>Child</span></div>");
      const div = doc.querySelector("div");
      const notAChild = doc.createElement("span");
      const newSpan = doc.createElement("span");

      expect(() => {
        div.insertAfter(newSpan, notAChild);
      }).toThrow("Reference node is not a child of this node");
    });
  });

  describe("insertAfter synchronization", () => {
    it("should update innerHTML correctly", () => {
      const doc = parseHTML("<div><span>A</span><span>C</span></div>");
      const div = doc.querySelector("div");
      const spanA = div.childNodes[0];

      const spanB = doc.createElement("span");
      spanB.textContent = "B";

      div.insertAfter(spanB, spanA);

      expect(div.innerHTML).toBe("<span>A</span><span>B</span><span>C</span>");
    });

    it("should update sibling relationships correctly", () => {
      const doc = parseHTML("<div><span>A</span><span>C</span></div>");
      const div = doc.querySelector("div");
      const spanA = div.childNodes[0];
      const spanC = div.childNodes[1];

      const spanB = doc.createElement("span");
      div.insertAfter(spanB, spanA);

      expect(spanA.nextSibling).toBe(spanB);
      expect(spanB.previousSibling).toBe(spanA);
      expect(spanB.nextSibling).toBe(spanC);
      expect(spanC.previousSibling).toBe(spanB);
    });
  });
});
