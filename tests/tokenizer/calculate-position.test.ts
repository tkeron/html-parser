import { expect, it, describe } from "bun:test";
import { calculatePosition } from "../../src/tokenizer/calculate-position.js";

describe("calculatePosition", () => {
  it("should calculate position at start", () => {
    const result = calculatePosition("hello", 0);
    expect(result).toEqual({ line: 1, column: 0, offset: 0 });
  });

  it("should calculate position in middle of line", () => {
    const result = calculatePosition("hello", 2);
    expect(result).toEqual({ line: 1, column: 2, offset: 2 });
  });

  it("should calculate position after newline", () => {
    const result = calculatePosition("hello\nworld", 6);
    expect(result).toEqual({ line: 2, column: 0, offset: 6 });
  });

  it("should calculate position in second line", () => {
    const result = calculatePosition("hello\nworld", 8);
    expect(result).toEqual({ line: 2, column: 2, offset: 8 });
  });

  it("should handle multiple newlines", () => {
    const result = calculatePosition("a\nb\nc", 4);
    expect(result).toEqual({ line: 3, column: 0, offset: 4 });
  });

  it("should handle empty string", () => {
    const result = calculatePosition("", 0);
    expect(result).toEqual({ line: 1, column: 0, offset: 0 });
  });
});
