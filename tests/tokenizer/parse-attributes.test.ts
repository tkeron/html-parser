import { expect, it, describe } from "bun:test";
import { parseAttributes } from "../../src/tokenizer/parse-attributes.js";

describe("parseAttributes", () => {
  it("should parse simple attributes", () => {
    const result = parseAttributes('id="test" class="foo"');
    expect(result).toEqual({ id: "test", class: "foo" });
  });

  it("should parse attributes with single quotes", () => {
    const result = parseAttributes("id='test' class='foo'");
    expect(result).toEqual({ id: "test", class: "foo" });
  });

  it("should parse attributes without quotes", () => {
    const result = parseAttributes("id=test class=foo");
    expect(result).toEqual({ id: "test", class: "foo" });
  });

  it("should decode entities in attribute values", () => {
    const result = parseAttributes('content="a&lt;b"');
    expect(result).toEqual({ content: "a<b" });
  });

  it("should handle boolean attributes", () => {
    const result = parseAttributes("disabled checked");
    expect(result).toEqual({ disabled: "", checked: "" });
  });

  it("should handle empty attribute string", () => {
    const result = parseAttributes("");
    expect(result).toEqual({});
  });

  it("should handle malformed attributes", () => {
    const result = parseAttributes('id="test" = class="foo"');
    expect(result).toEqual({ id: "test", class: "foo" });
  });

  it("should lowercase attribute names", () => {
    const result = parseAttributes('ID="test" CLASS="foo"');
    expect(result).toEqual({ id: "test", class: "foo" });
  });
});
