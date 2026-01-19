import { describe, it, expect } from 'bun:test';
import { parseHTML } from '../index';
import {
  setInnerHTML
} from '../src/dom-simulator';

describe('DOM Extended Functionality', () => {
  describe('innerHTML and outerHTML', () => {
    it('should generate correct innerHTML for simple elements', () => {
      const doc = parseHTML('<div>Hello World</div>') as Document;
      const div = doc.body?.firstChild as HTMLElement;

      expect(div.innerHTML).toBe('Hello World');
    });

    it('should generate correct innerHTML for nested elements', () => {
      const doc = parseHTML('<div><p>Hello</p><span>World</span></div>') as Document;
      const div = doc.body?.firstChild as HTMLElement;

      expect(div.innerHTML).toBe('<p>Hello</p><span>World</span>');
    });

    it('should generate correct outerHTML for elements', () => {
      const doc = parseHTML('<div class="test">Hello</div>') as Document;
      const div = doc.body?.firstChild as HTMLElement;

      expect(div.outerHTML).toBe('<div class="test">Hello</div>');
    });

    it('should generate correct outerHTML for elements with multiple attributes', () => {
      const doc = parseHTML('<input type="text" name="username" value="test">') as Document;
      const input = doc.body?.firstChild as HTMLElement;

      expect(input.outerHTML).toContain('type="text"');
      expect(input.outerHTML).toContain('name="username"');
      expect(input.outerHTML).toContain('value="test"');
    });

    it('should handle comments in innerHTML', () => {
      const doc = parseHTML('<div><!-- comment -->text</div>') as Document;
      const div = doc.body?.firstChild as HTMLElement;

      expect(div.innerHTML).toBe('<!-- comment -->text');
    });
  });

  describe('textContent property', () => {
    it('should provide textContent on elements', () => {
      const doc = parseHTML('<div>Hello <span>World</span></div>') as Document;
      const div = doc.body?.firstChild as HTMLElement;

      expect(div.textContent).toBe('Hello World');
    });

    it('should provide textContent for deeply nested elements', () => {
      const doc = parseHTML('<div><p><em>Hello</em> <strong>Beautiful</strong></p> <span>World</span></div>') as Document;
      const div = doc.body?.firstChild as HTMLElement;

      expect(div.textContent).toBe('Hello Beautiful World');
    });

    it('should ignore comments in textContent', () => {
      const doc = parseHTML('<div>Hello <!-- comment --> World</div>') as Document;
      const div = doc.body?.firstChild as HTMLElement;

      expect(div.textContent).toBe('Hello  World');
    });
  });

  describe('element navigation properties', () => {
    it('should provide parentElement property', () => {
      const doc = parseHTML('<div><p>Hello</p></div>') as Document;
      const div = doc.body?.firstChild as HTMLElement;
      const p = div.children[0];

      expect(p).toBeDefined();
      expect(p?.parentElement).toBe(div);
    });

    it('should provide firstElementChild and lastElementChild', () => {
      const doc = parseHTML('<div><span>First</span><p>Second</p><em>Last</em></div>') as Document;
      const div = doc.body?.firstChild as HTMLElement;

      expect(div.firstElementChild?.tagName).toBe('SPAN');
      expect(div.lastElementChild?.tagName).toBe('EM');
    });

    it('should provide nextElementSibling and previousElementSibling', () => {
      const doc = parseHTML('<div><span>First</span><p>Second</p><em>Last</em></div>') as Document;
      const div = doc.body?.firstChild as HTMLElement;
      const span = div.children[0];
      const p = div.children[1];
      const em = div.children[2];

      expect(span).toBeDefined();
      expect(p).toBeDefined();
      expect(em).toBeDefined();

      if (span && p && em) {
        expect(span.nextElementSibling).toBe(p);
        expect(p.previousElementSibling).toBe(span);
        expect(p.nextElementSibling).toBe(em);
        expect(em.previousElementSibling).toBe(p);

        expect(span.previousElementSibling).toBeNull();
        expect(em.nextElementSibling).toBeNull();
      }
    });
  });

  describe('setInnerHTML functionality', () => {
    it('should clear existing content when setting innerHTML', () => {
      const doc = parseHTML('<div><p>Old content</p></div>') as Document;
      const div = doc.body?.firstChild as HTMLElement;

      setInnerHTML(div, 'New content');

      expect(div.innerHTML).toBe('New content');
      expect(div.children.length).toBe(0);
      expect(div.childNodes.length).toBe(1);
      expect(div.childNodes[0]?.nodeType).toBe(3);
      expect(div.childNodes[0]?.textContent).toBe('New content');
    });
  });

  describe('Document body property type validation', () => {
    it('should have body property with HTMLElement type', () => {
      const doc = parseHTML('<html><body><p>Content</p></body></html>') as Document;

      expect(doc.body).toBeTruthy();
      expect(doc.body?.tagName).toBe('BODY');
      expect(doc.body?.innerHTML).toBe('<p>Content</p>');
      expect(doc.body?.textContent).toBe('Content');
    });

    it('should have head property with HTMLElement type', () => {
      const doc = parseHTML('<html><head><title>Test</title></head><body></body></html>') as Document;

      expect(doc.head).toBeTruthy();
      expect(doc.head?.tagName).toBe('HEAD');
      expect(doc.head?.innerHTML).toBe('<title>Test</title>');
    });

    it('should have documentElement property with HTMLElement type', () => {
      const doc = parseHTML('<html><head></head><body></body></html>') as Document;

      expect(doc.documentElement).toBeTruthy();
      expect(doc.documentElement?.tagName).toBe('HTML');
      expect(doc.documentElement?.children.length).toBe(2);
    });
  });

  describe('DOM mutation and manipulation', () => {
    it("should append an element and update innerHTML accordingly", () => {
      const doc = parseHTML('<html><head></head><body></body></html>');

      const body = doc.querySelector("body");

      const h1 = doc.createElement("h1");

      h1.textContent = "Hello World";

      body?.appendChild(h1);

      const innerHTML = body?.innerHTML;

      expect(innerHTML).toBe('<h1>Hello World</h1>');

    });
  });


});
