import { parse } from "../../src/parser/index";
import { tokenize } from "../../src/tokenizer/index";

it("should parse empty HTML", () => {
  const tokens = tokenize("");
  const result = parse(tokens);
  expect(result.nodeType).toBe(9);
  expect(result.childNodes).toHaveLength(1);
  expect(result.documentElement.tagName).toBe("HTML");
});

it("should parse simple HTML", () => {
  const tokens = tokenize("<html><body>Hello</body></html>");
  const result = parse(tokens);
  expect(result.nodeType).toBe(9);
  expect(result.documentElement.tagName).toBe("HTML");
  expect(result.body.tagName).toBe("BODY");
  expect(result.body.childNodes[0].textContent).toBe("Hello");
});

it("should parse HTML with doctype", () => {
  const tokens = tokenize("<!DOCTYPE html><html></html>");
  const result = parse(tokens);
  expect(result.doctype.name).toBe("html");
  expect(result.documentElement.tagName).toBe("HTML");
});

it("should parse HTML with comments", () => {
  const tokens = tokenize("<!-- comment --><html></html>");
  const result = parse(tokens);
  expect(result.childNodes[0].nodeType).toBe(8);
  expect(result.childNodes[0].textContent).toBe(" comment ");
});

it("should parse HTML with attributes", () => {
  const tokens = tokenize('<div class="test" id="mydiv">content</div>');
  const result = parse(tokens);
  const div = result.body.childNodes[0];
  expect(div.tagName).toBe("DIV");
  expect(div.attributes.class).toBe("test");
  expect(div.attributes.id).toBe("mydiv");
  expect(div.childNodes[0].textContent).toBe("content");
});

it("should parse self-closing tags", () => {
  const tokens = tokenize("<img src='test.jpg' />");
  const result = parse(tokens);
  const img = result.body.childNodes[0];
  expect(img.tagName).toBe("IMG");
  expect(img.attributes.src).toBe("test.jpg");
  expect(img.childNodes).toHaveLength(0);
});

it("should parse void elements", () => {
  const tokens = tokenize("<br><hr><input>");
  const result = parse(tokens);
  expect(result.body.childNodes).toHaveLength(3);
  expect(result.body.childNodes[0].tagName).toBe("BR");
  expect(result.body.childNodes[1].tagName).toBe("HR");
  expect(result.body.childNodes[2].tagName).toBe("INPUT");
});

it("should handle unclosed tags", () => {
  const tokens = tokenize("<div><p>Hello");
  const result = parse(tokens);
  expect(result.body.childNodes[0].tagName).toBe("DIV");
  expect(result.body.childNodes[0].childNodes[0].tagName).toBe("P");
});

it("should parse nested elements", () => {
  const tokens = tokenize("<div><span>inner</span></div>");
  const result = parse(tokens);
  const div = result.body.childNodes[0];
  expect(div.tagName).toBe("DIV");
  const span = div.childNodes[0];
  expect(span.tagName).toBe("SPAN");
  expect(span.childNodes[0].textContent).toBe("inner");
});

it("should parse multiple root elements", () => {
  const tokens = tokenize("<div>first</div><div>second</div>");
  const result = parse(tokens);
  expect(result.body.childNodes).toHaveLength(2);
  expect(result.body.childNodes[0].childNodes[0].textContent).toBe("first");
  expect(result.body.childNodes[1].childNodes[0].textContent).toBe("second");
});

it("should handle malformed HTML", () => {
  const tokens = tokenize("<div><p>Hello</div>");
  const result = parse(tokens);
  expect(result.body.childNodes[0].tagName).toBe("DIV");
  expect(result.body.childNodes[0].childNodes[0].tagName).toBe("P");
});

it("should parse HTML with head and body", () => {
  const tokens = tokenize(
    "<html><head><title>Test</title></head><body>Content</body></html>",
  );
  const result = parse(tokens);
  expect(result.head.tagName).toBe("HEAD");
  expect(result.head.childNodes[0].tagName).toBe("TITLE");
  expect(result.body.tagName).toBe("BODY");
  expect(result.body.childNodes[0].textContent).toBe("Content");
});

it("should parse HTML without explicit html tag", () => {
  const tokens = tokenize(
    "<head><title>Test</title></head><body>Content</body>",
  );
  const result = parse(tokens);
  expect(result.documentElement.tagName).toBe("HTML");
  expect(result.head.tagName).toBe("HEAD");
  expect(result.body.tagName).toBe("BODY");
});

it("should parse text content", () => {
  const tokens = tokenize("Hello <b>world</b>!");
  const result = parse(tokens);
  expect(result.body.childNodes).toHaveLength(3);
  expect(result.body.childNodes[0].textContent).toBe("Hello ");
  expect(result.body.childNodes[1].tagName).toBe("B");
  expect(result.body.childNodes[2].textContent).toBe("!");
});

it("should handle whitespace", () => {
  const tokens = tokenize("  <div>  content  </div>  ");
  const result = parse(tokens);
  const div = result.body.childNodes[0];
  expect(div.tagName).toBe("DIV");
  expect(div.childNodes[0].textContent).toBe("  content  ");
});

it("should parse custom elements", () => {
  const tokens = tokenize("<my-element>content</my-element>");
  const result = parse(tokens);
  const element = result.body?.childNodes[0] as any;
  expect(element?.tagName).toBe("MY-ELEMENT");
  expect(element?.childNodes[0]?.textContent).toBe("content");
});
