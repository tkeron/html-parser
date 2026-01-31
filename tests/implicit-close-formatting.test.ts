import { describe, it, expect } from "bun:test";
import { parseHTML } from "../index.js";
import { serializeToHtml5lib } from "./helpers/tree-adapter.js";

describe("implicit close with formatting element reconstruction", () => {
  it("should close <p> and reconstruct <b> elements when new <p> opens", () => {
    const html = "<p><b><b><b><b><p>x";
    const doc = parseHTML(html);
    const result = serializeToHtml5lib(doc, { skipImplicitDoctype: true });

    expect(result).toBe(`| <html>
|   <head>
|   <body>
|     <p>
|       <b>
|         <b>
|           <b>
|             <b>
|     <p>
|       <b>
|         <b>
|           <b>
|             "x"
`);
  });

  it("should close <p> through nested formatting and reconstruct (single <b>)", () => {
    const html = "<p><b><p>x";
    const doc = parseHTML(html);
    const result = serializeToHtml5lib(doc, { skipImplicitDoctype: true });

    expect(result).toBe(`| <html>
|   <head>
|   <body>
|     <p>
|       <b>
|     <p>
|       <b>
|         "x"
`);
  });

  it("should handle text before and after implicit close", () => {
    const html = "<p><b>1<p>2";
    const doc = parseHTML(html);
    const result = serializeToHtml5lib(doc, { skipImplicitDoctype: true });

    expect(result).toBe(`| <html>
|   <head>
|   <body>
|     <p>
|       <b>
|         "1"
|     <p>
|       <b>
|         "2"
`);
  });

  it("should handle multiple different formatting elements", () => {
    const html = "<p><b><i><p>x";
    const doc = parseHTML(html);
    const result = serializeToHtml5lib(doc, { skipImplicitDoctype: true });

    expect(result).toBe(`| <html>
|   <head>
|   <body>
|     <p>
|       <b>
|         <i>
|     <p>
|       <b>
|         <i>
|           "x"
`);
  });

  it("should handle div closing <p> and reconstructing formatting", () => {
    const html = "<p><b><div>x";
    const doc = parseHTML(html);
    const result = serializeToHtml5lib(doc, { skipImplicitDoctype: true });

    expect(result).toBe(`| <html>
|   <head>
|   <body>
|     <p>
|       <b>
|     <div>
|       <b>
|         "x"
`);
  });

  it("should handle multiple auto-closing with formatting", () => {
    const html = "<p><b><p><i><p>x";
    const doc = parseHTML(html);
    const result = serializeToHtml5lib(doc, { skipImplicitDoctype: true });

    expect(result).toBe(`| <html>
|   <head>
|   <body>
|     <p>
|       <b>
|     <p>
|       <b>
|         <i>
|     <p>
|       <b>
|         <i>
|           "x"
`);
  });
});
