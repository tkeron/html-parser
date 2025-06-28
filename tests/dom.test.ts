import { describe, it, expect } from "bun:test";
import { parseHTML } from "../index";
import {
  NodeType,
  getTextContent,
  getAttribute,
  hasAttribute,
  setAttribute,
  removeAttribute,
} from "../src/dom-simulator";
import { parse } from "../src/parser";

describe("DOM Simulator - Phase 1: Structure and Conversion", () => {
  describe("parseHTML basic functionality", () => {
    it("should return a Document object", () => {
      const doc = parseHTML("<p>Hello</p>");
      expect(doc.nodeType).toBe(NodeType.DOCUMENT_NODE);
      expect(doc.nodeName).toBe("#document");
    });

    it("should parse simple HTML elements", () => {
      const doc = parseHTML("<p>Hello World</p>");

      expect(doc.childNodes.length).toBe(1);
      const paragraph = doc.childNodes[0]!;

      expect(paragraph.nodeType).toBe(NodeType.ELEMENT_NODE);
      expect(paragraph.nodeName).toBe("P");
      expect((paragraph as any).tagName).toBe("P");
    });

    it("should parse text content correctly", () => {
      const doc = parseHTML("<p>Hello World</p>");
      const paragraph = doc.childNodes[0]!;

      expect(paragraph.childNodes.length).toBe(1);
      const textNode = paragraph.childNodes[0]!;

      expect(textNode.nodeType).toBe(NodeType.TEXT_NODE);
      expect(textNode.nodeName).toBe("#text");
      expect(textNode.nodeValue).toBe("Hello World");
    });

    it("should parse nested elements", () => {
      const doc = parseHTML("<div><p>Hello</p><span>World</span></div>");

      const div = doc.childNodes[0]!;
      expect(div.nodeName).toBe("DIV");
      expect(div.childNodes.length).toBe(2);

      const p = div.childNodes[0]!;
      const span = div.childNodes[1]!;

      expect(p.nodeName).toBe("P");
      expect(span.nodeName).toBe("SPAN");
    });

    it("should handle attributes correctly", () => {
      const doc = parseHTML('<p id="test" class="highlight">Content</p>');
      const paragraph = doc.childNodes[0]! as any;

      expect(paragraph.attributes.id).toBe("test");
      expect(paragraph.attributes.class).toBe("highlight");
    });

    it("should parse comments", () => {
      const doc = parseHTML("<!-- This is a comment --><p>Hello</p>");

      expect(doc.childNodes.length).toBe(2);
      const comment = doc.childNodes[0]!;

      expect(comment.nodeType).toBe(NodeType.COMMENT_NODE);
      expect(comment.nodeName).toBe("#comment");
      expect(comment.nodeValue).toBe(" This is a comment ");
    });

    it("should set parent-child relationships correctly", () => {
      const doc = parseHTML("<div><p>Hello</p></div>");

      const div = doc.childNodes[0]!;
      const p = div.childNodes[0]!;

      expect(p.parentNode).toBe(div);
      expect(div.parentNode).toBe(doc);
      expect(div.firstChild).toBe(p);
      expect(div.lastChild).toBe(p);
    });

    it("should set sibling relationships correctly", () => {
      const doc = parseHTML(
        "<div><p>First</p><span>Second</span><em>Third</em></div>"
      );

      const div = doc.childNodes[0]!;
      const p = div.childNodes[0]!;
      const span = div.childNodes[1]!;
      const em = div.childNodes[2]!;

      expect(p.nextSibling).toBe(span);
      expect(span.previousSibling).toBe(p);
      expect(span.nextSibling).toBe(em);
      expect(em.previousSibling).toBe(span);

      expect(p.previousSibling).toBeNull();
      expect(em.nextSibling).toBeNull();
    });

    it("should handle self-closing elements", () => {
      const doc = parseHTML("<p>Before<br/>After</p>");

      const p = doc.childNodes[0]!;
      expect(p.childNodes.length).toBe(3);

      const br = p.childNodes[1]!;
      expect(br.nodeName).toBe("BR");
      expect(br.childNodes.length).toBe(0);
    });

    it("should handle empty elements", () => {
      const doc = parseHTML("<div></div>");

      const div = doc.childNodes[0]!;
      expect(div.childNodes.length).toBe(0);
      expect(div.firstChild).toBeNull();
      expect(div.lastChild).toBeNull();
    });
  });

  describe("Document special properties", () => {
    it("should identify documentElement (html)", () => {
      const doc = parseHTML("<html><head></head><body></body></html>");

      expect(doc.documentElement).toBeTruthy();
      expect((doc.documentElement as any)?.tagName).toBe("HTML");
    });

    it("should identify body element", () => {
      const doc = parseHTML("<html><body><p>Content</p></body></html>");

      expect(doc.body).toBeTruthy();
      expect((doc.body as any)?.tagName).toBe("BODY");
    });

    it("should identify head element", () => {
      const doc = parseHTML("<html><head><title>Test</title></head></html>");

      expect(doc.head).toBeTruthy();
      expect((doc.head as any)?.tagName).toBe("HEAD");
    });
  });
});

describe("DOM Simulator - Phase 2: Navigation and Attributes", () => {
  describe("getTextContent", () => {
    it("should get text content from a simple text node", () => {
      const doc = parseHTML("<p>Hello World</p>");
      const p = doc.childNodes[0]!;
      const textNode = p.childNodes[0]!;

      expect(getTextContent(textNode)).toBe("Hello World");
    });

    it("should get text content from an element with text", () => {
      const doc = parseHTML("<p>Hello World</p>");
      const p = doc.childNodes[0]!;

      expect(getTextContent(p)).toBe("Hello World");
    });

    it("should get concatenated text from nested elements", () => {
      const doc = parseHTML("<div>Hello <span>beautiful</span> world</div>");
      const div = doc.childNodes[0]!;

      expect(getTextContent(div)).toBe("Hello beautiful world");
    });

    it("should get text from deeply nested elements", () => {
      const doc = parseHTML(
        "<div>Start <p>Middle <em>Deep <strong>Deeper</strong></em></p> End</div>"
      );
      const div = doc.childNodes[0]!;

      expect(getTextContent(div)).toBe("Start Middle Deep Deeper End");
    });

    it("should return empty string for elements with no text", () => {
      const doc = parseHTML("<div></div>");
      const div = doc.childNodes[0]!;

      expect(getTextContent(div)).toBe("");
    });

    it("should ignore comments when getting text content", () => {
      const doc = parseHTML("<div>Before<!-- comment -->After</div>");
      const div = doc.childNodes[0]!;

      expect(getTextContent(div)).toBe("BeforeAfter");
    });

    it("should handle mixed content with self-closing elements", () => {
      const doc = parseHTML("<p>Before<br/>After</p>");
      const p = doc.childNodes[0]!;

      expect(getTextContent(p)).toBe("BeforeAfter");
    });
  });

  describe("Attribute functions", () => {
    it("should get existing attributes", () => {
      const doc = parseHTML(
        '<div id="test" class="highlight" data-value="123">Content</div>'
      );
      const div = doc.childNodes[0]! as any;

      expect(getAttribute(div, "id")).toBe("test");
      expect(getAttribute(div, "class")).toBe("highlight");
      expect(getAttribute(div, "data-value")).toBe("123");
    });

    it("should return null for non-existing attributes", () => {
      const doc = parseHTML('<div id="test">Content</div>');
      const div = doc.childNodes[0]! as any;

      expect(getAttribute(div, "nonexistent")).toBeNull();
      expect(getAttribute(div, "class")).toBeNull();
    });

    it("should check if attributes exist", () => {
      const doc = parseHTML('<div id="test" class="highlight">Content</div>');
      const div = doc.childNodes[0]! as any;

      expect(hasAttribute(div, "id")).toBe(true);
      expect(hasAttribute(div, "class")).toBe(true);
      expect(hasAttribute(div, "nonexistent")).toBe(false);
    });

    it("should set new attributes", () => {
      const doc = parseHTML("<div>Content</div>");
      const div = doc.childNodes[0]! as any;

      setAttribute(div, "id", "new-id");
      setAttribute(div, "class", "new-class");

      expect(getAttribute(div, "id")).toBe("new-id");
      expect(getAttribute(div, "class")).toBe("new-class");
      expect(hasAttribute(div, "id")).toBe(true);
      expect(hasAttribute(div, "class")).toBe(true);
    });

    it("should update existing attributes", () => {
      const doc = parseHTML('<div id="old-id" class="old-class">Content</div>');
      const div = doc.childNodes[0]! as any;

      setAttribute(div, "id", "new-id");
      setAttribute(div, "class", "new-class");

      expect(getAttribute(div, "id")).toBe("new-id");
      expect(getAttribute(div, "class")).toBe("new-class");
    });

    it("should remove attributes", () => {
      const doc = parseHTML(
        '<div id="test" class="highlight" data-value="123">Content</div>'
      );
      const div = doc.childNodes[0]! as any;

      removeAttribute(div, "class");
      removeAttribute(div, "data-value");

      expect(getAttribute(div, "id")).toBe("test");
      expect(getAttribute(div, "class")).toBeNull();
      expect(getAttribute(div, "data-value")).toBeNull();
      expect(hasAttribute(div, "class")).toBe(false);
      expect(hasAttribute(div, "data-value")).toBe(false);
    });

    it("should handle removing non-existing attributes gracefully", () => {
      const doc = parseHTML('<div id="test">Content</div>');
      const div = doc.childNodes[0]! as any;

      removeAttribute(div, "nonexistent");

      expect(getAttribute(div, "id")).toBe("test");
    });
  });
});

describe("DOM extra tests", () => {
  const smallDocument = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Sample Page</title>
        <meta charset="UTF-8">
      </head>
      <body>
        <header id="main-header" class="site-header">
          <h1>Welcome</h1>
        </header>
        <main>
          <section>
            <p>First paragraph.</p>
            <p>Second <strong>paragraph</strong> with <em>formatting</em>.</p>
          </section>
          <img src="image.jpg" alt="Sample Image">
          <!-- Footer note -->
        </main>
        <footer>
          <p>Contact: <a href="mailto:test@example.com">Email us</a></p>
        </footer>
      </body>
    </html>
  `;

  it("should parse a simple HTML document and perform common DOM operations", () => {
    const doc = parseHTML(`<!DOCTYPE html>
<html>
<head>
    <title>Test Document</title>
</head>
<body>
    <h1>Welcome to the Test Document</h1>
    <p>This is a paragraph in the test document.</p>
</body>
</html>`);

    expect(doc.body).toHaveProperty("querySelector");

    const h1 = doc.body?.querySelector("h1");

    expect(h1).toBeTruthy();
    expect(h1?.tagName).toBe("H1");
    expect(h1?.textContent).toBe("Welcome to the Test Document");
    expect(h1?.innerHTML).toBe("Welcome to the Test Document");
  });

  it("should correctly parse nested elements and maintain DOM structure", () => {
    const doc = parseHTML(`<div><p><span>Hello</span> World</p></div>`);
    const div = doc.body?.querySelector("div");
    const p = div?.querySelector("p");
    const span = p?.querySelector("span");

    expect(div).toBeTruthy();
    expect(p).toBeTruthy();
    expect(span).toBeTruthy();
    expect(span?.textContent).toBe("Hello");
    expect(p?.textContent).toBe("Hello World");
  });

  it("should create a new Document", () => {
    const doc = parseHTML();
    expect(doc).toBeTruthy();
    expect(doc.nodeType).toBe(NodeType.DOCUMENT_NODE);
    expect(doc.nodeName).toBe("#document");
    expect(doc.childNodes.length).toBe(0);
  });

  it("should parse document structure and identify main elements", () => {
    const doc = parseHTML(smallDocument);

    expect(doc.nodeType).toBe(NodeType.DOCUMENT_NODE);
    expect(doc.documentElement?.nodeName).toBe("HTML");
    expect(doc.head?.nodeName).toBe("HEAD");
    expect(doc.body?.nodeName).toBe("BODY");

    expect(doc.head?.querySelector("title")?.textContent).toBe("Sample Page");
    expect(doc.head?.querySelector("meta")?.getAttribute("charset")).toBe(
      "UTF-8"
    );
  });

  it("should query and navigate DOM elements correctly", () => {
    const doc = parseHTML(smallDocument);

    const header = doc.body?.querySelector("#main-header")!;
    expect(header.nodeName).toBe("HEADER");
    expect(header.getAttribute("class")).toBe("site-header");
    expect(header.querySelector("h1")?.textContent).toBe("Welcome");

    const section = doc.body?.querySelector("section")!;
    const paragraphs = section.querySelectorAll("p");
    expect(paragraphs.length).toBe(2);
    expect(paragraphs[0]?.textContent).toBe("First paragraph.");
    expect(paragraphs[1]?.textContent).toBe(
      "Second paragraph with formatting."
    );

    const strong = section.querySelector("strong")!;
    expect(strong.textContent).toBe("paragraph");
    expect(strong.parentNode?.nodeName).toBe("P");

    const em = section.querySelector("em")!;
    expect(em.textContent).toBe("formatting");
  });

  it("should handle different node types and attributes", () => {
    const doc = parseHTML(smallDocument);

    const img = doc.body?.querySelector("img")!;
    expect(img.nodeName).toBe("IMG");
    expect(img.getAttribute("src")).toBe("image.jpg");
    expect(img.getAttribute("alt")).toBe("Sample Image");

    const main = doc.body?.querySelector("main")!;
    const commentNode = main.childNodes.find(
      (n: any) => n.nodeType === NodeType.COMMENT_NODE
    );
    expect(commentNode).toBeTruthy();
    expect(commentNode?.nodeValue?.trim()).toBe("Footer note");

    const footerLink = doc.body?.querySelector("footer a")!;
    expect(footerLink.getAttribute("href")).toBe("mailto:test@example.com");
    expect(footerLink.textContent).toBe("Email us");
  });

  it("should support DOM manipulation and traversal operations", () => {
    const doc = parseHTML(smallDocument);
    const section = doc.body?.querySelector("section")!;
    const paragraphs = section.querySelectorAll("p");
    const header = doc.body?.querySelector("#main-header")!;

    const clonedFooter = (doc.body?.querySelector("footer") as any).cloneNode(
      true
    );
    expect(clonedFooter.nodeName).toBe("FOOTER");
    expect(clonedFooter.querySelector("a")?.textContent).toBe("Email us");

    const bodyText = getTextContent(doc.body!);
    expect(bodyText.includes("Welcome")).toBe(true);
    expect(bodyText.includes("First paragraph.")).toBe(true);
    expect(bodyText.includes("Second paragraph with formatting")).toBe(true);
    expect(bodyText.includes("Email us")).toBe(true);

    // Attribute manipulation
    header.setAttribute("data-role", "banner");
    expect(header.getAttribute("data-role")).toBe("banner");
    header.removeAttribute("class");
    expect(header.hasAttribute("class")).toBe(false);

    // Sibling relationships - handling whitespace text nodes between elements
    const firstP = paragraphs[0]!;
    const secondP = paragraphs[1]!;
    
    // nextSibling/previousSibling include text nodes (whitespace), 
    // so we need to check nextElementSibling/previousElementSibling instead
    expect(firstP.nextElementSibling === secondP).toBe(true);
    expect(secondP.previousElementSibling === firstP).toBe(true);

    // Verify that there are indeed text nodes between the paragraphs
    expect(firstP.nextSibling?.nodeType).toBe(NodeType.TEXT_NODE);
    expect(secondP.previousSibling?.nodeType).toBe(NodeType.TEXT_NODE);

    // Alternative: Compare by key properties for more robust checking
    const compareNodes = (node1: any, node2: any) => {
      if (!node1 || !node2) return node1 === node2;
      return (
        node1.nodeName === node2.nodeName &&
        node1.nodeType === node2.nodeType &&
        node1.textContent === node2.textContent
      );
    };

    expect(compareNodes(firstP.nextElementSibling, secondP)).toBe(true);
    expect(compareNodes(secondP.previousElementSibling, firstP)).toBe(true);
  });
});
