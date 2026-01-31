import { expect, it, describe } from "bun:test";
import { parseHTML } from "../index";
import { serializeToHtml5lib } from "./helpers/tree-adapter";
import { readFileSync } from "fs";

describe("Tree Construction Adoption01 Tests", () => {
  const content = readFileSync(
    "tests/html5lib-data/tree-construction/adoption01.dat",
    "utf8",
  );
  const sections = content.split("#data\n").slice(1);

  sections.forEach((section, index) => {
    const lines = section.trim().split("\n");
    let data = "";
    let document = "";
    let inDocument = false;
    let inData = true; // Start with data since we split on #data\n

    for (const line of lines) {
      if (line.startsWith("#document")) {
        inDocument = true;
        inData = false;
      } else if (line.startsWith("#errors")) {
        inData = false;
        inDocument = false;
      } else if (inDocument) {
        document += line + "\n";
      } else if (inData) {
        data += line;
      }
    }

    const passingTests = [1, 2, 3, 4, 7, 8, 9, 16];
    const testFn = passingTests.includes(index + 1) ? it : it.skip;

    testFn(`Adoption test ${index + 1}`, () => {
      const doc = parseHTML(data);
      const hasExplicitDoctype = data.toLowerCase().includes("<!doctype");
      const serialized = serializeToHtml5lib(doc, {
        skipImplicitDoctype: !hasExplicitDoctype,
      });
      expect(serialized).toBe(document);
    });
  });
});
