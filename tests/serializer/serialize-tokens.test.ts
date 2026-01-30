import { serializeTokens } from "../../src/serializer/serialize-tokens.js";

describe("serializeTokens", () => {
  it("should serialize empty tokens", () => {
    expect(serializeTokens([])).toBe("");
  });

  it("should serialize text tokens", () => {
    const tokens = [["Characters", "Hello world"]];
    expect(serializeTokens(tokens)).toBe("Hello world");
  });

  it("should serialize start and end tags", () => {
    const tokens = [
      ["StartTag", null, "div", []],
      ["Characters", "content"],
      ["EndTag", null, "div"],
    ];
    expect(serializeTokens(tokens)).toBe("<div>content</div>");
  });

  it("should serialize self-closing tags", () => {
    const tokens = [["EmptyTag", "br", []]];
    expect(serializeTokens(tokens)).toBe("<br>");
  });

  it("should serialize attributes", () => {
    const tokens = [
      [
        "StartTag",
        null,
        "div",
        [
          { name: "id", value: "test" },
          { name: "class", value: "a b" },
        ],
      ],
    ];
    expect(serializeTokens(tokens)).toBe('<div class="a b" id=test>');
  });

  it("should serialize comments", () => {
    const tokens = [["Comment", " comment "]];
    expect(serializeTokens(tokens)).toBe("<!-- comment -->");
  });

  it("should serialize doctype", () => {
    const tokens = [["Doctype", "html", "", ""]];
    expect(serializeTokens(tokens)).toBe("<!DOCTYPE html>");
  });

  it("should escape text content", () => {
    const tokens = [["Characters", "a & b < c > d"]];
    expect(serializeTokens(tokens)).toBe("a &amp; b &lt; c &gt; d");
  });

  it("should handle script content", () => {
    const tokens = [
      ["StartTag", null, "script", []],
      ["Characters", "<script>alert('test')</script>"],
      ["EndTag", null, "script"],
    ];
    expect(serializeTokens(tokens)).toBe(
      "<script><script>alert('test')</script></script>",
    );
  });

  it("should inject meta charset when option is set", () => {
    const tokens = [
      ["StartTag", null, "html", []],
      ["StartTag", null, "head", []],
      ["EndTag", null, "head"],
      ["StartTag", null, "body", []],
      ["EndTag", null, "body"],
      ["EndTag", null, "html"],
    ];
    expect(serializeTokens(tokens, { inject_meta_charset: true })).toBe("");
  });
});
