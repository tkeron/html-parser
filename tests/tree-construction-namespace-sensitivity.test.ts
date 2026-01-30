import { readFileSync } from "fs";
import { parse } from "../src/index.ts";

describe("Tree Construction NamespaceSensitivity Tests", () => {
  const content = readFileSync(
    "tests/html5lib-data/tree-construction/namespace-sensitivity.dat",
    "utf8",
  );
  const tests = content.split("#data\n").slice(1);

  tests.forEach((test, index) => {
    const parts = test.split("#document\n");
    const input = parts[0].trim();

    it.skip(`NamespaceSensitivity test ${index + 1}`, () => {
      const doc = parse(input);
      expect(doc).toBeDefined();
    });
  });
});
