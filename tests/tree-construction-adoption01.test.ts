import { expect, it, describe } from "bun:test";
import { parseHTML, parseHTMLFragment } from "../index";
import {
  serializeToHtml5lib,
  serializeFragmentToHtml5lib,
} from "./helpers/tree-adapter";
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
    let inData = true;
    let isFragmentTest = false;
    let fragmentContext = "";

    for (const line of lines) {
      if (line.startsWith("#document-fragment")) {
        isFragmentTest = true;
        inDocument = false;
        inData = false;
      } else if (isFragmentTest && !fragmentContext && !line.startsWith("#")) {
        fragmentContext = line.trim();
      } else if (line.startsWith("#document")) {
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

    if (isFragmentTest) {
      it(`Adoption test ${index + 1} (fragment: ${fragmentContext})`, () => {
        const nodes = parseHTMLFragment(data, fragmentContext);
        const serialized = serializeFragmentToHtml5lib(nodes);
        expect(serialized).toBe(document);
      });
    } else {
      it(`Adoption test ${index + 1}`, () => {
        const doc = parseHTML(data);
        const hasExplicitDoctype = data.toLowerCase().includes("<!doctype");
        const serialized = serializeToHtml5lib(doc, {
          skipImplicitDoctype: !hasExplicitDoctype,
        });
        expect(serialized).toBe(document);
      });
    }
  });
});
