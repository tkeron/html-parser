import { readFileSync } from "fs";
import { parse } from "../src/index.ts";

describe("Tree Construction Tests5 Tests", () => {
  const content = readFileSync(
    "tests/html5lib-data/tree-construction/tests5.dat",
    "utf8",
  );
  const sections = content.split("#data\n");

  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    const [dataPart] = section.split("#document\n");
    const data = dataPart.trim();

    it(`Tests5 test ${i}`, () => {
      const doc = parse(data);
      expect(doc).toBeDefined();
      // TODO: Implement DOM serialization and comparison
    });
  }
});
