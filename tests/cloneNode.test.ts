import { describe, it, expect } from "vitest";
import { parseHTML } from "../index.js";
import { NodeType } from "../src/dom-simulator.js";

describe("cloneNode functionality", () => {
  describe("cloneNode(true) - deep cloning", () => {
    it("should clone a simple element with text content", () => {
      const html = `<div id="original">Hello World</div>`;
      const doc = parseHTML(html);
      const original = doc.querySelector("#original")!;

      const cloned = original.cloneNode(true);

      expect(cloned).toBeTruthy();
      expect(cloned.nodeName).toBe("DIV");

      expect(cloned.getAttribute("id")).toBe("original");

      expect(cloned.textContent).toBe("Hello World");

      expect(cloned.childNodes.length).toBeGreaterThan(0);
    });

    it("should clone nested elements with multiple levels", () => {
      const html = `
        <div id="parent">
          <div class="child">
            <span>Nested Text</span>
          </div>
        </div>
      `;
      const doc = parseHTML(html);
      const parent = doc.querySelector("#parent")!;

      const cloned = parent.cloneNode(true);

      expect(cloned.nodeName).toBe("DIV");
      expect(cloned.getAttribute("id")).toBe("parent");

      expect(cloned.childNodes.length).toBeGreaterThan(0);

      const childDiv = cloned.querySelector(".child");
      expect(childDiv).toBeTruthy();
      expect(childDiv?.nodeName).toBe("DIV");
      expect(childDiv?.getAttribute("class")).toBe("child");

      const span = cloned.querySelector("span");
      expect(span).toBeTruthy();
      expect(span?.textContent).toBe("Nested Text");
    });

    it("should clone element with multiple children", () => {
      const html = `
        <ul id="list">
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      `;
      const doc = parseHTML(html);
      const list = doc.querySelector("#list")!;

      const cloned = list.cloneNode(true);

      const items = cloned.querySelectorAll("li");
      expect(items.length).toBe(3);
      expect(items[0]?.textContent).toBe("Item 1");
      expect(items[1]?.textContent).toBe("Item 2");
      expect(items[2]?.textContent).toBe("Item 3");
    });

    it("should preserve innerHTML after cloning", () => {
      const html = `
        <div id="container">
          <h1>Title</h1>
          <p>Paragraph 1</p>
          <p>Paragraph 2</p>
        </div>
      `;
      const doc = parseHTML(html);
      const container = doc.querySelector("#container")!;

      const originalInnerHTML = container.innerHTML;
      expect(originalInnerHTML).toBeTruthy();
      expect(originalInnerHTML.length).toBeGreaterThan(0);

      const cloned = container.cloneNode(true);

      expect(cloned.innerHTML).toBeTruthy();
      expect(cloned.innerHTML.length).toBeGreaterThan(0);

      expect(cloned.innerHTML).toContain("<h1>Title</h1>");
      expect(cloned.innerHTML).toContain("<p>Paragraph 1</p>");
      expect(cloned.innerHTML).toContain("<p>Paragraph 2</p>");
    });

    it("should clone element with mixed content (elements and text nodes)", () => {
      const html = `<div id="mixed">Text before<strong>bold text</strong>Text after</div>`;
      const doc = parseHTML(html);
      const mixed = doc.querySelector("#mixed")!;

      const originalChildCount = mixed.childNodes.length;
      expect(originalChildCount).toBeGreaterThan(0);

      const cloned = mixed.cloneNode(true);

      expect(cloned.childNodes.length).toBe(originalChildCount);

      expect(cloned.textContent).toBe("Text beforebold textText after");

      const strong = cloned.querySelector("strong");
      expect(strong).toBeTruthy();
      expect(strong?.textContent).toBe("bold text");
    });

    it("should clone all attributes including custom ones", () => {
      const html = `<div id="attrs" class="test" data-value="123" data-custom="abc">Content</div>`;
      const doc = parseHTML(html);
      const element = doc.querySelector("#attrs")!;

      const cloned = element.cloneNode(true);

      expect(cloned.getAttribute("id")).toBe("attrs");
      expect(cloned.getAttribute("class")).toBe("test");
      expect(cloned.getAttribute("data-value")).toBe("123");
      expect(cloned.getAttribute("data-custom")).toBe("abc");
      expect(cloned.textContent).toBe("Content");
    });

    it("should clone complex structure with different node types", () => {
      const html = `
        <article id="article">
          <h2>Article Title</h2>
          <!-- This is a comment -->
          <p>First paragraph</p>
          <div class="highlight">
            <span>Highlighted</span> text
          </div>
          <p>Last paragraph</p>
        </article>
      `;
      const doc = parseHTML(html);
      const article = doc.querySelector("#article")!;

      const cloned = article.cloneNode(true);

      expect(cloned.nodeName).toBe("ARTICLE");
      expect(cloned.getAttribute("id")).toBe("article");

      expect(cloned.querySelector("h2")?.textContent).toBe("Article Title");

      const paragraphs = cloned.querySelectorAll("p");
      expect(paragraphs.length).toBe(2);
      expect(paragraphs[0]?.textContent).toBe("First paragraph");
      expect(paragraphs[1]?.textContent).toBe("Last paragraph");

      const highlight = cloned.querySelector(".highlight");
      expect(highlight).toBeTruthy();
      expect(highlight?.querySelector("span")?.textContent).toBe("Highlighted");

      const hasComment = Array.from(cloned.childNodes).some(
        (node: any) => node.nodeType === NodeType.COMMENT_NODE,
      );
      expect(hasComment).toBe(true);
    });

    it("should clone element with empty children", () => {
      const html = `<div id="container"><p></p><span></span></div>`;
      const doc = parseHTML(html);
      const container = doc.querySelector("#container")!;

      const cloned = container.cloneNode(true);

      expect(cloned.querySelector("p")).toBeTruthy();
      expect(cloned.querySelector("span")).toBeTruthy();
    });

    it("should maintain outerHTML structure in cloned node", () => {
      const html = `<section class="main"><h1>Title</h1><p>Text</p></section>`;
      const doc = parseHTML(html);
      const section = doc.querySelector("section")!;

      const cloned = section.cloneNode(true);

      expect(cloned.outerHTML).toBeTruthy();
      expect(cloned.outerHTML).toContain("section");
      expect(cloned.outerHTML).toContain('class="main"');
      expect(cloned.outerHTML).toContain("<h1>Title</h1>");
      expect(cloned.outerHTML).toContain("<p>Text</p>");
    });
  });

  describe("cloneNode(false) - shallow cloning", () => {
    it("should clone element without children when deep is false", () => {
      const html = `<div id="parent"><p>Child</p></div>`;
      const doc = parseHTML(html);
      const parent = doc.querySelector("#parent")!;

      const cloned = parent.cloneNode(false);

      expect(cloned.nodeName).toBe("DIV");
      expect(cloned.getAttribute("id")).toBe("parent");
      expect(cloned.childNodes.length).toBe(0);
      expect(cloned.querySelector("p")).toBeNull();
    });

    it("should preserve attributes in shallow clone", () => {
      const html = `<div id="test" class="container" data-value="123"><span>Content</span></div>`;
      const doc = parseHTML(html);
      const element = doc.querySelector("#test")!;

      const cloned = element.cloneNode(false);

      expect(cloned.getAttribute("id")).toBe("test");
      expect(cloned.getAttribute("class")).toBe("container");
      expect(cloned.getAttribute("data-value")).toBe("123");

      expect(cloned.childNodes.length).toBe(0);
      expect(cloned.innerHTML).toBe("");
    });
  });

  describe("cloneNode independence", () => {
    it("cloned node should be independent from original", () => {
      const html = `<div id="original">Original</div>`;
      const doc = parseHTML(html);
      const original = doc.querySelector("#original")!;

      const cloned = original.cloneNode(true);

      cloned.setAttribute("id", "cloned");
      cloned.setAttribute("data-modified", "true");

      expect(original.getAttribute("id")).toBe("original");
      expect(original.hasAttribute("data-modified")).toBe(false);
      expect(cloned.getAttribute("id")).toBe("cloned");
      expect(cloned.getAttribute("data-modified")).toBe("true");
    });

    it("modifying cloned children should not affect original", () => {
      const html = `<div id="parent"><p id="child">Text</p></div>`;
      const doc = parseHTML(html);
      const parent = doc.querySelector("#parent")!;

      const cloned = parent.cloneNode(true);
      const clonedChild = cloned.querySelector("#child");

      expect(clonedChild).toBeTruthy();

      clonedChild?.setAttribute("data-cloned", "yes");

      const originalChild = parent.querySelector("#child");
      expect(originalChild?.hasAttribute("data-cloned")).toBe(false);
    });
  });

  describe("cloneNode edge cases", () => {
    it("should handle cloning of self-closing tags", () => {
      const html = `<div><img src="test.jpg" alt="Test" /><br /></div>`;
      const doc = parseHTML(html);
      const div = doc.querySelector("div")!;

      const cloned = div.cloneNode(true);

      const img = cloned.querySelector("img");
      expect(img).toBeTruthy();
      expect(img?.getAttribute("src")).toBe("test.jpg");
      expect(img?.getAttribute("alt")).toBe("Test");
    });

    it("should clone elements with special characters in content", () => {
      const html = `<div id="special">Text with &amp; &lt; &gt; entities</div>`;
      const doc = parseHTML(html);
      const element = doc.querySelector("#special")!;

      const cloned = element.cloneNode(true);

      expect(cloned.textContent).toBeTruthy();
      expect(cloned.textContent.length).toBeGreaterThan(0);
    });

    it("should handle deeply nested structures", () => {
      const html = `
        <div id="level1">
          <div id="level2">
            <div id="level3">
              <div id="level4">
                <div id="level5">Deep Content</div>
              </div>
            </div>
          </div>
        </div>
      `;
      const doc = parseHTML(html);
      const level1 = doc.querySelector("#level1")!;

      const cloned = level1.cloneNode(true);

      expect(cloned.querySelector("#level2")).toBeTruthy();
      expect(cloned.querySelector("#level3")).toBeTruthy();
      expect(cloned.querySelector("#level4")).toBeTruthy();
      const level5 = cloned.querySelector("#level5");
      expect(level5).toBeTruthy();
      expect(level5?.textContent).toBe("Deep Content");
    });
  });

  describe("cloneNode internal properties", () => {
    it("should verify _internalInnerHTML is properly set in clone", () => {
      const html = `<div id="container"><p>Paragraph 1</p><p>Paragraph 2</p></div>`;
      const doc = parseHTML(html);
      const container = doc.querySelector("#container")!;

      const originalInnerHTML = container.innerHTML;
      expect(originalInnerHTML).toBeTruthy();

      const cloned = container.cloneNode(true);

      const clonedInnerHTML = cloned.innerHTML;
      expect(clonedInnerHTML).toBeTruthy();
      expect(clonedInnerHTML.length).toBeGreaterThan(0);

      expect(clonedInnerHTML).toContain("<p>Paragraph 1</p>");
      expect(clonedInnerHTML).toContain("<p>Paragraph 2</p>");

      expect(typeof cloned.innerHTML).toBe("string");
    });

    it("should maintain proper childNodes structure after clone", () => {
      const html = `<div id="parent">Text<span>Span</span>More text</div>`;
      const doc = parseHTML(html);
      const parent = doc.querySelector("#parent")!;

      const originalChildCount = parent.childNodes.length;
      expect(originalChildCount).toBeGreaterThan(0);

      const cloned = parent.cloneNode(true);

      expect(cloned.childNodes.length).toBe(originalChildCount);

      for (let i = 0; i < cloned.childNodes.length; i++) {
        expect(cloned.childNodes[i]).toBeTruthy();
        expect(cloned.childNodes[i].nodeType).toBeDefined();
      }
    });

    it("should properly initialize children array in cloned element", () => {
      const html = `<div id="container"><span>1</span><span>2</span><span>3</span></div>`;
      const doc = parseHTML(html);
      const container = doc.querySelector("#container")!;

      const cloned = container.cloneNode(true);

      expect(cloned.children).toBeTruthy();
      expect(Array.isArray(cloned.children)).toBe(true);
      expect(cloned.children.length).toBe(3);

      for (const child of cloned.children) {
        expect(child.nodeType).toBe(NodeType.ELEMENT_NODE);
      }
    });

    it("should clone and maintain firstChild and lastChild references", () => {
      const html = `<ul id="list"><li>First</li><li>Middle</li><li>Last</li></ul>`;
      const doc = parseHTML(html);
      const list = doc.querySelector("#list")!;

      const cloned = list.cloneNode(true);

      expect(cloned.firstChild).toBeTruthy();
      expect(cloned.lastChild).toBeTruthy();

      expect(cloned.firstElementChild).toBeTruthy();
      expect(cloned.lastElementChild).toBeTruthy();

      const firstLi = cloned.firstElementChild;
      const lastLi = cloned.lastElementChild;

      expect(firstLi?.textContent).toContain("First");
      expect(lastLi?.textContent).toContain("Last");
    });
  });

  describe("cloneNode with innerHTML manipulation", () => {
    it("should clone element after innerHTML was modified", () => {
      const html = `<div id="dynamic"></div>`;
      const doc = parseHTML(html);
      const dynamic = doc.querySelector("#dynamic")!;

      dynamic.innerHTML = "<p>Dynamic content</p><span>More content</span>";

      const cloned = dynamic.cloneNode(true);

      expect(cloned.querySelector("p")).toBeTruthy();
      expect(cloned.querySelector("p")?.textContent).toBe("Dynamic content");
      expect(cloned.querySelector("span")).toBeTruthy();
      expect(cloned.querySelector("span")?.textContent).toBe("More content");
    });

    it("should clone element and allow innerHTML manipulation on clone", () => {
      const html = `<div id="original"><p>Original</p></div>`;
      const doc = parseHTML(html);
      const original = doc.querySelector("#original")!;

      const cloned = original.cloneNode(true);

      expect(cloned.querySelector("p")?.textContent).toBe("Original");

      cloned.innerHTML = "<span>Modified</span>";

      expect(original.querySelector("p")?.textContent).toBe("Original");
      expect(original.querySelector("span")).toBeNull();

      expect(cloned.querySelector("span")?.textContent).toBe("Modified");
      expect(cloned.querySelector("p")).toBeNull();
    });
  });

  describe("cloneNode real-world scenarios", () => {
    it("should clone a complete card component", () => {
      const html = `
        <div class="card" data-id="123">
          <div class="card-header">
            <h3 class="card-title">Card Title</h3>
            <button class="close">×</button>
          </div>
          <div class="card-body">
            <p>This is the card content with <strong>bold</strong> text.</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
          <div class="card-footer">
            <button class="btn-primary">Save</button>
            <button class="btn-secondary">Cancel</button>
          </div>
        </div>
      `;
      const doc = parseHTML(html);
      const card = doc.querySelector(".card")!;

      const cloned = card.cloneNode(true);

      expect(cloned.getAttribute("data-id")).toBe("123");
      expect(cloned.querySelector(".card-header")).toBeTruthy();
      expect(cloned.querySelector(".card-body")).toBeTruthy();
      expect(cloned.querySelector(".card-footer")).toBeTruthy();

      expect(cloned.querySelector(".card-title")?.textContent).toBe(
        "Card Title",
      );
      expect(cloned.querySelector("strong")?.textContent).toBe("bold");

      const items = cloned.querySelectorAll("li");
      expect(items.length).toBe(2);

      const buttons = cloned.querySelectorAll("button");
      expect(buttons.length).toBe(3);
    });

    it("should clone a form with various input types", () => {
      const html = `
        <form id="user-form">
          <input type="text" name="username" value="john" />
          <input type="email" name="email" value="john@example.com" />
          <textarea name="bio">User bio</textarea>
          <select name="country">
            <option value="us">USA</option>
            <option value="uk" selected>UK</option>
          </select>
        </form>
      `;
      const doc = parseHTML(html);
      const form = doc.querySelector("#user-form")!;

      const cloned = form.cloneNode(true);

      const textInput = cloned.querySelector('[name="username"]');
      expect(textInput).toBeTruthy();
      expect(textInput?.getAttribute("value")).toBe("john");

      const emailInput = cloned.querySelector('[name="email"]');
      expect(emailInput).toBeTruthy();
      expect(emailInput?.getAttribute("value")).toBe("john@example.com");

      const textarea = cloned.querySelector("textarea");
      expect(textarea).toBeTruthy();
      expect(textarea?.textContent).toBe("User bio");

      const select = cloned.querySelector("select");
      expect(select).toBeTruthy();
      const options = select?.querySelectorAll("option");
      expect(options?.length).toBe(2);
    });

    it("should clone a table structure", () => {
      const html = `
        <table id="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John</td>
              <td>30</td>
            </tr>
            <tr>
              <td>Jane</td>
              <td>25</td>
            </tr>
          </tbody>
        </table>
      `;
      const doc = parseHTML(html);
      const table = doc.querySelector("#data-table")!;

      const cloned = table.cloneNode(true);

      expect(cloned.querySelector("thead")).toBeTruthy();
      expect(cloned.querySelector("tbody")).toBeTruthy();

      const headers = cloned.querySelectorAll("th");
      expect(headers.length).toBe(2);
      expect(headers[0]?.textContent).toBe("Name");
      expect(headers[1]?.textContent).toBe("Age");

      const rows = cloned.querySelectorAll("tbody tr");
      expect(rows.length).toBe(2);

      const firstRowCells = rows[0]?.querySelectorAll("td");
      expect(firstRowCells?.length).toBe(2);
      expect(firstRowCells?.[0]?.textContent).toBe("John");
      expect(firstRowCells?.[1]?.textContent).toBe("30");
    });
  });
});
