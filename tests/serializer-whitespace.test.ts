import { expect, it, describe } from "bun:test";
import { serializeTokens } from "../src/serializer";
import { readFileSync } from "fs";

describe("Serializer Whitespace Tests", () => {
  const content = readFileSync("tests/serializer-data/whitespace.test", "utf8");
  const data = JSON.parse(content);
  const tests = data.tests;

  tests.forEach((test: any, index: number) => {
    it(test.description, () => {
      const result = serializeTokens(test.input, test.options);
      expect(result).toBe(test.expected[0]);
    });
  });
});
