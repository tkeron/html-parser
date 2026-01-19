import { expect, it, describe } from 'bun:test';
import { parseHTML } from '../index';
import { serializeToHtml5lib } from './helpers/tree-adapter';
import { readFileSync } from 'fs';

describe('Tree Construction Adoption02 Tests', () => {
  const content = readFileSync('tests/html5lib-data/tree-construction/adoption02.dat', 'utf8');
  const sections = content.split('#data\n').slice(1);

  sections.forEach((section, index) => {
    const lines = section.trim().split('\n');
    let data = '';
    let document = '';
    let inDocument = false;

    for (const line of lines) {
      if (line.startsWith('#document')) {
        inDocument = true;
      } else if (line.startsWith('#data')) {
        // next section
      } else if (inDocument) {
        document += line.slice(2) + '\n';
      } else if (!line.startsWith('#')) {
        data += line;
      }
    }

    it.skip(`Adoption02 test ${index + 1}`, () => {
      const doc = parseHTML(data);
      const serialized = serializeToHtml5lib(doc);
      expect(serialized).toBe(document.trim());
    });
  });
});