import { describe, it, expect } from "bun:test";
import { parseHTML } from "../index";

describe("outerHTML replacement - Browser behavior", () => {
  it("should replace element with its innerHTML when setting outerHTML = innerHTML", () => {
    
    
    
    
    const doc = parseHTML(`
      <html>
        <body>
          <div id="mi-prueba" style="border: 2px solid red; padding: 10px;">
            <strong>Lorem ipsum!</strong> Dolor sit amet consectetur.
          </div>
        </body>
      </html>
    `);
    
    const elem = doc.querySelector("#mi-prueba");
    expect(elem).not.toBeNull();
    
    
    const innerHTML = elem!.innerHTML;
    expect(innerHTML).toContain("<strong>Lorem ipsum!</strong>");
    expect(innerHTML).toContain("Dolor sit amet consectetur.");
    
    
    const parent = elem!.parentNode;
    expect(parent).not.toBeNull();
    expect(parent!.childNodes).toContain(elem);
    
    
    elem!.outerHTML = innerHTML;
    
    
    const elemAfter = doc.querySelector("#mi-prueba");
    expect(elemAfter).toBeNull();
    
    
    const body = doc.querySelector("body");
    expect(body!.innerHTML).toContain("<strong>Lorem ipsum!</strong>");
    expect(body!.innerHTML).toContain("Dolor sit amet consectetur.");
    
    
    expect(body!.innerHTML).not.toContain('id="mi-prueba"');
    expect(body!.innerHTML).not.toContain('style=');
  });

  it("should replace element with simple text content", () => {
    const doc = parseHTML(`
      <div>
        <p id="paragraph" class="styled">Simple text</p>
      </div>
    `);
    
    const paragraph = doc.querySelector("#paragraph");
    expect(paragraph).not.toBeNull();
    
    const parent = paragraph!.parentNode;
    const innerHTML = paragraph!.innerHTML;
    
    
    paragraph!.outerHTML = innerHTML;
    
    
    expect(doc.querySelector("#paragraph")).toBeNull();
    
    
    expect(parent!.textContent).toContain("Simple text");
  });

  it("should replace element with multiple child nodes", () => {
    const doc = parseHTML(`
      <ul>
        <li id="item-container">
          <span>Item 1</span>
          <span>Item 2</span>
        </li>
      </ul>
    `);
    
    const container = doc.querySelector("#item-container");
    expect(container).not.toBeNull();
    
    const ul = doc.querySelector("ul");
    const innerHTML = container!.innerHTML;
    
    
    container!.outerHTML = innerHTML;
    
    
    expect(doc.querySelector("#item-container")).toBeNull();
    
    
    const spans = ul!.querySelectorAll("span");
    expect(spans.length).toBe(2);
    expect(spans[0]?.textContent).toBe("Item 1");
    expect(spans[1]?.textContent).toBe("Item 2");
  });

  it("should replace element with empty string", () => {
    const doc = parseHTML(`
      <div>
        <span id="to-remove"></span>
      </div>
    `);
    
    const span = doc.querySelector("#to-remove");
    expect(span).not.toBeNull();
    
    const parent = span!.parentNode;
    const childCountBefore = parent!.childNodes.length;
    
    
    span!.outerHTML = "";
    
    
    expect(doc.querySelector("#to-remove")).toBeNull();
    
    
    expect(parent!.childNodes.length).toBe(childCountBefore - 1);
  });

  it("should replace element with new HTML structure", () => {
    const doc = parseHTML(`
      <div>
        <p id="old">Old content</p>
      </div>
    `);
    
    const oldParagraph = doc.querySelector("#old");
    expect(oldParagraph).not.toBeNull();
    
    const parent = oldParagraph!.parentNode;
    
    
    oldParagraph!.outerHTML = '<div id="new">New content</div>';
    
    
    expect(doc.querySelector("#old")).toBeNull();
    
    
    const newDiv = doc.querySelector("#new");
    expect(newDiv).not.toBeNull();
    expect(newDiv!.textContent).toBe("New content");
    expect(newDiv!.parentNode).toBe(parent);
  });

  it("should maintain sibling relationships after outerHTML replacement", () => {
    const doc = parseHTML(`
      <div>
        <span>First</span>
        <p id="middle">Middle</p>
        <span>Last</span>
      </div>
    `);
    
    const middle = doc.querySelector("#middle");
    const firstSpan = doc.querySelectorAll("span")[0];
    const lastSpan = doc.querySelectorAll("span")[1];
    
    
    middle!.outerHTML = middle!.innerHTML;
    
    
    expect(firstSpan!.nextSibling).not.toBe(middle);
    expect(lastSpan!.previousSibling).not.toBe(middle);
    
    
    const parent = firstSpan!.parentNode;
    expect(parent!.textContent).toContain("Middle");
  });

  it("should handle complex nested HTML replacement", () => {
    const doc = parseHTML(`
      <article>
        <section id="wrapper" class="container" data-id="123">
          <h2>Title</h2>
          <p>Paragraph <strong>bold</strong> text</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </section>
      </article>
    `);
    
    const wrapper = doc.querySelector("#wrapper");
    expect(wrapper).not.toBeNull();
    
    const article = doc.querySelector("article");
    const innerHTML = wrapper!.innerHTML;
    
    
    wrapper!.outerHTML = innerHTML;
    
    
    expect(doc.querySelector("#wrapper")).toBeNull();
    expect(doc.querySelector("section")).toBeNull();
    
    
    expect(article!.querySelector("h2")).not.toBeNull();
    expect(article!.querySelector("h2")!.textContent).toBe("Title");
    expect(article!.querySelector("strong")).not.toBeNull();
    expect(article!.querySelectorAll("li").length).toBe(2);
  });
});
