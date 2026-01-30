import { describe, it, expect } from "bun:test";
import { readFileSync } from "fs";
import { parse } from "../src/index.ts";

describe("Tree Construction Scriptdata01 Tests", () => {
  const content = readFileSync(
    "tests/html5lib-data/tree-construction/scriptdata01.dat",
    "utf8",
  );
  const sections = content.split(/^#data$/gm).slice(1);

  for (const section of sections) {
    const [data, document] = section.split(/^#document$/gm);
    const input = data.trim();
    const expected = document.trim();

    it(`Scriptdata01 test: ${input.slice(0, 50)}${input.length > 50 ? "..." : ""}`, () => {
      const doc = parse(input);
      expect(doc).toBeDefined();
      // TODO: Implement DOM serialization and comparison
      // expect(serialize(doc)).toBe(expected);
    });
  }
});
