import { expect, it, describe } from "bun:test";
import { parseHTML } from "../index";
import { serializeToHtml5lib } from "./helpers/tree-adapter";

describe("Foster Parenting", () => {
  describe("Text foster parenting", () => {
    it("should foster parent text before table and merge adjacent text nodes", () => {
      const doc = parseHTML("<table>A<td>B</td>C</table>");
      const serialized = serializeToHtml5lib(doc, {
        skipImplicitDoctype: true,
      });
      expect(serialized).toBe(`| <html>
|   <head>
|   <body>
|     "AC"
|     <table>
|       <tbody>
|         <tr>
|           <td>
|             "B"
`);
    });

    it("should foster parent text with whitespace correctly", () => {
      const doc = parseHTML("<table> X </table>");
      const serialized = serializeToHtml5lib(doc, {
        skipImplicitDoctype: true,
      });
      expect(serialized).toBe(`| <html>
|   <head>
|   <body>
|     " X "
|     <table>
`);
    });
  });

  describe("Element foster parenting", () => {
    it("should foster parent <a> before table with AAA reconstruction", () => {
      const doc = parseHTML("<table><a>1<td>2</td>3</table>");
      const serialized = serializeToHtml5lib(doc, {
        skipImplicitDoctype: true,
      });
      expect(serialized).toBe(`| <html>
|   <head>
|   <body>
|     <a>
|       "1"
|     <a>
|       "3"
|     <table>
|       <tbody>
|         <tr>
|           <td>
|             "2"
`);
    });

    it("should foster parent elements with AAA for formatting in <p>", () => {
      const doc = parseHTML("<table><a>1<p>2</a>3</p>");
      const serialized = serializeToHtml5lib(doc, {
        skipImplicitDoctype: true,
      });
      expect(serialized).toBe(`| <html>
|   <head>
|   <body>
|     <a>
|       "1"
|     <p>
|       <a>
|         "2"
|       "3"
|     <table>
`);
    });
  });

  describe("Implicit table structure", () => {
    it("should create implicit tbody and tr for td in table", () => {
      const doc = parseHTML("<table><td>X</td></table>");
      const serialized = serializeToHtml5lib(doc, {
        skipImplicitDoctype: true,
      });
      expect(serialized).toBe(`| <html>
|   <head>
|   <body>
|     <table>
|       <tbody>
|         <tr>
|           <td>
|             "X"
`);
    });

    it("should create implicit tr for td in tbody", () => {
      const doc = parseHTML("<table><tbody><td>X</td></tbody></table>");
      const serialized = serializeToHtml5lib(doc, {
        skipImplicitDoctype: true,
      });
      expect(serialized).toBe(`| <html>
|   <head>
|   <body>
|     <table>
|       <tbody>
|         <tr>
|           <td>
|             "X"
`);
    });

    it("should not create implicit structure when tr is present", () => {
      const doc = parseHTML("<table><tr><td>X</td></tr></table>");
      const serialized = serializeToHtml5lib(doc, {
        skipImplicitDoctype: true,
      });
      expect(serialized).toBe(`| <html>
|   <head>
|   <body>
|     <table>
|       <tbody>
|         <tr>
|           <td>
|             "X"
`);
    });
  });
});
