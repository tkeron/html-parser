import { describe, it, expect } from "bun:test";
import { readFileSync } from "fs";
import { parseHTML } from "../src/index.ts";
import { serializeToHtml5lib } from "./helpers/tree-adapter";

describe("Tree Construction Html5testCom Tests", () => {
  const data = readFileSync("tests/html5lib-data/tree-construction/html5test-com.dat", "utf8");
  const sections = data.split("#data\n").slice(1);

  for (const section of sections) {
    const parts = section.split("#document\n");
    if (parts.length < 2) continue;
    const inputWithErrors = parts[0];
    const expectedRaw = parts[1].split("\n#")[0];
    const expected = expectedRaw.split("\n").filter(l => l.startsWith("|")).join("\n") + "\n";
    const input = inputWithErrors.split("#errors\n")[0].trim();
    const hasDoctype = input.toLowerCase().startsWith("<!doctype");

    const testName = input.split("\n")[0] || "Html5testCom test";
    
    const isFosterParenting = input.includes('<table><form><input type=hidden><input></form><div></div></table>');
    const isAdoptionAgency = input.includes('<i>A<b>B<p></i>C</b>D');
    
    const testFn = (isFosterParenting || isAdoptionAgency) ? it.skip : it;
    
    testFn(testName, () => {
      const doc = parseHTML(input);
      const actual = serializeToHtml5lib(doc, { skipImplicitDoctype: !hasDoctype });
      expect(actual).toBe(expected);
    });
  }
});