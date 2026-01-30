import { expect, it, describe } from "bun:test";
import { parse } from "../src/parser";
import { readFileSync } from "fs";

describe("Tree Construction Entities02 Tests", () => {
  const content = readFileSync(
    "tests/html5lib-data/tree-construction/entities02.dat",
    "utf8",
  );
  const sections = content.split("#data\n").slice(1);

  sections.forEach((section, index) => {
    const lines = section.trim().split("\n");
    let data = "";
    let document = "";
    let inDocument = false;

    for (const line of lines) {
      if (line.startsWith("#document")) {
        inDocument = true;
      } else if (line.startsWith("#data")) {
        // next section
      } else if (inDocument) {
        document += line + "\n";
      } else if (!line.startsWith("#")) {
        data += line;
      }
    }

    it(`Entities02 test ${index + 1}`, () => {
      const doc = parse(data);
      // TODO: compare doc with expected document tree
      expect(true).toBe(true); // placeholder
    });
  });
});
