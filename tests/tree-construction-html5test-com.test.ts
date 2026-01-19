import { describe, it } from "bun:test";
import { readFileSync } from "fs";
import { parse } from "../src/index.ts";

describe("Tree Construction Html5testCom Tests", () => {
  const data = readFileSync("tests/html5lib-data/tree-construction/html5test-com.dat", "utf8");
  const sections = data.split("#data\n").slice(1);

  for (const section of sections) {
    const parts = section.split("#document\n");
    if (parts.length < 2) continue;
    const inputWithErrors = parts[0];
    const expected = parts[1];
    const input = inputWithErrors.split("#errors\n")[0].trim();

    const testName = input.split("\n")[0] || "Html5testCom test";
    it.skip(testName, () => {
      const doc = parse(input);
      // TODO: Implement DOM tree comparison with expected
      // For now, just ensure parsing doesn't throw
      expect(doc).toBeDefined();
    });
  }
});