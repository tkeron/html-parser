import { parseHTML } from "../../index.ts";
import { serializeToHtml5lib } from "./tree-adapter.ts";

describe("Tree Adapter Tests", () => {
  it("should serialize simple element", () => {
    const doc = parseHTML("<div></div>");
    const serialized = serializeToHtml5lib(doc);
    expect(serialized).toContain("| <html>");
    expect(serialized).toContain("|   <body>");
    expect(serialized).toContain("|     <div>");
  });

  it("should serialize element with attributes", () => {
    const doc = parseHTML('<div class="foo" id="bar"></div>');
    const serialized = serializeToHtml5lib(doc);
    expect(serialized).toContain("<div>");
    expect(serialized).toContain('class="foo"');
    expect(serialized).toContain('id="bar"');
  });

  it("should serialize text content", () => {
    const doc = parseHTML("<div>hello</div>");
    const serialized = serializeToHtml5lib(doc);
    expect(serialized).toContain('"hello"');
  });

  it("should serialize comment", () => {
    const doc = parseHTML("<div><!-- comment --></div>");
    const serialized = serializeToHtml5lib(doc);
    expect(serialized).toContain("<!--  comment  -->");
  });

  it("should serialize DOCTYPE", () => {
    const doc = parseHTML("<!DOCTYPE html><div></div>");
    const serialized = serializeToHtml5lib(doc);
    expect(serialized).toContain("<!DOCTYPE html>");
    expect(serialized).toContain("<div>");
  });
});
