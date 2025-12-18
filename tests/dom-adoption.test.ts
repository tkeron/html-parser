import { describe, it, expect } from "bun:test";
import { parseHTML } from "../index";
import { createDocument } from "../src/dom-simulator";

describe("DOM Manipulation - Node Adoption Between Documents", () => {
  describe("Moving nodes between documents with appendChild", () => {
    it("should move element from one document to another", () => {
      const doc1 = parseHTML("<div><span>Moving</span></div>");
      const doc2 = parseHTML("<div></div>");

      const div1 = doc1.querySelector("div");
      const div2 = doc2.querySelector("div");
      const movingSpan = div1.querySelector("span");

      div2.appendChild(movingSpan);

      expect(div1.childNodes.length).toBe(0);
      expect(div2.childNodes.length).toBe(1);
      expect(movingSpan.parentNode).toBe(div2);
      expect(div2.innerHTML).toBe("<span>Moving</span>");
    });

    it("should move element with nested children between documents", () => {
      const doc1 = parseHTML(
        "<div><section><span>Nested</span><p>Content</p></section></div>"
      );
      const doc2 = parseHTML("<div></div>");

      const div1 = doc1.querySelector("div");
      const div2 = doc2.querySelector("div");
      const section = div1.querySelector("section");

      div2.appendChild(section);

      expect(div1.childNodes.length).toBe(0);
      expect(div2.childNodes.length).toBe(1);
      expect(section.parentNode).toBe(div2);
      expect(section.children.length).toBe(2);
      expect(div2.innerHTML).toBe(
        "<section><span>Nested</span><p>Content</p></section>"
      );
    });

    it("should move text node between documents", () => {
      const doc1 = parseHTML("<div>Text content</div>");
      const doc2 = parseHTML("<div></div>");

      const div1 = doc1.querySelector("div");
      const div2 = doc2.querySelector("div");
      const textNode = div1.childNodes[0];

      div2.appendChild(textNode);

      expect(div1.childNodes.length).toBe(0);
      expect(div2.childNodes.length).toBe(1);
      expect(textNode.parentNode).toBe(div2);
      expect(div2.textContent).toBe("Text content");
    });

    it("should update parent references correctly when moving", () => {
      const doc1 = parseHTML("<div><span>Child</span></div>");
      const doc2 = parseHTML("<article></article>");

      const div = doc1.querySelector("div");
      const article = doc2.querySelector("article");
      const span = div.querySelector("span");

      article.appendChild(span);

      expect(span.parentNode).toBe(article);
      expect(span.parentElement).toBe(article);
      expect(div.contains).toBeUndefined(); 
    });

    it("should preserve element attributes when moving between documents", () => {
      const doc1 = parseHTML('<div><span class="highlight" id="test">Text</span></div>');
      const doc2 = parseHTML("<div></div>");

      const div1 = doc1.querySelector("div");
      const div2 = doc2.querySelector("div");
      const span = div1.querySelector("span");

      div2.appendChild(span);

      expect(span.getAttribute("class")).toBe("highlight");
      expect(span.getAttribute("id")).toBe("test");
      expect(div2.innerHTML).toBe('<span class="highlight" id="test">Text</span>');
    });
  });

  describe("Moving nodes between documents with insertBefore", () => {
    it("should move element to another document using insertBefore", () => {
      const doc1 = parseHTML("<div><span>Moving</span></div>");
      const doc2 = parseHTML("<div><span>Existing</span></div>");

      const div1 = doc1.querySelector("div");
      const div2 = doc2.querySelector("div");
      const movingSpan = div1.querySelector("span");
      const existingSpan = div2.querySelector("span");

      div2.insertBefore(movingSpan, existingSpan);

      expect(div1.childNodes.length).toBe(0);
      expect(div2.childNodes.length).toBe(2);
      expect(movingSpan.parentNode).toBe(div2);
      expect(div2.children[0]).toBe(movingSpan);
      expect(div2.children[1]).toBe(existingSpan);
    });

    it("should update sibling relationships when moving with insertBefore", () => {
      const doc1 = parseHTML("<div><span>Moving</span></div>");
      const doc2 = parseHTML("<div><span>A</span><span>B</span></div>");

      const div1 = doc1.querySelector("div");
      const div2 = doc2.querySelector("div");
      const movingSpan = div1.querySelector("span");
      const spanB = div2.children[1];

      div2.insertBefore(movingSpan, spanB);

      expect(div2.children[1]).toBe(movingSpan);
      expect(movingSpan.previousElementSibling.textContent).toBe("A");
      expect(movingSpan.nextElementSibling).toBe(spanB);
      expect(spanB.previousElementSibling).toBe(movingSpan);
    });
  });

  describe("Moving nodes between documents with replaceChild", () => {
    it("should move element to another document using replaceChild", () => {
      const doc1 = parseHTML("<div><span>Moving</span></div>");
      const doc2 = parseHTML("<div><span>Old</span></div>");

      const div1 = doc1.querySelector("div");
      const div2 = doc2.querySelector("div");
      const movingSpan = div1.querySelector("span");
      const oldSpan = div2.querySelector("span");

      div2.replaceChild(movingSpan, oldSpan);

      expect(div1.childNodes.length).toBe(0);
      expect(div2.childNodes.length).toBe(1);
      expect(movingSpan.parentNode).toBe(div2);
      expect(div2.children[0]).toBe(movingSpan);
      expect(oldSpan.parentNode).toBeNull();
    });

    it("should preserve position when replacing with moved node", () => {
      const doc1 = parseHTML("<div><span>Moving</span></div>");
      const doc2 = parseHTML("<div><span>A</span><span>Old</span><span>C</span></div>");

      const div1 = doc1.querySelector("div");
      const div2 = doc2.querySelector("div");
      const movingSpan = div1.querySelector("span");
      const oldSpan = div2.children[1];

      div2.replaceChild(movingSpan, oldSpan);

      expect(div2.children.length).toBe(3);
      expect(div2.children[1]).toBe(movingSpan);
      expect(div2.innerHTML).toBe("<span>A</span><span>Moving</span><span>C</span>");
    });
  });

  describe("Document isolation and independence", () => {
    it("should keep documents independent after moving nodes", () => {
      const doc1 = parseHTML("<div><span>A</span><span>B</span></div>");
      const doc2 = parseHTML("<article></article>");

      const div = doc1.querySelector("div");
      const article = doc2.querySelector("article");
      const spanB = div.children[1];

      article.appendChild(spanB);

      
      expect(doc1.querySelector("div").children.length).toBe(1);
      expect(doc1.querySelector("div").children[0].textContent).toBe("A");

      
      expect(doc2.querySelector("article").children.length).toBe(1);
      expect(doc2.querySelector("article").children[0].textContent).toBe("B");

      
      expect(doc1.querySelectorAll("span").length).toBe(1);
      expect(doc2.querySelectorAll("span").length).toBe(1);
    });

    it("should handle moving root-level elements between documents", () => {
      const doc1 = parseHTML("<div>Doc1</div>");
      const doc2 = createDocument();

      const div = doc1.querySelector("div");
      doc2.appendChild(div);

      expect(doc1.querySelectorAll("div").length).toBe(0);
      expect(doc2.querySelectorAll("div").length).toBe(1);
      expect(div.parentNode).toBe(doc2);
    });
  });

  describe("Complex node adoption scenarios", () => {
    it("should handle moving node with event listeners (structure only)", () => {
      
      
      const doc1 = parseHTML('<div><button id="btn">Click</button></div>');
      const doc2 = parseHTML("<div></div>");

      const div1 = doc1.querySelector("div");
      const div2 = doc2.querySelector("div");
      const button = doc1.querySelector("#btn");

      div2.appendChild(button);

      expect(button.parentNode).toBe(div2);
      expect(button.getAttribute("id")).toBe("btn");
      expect(div2.querySelector("#btn")).toBe(button);
    });

    it("should prevent circular adoption (HierarchyRequestError)", () => {
      const doc = parseHTML("<div><span></span></div>");
      const div = doc.querySelector("div");
      const span = doc.querySelector("span");

      
      
      expect(() => {
        span.appendChild(div);
      }).toThrow("HierarchyRequestError");
    });

    it("should maintain innerHTML synchronization across document boundaries", () => {
      const doc1 = parseHTML("<div><p>Paragraph 1</p><p>Paragraph 2</p></div>");
      const doc2 = parseHTML("<section></section>");

      const div = doc1.querySelector("div");
      const section = doc2.querySelector("section");
      const p1 = div.children[0];

      section.appendChild(p1);

      expect(div.innerHTML).toBe("<p>Paragraph 2</p>");
      expect(section.innerHTML).toBe("<p>Paragraph 1</p>");
    });

    it("should handle adoption of deeply nested structures", () => {
      const doc1 = parseHTML(`
        <div>
          <section>
            <article>
              <h1>Title</h1>
              <p>Content</p>
            </article>
          </section>
        </div>
      `);
      const doc2 = parseHTML("<main></main>");

      const section = doc1.querySelector("section");
      const main = doc2.querySelector("main");

      main.appendChild(section);

      expect(section.parentNode).toBe(main);
      expect(main.querySelector("h1").textContent).toBe("Title");
      expect(main.querySelector("p").textContent).toBe("Content");
      expect(doc1.querySelector("section")).toBeNull();
    });
  });

  describe("Node adoption with mixed content", () => {
    it("should move element with mixed text and element children", () => {
      const doc1 = parseHTML("<div>Text <span>element</span> more text</div>");
      const doc2 = parseHTML("<article></article>");

      const div = doc1.querySelector("div");
      const article = doc2.querySelector("article");

      article.appendChild(div);

      expect(div.parentNode).toBe(article);
      expect(div.childNodes.length).toBe(3);
      expect(div.textContent).toBe("Text element more text");
      expect(article.innerHTML).toBe("<div>Text <span>element</span> more text</div>");
    });

    it("should maintain content structure when moving nodes with attributes", () => {
      const doc1 = parseHTML(`
        <div class="container">
          <span id="item1" class="active">Item 1</span>
          <span id="item2">Item 2</span>
        </div>
      `);
      const doc2 = parseHTML('<section class="new-section"></section>');

      const container = doc1.querySelector(".container");
      const section = doc2.querySelector("section");

      section.appendChild(container);

      expect(container.getAttribute("class")).toBe("container");
      expect(section.querySelector("#item1").getAttribute("class")).toBe("active");
      expect(section.querySelector("#item2")).not.toBeNull();
    });
  });

  describe("Edge cases in node adoption", () => {
    it("should handle adopting a node back to its original document", () => {
      const doc1 = parseHTML("<div><span>Original</span></div>");
      const doc2 = parseHTML("<article></article>");

      const div = doc1.querySelector("div");
      const article = doc2.querySelector("article");
      const span = div.querySelector("span");

      
      article.appendChild(span);
      expect(span.parentNode).toBe(article);

      
      div.appendChild(span);
      expect(span.parentNode).toBe(div);
      expect(div.innerHTML).toBe("<span>Original</span>");
      expect(article.innerHTML).toBe("");
    });

    it("should handle moving an entire subtree and then moving it back", () => {
      const doc1 = parseHTML("<div><section><p>A</p><p>B</p></section></div>");
      const doc2 = createDocument();

      const div = doc1.querySelector("div");
      const section = div.querySelector("section");

      const originalHTML = div.innerHTML;

      
      doc2.appendChild(section);
      expect(div.innerHTML).toBe("");

      
      div.appendChild(section);
      expect(div.innerHTML).toBe(originalHTML);
    });

    it("should handle adopting multiple nodes sequentially", () => {
      const doc1 = parseHTML("<div><span>1</span><span>2</span><span>3</span></div>");
      const doc2 = parseHTML("<section></section>");

      const div = doc1.querySelector("div");
      const section = doc2.querySelector("section");

      
      while (div.children.length > 0) {
        section.appendChild(div.children[0]);
      }

      expect(div.children.length).toBe(0);
      expect(section.children.length).toBe(3);
      expect(section.children[0].textContent).toBe("1");
      expect(section.children[1].textContent).toBe("2");
      expect(section.children[2].textContent).toBe("3");
    });
  });
});
