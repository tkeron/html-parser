import { expect, it, describe } from "bun:test";
import { tokenize, TokenType } from "../../src/tokenizer/index.js";

describe("HTML Tokenizer", () => {
  describe("Basic Tags", () => {
    it("should tokenize simple opening tag", () => {
      const tokens = tokenize("<div>");

      expect(tokens).toHaveLength(2);
      expect(tokens[0]!).toEqual({
        type: TokenType.TAG_OPEN,
        value: "div",
        position: expect.any(Object),
        attributes: {},
        isSelfClosing: false,
      });
      expect(tokens[1]!.type).toBe(TokenType.EOF);
    });

    it("should tokenize simple closing tag", () => {
      const tokens = tokenize("</div>");

      expect(tokens).toHaveLength(2);
      expect(tokens[0]!).toEqual({
        type: TokenType.TAG_CLOSE,
        value: "div",
        position: expect.any(Object),
        isClosing: true,
      });
    });

    it("should tokenize self-closing tag", () => {
      const tokens = tokenize("<img/>");

      expect(tokens).toHaveLength(2);
      expect(tokens[0]!).toEqual({
        type: TokenType.TAG_OPEN,
        value: "img",
        position: expect.any(Object),
        attributes: {},
        isSelfClosing: true,
      });
    });

    it("should handle case insensitive tag names", () => {
      const tokens = tokenize("<DIV></DIV>");

      expect(tokens[0]!.value).toBe("div");
      expect(tokens[1]!.value).toBe("div");
    });
  });

  describe("Attributes", () => {
    it("should parse attributes with double quotes", () => {
      const tokens = tokenize('<div class="container" id="main">');

      expect(tokens[0]?.attributes).toEqual({
        class: "container",
        id: "main",
      });
    });

    it("should parse attributes with single quotes", () => {
      const tokens = tokenize(`<div class='container' id='main'>`);

      expect(tokens[0]?.attributes).toEqual({
        class: "container",
        id: "main",
      });
    });

    it("should parse unquoted attributes", () => {
      const tokens = tokenize("<div class=container id=main>");

      expect(tokens[0]?.attributes).toEqual({
        class: "container",
        id: "main",
      });
    });

    it("should parse boolean attributes", () => {
      const tokens = tokenize("<input disabled checked>");

      expect(tokens[0]?.attributes).toEqual({
        disabled: "",
        checked: "",
      });
    });

    it("should handle mixed attribute types", () => {
      const tokens = tokenize('<input type="text" disabled value=test>');

      expect(tokens[0]?.attributes).toEqual({
        type: "text",
        disabled: "",
        value: "test",
      });
    });

    it("should handle attributes with special characters", () => {
      const tokens = tokenize('<div data-test="value" aria-label="test">');

      expect(tokens[0]?.attributes).toEqual({
        "data-test": "value",
        "aria-label": "test",
      });
    });
  });

  describe("Text Content", () => {
    it("should tokenize plain text", () => {
      const tokens = tokenize("Hello World");

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({
        type: TokenType.TEXT,
        value: "Hello World",
        position: expect.any(Object),
      });
    });

    it("should handle text with whitespace", () => {
      const tokens = tokenize("  Hello   World  ");

      expect(tokens[0]?.value).toBe("  Hello   World  ");
    });

    it("should handle multiline text", () => {
      const tokens = tokenize("Line 1\nLine 2\nLine 3");

      expect(tokens[0]?.value).toBe("Line 1\nLine 2\nLine 3");
    });
  });

  describe("HTML Entities", () => {
    it("should parse named entities", () => {
      const tokens = tokenize("&amp; &lt; &gt; &quot; &nbsp;");

      expect(tokens[0]?.value).toBe('& < > " \u00A0');
    });

    it("should parse numeric entities", () => {
      const tokens = tokenize("&#65; &#66; &#67;");

      expect(tokens[0]?.value).toBe("A B C");
    });

    it("should parse hexadecimal entities", () => {
      const tokens = tokenize("&#x41; &#x42; &#x43;");

      expect(tokens[0]?.value).toBe("A B C");
    });

    it("should handle entities in attributes", () => {
      const tokens = tokenize('<div title="&quot;Hello&quot;">');

      expect(tokens[0]?.attributes!.title).toBe('"Hello"');
    });

    it("should handle unknown entities", () => {
      const tokens = tokenize("&unknown;");

      expect(tokens[0]?.value).toBe("&unknown;");
    });
  });

  describe("Comments", () => {
    it("should parse HTML comments", () => {
      const tokens = tokenize("<!-- This is a comment -->");

      expect(tokens[0]).toEqual({
        type: TokenType.COMMENT,
        value: " This is a comment ",
        position: expect.any(Object),
      });
    });

    it("should handle multiline comments", () => {
      const tokens = tokenize(
        `<!-- \n        Multi line\n        comment\n      -->`,
      );

      expect(tokens[0]?.type).toBe(TokenType.COMMENT);
      expect(tokens[0]?.value).toContain("Multi line");
    });

    it("should handle empty comments", () => {
      const tokens = tokenize("<!---->");

      expect(tokens[0]).toEqual({
        type: TokenType.COMMENT,
        value: "",
        position: expect.any(Object),
      });
    });
  });

  describe("CDATA Sections (HTML5: treated as bogus comments)", () => {
    it("should parse CDATA sections as bogus comments in HTML5", () => {
      const tokens = tokenize("<![CDATA[Some data]]>");

      expect(tokens[0]).toEqual({
        type: TokenType.COMMENT,
        value: "[CDATA[Some data]]",
        position: expect.any(Object),
      });
    });

    it("should handle CDATA with special characters as bogus comment", () => {
      const tokens = tokenize('<![CDATA[<script>alert("test");</script>]]>');

      expect(tokens[0]?.value).toBe('[CDATA[<script>alert("test");</script>]]');
    });
  });

  describe("DOCTYPE Declaration", () => {
    it("should parse DOCTYPE declaration", () => {
      const tokens = tokenize("<!DOCTYPE html>");

      expect(tokens[0]).toEqual({
        type: TokenType.DOCTYPE,
        value: "html",
        position: expect.any(Object),
      });
    });

    it("should parse complex DOCTYPE", () => {
      const tokens = tokenize(
        '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">',
      );

      expect(tokens[0]?.type).toBe(TokenType.DOCTYPE);
      expect(tokens[0]?.value).toBe("html");
    });
  });

  describe("Processing Instructions (HTML5: treated as bogus comments)", () => {
    it("should parse XML processing instruction as bogus comment", () => {
      const tokens = tokenize('<?xml version="1.0" encoding="UTF-8"?>');

      expect(tokens[0]).toEqual({
        type: TokenType.COMMENT,
        value: '?xml version="1.0" encoding="UTF-8"?',
        position: expect.any(Object),
      });
    });

    it("should parse PHP-style processing instruction as bogus comment", () => {
      const tokens = tokenize('<?php echo "Hello"; ?>');

      expect(tokens[0]?.type).toBe(TokenType.COMMENT);
      expect(tokens[0]?.value).toBe('?php echo "Hello"; ?');
    });
  });

  describe("Complex HTML Documents", () => {
    it("should tokenize complete HTML document", () => {
      const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Test</title>
  </head>
  <body>
    <h1>Hello World</h1>
    <p>This is a test.</p>
  </body>
</html>`;

      const tokens = tokenize(html);

      expect(tokens.length).toBeGreaterThan(10);
      expect(tokens[0]?.type).toBe(TokenType.DOCTYPE);
      expect(tokens[tokens?.length - 1]?.type).toBe(TokenType.EOF);

      const htmlTag = tokens.find(
        (t) => t.type === TokenType.TAG_OPEN && t.value === "html",
      );
      expect(htmlTag).toBeDefined();
      expect(htmlTag!.attributes!.lang).toBe("en");
    });

    it("should handle mixed content", () => {
      const html = `<div>
        Text before <!-- comment -->
        <span>nested</span>
        Text after &amp; entity
      </div>`;

      const tokens = tokenize(html);

      expect(tokens.some((t) => t.type === TokenType.TAG_OPEN)).toBe(true);
      expect(tokens.some((t) => t.type === TokenType.TEXT)).toBe(true);
      expect(tokens.some((t) => t.type === TokenType.COMMENT)).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty input", () => {
      const tokens = tokenize("");

      expect(tokens).toHaveLength(1);
      expect(tokens[0]?.type).toBe(TokenType.EOF);
    });

    it("should handle whitespace only", () => {
      const tokens = tokenize("   \n\t  ");

      expect(tokens).toHaveLength(2);
      expect(tokens[0]?.type).toBe(TokenType.TEXT);
      expect(tokens[0]?.value).toBe("   \n\t  ");
    });

    it("should handle malformed tags", () => {
      const tokens = tokenize('<div class="test>');

      expect(tokens[0]?.type).toBe(TokenType.TAG_OPEN);
      expect(tokens[0]?.value).toBe("div");
    });

    it("should handle unclosed comments", () => {
      const tokens = tokenize("<!-- unclosed comment");

      expect(tokens[0]?.type).toBe(TokenType.COMMENT);
      expect(tokens[0]?.value).toBe(" unclosed comment");
    });
  });

  describe("Advanced Edge Cases", () => {
    it("should handle attributes with no spaces", () => {
      const tokens = tokenize('<div class="test"id="main"data-value="123">');
      expect(tokens.length).toBeGreaterThan(0);
      const tag = tokens[0]!;

      expect(tag.attributes).toEqual({
        class: "test",
        id: "main",
        "data-value": "123",
      });
    });

    it("should handle attributes with excessive spaces", () => {
      const tokens = tokenize('<div   class  =  "test"    id   =   "main"   >');
      expect(tokens.length).toBeGreaterThan(0);
      const tag = tokens[0]!;

      expect(tag.attributes).toEqual({
        class: "test",
        id: "main",
      });
    });

    it("should handle mixed quote styles in same tag", () => {
      const tokens = tokenize(
        `<div class='single' id="double" data-test='mix "quoted" content'>`,
      );
      expect(tokens.length).toBeGreaterThan(0);
      const tag = tokens[0]!;

      expect(tag.attributes!.class).toBe("single");
      expect(tag.attributes!.id).toBe("double");
      expect(tag.attributes!["data-test"]).toBe('mix "quoted" content');
    });

    it("should handle malformed quotes gracefully", () => {
      const tokens = tokenize('<div class="unclosed id="test">');
      expect(tokens.length).toBeGreaterThan(0);
      const tag = tokens[0]!;

      expect(tag.type).toBe(TokenType.TAG_OPEN);
      expect(tag.value).toBe("div");
      expect(tag.attributes).toBeDefined();
    });

    it("should handle empty tag names", () => {
      const tokens = tokenize("<>content</>");

      expect(tokens.length).toBeGreaterThan(0);
    });

    it("should handle tags with numbers and special characters", () => {
      const tokens = tokenize('<h1 class="heading-1" data-level="1">');
      expect(tokens.length).toBeGreaterThan(0);
      const tag = tokens[0]!;

      expect(tag.value).toBe("h1");
      expect(tag.attributes).toEqual({
        class: "heading-1",
        "data-level": "1",
      });
    });

    it("should handle extremely long attribute values", () => {
      const longValue = "a".repeat(10000);
      const tokens = tokenize(`<div data-long="${longValue}">`);
      expect(tokens.length).toBeGreaterThan(0);
      const tag = tokens[0]!;

      expect(tag.attributes!["data-long"]).toBe(longValue);
    });

    it("should handle unicode characters in attributes", () => {
      const tokens = tokenize(
        '<div title="测试" data-emoji="🚀" class="café">',
      );
      expect(tokens.length).toBeGreaterThan(0);
      const tag = tokens[0]!;

      expect(tag.attributes).toEqual({
        title: "测试",
        "data-emoji": "🚀",
        class: "café",
      });
    });

    it("should handle nested quotes in attributes", () => {
      const tokens = tokenize(
        `<div onclick="alert('Hello')" title='She said "hi"'>`,
      );
      expect(tokens.length).toBeGreaterThan(0);
      const tag = tokens[0]!;

      expect(tag.attributes!.onclick).toBe(`alert('Hello')`);
      expect(tag.attributes!.title).toBe('She said "hi"');
    });

    it("should handle attributes without values", () => {
      const tokens = tokenize(
        '<input type="checkbox" checked disabled readonly>',
      );
      expect(tokens.length).toBeGreaterThan(0);
      const tag = tokens[0]!;

      expect(tag.attributes).toEqual({
        type: "checkbox",
        checked: "",
        disabled: "",
        readonly: "",
      });
    });

    it("should handle CDATA as bogus comment with complex content", () => {
      const complexContent = `
        function it() {
          return "<div>HTML inside JS</div>";
        }
        /* Comment with </script> */
        var x = "String with <tags>";
      `;
      const tokens = tokenize(`<![CDATA[${complexContent}]]>`);
      const cdataToken = tokens[0]!;

      expect(cdataToken.type).toBe(TokenType.COMMENT);
      expect(cdataToken.value).toBe("[CDATA[" + complexContent + "]]");
    });

    it("should handle processing instructions as bogus comments", () => {
      const tests = [
        { input: '<?xml version="1.0" encoding="UTF-8"?>', expected: "xml" },
        {
          input: '<?xml-stylesheet type="text/xsl" href="style.xsl"?>',
          expected: "xml",
        },
        { input: '<?php echo "Hello World"; ?>', expected: "php" },
        { input: '<?python print("Hello") ?>', expected: "python" },
      ];

      tests.forEach((test) => {
        const tokens = tokenize(test.input);
        const piToken = tokens[0]!;

        expect(piToken.type).toBe(TokenType.COMMENT);
        expect(piToken.value.toLowerCase()).toContain(test.expected);
      });
    });

    it("should handle comments with special content", () => {
      const specialComments = [
        "<!-- TODO: Fix this -->",
        '<!-- <script>alert("xss")</script> -->',
        "<!-- Multi\nline\ncomment -->",
        "<!-- Comment with -- inside -->",
        "<!--[if IE]><![endif]-->",
      ];

      specialComments.forEach((comment) => {
        const tokens = tokenize(comment);
        const commentToken = tokens[0]!;

        expect(commentToken.type).toBe(TokenType.COMMENT);
      });
    });

    it("should handle mixed content with all token types (HTML5 mode)", () => {
      const html = `
        <!DOCTYPE html>
        <!-- Main document -->
        <html lang="en">
          <head>
            <title>Test &amp; Demo</title>
          </head>
          <body>
            <h1>Hello World</h1>
            <p>Text with <strong>bold</strong> content.</p>
            <!-- End of body -->
          </body>
        </html>
        <!-- End of document -->
      `;

      const tokens = tokenize(html);

      const tokenCounts = {
        [TokenType.DOCTYPE]: 0,
        [TokenType.COMMENT]: 0,
        [TokenType.TAG_OPEN]: 0,
        [TokenType.TAG_CLOSE]: 0,
        [TokenType.TEXT]: 0,
        [TokenType.EOF]: 0,
      };

      tokens.forEach((token) => {
        if (token.type in tokenCounts) {
          tokenCounts[token.type]++;
        }
      });

      expect(tokenCounts[TokenType.DOCTYPE]).toBeGreaterThan(0);
      expect(tokenCounts[TokenType.COMMENT]).toBeGreaterThan(0);
      expect(tokenCounts[TokenType.TAG_OPEN]).toBeGreaterThan(0);
      expect(tokenCounts[TokenType.TAG_CLOSE]).toBeGreaterThan(0);
      expect(tokenCounts[TokenType.TEXT]).toBeGreaterThan(0);
      expect(tokenCounts[TokenType.EOF]).toBe(1);
    });
  });

  describe("Performance and Stress Tests", () => {
    it("should handle very large documents", () => {
      let html = "<div>";
      for (let i = 0; i < 1000; i++) {
        html += `<p id="para-${i}" class="paragraph">Paragraph ${i} content</p>`;
      }
      html += "</div>";

      const startTime = Date.now();
      const tokens = tokenize(html);
      const endTime = Date.now();

      expect(tokens.length).toBeGreaterThan(2000);
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it("should handle deeply nested structures", () => {
      let html = "";
      const depth = 100;

      for (let i = 0; i < depth; i++) {
        html += `<div level="${i}">`;
      }
      html += "Content";
      for (let i = 0; i < depth; i++) {
        html += "</div>";
      }

      const tokens = tokenize(html);

      expect(tokens.length).toBe(depth * 2 + 2);
    });

    it("should handle many attributes per element", () => {
      let html = "<div";
      for (let i = 0; i < 100; i++) {
        html += ` attr-${i}="value-${i}"`;
      }
      html += ">";

      const tokens = tokenize(html);
      const divTag = tokens[0]!;

      expect(Object.keys(divTag.attributes!).length).toBe(100);
      expect(divTag.attributes!["attr-50"]).toBe("value-50");
    });
  });

  describe("Real-world Scenarios", () => {
    it("should handle SVG elements", () => {
      const svg = `
        <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"/>
          <text x="50" y="50" text-anchor="middle">SVG</text>
        </svg>
      `;

      const tokens = tokenize(svg);

      const svgTag = tokens.find((token) => token.value === "svg")!;
      expect(svgTag.attributes!.xmlns).toBe("http://www.w3.org/2000/svg");

      const circleTag = tokens.find((token) => token.value === "circle")!;
      expect(circleTag.isSelfClosing).toBe(true);
      expect(circleTag.attributes!.fill).toBe("red");
    });

    it("should handle script and style tags", () => {
      const html = `
        <script type="text/javascript">
          function hello() {
            alert("Hello <world>");
          }
        </script>
        <style type="text/css">
          .class { color: red; }
          /* Comment with <tags> */
        </style>
      `;

      const tokens = tokenize(html);

      const scriptTag = tokens.find((token) => token.value === "script")!;
      const styleTag = tokens.find((token) => token.value === "style")!;

      expect(scriptTag.attributes!.type).toBe("text/javascript");
      expect(styleTag.attributes!.type).toBe("text/css");
    });

    it("should handle form elements with complex attributes", () => {
      const html = `
        <form method="POST" action="/submit" enctype="multipart/form-data">
          <input type="email" name="email" required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$" title="Please enter a valid email">
          <select name="country" size="1" multiple>
            <option value="us" selected>United States</option>
            <option value="ca">Canada</option>
          </select>
        </form>
      `;

      const tokens = tokenize(html);

      const inputTag = tokens.find((token) => token.value === "input")!;
      expect(inputTag.attributes!.pattern).toContain("@");
      expect(inputTag.attributes!.required).toBe("");

      const selectTag = tokens.find((token) => token.value === "select")!;
      expect(selectTag.attributes!.multiple).toBe("");
    });
  });

  describe("Error Recovery", () => {
    it("should handle incomplete tags gracefully", () => {
      const malformedHTML = '<div class="test><p>Content</p>';
      const tokens = tokenize(malformedHTML);

      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens[tokens.length - 1]!.type).toBe(TokenType.EOF);
    });

    it("should handle unmatched quotes in attributes", () => {
      const html = '<div class="test id=\'main">Content</div>';
      const tokens = tokenize(html);

      const divTag = tokens.find((token) => token.value === "div")!;
      expect(divTag).toBeDefined();
    });

    it("should continue parsing after errors", () => {
      const html = "<div><p>Valid paragraph</p><span>Valid span</span>";
      const tokens = tokenize(html);

      const hasValidElements =
        tokens.some((token) => token.value === "p") ||
        tokens.some((token) => token.value === "span");
      expect(hasValidElements).toBe(true);
    });

    it("should handle empty angle brackets <>", () => {
      const html = "<>text<div>content</div>";
      const tokens = tokenize(html);

      // Should skip the invalid <> and continue parsing
      expect(tokens[tokens.length - 1]!.type).toBe(TokenType.EOF);
      const divToken = tokens.find((t) => t.value === "div");
      expect(divToken).toBeDefined();
    });

    it("should handle angle bracket with only space < >", () => {
      const html = "< >text<p>paragraph</p>";
      const tokens = tokenize(html);

      expect(tokens[tokens.length - 1]!.type).toBe(TokenType.EOF);
      const pToken = tokens.find((t) => t.value === "p");
      expect(pToken).toBeDefined();
    });

    it("should handle tag with no valid name", () => {
      const html = "<123>text</123><div>ok</div>";
      const tokens = tokenize(html);

      // Tags starting with numbers are invalid, should be treated as text
      expect(tokens[tokens.length - 1]!.type).toBe(TokenType.EOF);
      const divToken = tokens.find((t) => t.value === "div");
      expect(divToken).toBeDefined();
    });
  });

  describe("Entity Edge Cases", () => {
    it("should handle entity without semicolon with valid prefix", () => {
      // &nbsp followed by other text (no semicolon) should decode &nbsp
      const tokens = tokenize("<div>&nbsptext</div>");

      const textToken = tokens.find((t) => t.type === TokenType.TEXT);
      expect(textToken).toBeDefined();
      // Should decode &nbsp (non-breaking space) and keep "text"
      expect(textToken!.value).toContain("text");
    });

    it("should handle entity without semicolon - lt prefix", () => {
      const tokens = tokenize("<div>&ltvalue</div>");

      const textToken = tokens.find((t) => t.type === TokenType.TEXT);
      expect(textToken).toBeDefined();
      expect(textToken!.value).toBe("&ltvalue");
    });

    it("should handle entity without semicolon - gt prefix", () => {
      const tokens = tokenize("<div>&gtvalue</div>");

      const textToken = tokens.find((t) => t.type === TokenType.TEXT);
      expect(textToken).toBeDefined();
      expect(textToken!.value).toBe("&gtvalue");
    });

    it("should handle entity without semicolon - amp prefix", () => {
      const tokens = tokenize("<div>&ampvalue</div>");

      const textToken = tokens.find((t) => t.type === TokenType.TEXT);
      expect(textToken).toBeDefined();
      expect(textToken!.value).toBe("&ampvalue");
    });

    it("should handle unknown entity gracefully", () => {
      const tokens = tokenize("<div>&unknownentity;</div>");

      const textToken = tokens.find((t) => t.type === TokenType.TEXT);
      expect(textToken).toBeDefined();
      // Unknown entity should be kept as-is
      expect(textToken!.value).toBe("&unknownentity;");
    });

    it("should handle partial entity name with no matching prefix", () => {
      const tokens = tokenize("<div>&xyz</div>");

      const textToken = tokens.find((t) => t.type === TokenType.TEXT);
      expect(textToken).toBeDefined();
      // No valid entity prefix, keep as-is
      expect(textToken!.value).toBe("&xyz");
    });
  });
});
