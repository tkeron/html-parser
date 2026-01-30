import { describe, it, expect } from "bun:test";
import { parseHTML } from "../index";

/**
 * Test suite for HTML void elements serialization
 *
 * Void elements should NOT have closing tags according to HTML spec:
 * https://html.spec.whatwg.org/multipage/syntax.html#void-elements
 *
 * List: area, base, br, col, embed, hr, img, input, link, meta, source, track, wbr
 */

const VOID_ELEMENTS = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
];

describe("Void Elements - outerHTML serialization", () => {
  describe("Individual void elements without attributes", () => {
    it("should serialize <br> without closing tag", () => {
      const doc = parseHTML("<html><body><br></body></html>");
      const br = doc.querySelector("br");
      expect(br).not.toBeNull();
      expect(br!.outerHTML).toBe("<br>");
    });

    it("should serialize <hr> without closing tag", () => {
      const doc = parseHTML("<html><body><hr></body></html>");
      const hr = doc.querySelector("hr");
      expect(hr).not.toBeNull();
      expect(hr!.outerHTML).toBe("<hr>");
    });

    it("should serialize <wbr> without closing tag", () => {
      const doc = parseHTML("<html><body><wbr></body></html>");
      const wbr = doc.querySelector("wbr");
      expect(wbr).not.toBeNull();
      expect(wbr!.outerHTML).toBe("<wbr>");
    });
  });

  describe("Individual void elements with attributes", () => {
    it("should serialize <img> with attributes without closing tag", () => {
      const doc = parseHTML(
        '<html><body><img src="test.jpg" alt="test image"></body></html>',
      );
      const img = doc.querySelector("img");
      expect(img).not.toBeNull();
      expect(img!.outerHTML).toBe('<img src="test.jpg" alt="test image">');
    });

    it("should serialize <input> with type attribute without closing tag", () => {
      const doc = parseHTML(
        '<html><body><input type="text" name="username"></body></html>',
      );
      const input = doc.querySelector("input");
      expect(input).not.toBeNull();
      expect(input!.outerHTML).toBe('<input type="text" name="username">');
    });

    it("should serialize <meta> with attributes without closing tag", () => {
      const doc = parseHTML(
        '<html><head><meta charset="utf-8"></head><body></body></html>',
      );
      const meta = doc.querySelector("meta");
      expect(meta).not.toBeNull();
      expect(meta!.outerHTML).toBe('<meta charset="utf-8">');
    });

    it("should serialize <link> with attributes without closing tag", () => {
      const doc = parseHTML(
        '<html><head><link rel="stylesheet" href="style.css"></head><body></body></html>',
      );
      const link = doc.querySelector("link");
      expect(link).not.toBeNull();
      expect(link!.outerHTML).toBe('<link rel="stylesheet" href="style.css">');
    });

    it("should serialize <base> with href without closing tag", () => {
      const doc = parseHTML(
        '<html><head><base href="https://example.com/"></head><body></body></html>',
      );
      const base = doc.querySelector("base");
      expect(base).not.toBeNull();
      expect(base!.outerHTML).toBe('<base href="https://example.com/">');
    });

    it("should serialize <col> with attributes without closing tag", () => {
      const doc = parseHTML(
        '<html><body><table><colgroup><col span="2" style="background:red"></colgroup></table></body></html>',
      );
      const col = doc.querySelector("col");
      expect(col).not.toBeNull();
      expect(col!.outerHTML).toBe('<col span="2" style="background:red">');
    });

    it("should serialize <embed> with attributes without closing tag", () => {
      const doc = parseHTML(
        '<html><body><embed src="video.swf" type="application/x-shockwave-flash"></body></html>',
      );
      const embed = doc.querySelector("embed");
      expect(embed).not.toBeNull();
      expect(embed!.outerHTML).toBe(
        '<embed src="video.swf" type="application/x-shockwave-flash">',
      );
    });

    it("should serialize <source> with attributes without closing tag", () => {
      const doc = parseHTML(
        '<html><body><video><source src="video.mp4" type="video/mp4"></video></body></html>',
      );
      const source = doc.querySelector("source");
      expect(source).not.toBeNull();
      expect(source!.outerHTML).toBe(
        '<source src="video.mp4" type="video/mp4">',
      );
    });

    it("should serialize <track> with attributes without closing tag", () => {
      const doc = parseHTML(
        '<html><body><video><track kind="subtitles" src="subs.vtt" srclang="en"></video></body></html>',
      );
      const track = doc.querySelector("track");
      expect(track).not.toBeNull();
      expect(track!.outerHTML).toBe(
        '<track kind="subtitles" src="subs.vtt" srclang="en">',
      );
    });

    it("should serialize <area> with attributes without closing tag", () => {
      const doc = parseHTML(
        '<html><body><map name="test"><area shape="rect" coords="0,0,100,100" href="link.html"></map></body></html>',
      );
      const area = doc.querySelector("area");
      expect(area).not.toBeNull();
      expect(area!.outerHTML).toBe(
        '<area shape="rect" coords="0,0,100,100" href="link.html">',
      );
    });
  });

  describe("All void elements - comprehensive test", () => {
    VOID_ELEMENTS.forEach((tagName) => {
      it(`should serialize <${tagName}> without closing tag`, () => {
        const doc = parseHTML(`<html><body><${tagName}></body></html>`);
        const element = doc.querySelector(tagName);
        expect(element).not.toBeNull();
        expect(element!.outerHTML).toBe(`<${tagName}>`);
        expect(element!.outerHTML).not.toContain(`</${tagName}>`);
      });
    });
  });

  describe("Multiple void elements in same document", () => {
    it("should serialize multiple void elements correctly", () => {
      const doc = parseHTML(
        '<html><body><img src="test.jpg"><br><input type="text"></body></html>',
      );

      const img = doc.querySelector("img");
      const br = doc.querySelector("br");
      const input = doc.querySelector("input");

      expect(img!.outerHTML).toBe('<img src="test.jpg">');
      expect(br!.outerHTML).toBe("<br>");
      expect(input!.outerHTML).toBe('<input type="text">');
    });

    it("should serialize document with multiple void elements without closing tags", () => {
      const html =
        '<html><body><img src="test.jpg"><br><input type="text"></body></html>';
      const doc = parseHTML(html);
      const outerHTML = doc.documentElement.outerHTML;

      expect(outerHTML).not.toContain("</img>");
      expect(outerHTML).not.toContain("</br>");
      expect(outerHTML).not.toContain("</input>");
    });
  });

  describe("Void elements in head section", () => {
    it("should serialize head void elements without closing tags", () => {
      const html = `<html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width">
          <link rel="stylesheet" href="style.css">
          <base href="https://example.com/">
        </head>
        <body></body>
      </html>`;
      const doc = parseHTML(html);

      const metas = doc.querySelectorAll("meta");
      const link = doc.querySelector("link");
      const base = doc.querySelector("base");

      metas.forEach((meta: any) => {
        expect(meta.outerHTML).not.toContain("</meta>");
      });
      expect(link!.outerHTML).not.toContain("</link>");
      expect(base!.outerHTML).not.toContain("</base>");
    });
  });

  describe("Void elements created with createElement", () => {
    it("should serialize dynamically created <img> without closing tag", () => {
      const doc = parseHTML("<html><body></body></html>");
      const img = doc.createElement("img");
      img.setAttribute("src", "dynamic.jpg");
      expect(img.outerHTML).toBe('<img src="dynamic.jpg">');
    });

    it("should serialize dynamically created <br> without closing tag", () => {
      const doc = parseHTML("<html><body></body></html>");
      const br = doc.createElement("br");
      expect(br.outerHTML).toBe("<br>");
    });

    it("should serialize dynamically created <input> without closing tag", () => {
      const doc = parseHTML("<html><body></body></html>");
      const input = doc.createElement("input");
      input.setAttribute("type", "password");
      input.setAttribute("name", "secret");
      expect(input.outerHTML).toBe('<input type="password" name="secret">');
    });

    it("should serialize dynamically created <meta> without closing tag", () => {
      const doc = parseHTML("<html><body></body></html>");
      const meta = doc.createElement("meta");
      meta.setAttribute("name", "description");
      meta.setAttribute("content", "Test page");
      expect(meta.outerHTML).toBe(
        '<meta name="description" content="Test page">',
      );
    });

    it("should serialize dynamically created <hr> without closing tag", () => {
      const doc = parseHTML("<html><body></body></html>");
      const hr = doc.createElement("hr");
      expect(hr.outerHTML).toBe("<hr>");
    });

    VOID_ELEMENTS.forEach((tagName) => {
      it(`should serialize dynamically created <${tagName}> without closing tag`, () => {
        const doc = parseHTML("<html><body></body></html>");
        const element = doc.createElement(tagName);
        expect(element.outerHTML).toBe(`<${tagName}>`);
        expect(element.outerHTML).not.toContain(`</${tagName}>`);
      });
    });
  });

  describe("Void elements with XHTML-style syntax", () => {
    it("should handle <br /> and serialize without closing tag", () => {
      const doc = parseHTML("<html><body><br /></body></html>");
      const br = doc.querySelector("br");
      expect(br).not.toBeNull();
      expect(br!.outerHTML).toBe("<br>");
      expect(br!.outerHTML).not.toContain("</br>");
    });

    it("should handle <img /> and serialize without closing tag", () => {
      const doc = parseHTML('<html><body><img src="test.jpg" /></body></html>');
      const img = doc.querySelector("img");
      expect(img).not.toBeNull();
      expect(img!.outerHTML).toBe('<img src="test.jpg">');
      expect(img!.outerHTML).not.toContain("</img>");
    });

    it("should handle <input /> and serialize without closing tag", () => {
      const doc = parseHTML('<html><body><input type="text" /></body></html>');
      const input = doc.querySelector("input");
      expect(input).not.toBeNull();
      expect(input!.outerHTML).toBe('<input type="text">');
      expect(input!.outerHTML).not.toContain("</input>");
    });
  });

  describe("Non-void elements should have closing tags", () => {
    it("should serialize <div> with closing tag", () => {
      const doc = parseHTML("<html><body><div></div></body></html>");
      const div = doc.querySelector("div");
      expect(div).not.toBeNull();
      expect(div!.outerHTML).toBe("<div></div>");
    });

    it("should serialize <span> with closing tag", () => {
      const doc = parseHTML("<html><body><span></span></body></html>");
      const span = doc.querySelector("span");
      expect(span).not.toBeNull();
      expect(span!.outerHTML).toBe("<span></span>");
    });

    it("should serialize <p> with closing tag", () => {
      const doc = parseHTML("<html><body><p></p></body></html>");
      const p = doc.querySelector("p");
      expect(p).not.toBeNull();
      expect(p!.outerHTML).toBe("<p></p>");
    });

    it("should serialize <script> with closing tag", () => {
      const doc = parseHTML("<html><body><script></script></body></html>");
      const script = doc.querySelector("script");
      expect(script).not.toBeNull();
      expect(script!.outerHTML).toBe("<script></script>");
    });

    it("should serialize <style> with closing tag", () => {
      const doc = parseHTML(
        "<html><head><style></style></head><body></body></html>",
      );
      const style = doc.querySelector("style");
      expect(style).not.toBeNull();
      expect(style!.outerHTML).toBe("<style></style>");
    });

    it("should serialize <iframe> with closing tag", () => {
      const doc = parseHTML(
        '<html><body><iframe src="page.html"></iframe></body></html>',
      );
      const iframe = doc.querySelector("iframe");
      expect(iframe).not.toBeNull();
      expect(iframe!.outerHTML).toBe('<iframe src="page.html"></iframe>');
    });

    it("should serialize <textarea> with closing tag", () => {
      const doc = parseHTML("<html><body><textarea></textarea></body></html>");
      const textarea = doc.querySelector("textarea");
      expect(textarea).not.toBeNull();
      expect(textarea!.outerHTML).toBe("<textarea></textarea>");
    });

    it("should serialize <video> with closing tag", () => {
      const doc = parseHTML("<html><body><video></video></body></html>");
      const video = doc.querySelector("video");
      expect(video).not.toBeNull();
      expect(video!.outerHTML).toBe("<video></video>");
    });

    it("should serialize <audio> with closing tag", () => {
      const doc = parseHTML("<html><body><audio></audio></body></html>");
      const audio = doc.querySelector("audio");
      expect(audio).not.toBeNull();
      expect(audio!.outerHTML).toBe("<audio></audio>");
    });

    it("should serialize <canvas> with closing tag", () => {
      const doc = parseHTML("<html><body><canvas></canvas></body></html>");
      const canvas = doc.querySelector("canvas");
      expect(canvas).not.toBeNull();
      expect(canvas!.outerHTML).toBe("<canvas></canvas>");
    });
  });

  describe("Void elements with content (should be ignored)", () => {
    it("should not include text content in void element", () => {
      const doc = parseHTML("<html><body><br>text</body></html>");
      const br = doc.querySelector("br");
      expect(br).not.toBeNull();
      expect(br!.outerHTML).toBe("<br>");
    });

    it("should not include innerHTML content in void element", () => {
      const doc = parseHTML('<html><body><img src="test.jpg"></body></html>');
      const img = doc.querySelector("img");
      expect(img).not.toBeNull();
      expect(img!.innerHTML).toBe("");
      expect(img!.outerHTML).toBe('<img src="test.jpg">');
    });
  });

  describe("Void elements in nested structures", () => {
    it("should serialize void elements inside multiple nested elements", () => {
      const html = `<html><body>
        <div class="container">
          <form>
            <div class="form-group">
              <input type="text" name="field1">
              <br>
              <input type="password" name="field2">
            </div>
          </form>
        </div>
      </body></html>`;

      const doc = parseHTML(html);
      const inputs = doc.querySelectorAll("input");
      const br = doc.querySelector("br");

      expect(inputs.length).toBe(2);
      inputs.forEach((input: any) => {
        expect(input.outerHTML).not.toContain("</input>");
      });
      expect(br!.outerHTML).toBe("<br>");
    });

    it("should serialize void elements inside tables correctly", () => {
      const html = `<html><body>
        <table>
          <colgroup>
            <col span="1" class="col1">
            <col span="2" class="col2">
          </colgroup>
          <tr><td><img src="icon.png"></td></tr>
        </table>
      </body></html>`;

      const doc = parseHTML(html);
      const cols = doc.querySelectorAll("col");
      const img = doc.querySelector("img");

      expect(cols.length).toBe(2);
      cols.forEach((col: any) => {
        expect(col.outerHTML).not.toContain("</col>");
      });
      expect(img!.outerHTML).not.toContain("</img>");
    });
  });

  describe("Edge cases", () => {
    it("should handle void element with boolean attributes", () => {
      const doc = parseHTML(
        '<html><body><input type="checkbox" checked disabled></body></html>',
      );
      const input = doc.querySelector("input");
      expect(input).not.toBeNull();
      expect(input!.outerHTML).not.toContain("</input>");
    });

    it("should handle void element with empty attribute value", () => {
      const doc = parseHTML(
        '<html><body><input type="text" value=""></body></html>',
      );
      const input = doc.querySelector("input");
      expect(input).not.toBeNull();
      expect(input!.outerHTML).not.toContain("</input>");
    });

    it("should handle uppercase void element tag names", () => {
      const doc = parseHTML(
        '<html><body><BR><IMG SRC="test.jpg"></body></html>',
      );
      const br = doc.querySelector("br");
      const img = doc.querySelector("img");

      expect(br).not.toBeNull();
      expect(img).not.toBeNull();
      expect(br!.outerHTML).not.toContain("</br>");
      expect(br!.outerHTML).not.toContain("</BR>");
      expect(img!.outerHTML).not.toContain("</img>");
      expect(img!.outerHTML).not.toContain("</IMG>");
    });

    it("should handle mixed case void element tag names", () => {
      const doc = parseHTML(
        '<html><body><Br><ImG src="test.jpg"></body></html>',
      );
      const br = doc.querySelector("br");
      const img = doc.querySelector("img");

      expect(br).not.toBeNull();
      expect(img).not.toBeNull();
      expect(br!.outerHTML.toLowerCase()).not.toContain("</br>");
      expect(img!.outerHTML.toLowerCase()).not.toContain("</img>");
    });
  });

  describe("Full document serialization", () => {
    it("should serialize complete document without closing tags on void elements", () => {
      const html = `<html>
        <head>
          <meta charset="utf-8">
          <link rel="stylesheet" href="style.css">
        </head>
        <body>
          <img src="logo.png" alt="Logo">
          <hr>
          <form>
            <input type="text" name="username">
            <br>
            <input type="password" name="password">
          </form>
        </body>
      </html>`;

      const doc = parseHTML(html);
      const fullHTML = doc.documentElement.outerHTML;

      // Check no void elements have closing tags
      expect(fullHTML).not.toContain("</meta>");
      expect(fullHTML).not.toContain("</link>");
      expect(fullHTML).not.toContain("</img>");
      expect(fullHTML).not.toContain("</hr>");
      expect(fullHTML).not.toContain("</input>");
      expect(fullHTML).not.toContain("</br>");

      // Check non-void elements still have closing tags
      expect(fullHTML).toContain("</head>");
      expect(fullHTML).toContain("</body>");
      expect(fullHTML).toContain("</form>");
      expect(fullHTML).toContain("</html>");
    });
  });
});
