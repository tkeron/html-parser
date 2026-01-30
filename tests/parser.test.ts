// @ts-nocheck
import { expect, it, describe } from "bun:test";
import { tokenize } from "../src/tokenizer/index.js";
import { parse, domToAST, ASTNodeType, type ASTNode } from "../src/parser";
import { file } from "bun";

function parseToAST(html: string): ASTNode {
  const tokens = tokenize(html);
  const dom = parse(tokens);
  const ast = domToAST(dom);

  const hasExplicitHtml =
    html.includes("<html") ||
    html.includes("<!DOCTYPE") ||
    html.includes("<!doctype");
  if (hasExplicitHtml) {
    return ast;
  }

  const htmlEl = ast.children?.find((c) => c.tagName === "html");
  if (htmlEl) {
    const bodyEl = htmlEl.children?.find((c) => c.tagName === "body");
    if (bodyEl && bodyEl.children) {
      const nonHtmlChildren =
        ast.children?.filter(
          (c) => c.tagName !== "html" && c.type !== "doctype",
        ) || [];
      return {
        type: ASTNodeType.Document,
        children: [...nonHtmlChildren, ...bodyEl.children],
      };
    }
  }
  return ast;
}

describe("HTML Parser", () => {
  describe("Basic Elements", () => {
    it("should parse simple element", () => {
      const ast = parseToAST("<div></div>");

      expect(ast.type).toBe(ASTNodeType.Document);
      expect(ast.children).toHaveLength(1);

      const divElement = ast.children![0]!;
      expect(divElement.type).toBe(ASTNodeType.Element);
      expect(divElement.tagName).toBe("div");
      expect(divElement.children).toHaveLength(0);
    });

    it("should parse element with attributes", () => {
      const ast = parseToAST('<div class="container" id="main"></div>');

      const divElement = ast.children![0]!;
      expect(divElement.attributes).toEqual({
        class: "container",
        id: "main",
      });
    });

    it("should parse self-closing elements", () => {
      const ast = parseToAST('<img src="test.jpg" alt="test"/>');

      const imgElement = ast.children![0]!;
      expect(imgElement.type).toBe(ASTNodeType.Element);
      expect(imgElement.tagName).toBe("img");
      expect((imgElement as any).isSelfClosing).toBe(true);
      expect(imgElement.attributes).toEqual({
        src: "test.jpg",
        alt: "test",
      });
    });

    it("should parse void elements correctly", () => {
      const ast = parseToAST('<br><hr><input type="text">');

      expect(ast.children).toHaveLength(3);
      expect(ast.children![0]!.tagName).toBe("br");
      expect((ast.children![0]! as any).isSelfClosing).toBe(true);
      expect(ast.children![1]!.tagName).toBe("hr");
      expect((ast.children![1]! as any).isSelfClosing).toBe(true);
      expect(ast.children![2]!.tagName).toBe("input");
      expect((ast.children![2]! as any).isSelfClosing).toBe(true);
    });
  });

  describe("Nested Elements", () => {
    it("should parse nested elements", () => {
      const ast = parseToAST("<div><p>Hello</p></div>");

      const divElement = ast.children![0]!;
      expect(divElement.tagName).toBe("div");
      expect(divElement.children).toHaveLength(1);

      const pElement = divElement.children![0]!;
      expect(pElement.tagName).toBe("p");
      expect(pElement.children).toHaveLength(1);

      const textNode = pElement.children![0]!;
      expect(textNode.type).toBe(ASTNodeType.Text);
      expect((textNode as any).content).toBe("Hello");
    });

    it("should parse deeply nested elements", () => {
      const ast = parseToAST(
        "<div><section><article><h1>Title</h1></article></section></div>",
      );

      const divElement = ast.children![0]!;
      const sectionElement = divElement.children![0]!;
      const articleElement = sectionElement.children![0]!;
      const h1Element = articleElement.children![0]!;

      expect(h1Element.tagName).toBe("h1");
      expect((h1Element.children![0]! as any).content).toBe("Title");
    });

    it("should handle multiple siblings", () => {
      const ast = parseToAST(
        "<div><p>First</p><p>Second</p><p>Third</p></div>",
      );

      const divElement = ast.children![0]!;
      expect(divElement.children).toHaveLength(3);

      expect(divElement.children![0]!.tagName).toBe("p");
      expect((divElement.children![0]!.children![0] as any).content).toBe(
        "First",
      );
      expect((divElement.children![1]!.children![0] as any).content).toBe(
        "Second",
      );
      expect((divElement.children![2]!.children![0] as any).content).toBe(
        "Third",
      );
    });
  });

  describe("Text Content", () => {
    it("should parse text content", () => {
      const ast = parseToAST("Hello World");

      expect(ast.children).toHaveLength(1);
      const textNode = ast.children![0]!;
      expect(textNode.type).toBe(ASTNodeType.Text);
      expect((textNode as any).content).toBe("Hello World");
    });

    it("should parse mixed text and elements", () => {
      const ast = parseToAST("Before <strong>bold</strong> after");

      expect(ast.children).toHaveLength(3);
      expect((ast.children![0]! as any).content).toBe("Before ");
      expect(ast.children![1]!.tagName).toBe("strong");
      expect((ast.children![1]!.children![0]! as any).content).toBe("bold");
      expect((ast.children![2]! as any).content).toBe(" after");
    });

    it("should handle entities in text", () => {
      const ast = parseToAST("<p>&amp; &lt; &gt;</p>");

      const pElement = ast.children![0]!;
      const textNode = pElement.children![0]!;
      expect((textNode as any).content).toBe("& < >");
    });
  });

  describe("Comments and Special Nodes", () => {
    it("should parse HTML comments", () => {
      const ast = parseToAST("<!-- This is a comment -->");

      expect(ast.children).toHaveLength(1);
      const commentNode = ast.children![0]!;
      expect(commentNode.type).toBe(ASTNodeType.Comment);
      expect((commentNode as any).content).toBe(" This is a comment ");
    });

    it("should parse DOCTYPE", () => {
      const ast = parseToAST("<!DOCTYPE html>");

      const doctypeNode = ast.children?.find(
        (c) => c.type === ASTNodeType.Doctype,
      );
      expect(doctypeNode).toBeDefined();
      expect((doctypeNode as any).content).toBe("html");
    });

    it.skip("should parse CDATA sections", () => {
      const ast = parseToAST("<![CDATA[Some raw data]]>");

      expect(ast.children).toHaveLength(1);
      const cdataNode = ast.children![0]!;
      expect(cdataNode.type).toBe(ASTNodeType.CDATA);
      expect((cdataNode as any).content).toBe("Some raw data");
    });

    it.skip("should parse processing instructions", () => {
      const ast = parseToAST('<?xml version="1.0"?>');

      expect(ast.children).toHaveLength(1);
      const piNode = ast.children![0]!;
      expect(piNode.type).toBe("processing-instruction" as any);
      expect((piNode as any).content).toBe('<?xml version="1.0"');
    });
  });

  describe("Complete HTML Documents", () => {
    it("should parse complete HTML document", () => {
      const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Test Document</title>
    <meta charset="UTF-8">
  </head>
  <body>
    <h1>Hello World</h1>
    <p>This is a test paragraph.</p>
    <!-- This is a comment -->
  </body>
</html>`;

      const ast = parseToAST(html);

      expect(ast.children!.length).toBeGreaterThan(1);

      const htmlElement = ast.children!.find(
        (child) =>
          child.type === ASTNodeType.Element && child.tagName === "html",
      )!;

      expect(htmlElement).toBeDefined();
      expect(htmlElement.attributes!.lang).toBe("en");

      const elementChildren = htmlElement.children!.filter(
        (child) => child.type === ASTNodeType.Element,
      );
      expect(elementChildren).toHaveLength(2);

      const headElement = elementChildren.find(
        (child) => child.tagName === "head",
      )!;
      const bodyElement = elementChildren.find(
        (child) => child.tagName === "body",
      )!;

      expect(headElement).toBeDefined();
      expect(bodyElement).toBeDefined();
    });
  });

  describe("real web scenarios", () => {
    it("should parse real-world HTML", async () => {
      const html = await file("./tests/test-page-0.txt").text();
      const ast = parseToAST(html);
    });
  });

  describe("Error Recovery", () => {
    it("should handle unclosed tags", () => {
      const ast = parseToAST("<div><p>Unclosed paragraph</div>");

      const divElement = ast.children![0]!;
      expect(divElement.tagName).toBe("div");

      const pElement = divElement.children![0]!;
      expect(pElement.tagName).toBe("p");
    });

    it("should handle unexpected closing tags", () => {
      const ast = parseToAST("<div></span></div>");

      const divElement = ast.children![0]!;
      expect(divElement.tagName).toBe("div");
    });

    it("should handle malformed attributes", () => {
      const ast = parseToAST('<div class="test id="main">Content</div>');

      const divElement = ast.children![0]!;
      expect(divElement.tagName).toBe("div");
      expect(divElement.attributes).toBeDefined();
    });
  });

  describe("Auto-closing Tags", () => {
    it("should auto-close list items", () => {
      const ast = parseToAST("<ul><li>First<li>Second</ul>");

      const ulElement = ast.children![0]!;
      const liElements = ulElement.children!.filter(
        (child) => child.type === ASTNodeType.Element && child.tagName === "li",
      );

      expect(liElements).toHaveLength(2);
      expect((liElements[0]!.children![0]! as any).content).toBe("First");
      expect((liElements[1]!.children![0]! as any).content).toBe("Second");
    });

    it("should auto-close paragraph tags", () => {
      const ast = parseToAST("<p>First paragraph<p>Second paragraph");

      const pElements = ast.children!.filter(
        (child) => child.type === ASTNodeType.Element && child.tagName === "p",
      );

      expect(pElements).toHaveLength(2);
      expect((pElements[0]!.children![0]! as any).content).toBe(
        "First paragraph",
      );
      expect((pElements[1]!.children![0]! as any).content).toBe(
        "Second paragraph",
      );
    });
  });

  describe("Whitespace Handling", () => {
    it("should preserve significant whitespace", () => {
      const ast = parseToAST("<p>  Hello   World  </p>");

      const pElement = ast.children![0]!;
      const textNode = pElement.children![0]!;
      expect((textNode as any).content).toBe("  Hello   World  ");
    });

    it("should skip insignificant whitespace", () => {
      const ast = parseToAST(`<html>
  <head>
    <title>Test</title>
  </head>
</html>`);

      const htmlElement = ast.children!.find(
        (child) =>
          child.type === ASTNodeType.Element && child.tagName === "html",
      )!;

      const headElement = htmlElement.children!.find(
        (child) =>
          child.type === ASTNodeType.Element && child.tagName === "head",
      )!;

      expect(headElement).toBeDefined();
    });
  });

  describe("complete web page", () => {
    it("should parse a complete web page", async () => {
      const html = await file("./tests/test-page-0.txt").text();
      const ast = parseToAST(html);
      expect(ast.children!.length).toBeGreaterThanOrEqual(1);
      const htmlElement = ast.children!.find(
        (child) =>
          child.type === ASTNodeType.Element && child.tagName === "html",
      )!;
      expect(htmlElement).toBeDefined();
      expect(htmlElement.type).toBe(ASTNodeType.Element);
      expect(htmlElement.tagName).toBe("html");
      expect(htmlElement.attributes!.lang).toBe("en");
      const headElement = htmlElement.children!.find(
        (child) =>
          child.type === ASTNodeType.Element && child.tagName === "head",
      )!;
      const bodyElement = htmlElement.children!.find(
        (child) =>
          child.type === ASTNodeType.Element && child.tagName === "body",
      )!;
      expect(headElement).toBeDefined();
      expect(bodyElement).toBeDefined();
    });
  });

  describe("Advanced Edge Cases", () => {
    it("should handle empty attributes", () => {
      const ast = parseToAST('<input disabled checked="" value="">');
      const inputElement = ast.children![0]!;
      expect(inputElement.attributes).toEqual({
        disabled: "",
        checked: "",
        value: "",
      });
    });

    it("should handle attributes with special characters", () => {
      const ast = parseToAST(
        '<div data-test="hello-world" class="my_class-123">',
      );
      const divElement = ast.children![0]!;
      expect(divElement.attributes).toEqual({
        "data-test": "hello-world",
        class: "my_class-123",
      });
    });

    it("should handle mixed quotes in attributes", () => {
      const ast = parseToAST(
        `<div title='He said "Hello"' data-info="She's here">`,
      );
      const divElement = ast.children![0]!;
      expect(divElement.attributes!.title).toBe('He said "Hello"');
      expect(divElement.attributes!["data-info"]).toBe("She's here");
    });

    it("should handle deeply nested comments", () => {
      const ast = parseToAST(
        "<div><!-- Outer <!-- Inner --> comment --></div>",
      );
      const divElement = ast.children![0]!;
      expect(divElement.children!.length).toBeGreaterThanOrEqual(1);
      expect(divElement.children![0]!.type).toBe(ASTNodeType.Comment);
    });

    it("should handle multiple consecutive whitespace", () => {
      const ast = parseToAST(
        "<p>    \n\t   Hello    \n\t   World    \n\t   </p>",
      );
      const pElement = ast.children![0]!;
      const textNode = pElement.children![0]!;
      expect((textNode as any).content).toContain("Hello");
      expect((textNode as any).content).toContain("World");
    });

    it("should handle malformed nested tags", () => {
      const ast = parseToAST("<div><p><span>Text</div></span></p>");
      const divElement = ast.children![0]!;
      expect(divElement.tagName).toBe("div");
      expect(divElement.children!.length).toBeGreaterThan(0);
    });

    it("should handle orphaned closing tags", () => {
      const ast = parseToAST("</div><p>Content</p></span>");
      const pElement = ast.children!.find(
        (child) => child.type === ASTNodeType.Element && child.tagName === "p",
      )!;
      expect(pElement).toBeDefined();
      expect((pElement.children![0]! as any).content).toBe("Content");
    });

    it("should handle extreme nesting depth", () => {
      let html = "";
      const depth = 50;
      for (let i = 0; i < depth; i++) {
        html += `<div level="${i}">`;
      }
      html += "Deep content";
      for (let i = 0; i < depth; i++) {
        html += "</div>";
      }
      const ast = parseToAST(html);
      let current = ast.children![0]!;
      for (let i = 0; i < depth - 1; i++) {
        expect(current.tagName).toBe("div");
        expect(current.attributes!.level).toBe(i.toString());
        current = current.children!.find(
          (child) => child.type === ASTNodeType.Element,
        )!;
      }
      const textNode = current.children!.find(
        (child) => child.type === ASTNodeType.Text,
      )!;
      expect((textNode as any).content).toBe("Deep content");
    });
  });

  describe("Complex Entity Handling", () => {
    it("should handle numeric character references", () => {
      const ast = parseToAST("<p>&#65; &#8364; &#x41; &#x20AC;</p>");
      const pElement = ast.children![0]!;
      const textNode = pElement.children![0]!;
      expect((textNode as any).content).toBe("A € A €");
    });

    it("should handle mixed entities and text", () => {
      const ast = parseToAST(
        "<p>R&amp;D &lt;testing&gt; &quot;quotes&quot; &apos;apostrophe&apos;</p>",
      );
      const pElement = ast.children![0]!;
      const textNode = pElement.children![0]!;
      expect((textNode as any).content).toBe(
        "R&D <testing> \"quotes\" 'apostrophe'",
      );
    });

    it("should handle entities in attributes", () => {
      const ast = parseToAST(
        '<div title="R&amp;D &lt;section&gt;" data-test="&quot;hello&quot;">',
      );
      const divElement = ast.children![0]!;
      expect(divElement.attributes!.title).toBe("R&D <section>");
      expect(divElement.attributes!["data-test"]).toBe('"hello"');
    });
  });

  describe("DOM-like Functionality Tests", () => {
    it("should maintain parent-child relationships", () => {
      const ast = parseToAST(
        "<div><section><article><h1>Title</h1><p>Content</p></article></section></div>",
      );
      const divElement = ast.children![0]!;
      const sectionElement = divElement.children![0]!;
      const articleElement = sectionElement.children![0]!;
      expect(articleElement.children).toHaveLength(2);
      expect(articleElement.children![0]!.tagName).toBe("h1");
      expect(articleElement.children![1]!.tagName).toBe("p");
    });

    it("should handle sibling navigation scenarios", () => {
      const ast = parseToAST(
        '<nav><a href="#home">Home</a><a href="#about">About</a><a href="#contact">Contact</a></nav>',
      );
      const navElement = ast.children![0]!;
      const links = navElement.children!.filter(
        (child) => child.type === ASTNodeType.Element,
      );
      expect(links).toHaveLength(3);
      links.forEach((link, index) => {
        expect(link.tagName).toBe("a");
        expect(link.attributes!.href).toBeDefined();
        expect(link.children![0]!.type).toBe(ASTNodeType.Text);
      });
      expect((links[0]!.children![0]! as any).content).toBe("Home");
      expect((links[1]!.children![0]! as any).content).toBe("About");
      expect((links[2]!.children![0]! as any).content).toBe("Contact");
    });

    it("should handle form elements with all attribute types", () => {
      const ast = parseToAST(`
        <form action="/submit" method="post" enctype="multipart/form-data">
          <input type="text" name="username" required placeholder="Enter username" maxlength="50">
          <input type="password" name="password" required>
          <input type="email" name="email" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$">
          <select name="country" multiple size="5">
            <option value="us" selected>United States</option>
            <option value="ca">Canada</option>
            <option value="mx">Mexico</option>
          </select>
          <textarea name="comments" rows="4" cols="50" placeholder="Enter comments"></textarea>
          <input type="checkbox" name="terms" id="terms" checked>
          <label for="terms">I agree to the terms</label>
          <button type="submit" disabled>Submit</button>
        </form>
      `);
      const formElement = ast.children!.find(
        (child) => child.tagName === "form",
      )!;
      expect(formElement.attributes!.action).toBe("/submit");
      expect(formElement.attributes!.method).toBe("post");
      const inputs: ASTNode[] = [];
      const traverse = (node: ASTNode) => {
        if (node.type === ASTNodeType.Element) {
          if (
            ["input", "select", "textarea", "button"].includes(node.tagName!)
          ) {
            inputs.push(node);
          }
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      traverse(formElement);
      expect(inputs.length).toBeGreaterThan(5);
      const usernameInput = inputs.find(
        (input) => input.attributes?.name === "username",
      );
      expect(usernameInput!.attributes!.required).toBe("");
      expect(usernameInput!.attributes!.placeholder).toBe("Enter username");
      const selectElement = inputs.find((input) => input.tagName === "select");
      expect(selectElement!.attributes!.multiple).toBe("");
    });

    it("should handle table structures correctly", () => {
      const ast = parseToAST(`
        <table border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Age</th>
              <th scope="col">City</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John Doe</td>
              <td>30</td>
              <td>New York</td>
            </tr>
            <tr>
              <td>Jane Smith</td>
              <td>25</td>
              <td>Los Angeles</td>
            </tr>
          </tbody>
        </table>
      `);
      const tableElement = ast.children!.find(
        (child) => child.tagName === "table",
      )!;
      const thead = tableElement.children!.find(
        (child) => child.tagName === "thead",
      );
      const tbody = tableElement.children!.find(
        (child) => child.tagName === "tbody",
      );
      expect(thead).toBeDefined();
      expect(tbody).toBeDefined();
      const rows: ASTNode[] = [];
      const traverse = (node: ASTNode) => {
        if (node.tagName === "tr") {
          rows.push(node);
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      traverse(tableElement);
      expect(rows).toHaveLength(3);
    });

    it("should handle mixed content with inline elements", () => {
      const ast = parseToAST(`
        <p>This is <strong>bold text</strong> and this is <em>italic text</em>. 
        Here's a <a href="https://example.com" target="_blank">link</a> and some 
        <code>inline code</code>. Also <span class="highlight">highlighted text</span>.</p>
      `);
      const pElement = ast.children!.find((child) => child.tagName === "p")!;
      let textNodes = 0;
      let elementNodes = 0;
      let totalChildren = 0;
      const traverse = (node: ASTNode) => {
        totalChildren++;
        if (node.type === ASTNodeType.Text && (node as any).content!.trim()) {
          textNodes++;
        } else if (node.type === ASTNodeType.Element) {
          elementNodes++;
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      if (pElement.children) {
        pElement.children.forEach(traverse);
      }
      expect(elementNodes).toBeGreaterThan(3);
      expect(textNodes).toBeGreaterThan(0);
    });

    it("should preserve document structure integrity", () => {
      const ast = parseToAST(`<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>Test Document</title>
            <style>body { margin: 0; }</style>
            <script>console.log('Hello');</script>
          </head>
          <body>
            <header id="main-header">
              <h1>Welcome</h1>
            </header>
            <main>
              <section class="content">
                <article>
                  <h2>Article Title</h2>
                  <p>Article content goes here.</p>
                </article>
              </section>
            </main>
            <footer>
              <p>&copy; 2025 Test Company</p>
            </footer>
          </body>
        </html>`);
      const doctype = ast.children!.find(
        (child) => child.type === ASTNodeType.Doctype,
      );
      expect(doctype).toBeDefined();
      const htmlElement = ast.children!.find(
        (child) => child.tagName === "html",
      )!;
      expect(htmlElement.attributes!.lang).toBe("en");
      const headElement = htmlElement.children!.find(
        (child) => child.tagName === "head",
      );
      const bodyElement = htmlElement.children!.find(
        (child) => child.tagName === "body",
      );
      expect(headElement).toBeDefined();
      expect(bodyElement).toBeDefined();
      const headerElement = bodyElement!.children!.find(
        (child) => child.tagName === "header",
      );
      const mainElement = bodyElement!.children!.find(
        (child) => child.tagName === "main",
      );
      const footerElement = bodyElement!.children!.find(
        (child) => child.tagName === "footer",
      );
      expect(headerElement).toBeDefined();
      expect(mainElement).toBeDefined();
      expect(footerElement).toBeDefined();
      expect(headerElement!.attributes!.id).toBe("main-header");
    });
  });
});
