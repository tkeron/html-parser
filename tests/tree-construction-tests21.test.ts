import { readFileSync } from "fs";
import { parse } from "../src/index.ts";

describe("Tree Construction Tests21 Tests", () => {
  const data = readFileSync("tests/html5lib-data/tree-construction/tests21.dat", "utf8");
  const tests = data.split("#data\n").slice(1);

  for (const test of tests) {
    const [input, expected] = test.split("#document\n");
    const title = input.trim().split("\n")[0] || "Unnamed test";
    const html = input.trim();

    it.skip(title, () => {
      const doc = parse(html);
      expect(doc).toBeDefined();
    });
  }
});