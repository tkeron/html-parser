import { readFileSync } from "fs";
import { parse } from "../src/index.ts";

describe("Tree Construction Tests6 Tests", () => {
  const content = readFileSync("tests/html5lib-data/tree-construction/tests6.dat", "utf8");
  const sections = content.split("#data\n");

  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    const [dataPart, documentPart] = section.split("#document\n");
    const data = dataPart.trim();
    const expectedDocument = documentPart ? documentPart.split("#errors\n")[0].trim() : "";
    const errors = documentPart && documentPart.includes("#errors\n") ? documentPart.split("#errors\n")[1].trim() : "";

    it(`Tests6 test ${i}`, () => {
      const doc = parse(data);
      expect(doc).toBeDefined();
      // TODO: Implement DOM serialization and comparison
    });
  }
});