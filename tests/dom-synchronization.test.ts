import { describe, it, expect } from "bun:test";
import { parseHTML } from "../index";
import { NodeType } from "../src/dom-simulator";

describe("DOM Manipulation - appendChild Synchronization", () => {
  describe("appendChild updates innerHTML correctly", () => {
    it("should update innerHTML when appending element", () => {
      const doc = parseHTML("<div><span>First</span></div>");
      const div = doc.querySelector("div");

      const newSpan = doc.createElement("span");
      newSpan.textContent = "Second";

      div.appendChild(newSpan);

      expect(div.innerHTML).toBe("<span>First</span><span>Second</span>");
    });

    it("should update innerHTML when appending text node", () => {
      const doc = parseHTML("<div><span>Element</span></div>");
      const div = doc.querySelector("div");

      const textNode = doc.createTextNode(" and text");
      div.appendChild(textNode);

      expect(div.innerHTML).toBe("<span>Element</span> and text");
    });

    it("should update innerHTML when appending to empty element", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      const span = doc.createElement("span");
      span.textContent = "Content";

      div.appendChild(span);

      expect(div.innerHTML).toBe("<span>Content</span>");
    });
  });

  describe("appendChild updates outerHTML correctly", () => {
    it("should update outerHTML of parent element", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      const span = doc.createElement("span");
      span.textContent = "Child";

      div.appendChild(span);

      expect(div.outerHTML).toBe("<div><span>Child</span></div>");
    });

    it("should update outerHTML with attributes intact", () => {
      const doc = parseHTML('<div class="container"></div>');
      const div = doc.querySelector("div");

      const p = doc.createElement("p");
      p.textContent = "Paragraph";

      div.appendChild(p);

      expect(div.outerHTML).toBe(
        '<div class="container"><p>Paragraph</p></div>'
      );
    });
  });

  describe("appendChild updates children array correctly", () => {
    it("should add element to children array", () => {
      const doc = parseHTML("<div><span>First</span></div>");
      const div = doc.querySelector("div");

      const newSpan = doc.createElement("span");
      newSpan.textContent = "Second";

      div.appendChild(newSpan);

      expect(div.children.length).toBe(2);
      expect(div.children[0].textContent).toBe("First");
      expect(div.children[1]).toBe(newSpan);
    });

    it("should not add text node to children array", () => {
      const doc = parseHTML("<div><span>Element</span></div>");
      const div = doc.querySelector("div");

      const textNode = doc.createTextNode("Text");
      div.appendChild(textNode);

      expect(div.children.length).toBe(1);
      expect(div.childNodes.length).toBe(2);
    });
  });

  describe("appendChild updates childNodes correctly", () => {
    it("should add node to childNodes array", () => {
      const doc = parseHTML("<div><span>First</span></div>");
      const div = doc.querySelector("div");
      const initialLength = div.childNodes.length;

      const newSpan = doc.createElement("span");
      div.appendChild(newSpan);

      expect(div.childNodes.length).toBe(initialLength + 1);
      expect(div.childNodes[div.childNodes.length - 1]).toBe(newSpan);
    });

    it("should add both elements and text nodes to childNodes", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      const span = doc.createElement("span");
      const text = doc.createTextNode("Text");

      div.appendChild(span);
      div.appendChild(text);

      expect(div.childNodes.length).toBe(2);
      expect(div.childNodes[0]).toBe(span);
      expect(div.childNodes[1]).toBe(text);
    });
  });

  describe("appendChild updates navigation properties", () => {
    it("should update firstChild when appending to empty element", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      const span = doc.createElement("span");
      div.appendChild(span);

      expect(div.firstChild).toBe(span);
    });

    it("should update lastChild when appending", () => {
      const doc = parseHTML("<div><span>First</span></div>");
      const div = doc.querySelector("div");

      const newSpan = doc.createElement("span");
      div.appendChild(newSpan);

      expect(div.lastChild).toBe(newSpan);
    });

    it("should update firstElementChild when appending first element", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      const span = doc.createElement("span");
      div.appendChild(span);

      expect(div.firstElementChild).toBe(span);
    });

    it("should update lastElementChild when appending element", () => {
      const doc = parseHTML("<div><span>First</span></div>");
      const div = doc.querySelector("div");

      const newSpan = doc.createElement("span");
      div.appendChild(newSpan);

      expect(div.lastElementChild).toBe(newSpan);
    });

    it("should update sibling relationships", () => {
      const doc = parseHTML("<div><span>First</span></div>");
      const div = doc.querySelector("div");
      const firstSpan = div.childNodes[0];

      const secondSpan = doc.createElement("span");
      div.appendChild(secondSpan);

      expect(firstSpan.nextSibling).toBe(secondSpan);
      expect(secondSpan.previousSibling).toBe(firstSpan);
      expect(secondSpan.nextSibling).toBeNull();
    });

    it("should update element sibling relationships", () => {
      const doc = parseHTML("<div><span>First</span></div>");
      const div = doc.querySelector("div");
      const firstSpan = div.children[0];

      const secondSpan = doc.createElement("span");
      div.appendChild(secondSpan);

      expect(firstSpan.nextElementSibling).toBe(secondSpan);
      expect(secondSpan.previousElementSibling).toBe(firstSpan);
      expect(secondSpan.nextElementSibling).toBeNull();
    });
  });

  describe("appendChild updates textContent correctly", () => {
    it("should update textContent when appending text node", () => {
      const doc = parseHTML("<div>Hello</div>");
      const div = doc.querySelector("div");

      const textNode = doc.createTextNode(" World");
      div.appendChild(textNode);

      expect(div.textContent).toBe("Hello World");
    });

    it("should update textContent when appending element with text", () => {
      const doc = parseHTML("<div>Start</div>");
      const div = doc.querySelector("div");

      const span = doc.createElement("span");
      span.textContent = " End";

      div.appendChild(span);

      expect(div.textContent).toBe("Start End");
    });
  });

  describe("appendChild moves node from previous parent", () => {
    it("should remove node from previous parent when appending", () => {
      const doc = parseHTML(
        "<div id='p1'><span>Child</span></div><div id='p2'></div>"
      );
      const parent1 = doc.querySelector("#p1");
      const parent2 = doc.querySelector("#p2");
      const child = parent1.querySelector("span");

      parent2.appendChild(child);

      expect(parent1.childNodes.length).toBe(0);
      expect(parent1.children.length).toBe(0);
      expect(parent2.childNodes.length).toBe(1);
      expect(child.parentNode).toBe(parent2);
    });

    it("should update innerHTML of both parents when moving node", () => {
      const doc = parseHTML(
        "<div id='p1'><span>Moving</span><span>Staying</span></div><div id='p2'><span>Existing</span></div>"
      );
      const parent1 = doc.querySelector("#p1");
      const parent2 = doc.querySelector("#p2");
      const movingSpan = parent1.children[0];

      parent2.appendChild(movingSpan);

      expect(parent1.innerHTML).toBe("<span>Staying</span>");
      expect(parent2.innerHTML).toBe(
        "<span>Existing</span><span>Moving</span>"
      );
    });
  });
});

describe("DOM Manipulation - removeChild Synchronization", () => {
  describe("removeChild updates innerHTML correctly", () => {
    it("should update innerHTML when removing element", () => {
      const doc = parseHTML(
        "<div><span>First</span><span>Second</span></div>"
      );
      const div = doc.querySelector("div");
      const secondSpan = div.children[1];

      div.removeChild(secondSpan);

      expect(div.innerHTML).toBe("<span>First</span>");
    });

    it("should update innerHTML when removing text node", () => {
      const doc = parseHTML("<div><span>Element</span> and text</div>");
      const div = doc.querySelector("div");
      const textNode = div.childNodes[1];

      div.removeChild(textNode);

      expect(div.innerHTML).toBe("<span>Element</span>");
    });

    it("should have empty innerHTML when removing all children", () => {
      const doc = parseHTML("<div><span>Only child</span></div>");
      const div = doc.querySelector("div");
      const child = div.childNodes[0];

      div.removeChild(child);

      expect(div.innerHTML).toBe("");
    });
  });

  describe("removeChild updates outerHTML correctly", () => {
    it("should update outerHTML of parent", () => {
      const doc = parseHTML(
        "<div><span>Keep</span><span>Remove</span></div>"
      );
      const div = doc.querySelector("div");
      const removeSpan = div.children[1];

      div.removeChild(removeSpan);

      expect(div.outerHTML).toBe("<div><span>Keep</span></div>");
    });
  });

  describe("removeChild updates children array correctly", () => {
    it("should remove element from children array", () => {
      const doc = parseHTML(
        "<div><span>First</span><span>Second</span><span>Third</span></div>"
      );
      const div = doc.querySelector("div");
      const secondSpan = div.children[1];

      div.removeChild(secondSpan);

      expect(div.children.length).toBe(2);
      expect(div.children[0].textContent).toBe("First");
      expect(div.children[1].textContent).toBe("Third");
    });

    it("should not affect children array when removing text node", () => {
      const doc = parseHTML("<div><span>Element</span>Text</div>");
      const div = doc.querySelector("div");
      const textNode = div.childNodes[1];

      div.removeChild(textNode);

      expect(div.children.length).toBe(1);
    });
  });

  describe("removeChild updates childNodes correctly", () => {
    it("should remove node from childNodes array", () => {
      const doc = parseHTML(
        "<div><span>First</span><span>Second</span></div>"
      );
      const div = doc.querySelector("div");
      const initialLength = div.childNodes.length;
      const secondSpan = div.childNodes[1];

      div.removeChild(secondSpan);

      expect(div.childNodes.length).toBe(initialLength - 1);
      expect(div.childNodes.indexOf(secondSpan)).toBe(-1);
    });
  });

  describe("removeChild updates navigation properties", () => {
    it("should update firstChild when removing first child", () => {
      const doc = parseHTML(
        "<div><span>First</span><span>Second</span></div>"
      );
      const div = doc.querySelector("div");
      const firstSpan = div.childNodes[0];
      const secondSpan = div.childNodes[1];

      div.removeChild(firstSpan);

      expect(div.firstChild).toBe(secondSpan);
    });

    it("should update lastChild when removing last child", () => {
      const doc = parseHTML(
        "<div><span>First</span><span>Second</span></div>"
      );
      const div = doc.querySelector("div");
      const firstSpan = div.childNodes[0];
      const secondSpan = div.childNodes[1];

      div.removeChild(secondSpan);

      expect(div.lastChild).toBe(firstSpan);
    });

    it("should set firstChild and lastChild to null when removing only child", () => {
      const doc = parseHTML("<div><span>Only</span></div>");
      const div = doc.querySelector("div");
      const child = div.childNodes[0];

      div.removeChild(child);

      expect(div.firstChild).toBeNull();
      expect(div.lastChild).toBeNull();
    });

    it("should update firstElementChild when removing first element", () => {
      const doc = parseHTML(
        "<div><span>First</span><span>Second</span></div>"
      );
      const div = doc.querySelector("div");
      const firstSpan = div.children[0];
      const secondSpan = div.children[1];

      div.removeChild(firstSpan);

      expect(div.firstElementChild).toBe(secondSpan);
    });

    it("should update lastElementChild when removing last element", () => {
      const doc = parseHTML(
        "<div><span>First</span><span>Second</span></div>"
      );
      const div = doc.querySelector("div");
      const firstSpan = div.children[0];
      const secondSpan = div.children[1];

      div.removeChild(secondSpan);

      expect(div.lastElementChild).toBe(firstSpan);
    });

    it("should update sibling relationships when removing middle child", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div>"
      );
      const div = doc.querySelector("div");
      const spanA = div.childNodes[0];
      const spanB = div.childNodes[1];
      const spanC = div.childNodes[2];

      div.removeChild(spanB);

      expect(spanA.nextSibling).toBe(spanC);
      expect(spanC.previousSibling).toBe(spanA);
    });

    it("should update element sibling relationships", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div>"
      );
      const div = doc.querySelector("div");
      const spanA = div.children[0];
      const spanB = div.children[1];
      const spanC = div.children[2];

      div.removeChild(spanB);

      expect(spanA.nextElementSibling).toBe(spanC);
      expect(spanC.previousElementSibling).toBe(spanA);
    });
  });

  describe("removeChild clears removed node properties", () => {
    it("should clear parentNode of removed child", () => {
      const doc = parseHTML("<div><span>Child</span></div>");
      const div = doc.querySelector("div");
      const child = div.childNodes[0];

      div.removeChild(child);

      expect(child.parentNode).toBeNull();
      expect(child.parentElement).toBeNull();
    });

    it("should clear sibling references of removed child", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div>"
      );
      const div = doc.querySelector("div");
      const spanB = div.childNodes[1];

      div.removeChild(spanB);

      expect(spanB.previousSibling).toBeNull();
      expect(spanB.nextSibling).toBeNull();
    });

    it("should clear element sibling references of removed element", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div>"
      );
      const div = doc.querySelector("div");
      const spanB = div.children[1];

      div.removeChild(spanB);

      expect(spanB.previousElementSibling).toBeNull();
      expect(spanB.nextElementSibling).toBeNull();
    });
  });

  describe("removeChild updates textContent correctly", () => {
    it("should update textContent when removing text node", () => {
      const doc = parseHTML("<div>Hello World</div>");
      const div = doc.querySelector("div");
      const textNode = div.childNodes[0];

      div.removeChild(textNode);

      expect(div.textContent).toBe("");
    });

    it("should update textContent when removing element with text", () => {
      const doc = parseHTML("<div><span>Remove this</span> Keep this</div>");
      const div = doc.querySelector("div");
      const span = div.childNodes[0];

      div.removeChild(span);

      expect(div.textContent).toBe(" Keep this");
    });
  });

  describe("removeChild error cases", () => {
    it("should throw error when child is not found", () => {
      const doc = parseHTML("<div><span>Child</span></div>");
      const div = doc.querySelector("div");
      const notAChild = doc.createElement("span");

      expect(() => {
        div.removeChild(notAChild);
      }).toThrow("Child not found");
    });
  });
});

describe("DOM Manipulation - Navigation Properties Update", () => {
  describe("Navigation properties after complex manipulations", () => {
    it("should maintain correct relationships after multiple appendChild calls", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      const span1 = doc.createElement("span");
      span1.textContent = "1";
      const span2 = doc.createElement("span");
      span2.textContent = "2";
      const span3 = doc.createElement("span");
      span3.textContent = "3";

      div.appendChild(span1);
      div.appendChild(span2);
      div.appendChild(span3);

      expect(div.firstChild).toBe(span1);
      expect(div.lastChild).toBe(span3);
      expect(span1.nextSibling).toBe(span2);
      expect(span2.previousSibling).toBe(span1);
      expect(span2.nextSibling).toBe(span3);
      expect(span3.previousSibling).toBe(span2);
      expect(span1.previousSibling).toBeNull();
      expect(span3.nextSibling).toBeNull();
    });

    it("should maintain correct relationships after insertBefore and appendChild", () => {
      const doc = parseHTML("<div><span>B</span></div>");
      const div = doc.querySelector("div");
      const spanB = div.childNodes[0];

      const spanA = doc.createElement("span");
      spanA.textContent = "A";
      const spanC = doc.createElement("span");
      spanC.textContent = "C";

      div.insertBefore(spanA, spanB);
      div.appendChild(spanC);

      expect(div.firstChild).toBe(spanA);
      expect(div.lastChild).toBe(spanC);
      expect(spanA.nextSibling).toBe(spanB);
      expect(spanB.previousSibling).toBe(spanA);
      expect(spanB.nextSibling).toBe(spanC);
      expect(spanC.previousSibling).toBe(spanB);
    });

    it("should maintain correct relationships after removeChild and appendChild", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>B</span><span>C</span></div>"
      );
      const div = doc.querySelector("div");
      const spanB = div.children[1];

      div.removeChild(spanB);
      div.appendChild(spanB);

      const spanA = div.children[0];
      const spanC = div.children[1];

      expect(div.children.length).toBe(3);
      expect(spanA.nextElementSibling).toBe(spanC);
      expect(spanC.previousElementSibling).toBe(spanA);
      expect(spanC.nextElementSibling).toBe(spanB);
      expect(spanB.previousElementSibling).toBe(spanC);
      expect(div.lastElementChild).toBe(spanB);
    });

    it("should maintain correct relationships after replaceChild", () => {
      const doc = parseHTML(
        "<div><span>A</span><span>Old</span><span>C</span></div>"
      );
      const div = doc.querySelector("div");
      const spanA = div.children[0];
      const oldSpan = div.children[1];
      const spanC = div.children[2];

      const newSpan = doc.createElement("span");
      newSpan.textContent = "B";

      div.replaceChild(newSpan, oldSpan);

      expect(spanA.nextSibling).toBe(newSpan);
      expect(spanA.nextElementSibling).toBe(newSpan);
      expect(newSpan.previousSibling).toBe(spanA);
      expect(newSpan.previousElementSibling).toBe(spanA);
      expect(newSpan.nextSibling).toBe(spanC);
      expect(newSpan.nextElementSibling).toBe(spanC);
      expect(spanC.previousSibling).toBe(newSpan);
      expect(spanC.previousElementSibling).toBe(newSpan);
    });
  });

  describe("Element-specific navigation with mixed node types", () => {
    it("should skip text nodes for element sibling navigation", () => {
      const doc = parseHTML("<div><span>A</span>Text<span>B</span></div>");
      const div = doc.querySelector("div");
      const spanA = div.children[0];
      const spanB = div.children[1];

      expect(spanA.nextElementSibling).toBe(spanB);
      expect(spanB.previousElementSibling).toBe(spanA);
      expect(div.children.length).toBe(2);
      expect(div.childNodes.length).toBe(3);
    });

    it("should maintain element navigation after inserting text nodes", () => {
      const doc = parseHTML("<div><span>A</span><span>B</span></div>");
      const div = doc.querySelector("div");
      const spanA = div.children[0];
      const spanB = div.children[1];

      const textNode = doc.createTextNode("Text");
      div.insertBefore(textNode, spanB);

      expect(spanA.nextElementSibling).toBe(spanB);
      expect(spanB.previousElementSibling).toBe(spanA);
    });
  });

  describe("firstChild/lastChild vs firstElementChild/lastElementChild", () => {
    it("should differentiate between first child and first element child", () => {
      const doc = parseHTML("<div>Text<span>Element</span></div>");
      const div = doc.querySelector("div");
      const textNode = div.childNodes[0];
      const span = div.children[0];

      expect(div.firstChild).toBe(textNode);
      expect(div.firstElementChild).toBe(span);
    });

    it("should differentiate between last child and last element child", () => {
      const doc = parseHTML("<div><span>Element</span>Text</div>");
      const div = doc.querySelector("div");
      const span = div.children[0];
      const textNode = div.childNodes[1];

      expect(div.lastChild).toBe(textNode);
      expect(div.lastElementChild).toBe(span);
    });

    it("should update both when adding/removing only element", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.querySelector("div");

      const span = doc.createElement("span");
      div.appendChild(span);

      expect(div.firstChild).toBe(span);
      expect(div.lastChild).toBe(span);
      expect(div.firstElementChild).toBe(span);
      expect(div.lastElementChild).toBe(span);

      div.removeChild(span);

      expect(div.firstChild).toBeNull();
      expect(div.lastChild).toBeNull();
      expect(div.firstElementChild).toBeNull();
      expect(div.lastElementChild).toBeNull();
    });
  });
});
