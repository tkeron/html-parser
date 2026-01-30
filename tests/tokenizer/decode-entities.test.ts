import { expect, it, describe } from "bun:test";
import { decodeEntities } from "../../src/tokenizer/decode-entities.js";

describe("decodeEntities", () => {
  it("should decode named entities", () => {
    expect(decodeEntities("&amp;")).toBe("&");
    expect(decodeEntities("&lt;")).toBe("<");
    expect(decodeEntities("&gt;")).toBe(">");
    expect(decodeEntities("&quot;")).toBe('"');
    expect(decodeEntities("&apos;")).toBe("'");
  });

  it("should decode numeric entities", () => {
    expect(decodeEntities("&#65;")).toBe("A");
    expect(decodeEntities("&#x41;")).toBe("A");
    expect(decodeEntities("&#x27;")).toBe("'");
  });

  it("should handle invalid entities", () => {
    expect(decodeEntities("&invalid;")).toBe("&invalid;");
    expect(decodeEntities("&amp")).toBe("&amp");
  });

  it("should replace null characters", () => {
    expect(decodeEntities("test\u0000test")).toBe("test\uFFFDtest");
  });

  it("should handle mixed content", () => {
    expect(decodeEntities("a&lt;b&gt;c&amp;d")).toBe("a<b>c&d");
  });
});
