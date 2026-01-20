import { describe, it, expect } from "bun:test";
import { parseHTML } from "../src/index";

describe("HTML entities in text content", () => {
  it("should preserve &lt; and &gt; entities when serializing innerHTML", () => {
    const doc = parseHTML("<p>&lt;div&gt;</p>");
    const p = doc.querySelector("p");
    expect(p.innerHTML).toBe("&lt;div&gt;");
  });

  it("should preserve &lt; and &gt; in code elements", () => {
    const doc = parseHTML("<code>&lt;script&gt;alert('xss')&lt;/script&gt;</code>");
    const code = doc.querySelector("code");
    expect(code.innerHTML).toBe("&lt;script&gt;alert('xss')&lt;/script&gt;");
  });

  it("should preserve &amp; entity when serializing innerHTML", () => {
    const doc = parseHTML("<span>foo &amp; bar</span>");
    const span = doc.querySelector("span");
    expect(span.innerHTML).toBe("foo &amp; bar");
  });

  it("should preserve mixed entities in text", () => {
    const doc = parseHTML("<div>&lt;a href=&quot;test&quot;&gt;link&lt;/a&gt;</div>");
    const div = doc.querySelector("div");
    expect(div.innerHTML).toBe('&lt;a href="test"&gt;link&lt;/a&gt;');
  });

  it("should handle textContent correctly (decoded)", () => {
    const doc = parseHTML("<p>&lt;div&gt;</p>");
    const p = doc.querySelector("p");
    expect(p.textContent).toBe("<div>");
  });

  it("should preserve entities in outerHTML", () => {
    const doc = parseHTML("<p>&lt;test&gt;</p>");
    const p = doc.querySelector("p");
    expect(p.outerHTML).toBe("<p>&lt;test&gt;</p>");
  });

  it("should preserve entities in nested elements", () => {
    const doc = parseHTML("<div><span>&lt;nested&gt;</span></div>");
    const div = doc.querySelector("div");
    expect(div.innerHTML).toBe("<span>&lt;nested&gt;</span>");
  });

  it("should handle multiple text nodes with entities", () => {
    const doc = parseHTML("<p>&lt;first&gt; and &lt;second&gt;</p>");
    const p = doc.querySelector("p");
    expect(p.innerHTML).toBe("&lt;first&gt; and &lt;second&gt;");
  });

  it("should not double-escape already escaped content", () => {
    const doc = parseHTML("<p>&amp;lt;</p>");
    const p = doc.querySelector("p");
    expect(p.textContent).toBe("&lt;");
    expect(p.innerHTML).toBe("&amp;lt;");
  });

  it("should preserve entities after DOM manipulation", () => {
    const doc = parseHTML("<div></div>");
    const div = doc.querySelector("div");
    const text = doc.createTextNode("<script>alert('xss')</script>");
    div.appendChild(text);
    expect(div.innerHTML).toBe("&lt;script&gt;alert('xss')&lt;/script&gt;");
  });
});
