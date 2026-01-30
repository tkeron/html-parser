import {
  escapeText,
  escapeAttributeValue,
} from "../../src/serializer/escape.js";

describe("escapeText", () => {
  it("should escape ampersands", () => {
    expect(escapeText("a & b")).toBe("a &amp; b");
  });

  it("should escape less-than signs", () => {
    expect(escapeText("a < b")).toBe("a &lt; b");
  });

  it("should escape greater-than signs", () => {
    expect(escapeText("a > b")).toBe("a &gt; b");
  });

  it("should escape multiple characters", () => {
    expect(escapeText("a & b < c > d")).toBe("a &amp; b &lt; c &gt; d");
  });

  it("should handle empty string", () => {
    expect(escapeText("")).toBe("");
  });
});

describe("escapeAttributeValue", () => {
  it("should escape ampersands", () => {
    expect(escapeAttributeValue("a & b")).toBe("a &amp; b");
  });

  it("should escape double quotes", () => {
    expect(escapeAttributeValue('a " b')).toBe("a &quot; b");
  });

  it("should escape single quotes", () => {
    expect(escapeAttributeValue("a ' b")).toBe("a &#39; b");
  });

  it("should escape multiple characters", () => {
    expect(escapeAttributeValue("a & b \" c ' d")).toBe(
      "a &amp; b &quot; c &#39; d",
    );
  });

  it("should handle empty string", () => {
    expect(escapeAttributeValue("")).toBe("");
  });
});
