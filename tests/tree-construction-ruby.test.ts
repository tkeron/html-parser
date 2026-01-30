import { describe, it, expect } from "bun:test";
import { readFileSync } from "fs";
import { parse } from "../src/index.ts";

describe("Tree Construction Ruby Tests", () => {
  const content = readFileSync(
    "tests/html5lib-data/tree-construction/ruby.dat",
    "utf8",
  );
  const sections = content.split(/^#data$/gm).slice(1);

  for (const section of sections) {
    const [data] = section.split(/^#document$/gm);
    const input = data.trim();

    it(`Ruby test: ${input.slice(0, 50)}${input.length > 50 ? "..." : ""}`, () => {
      const doc = parse(input);
      expect(doc).toBeDefined();
      // TODO: Implement DOM serialization and comparison
      // expect(serialize(doc)).toBe(expected);
    });
  }
});
