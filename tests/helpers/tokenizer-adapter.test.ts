import { tokenize } from "../../src/tokenizer/index.js";
import { adaptTokens } from "./tokenizer-adapter.ts";

describe("Tokenizer Adapter Tests", () => {
  it("should adapt simple start tag", () => {
    const tokens = tokenize("<div>");
    const adapted = adaptTokens(tokens);
    expect(adapted).toEqual([["StartTag", "div", {}]]);
  });

  it("should adapt start tag with attributes", () => {
    const tokens = tokenize('<div class="foo" id="bar">');
    const adapted = adaptTokens(tokens);
    expect(adapted).toEqual([["StartTag", "div", { class: "foo", id: "bar" }]]);
  });

  it("should adapt self-closing tag", () => {
    const tokens = tokenize("<br/>");
    const adapted = adaptTokens(tokens);
    expect(adapted).toEqual([["StartTag", "br", {}, true]]);
  });

  it("should adapt end tag", () => {
    const tokens = tokenize("</div>");
    const adapted = adaptTokens(tokens);
    expect(adapted).toEqual([["EndTag", "div"]]);
  });

  it("should adapt text", () => {
    const tokens = tokenize("hello world");
    const adapted = adaptTokens(tokens);
    expect(adapted).toEqual([["Character", "hello world"]]);
  });

  it("should adapt comment", () => {
    const tokens = tokenize("<!-- comment -->");
    const adapted = adaptTokens(tokens);
    expect(adapted).toEqual([["Comment", " comment "]]);
  });

  it("should adapt DOCTYPE", () => {
    const tokens = tokenize("<!DOCTYPE html>");
    const adapted = adaptTokens(tokens);
    expect(adapted).toEqual([["DOCTYPE", "html", null, null, true]]);
  });

  it("should adapt mixed content", () => {
    const tokens = tokenize("<div>hello</div>");
    const adapted = adaptTokens(tokens);
    expect(adapted).toEqual([
      ["StartTag", "div", {}],
      ["Character", "hello"],
      ["EndTag", "div"],
    ]);
  });
});
