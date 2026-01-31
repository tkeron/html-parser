import { it, expect } from "bun:test";
import { parseHTML } from "../index.js";
import { serializeToHtml5lib } from "./helpers/tree-adapter.js";

it("should run AAA 2 times - test case with nested divs", () => {
  const html = "<a>1<div>2<div>3</a>4</div>5</div>";
  const doc = parseHTML(html);
  const serialized = serializeToHtml5lib(doc, { skipImplicitDoctype: true });

  const expected = `| <html>
|   <head>
|   <body>
|     <a>
|       "1"
|     <div>
|       <a>
|         "2"
|       <div>
|         <a>
|           "3"
|         "4"
|       "5"
`;

  expect(serialized).toBe(expected);
});

it("should run AAA 8 times - deeply nested divs", () => {
  const html =
    "<div><a><b><div><div><div><div><div><div><div><div><div><div></a>";
  const doc = parseHTML(html);
  const serialized = serializeToHtml5lib(doc, { skipImplicitDoctype: true });

  const expected = `| <html>
|   <head>
|   <body>
|     <div>
|       <a>
|         <b>
|       <b>
|         <div>
|           <a>
|           <div>
|             <a>
|             <div>
|               <a>
|               <div>
|                 <a>
|                 <div>
|                   <a>
|                   <div>
|                     <a>
|                     <div>
|                       <a>
|                       <div>
|                         <a>
|                           <div>
|                             <div>
`;

  expect(serialized).toBe(expected);
});

it("should run AAA 2 times - with style and address elements", () => {
  const html = "<a><div><style></style><address><a>";
  const doc = parseHTML(html);
  const serialized = serializeToHtml5lib(doc, { skipImplicitDoctype: true });

  const expected = `| <html>
|   <head>
|   <body>
|     <a>
|     <div>
|       <a>
|         <style>
|       <address>
|         <a>
|         <a>
`;

  expect(serialized).toBe(expected);
});

it("should run AAA with formatting element cloning", () => {
  const html = "<a>x<div>y</a>z</div>";
  const doc = parseHTML(html);
  const serialized = serializeToHtml5lib(doc, { skipImplicitDoctype: true });

  const expected = `| <html>
|   <head>
|   <body>
|     <a>
|       "x"
|     <div>
|       <a>
|         "y"
|       "z"
`;

  expect(serialized).toBe(expected);
});

it("should stop AAA when no more formatting elements to adopt", () => {
  const html = "<b>text</b><div>content</div>";
  const doc = parseHTML(html);
  const serialized = serializeToHtml5lib(doc, { skipImplicitDoctype: true });

  const expected = `| <html>
|   <head>
|   <body>
|     <b>
|       "text"
|     <div>
|       "content"
`;

  expect(serialized).toBe(expected);
});
