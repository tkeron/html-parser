import { expect, it } from "bun:test";
import { detectEncoding } from "../../src/encoding/index.ts";

it("should detect charset from meta tag", () => {
  const html = '<html><head><meta charset="utf-8"></head></html>';
  expect(detectEncoding(html)).toBe("utf-8");
});

it("should detect charset from meta tag with single quotes", () => {
  const html = "<html><head><meta charset='iso-8859-1'></head></html>";
  expect(detectEncoding(html)).toBe("windows-1252");
});

it("should detect charset from content-type meta", () => {
  const html =
    '<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head></html>';
  expect(detectEncoding(html)).toBe("utf-8");
});

it("should return windows-1252 as default", () => {
  const html = "<html><head></head></html>";
  expect(detectEncoding(html)).toBe("windows-1252");
});

it("should normalize encoding aliases", () => {
  const html = '<html><head><meta charset="UTF-8"></head></html>';
  expect(detectEncoding(html)).toBe("utf-8");
});

it("should handle case insensitive charset", () => {
  const html = '<html><head><meta CHARSET="utf-8"></head></html>';
  expect(detectEncoding(html)).toBe("utf-8");
});
