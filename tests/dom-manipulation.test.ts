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
        "<div id='parent1'><span>Child</span></div><div id='parent2'></div>",
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
        "<div id='p1'><span>A</span><span>B</span></div><div id='p2'><span>C</span></div>",
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
        "<div><span>First</span><span>Old</span><span>Third</span></div>",
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
        "<div><span>A</span><span>Old</span><span>C</span></div>",
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
      const doc = parseHTML(
        "<div><span>A</span><span>Old</span><span>C</span></div>",
      );
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
        "<div><span>A</span><span>Old</span><span>C</span></div>",
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
        "<div><span>A</span><span>Old</span><span>C</span></div>",
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
        "<div><span>A</span><span>Old</span><span>C</span></div>",
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
        "<div id='p1'><span>Moving</span></div><div id='p2'><span>Old</span></div>",
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

describe("DOM Manipulation - prepend", () => {
  describe("Basic prepend functionality", () => {
    it("should prepend a single node to an element with children", () => {
      const doc = parseHTML("<div><span>Second</span><span>Third</span></div>");
      const div = doc.querySelector("div");
      const secondSpan = div.childNodes[0];

      const newSpan = doc.createElement("span");
      newSpan.textContent = "First";

      div.prepend(newSpan);

      expect(div.childNodes.length).toBe(3);
      expect(div.childNodes[0]).toBe(newSpan);
      expect(div.childNodes[1]).toBe(secondSpan);
      expect(div.firstChild).toBe(newSpan);
    });

    it("should prepend a node to an empty element", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      const span = doc.createElement("span");
      span.textContent = "First";

      div.prepend(span);

      expect(div.childNodes.length).toBe(1);
      expect(div.childNodes[0]).toBe(span);
      expect(div.firstChild).toBe(span);
      expect(div.lastChild).toBe(span);
    });

    it("should prepend multiple nodes", () => {
      const doc = parseHTML("<div><span>Third</span></div>");
      const div = doc.querySelector("div");

      const first = doc.createElement("span");
      first.textContent = "First";
      const second = doc.createElement("span");
      second.textContent = "Second";

      div.prepend(first, second);

      expect(div.childNodes.length).toBe(3);
      expect(div.childNodes[0]).toBe(first);
      expect(div.childNodes[1]).toBe(second);
      expect(div.childNodes[2].textContent).toBe("Third");
      expect(div.firstChild).toBe(first);
    });

    it("should prepend with string argument", () => {
      const doc = parseHTML("<div><span>Element</span></div>");
      const div = doc.querySelector("div");

      div.prepend("Text before ");

      expect(div.childNodes.length).toBe(2);
      expect(div.childNodes[0].nodeType).toBe(NodeType.TEXT_NODE);
      expect(div.childNodes[0].textContent).toBe("Text before ");
      expect(div.firstChild.nodeValue).toBe("Text before ");
    });

    it("should prepend mixed nodes and strings", () => {
      const doc = parseHTML("<div><span>Last</span></div>");
      const div = doc.querySelector("div");

      const span = doc.createElement("span");
      span.textContent = "Second";

      div.prepend("First ", span);

      expect(div.childNodes.length).toBe(3);
      expect(div.childNodes[0].nodeType).toBe(NodeType.TEXT_NODE);
      expect(div.childNodes[0].textContent).toBe("First ");
      expect(div.childNodes[1]).toBe(span);
      expect(div.childNodes[2].textContent).toBe("Last");
    });

    it("should do nothing when called with no arguments", () => {
      const doc = parseHTML("<div><span>Only</span></div>");
      const div = doc.querySelector("div");
      const originalLength = div.childNodes.length;

      div.prepend();

      expect(div.childNodes.length).toBe(originalLength);
    });
  });

  describe("prepend with text nodes", () => {
    it("should prepend text node before elements", () => {
      const doc = parseHTML("<div><span>Element</span></div>");
      const div = doc.querySelector("div");
      const span = div.childNodes[0];

      const textNode = doc.createTextNode("Text ");

      div.prepend(textNode);

      expect(div.childNodes.length).toBe(2);
      expect(div.childNodes[0]).toBe(textNode);
      expect(div.childNodes[1]).toBe(span);
      expect(div.firstChild).toBe(textNode);
    });
  });

  describe("prepend sibling relationships", () => {
    it("should update nextSibling and previousSibling correctly", () => {
      const doc = parseHTML("<div><span>B</span><span>C</span></div>");
      const div = doc.querySelector("div");
      const spanB = div.childNodes[0];

      const spanA = doc.createElement("span");
      spanA.textContent = "A";

      div.prepend(spanA);

      expect(spanA.nextSibling).toBe(spanB);
      expect(spanA.previousSibling).toBeNull();
      expect(spanB.previousSibling).toBe(spanA);
      expect(div.firstChild).toBe(spanA);
    });

    it("should update element sibling relationships", () => {
      const doc = parseHTML("<div><span>B</span></div>");
      const div = doc.querySelector("div");
      const spanB = div.childNodes[0];

      const spanA = doc.createElement("span");
      spanA.textContent = "A";

      div.prepend(spanA);

      expect(spanA.nextElementSibling).toBe(spanB);
      expect(spanA.previousElementSibling).toBeNull();
      expect(spanB.previousElementSibling).toBe(spanA);
      expect(div.firstElementChild).toBe(spanA);
    });
  });

  describe("prepend with parent relocation", () => {
    it("should move node from another parent when prepending", () => {
      const doc = parseHTML(
        "<div id='a'><span>Child</span></div><div id='b'><span>Other</span></div>",
      );
      const divA = doc.querySelector("#a");
      const divB = doc.querySelector("#b");
      const child = divA.querySelector("span");

      divB.prepend(child);

      expect(divA.childNodes.length).toBe(0);
      expect(divB.childNodes.length).toBe(2);
      expect(divB.firstChild).toBe(child);
      expect(child.parentNode).toBe(divB);
    });

    it("should remove from old parent before prepending", () => {
      const doc = parseHTML(
        "<div id='a'><span id='1'>1</span><span id='2'>2</span></div><div id='b'></div>",
      );
      const divA = doc.querySelector("#a");
      const divB = doc.querySelector("#b");
      const span1 = doc.querySelector("#1");

      divB.prepend(span1);

      expect(divA.childNodes.length).toBe(1);
      expect(divA.childNodes[0].textContent).toBe("2");
      expect(divB.childNodes.length).toBe(1);
      expect(divB.firstChild).toBe(span1);
    });
  });

  describe("prepend synchronization", () => {
    it("should update innerHTML correctly", () => {
      const doc = parseHTML("<div><span>B</span><span>C</span></div>");
      const div = doc.querySelector("div");

      const spanA = doc.createElement("span");
      spanA.textContent = "A";

      div.prepend(spanA);

      expect(div.innerHTML).toBe("<span>A</span><span>B</span><span>C</span>");
    });

    it("should update innerHTML with multiple prepends", () => {
      const doc = parseHTML("<div><span>C</span></div>");
      const div = doc.querySelector("div");

      const spanA = doc.createElement("span");
      spanA.textContent = "A";
      const spanB = doc.createElement("span");
      spanB.textContent = "B";

      div.prepend(spanA, spanB);

      expect(div.innerHTML).toBe("<span>A</span><span>B</span><span>C</span>");
    });

    it("should update textContent correctly", () => {
      const doc = parseHTML("<div><span>Second</span></div>");
      const div = doc.querySelector("div");

      div.prepend("First ");

      expect(div.textContent).toBe("First Second");
    });
  });

  describe("prepend on document", () => {
    it("should prepend to document", () => {
      const doc = parseHTML("<div>Content</div>");
      const initialChildCount = doc.childNodes.length;
      const firstChild = doc.firstChild;

      const newDiv = doc.createElement("div");
      newDiv.textContent = "Prepended";

      doc.prepend(newDiv);

      expect(doc.firstChild).toBe(newDiv);
      expect(newDiv.nextSibling).toBe(firstChild);
      expect(doc.childNodes.length).toBe(initialChildCount + 1);
    });
  });
});

describe("DOM Manipulation - append", () => {
  describe("Basic append functionality", () => {
    it("should append a single node to an element with children", () => {
      const doc = parseHTML("<div><span>First</span><span>Second</span></div>");
      const div = doc.querySelector("div");
      const secondSpan = div.childNodes[1];

      const newSpan = doc.createElement("span");
      newSpan.textContent = "Third";

      div.append(newSpan);

      expect(div.childNodes.length).toBe(3);
      expect(div.childNodes[2]).toBe(newSpan);
      expect(div.lastChild).toBe(newSpan);
      expect(secondSpan.nextSibling).toBe(newSpan);
    });

    it("should append a node to an empty element", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      const span = doc.createElement("span");
      span.textContent = "First";

      div.append(span);

      expect(div.childNodes.length).toBe(1);
      expect(div.childNodes[0]).toBe(span);
      expect(div.firstChild).toBe(span);
      expect(div.lastChild).toBe(span);
    });

    it("should append multiple nodes", () => {
      const doc = parseHTML("<div><span>First</span></div>");
      const div = doc.querySelector("div");

      const second = doc.createElement("span");
      second.textContent = "Second";
      const third = doc.createElement("span");
      third.textContent = "Third";

      div.append(second, third);

      expect(div.childNodes.length).toBe(3);
      expect(div.childNodes[1]).toBe(second);
      expect(div.childNodes[2]).toBe(third);
      expect(div.lastChild).toBe(third);
    });

    it("should append with string argument", () => {
      const doc = parseHTML("<div><span>Element</span></div>");
      const div = doc.querySelector("div");

      div.append(" text after");

      expect(div.childNodes.length).toBe(2);
      expect(div.childNodes[1].nodeType).toBe(NodeType.TEXT_NODE);
      expect(div.childNodes[1].textContent).toBe(" text after");
      expect(div.lastChild.nodeValue).toBe(" text after");
    });

    it("should append mixed nodes and strings", () => {
      const doc = parseHTML("<div><span>First</span></div>");
      const div = doc.querySelector("div");

      const span = doc.createElement("span");
      span.textContent = "Second";

      div.append(span, " and text");

      expect(div.childNodes.length).toBe(3);
      expect(div.childNodes[1]).toBe(span);
      expect(div.childNodes[2].nodeType).toBe(NodeType.TEXT_NODE);
      expect(div.childNodes[2].textContent).toBe(" and text");
    });

    it("should do nothing when called with no arguments", () => {
      const doc = parseHTML("<div><span>Only</span></div>");
      const div = doc.querySelector("div");
      const originalLength = div.childNodes.length;

      div.append();

      expect(div.childNodes.length).toBe(originalLength);
    });
  });

  describe("append with text nodes", () => {
    it("should append text node after elements", () => {
      const doc = parseHTML("<div><span>Element</span></div>");
      const div = doc.querySelector("div");
      const span = div.childNodes[0];

      const textNode = doc.createTextNode(" Text");

      div.append(textNode);

      expect(div.childNodes.length).toBe(2);
      expect(div.childNodes[1]).toBe(textNode);
      expect(div.lastChild).toBe(textNode);
    });
  });

  describe("append sibling relationships", () => {
    it("should update nextSibling and previousSibling correctly", () => {
      const doc = parseHTML("<div><span>A</span><span>B</span></div>");
      const div = doc.querySelector("div");
      const spanB = div.childNodes[1];

      const spanC = doc.createElement("span");
      spanC.textContent = "C";

      div.append(spanC);

      expect(spanB.nextSibling).toBe(spanC);
      expect(spanC.previousSibling).toBe(spanB);
      expect(spanC.nextSibling).toBeNull();
      expect(div.lastChild).toBe(spanC);
    });

    it("should update element sibling relationships", () => {
      const doc = parseHTML("<div><span>A</span></div>");
      const div = doc.querySelector("div");
      const spanA = div.childNodes[0];

      const spanB = doc.createElement("span");
      spanB.textContent = "B";

      div.append(spanB);

      expect(spanA.nextElementSibling).toBe(spanB);
      expect(spanB.previousElementSibling).toBe(spanA);
      expect(spanB.nextElementSibling).toBeNull();
      expect(div.lastElementChild).toBe(spanB);
    });
  });

  describe("append with parent relocation", () => {
    it("should move node from another parent when appending", () => {
      const doc = parseHTML(
        "<div id='a'><span>Child</span></div><div id='b'><span>Other</span></div>",
      );
      const divA = doc.querySelector("#a");
      const divB = doc.querySelector("#b");
      const child = divA.querySelector("span");

      divB.append(child);

      expect(divA.childNodes.length).toBe(0);
      expect(divB.childNodes.length).toBe(2);
      expect(divB.lastChild).toBe(child);
      expect(child.parentNode).toBe(divB);
    });

    it("should remove from old parent before appending", () => {
      const doc = parseHTML(
        "<div id='a'><span id='1'>1</span><span id='2'>2</span></div><div id='b'></div>",
      );
      const divA = doc.querySelector("#a");
      const divB = doc.querySelector("#b");
      const span2 = doc.querySelector("#2");

      divB.append(span2);

      expect(divA.childNodes.length).toBe(1);
      expect(divA.childNodes[0].textContent).toBe("1");
      expect(divB.childNodes.length).toBe(1);
      expect(divB.lastChild).toBe(span2);
    });
  });

  describe("append synchronization", () => {
    it("should update innerHTML correctly", () => {
      const doc = parseHTML("<div><span>A</span><span>B</span></div>");
      const div = doc.querySelector("div");

      const spanC = doc.createElement("span");
      spanC.textContent = "C";

      div.append(spanC);

      expect(div.innerHTML).toBe("<span>A</span><span>B</span><span>C</span>");
    });

    it("should update innerHTML with multiple appends", () => {
      const doc = parseHTML("<div><span>A</span></div>");
      const div = doc.querySelector("div");

      const spanB = doc.createElement("span");
      spanB.textContent = "B";
      const spanC = doc.createElement("span");
      spanC.textContent = "C";

      div.append(spanB, spanC);

      expect(div.innerHTML).toBe("<span>A</span><span>B</span><span>C</span>");
    });

    it("should update textContent correctly", () => {
      const doc = parseHTML("<div><span>First</span></div>");
      const div = doc.querySelector("div");

      div.append(" Second");

      expect(div.textContent).toBe("First Second");
    });
  });

  describe("append on document", () => {
    it("should append to document", () => {
      const doc = parseHTML("<div>Content</div>");
      const initialChildCount = doc.childNodes.length;

      const newDiv = doc.createElement("div");
      newDiv.textContent = "Appended";

      doc.append(newDiv);

      expect(doc.lastChild).toBe(newDiv);
      expect(doc.childNodes.length).toBe(initialChildCount + 1);
    });
  });
});

describe("DOM Manipulation - remove", () => {
  describe("Basic remove functionality", () => {
    it("should remove an element from its parent", () => {
      const doc = parseHTML(
        "<div><span id='1'>First</span><span id='2'>Second</span></div>",
      );
      const div = doc.querySelector("div");
      const span1 = doc.querySelector("#1");

      span1.remove();

      expect(div.childNodes.length).toBe(1);
      expect(div.childNodes[0].textContent).toBe("Second");
      expect(span1.parentNode).toBeNull();
    });

    it("should remove the only child", () => {
      const doc = parseHTML("<div><span>Only</span></div>");
      const div = doc.querySelector("div");
      const span = div.querySelector("span");

      span.remove();

      expect(div.childNodes.length).toBe(0);
      expect(div.firstChild).toBeNull();
      expect(div.lastChild).toBeNull();
      expect(span.parentNode).toBeNull();
    });

    it("should do nothing when element has no parent", () => {
      const doc = parseHTML("<div></div>");
      const orphan = doc.createElement("span");

      expect(() => orphan.remove()).not.toThrow();
      expect(orphan.parentNode).toBeNull();
    });

    it("should remove first child", () => {
      const doc = parseHTML(
        "<div><span>First</span><span>Second</span><span>Third</span></div>",
      );
      const div = doc.querySelector("div");
      const first = div.childNodes[0];

      first.remove();

      expect(div.childNodes.length).toBe(2);
      expect(div.firstChild.textContent).toBe("Second");
      expect(div.childNodes[0].previousSibling).toBeNull();
    });

    it("should remove last child", () => {
      const doc = parseHTML(
        "<div><span>First</span><span>Second</span><span>Third</span></div>",
      );
      const div = doc.querySelector("div");
      const last = div.childNodes[2];

      last.remove();

      expect(div.childNodes.length).toBe(2);
      expect(div.lastChild.textContent).toBe("Second");
      expect(div.childNodes[1].nextSibling).toBeNull();
    });

    it("should remove middle child", () => {
      const doc = parseHTML(
        "<div><span>First</span><span>Second</span><span>Third</span></div>",
      );
      const div = doc.querySelector("div");
      const middle = div.childNodes[1];

      middle.remove();

      expect(div.childNodes.length).toBe(2);
      expect(div.childNodes[0].textContent).toBe("First");
      expect(div.childNodes[1].textContent).toBe("Third");
    });
  });

  describe("remove sibling relationships", () => {
    it("should update nextSibling and previousSibling correctly", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div>",
      );
      const div = doc.querySelector("div");
      const spanA = div.childNodes[0];
      const spanB = div.childNodes[1];
      const spanC = div.childNodes[2];

      spanB.remove();

      expect(spanA.nextSibling).toBe(spanC);
      expect(spanC.previousSibling).toBe(spanA);
      expect(spanB.nextSibling).toBeNull();
      expect(spanB.previousSibling).toBeNull();
    });

    it("should update element sibling relationships", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div>",
      );
      const div = doc.querySelector("div");
      const spanA = div.childNodes[0];
      const spanB = div.childNodes[1];
      const spanC = div.childNodes[2];

      spanB.remove();

      expect(spanA.nextElementSibling).toBe(spanC);
      expect(spanC.previousElementSibling).toBe(spanA);
      expect(spanB.nextElementSibling).toBeNull();
      expect(spanB.previousElementSibling).toBeNull();
    });

    it("should update parent references", () => {
      const doc = parseHTML("<div><span>Child</span></div>");
      const div = doc.querySelector("div");
      const span = div.querySelector("span");

      span.remove();

      expect(span.parentNode).toBeNull();
      expect(span.parentElement).toBeNull();
    });
  });

  describe("remove text nodes", () => {
    it("should remove text node", () => {
      const doc = parseHTML("<div>Text content</div>");
      const div = doc.querySelector("div");
      const textNode = div.childNodes[0];

      textNode.remove();

      expect(div.childNodes.length).toBe(0);
      expect(div.textContent).toBe("");
      expect(textNode.parentNode).toBeNull();
    });

    it("should remove text node between elements", () => {
      const doc = parseHTML("<div><span>A</span> text <span>B</span></div>");
      const div = doc.querySelector("div");
      const textNode = div.childNodes[1];

      textNode.remove();

      expect(div.childNodes.length).toBe(2);
      expect(div.childNodes[0].nextSibling).toBe(div.childNodes[1]);
    });
  });

  describe("remove synchronization", () => {
    it("should update innerHTML correctly", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div>",
      );
      const div = doc.querySelector("div");
      const spanB = div.childNodes[1];

      spanB.remove();

      expect(div.innerHTML).toBe("<span>A</span><span>C</span>");
    });

    it("should update textContent correctly", () => {
      const doc = parseHTML("<div><span>First</span><span>Second</span></div>");
      const div = doc.querySelector("div");
      const second = div.childNodes[1];

      second.remove();

      expect(div.textContent).toBe("First");
    });

    it("should update children array correctly", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div>",
      );
      const div = doc.querySelector("div");
      const spanB = div.children[1];

      spanB.remove();

      expect(div.children.length).toBe(2);
      expect(div.children[0].textContent).toBe("A");
      expect(div.children[1].textContent).toBe("C");
    });
  });

  describe("remove multiple elements", () => {
    it("should remove multiple elements sequentially", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div>",
      );
      const div = doc.querySelector("div");
      const spanA = div.childNodes[0];
      const spanB = div.childNodes[1];

      spanA.remove();
      spanB.remove();

      expect(div.childNodes.length).toBe(1);
      expect(div.childNodes[0].textContent).toBe("C");
    });
  });
});
