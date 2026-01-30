import { expect, it, describe } from "bun:test";
import { tokenize } from "../src/tokenizer/index.js";
import { readFileSync } from "fs";
import { adaptTokens } from "./helpers/tokenizer-adapter";

describe("Tokenizer PendingSpecChanges Tests", () => {
  const content = readFileSync(
    "tests/html5lib-data/tokenizer/pendingSpecChanges.test",
    "utf8",
  );
  const data = JSON.parse(content);
  const tests = data.tests;

  tests.forEach((test: any, index: number) => {
    if (!test.errors || test.errors.length === 0) {
      it(test.description, () => {
        const tokens = tokenize(test.input);
        const adapted = adaptTokens(tokens);
        expect(adapted).toEqual(test.output);
      });
    }
  });
});
