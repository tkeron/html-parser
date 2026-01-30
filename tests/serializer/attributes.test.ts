import {
  needsQuotes,
  serializeAttribute,
  serializeAttributes,
} from "../../src/serializer/attributes.js";

describe("needsQuotes", () => {
  it("should return true for empty string", () => {
    expect(needsQuotes("")).toBe(true);
  });

  it("should return true for strings with spaces", () => {
    expect(needsQuotes("a b")).toBe(true);
  });

  it("should return true for strings with tabs", () => {
    expect(needsQuotes("a\tb")).toBe(true);
  });

  it("should return true for strings with newlines", () => {
    expect(needsQuotes("a\nb")).toBe(true);
  });

  it("should return true for strings with carriage returns", () => {
    expect(needsQuotes("a\rb")).toBe(true);
  });

  it("should return true for strings with form feeds", () => {
    expect(needsQuotes("a\fb")).toBe(true);
  });

  it("should return true for strings with single quotes", () => {
    expect(needsQuotes("a'b")).toBe(true);
  });

  it("should return true for strings with double quotes", () => {
    expect(needsQuotes('a"b')).toBe(true);
  });

  it("should return true for strings with equals", () => {
    expect(needsQuotes("a=b")).toBe(true);
  });

  it("should return true for strings with greater than", () => {
    expect(needsQuotes("a>b")).toBe(true);
  });

  it("should return true for strings with backticks", () => {
    expect(needsQuotes("a`b")).toBe(true);
  });

  it("should return false for simple strings", () => {
    expect(needsQuotes("abc")).toBe(false);
  });
});

describe("serializeAttribute", () => {
  it("should minimize boolean attributes", () => {
    expect(serializeAttribute("disabled", "disabled")).toBe("disabled");
  });

  it("should not minimize when option is false", () => {
    expect(
      serializeAttribute("disabled", "disabled", {
        minimize_boolean_attributes: false,
      }),
    ).toBe("disabled=disabled");
  });

  it("should serialize without quotes when not needed", () => {
    expect(serializeAttribute("id", "test")).toBe("id=test");
  });

  it("should serialize with double quotes when needed", () => {
    expect(serializeAttribute("class", "a b")).toBe('class="a b"');
  });

  it("should serialize with single quotes when value contains double quotes", () => {
    expect(serializeAttribute("data", 'a"b')).toBe("data='a\"b'");
  });

  it("should serialize with double quotes when value contains single quotes", () => {
    expect(serializeAttribute("data", "a'b")).toBe('data="a\'b"');
  });

  it("should serialize with double quotes when value contains both quotes", () => {
    expect(serializeAttribute("data", "a\"b'c")).toBe('data="a&quot;b\'c"');
  });

  it("should force quote character when specified", () => {
    expect(serializeAttribute("data", "test", { quote_char: "'" })).toBe(
      "data='test'",
    );
  });

  it("should escape less-than in attributes when option is set", () => {
    expect(
      serializeAttribute("data", "a<b", { escape_lt_in_attrs: true }),
    ).toBe("data=a&lt;b");
  });

  it("should always quote when quote_attr_values is true", () => {
    expect(serializeAttribute("id", "test", { quote_attr_values: true })).toBe(
      'id="test"',
    );
  });
});

describe("serializeAttributes", () => {
  it("should serialize array of attributes", () => {
    const attrs = [
      { name: "id", value: "test" },
      { name: "class", value: "a b" },
    ];
    expect(serializeAttributes(attrs)).toBe(' class="a b" id=test');
  });

  it("should serialize object attributes", () => {
    const attrs = { id: "test", class: "a b" };
    expect(serializeAttributes(attrs)).toBe(' class="a b" id=test');
  });

  it("should sort attributes alphabetically", () => {
    const attrs = { z: "1", a: "2" };
    expect(serializeAttributes(attrs)).toBe(" a=2 z=1");
  });

  it("should handle empty attributes", () => {
    expect(serializeAttributes([])).toBe("");
    expect(serializeAttributes({})).toBe("");
  });
});
