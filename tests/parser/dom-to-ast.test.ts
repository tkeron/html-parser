import { domToAST } from "../../src/parser/index";
import {
  createDocument,
  createElement,
  createTextNode,
  createComment,
  createDoctype,
} from "../../src/dom-simulator/index.js";

it("should convert document to AST", () => {
  const doc = createDocument();
  const ast = domToAST(doc);
  expect(ast.type).toBe("document");
  expect(ast.children).toEqual([]);
});

it("should convert element to AST", () => {
  const element = createElement("div", { class: "test", id: "mydiv" });
  const ast = domToAST(element);
  expect(ast.type).toBe("element");
  expect(ast.tagName).toBe("div");
  expect(ast.attributes).toEqual({ class: "test", id: "mydiv" });
  expect(ast.children).toEqual([]);
});

it("should convert element with children to AST", () => {
  const element = createElement("div", {});
  const text = createTextNode("Hello");
  element.appendChild(text);
  const ast = domToAST(element);
  expect(ast.type).toBe("element");
  expect(ast.tagName).toBe("div");
  expect(ast.children).toHaveLength(1);
  expect(ast.children[0].type).toBe("text");
  expect(ast.children[0].content).toBe("Hello");
});

it("should convert text node to AST", () => {
  const text = createTextNode("Hello world");
  const ast = domToAST(text);
  expect(ast.type).toBe("text");
  expect(ast.content).toBe("Hello world");
});

it("should convert comment to AST", () => {
  const comment = createComment("This is a comment");
  const ast = domToAST(comment);
  expect(ast.type).toBe("comment");
  expect(ast.content).toBe("This is a comment");
});

it("should convert doctype to AST", () => {
  const doctype = createDoctype("html");
  const ast = domToAST(doctype);
  expect(ast.type).toBe("doctype");
  expect(ast.name).toBe("html");
  expect(ast.publicId).toBe("");
  expect(ast.systemId).toBe("");
});

it("should convert doctype with ids to AST", () => {
  const doctype = createDoctype("html", "public", "system");
  const ast = domToAST(doctype);
  expect(ast.type).toBe("doctype");
  expect(ast.name).toBe("html");
  expect(ast.publicId).toBe("public");
  expect(ast.systemId).toBe("system");
});

it("should handle null input", () => {
  const ast = domToAST(null);
  expect(ast.type).toBe("document");
  expect(ast.children).toEqual([]);
});

it("should convert nested elements to AST", () => {
  const div = createElement("div", { class: "container" });
  const span = createElement("span", { class: "inner" });
  const text = createTextNode("content");
  span.appendChild(text);
  div.appendChild(span);
  const ast = domToAST(div);
  expect(ast.type).toBe("element");
  expect(ast.tagName).toBe("div");
  expect(ast.attributes).toEqual({ class: "container" });
  expect(ast.children).toHaveLength(1);
  const childAst = ast.children[0];
  expect(childAst.type).toBe("element");
  expect(childAst.tagName).toBe("span");
  expect(childAst.attributes).toEqual({ class: "inner" });
  expect(childAst.children).toHaveLength(1);
  expect(childAst.children[0].type).toBe("text");
  expect(childAst.children[0].content).toBe("content");
});

it("should convert element with namespace to AST", () => {
  const element = createElement("svg", {}, "http://www.w3.org/2000/svg");
  const ast = domToAST(element);
  expect(ast.type).toBe("element");
  expect(ast.tagName).toBe("svg");
  expect(ast.namespaceURI).toBe("http://www.w3.org/2000/svg");
});

it("should handle unknown node types", () => {
  const unknownNode = { nodeType: 999 };
  const ast = domToAST(unknownNode);
  expect(ast.type).toBe("text");
  expect(ast.content).toBe("");
});
