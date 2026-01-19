import { expect, it, describe } from 'bun:test';
import { serializeTokens } from '../src/serializer';
import { readFileSync } from 'fs';

describe('Serializer Core Tests', () => {
  const content = readFileSync('tests/serializer-data/core.test', 'utf8');
  const data = JSON.parse(content);
  const tests = data.tests;

  tests.forEach((test: any, index: number) => {
    it(test.description, () => {
      const result = serializeTokens(test.input);
      expect(result).toBe(test.expected[0]);
    });
  });
});