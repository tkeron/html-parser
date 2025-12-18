import { describe, it, expect } from 'bun:test';
import { parseHTML } from '../../../index';


function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .trim();
}

describe('Final HTML Output Validation', () => {
  describe('Complete HTML Structure', () => {
    it('should parse and create DOM structure correctly', () => {
      const html = '<div class="container"><p>Hello World</p></div>';
      
      const document = parseHTML(html);
      
      expect(document).toBeDefined();
      expect(document.nodeType).toBe(9); 
      
      const div = document.querySelector('div');
      expect(div).toBeDefined();
      expect(div?.className).toBe('container');
      
      const p = document.querySelector('p');
      expect(p).toBeDefined();
      expect(p?.textContent).toBe('Hello World');
    });

    it('should handle nested elements correctly', () => {
      const html = '<div><span><strong>Bold text</strong></span></div>';
      
      const document = parseHTML(html);
      
      const div = document.querySelector('div');
      expect(div).toBeDefined();
      
      const span = div?.querySelector('span');
      expect(span).toBeDefined();
      
      const strong = span?.querySelector('strong');
      expect(strong).toBeDefined();
      expect(strong?.textContent).toBe('Bold text');
    });

    it('should handle self-closing tags correctly', () => {
      const html = '<div><img src="test.jpg" alt="Test"><br><hr></div>';
      
      const document = parseHTML(html);
      
      const img = document.querySelector('img');
      expect(img).toBeDefined();
      expect(img?.getAttribute('src')).toBe('test.jpg');
      expect(img?.getAttribute('alt')).toBe('Test');
      
      const br = document.querySelector('br');
      expect(br).toBeDefined();
      
      const hr = document.querySelector('hr');
      expect(hr).toBeDefined();
    });

    it('should handle attributes correctly', () => {
      const html = '<div id="main" class="container" data-value="test">Content</div>';
      
      const document = parseHTML(html);
      
      const div = document.querySelector('div');
      expect(div).toBeDefined();
      expect(div?.getAttribute('id')).toBe('main');
      expect(div?.getAttribute('class')).toBe('container');
      expect(div?.getAttribute('data-value')).toBe('test');
      expect(div?.textContent).toBe('Content');
    });

    it('should handle text content correctly', () => {
      const html = '<p>This is a <strong>bold</strong> text with <em>emphasis</em>.</p>';
      
      const document = parseHTML(html);
      
      const p = document.querySelector('p');
      expect(p).toBeDefined();
      expect(normalizeText(p?.textContent || '')).toBe('This is a bold text with emphasis.');
      
      const strong = document.querySelector('strong');
      expect(strong?.textContent).toBe('bold');
      
      const em = document.querySelector('em');
      expect(em?.textContent).toBe('emphasis');
    });

    it('should handle comments correctly', () => {
      const html = '<div><!-- This is a comment --><p>Content</p></div>';
      
      const document = parseHTML(html);
      
      const div = document.querySelector('div');
      expect(div).toBeDefined();
      
      const p = document.querySelector('p');
      expect(p).toBeDefined();
      expect(p?.textContent).toBe('Content');
      
      
      const commentNode = div?.childNodes[0];
      expect(commentNode?.nodeType).toBe(8); 
    });
  });

  describe('DOM Structure Validation', () => {
    it('should maintain correct parent-child relationships', () => {
      const html = '<div><p><span>Nested</span></p></div>';
      
      const document = parseHTML(html);
      
      const div = document.querySelector('div');
      expect(div).toBeDefined();
      expect(div?.children.length).toBe(1);
      
      const p = div?.children[0];
      expect(p?.tagName).toBe('P');
      expect(p?.children.length).toBe(1);
      
      const span = p?.children[0];
      expect(span?.tagName).toBe('SPAN');
      expect(span?.textContent).toBe('Nested');
    });

    it('should handle mixed content correctly', () => {
      const html = '<div>Text before <span>span content</span> text after</div>';
      
      const document = parseHTML(html);
      
      const div = document.querySelector('div');
      expect(div).toBeDefined();
      expect(div?.childNodes.length).toBe(3);
      
      
      expect(div?.childNodes[0]?.nodeType).toBe(3); 
      expect(div?.childNodes[0]?.textContent).toBe('Text before ');
      
      
      expect(div?.childNodes[1]?.nodeType).toBe(1); 
      expect((div?.childNodes[1] as Element)?.tagName).toBe('SPAN');
      
      
      expect(div?.childNodes[2]?.nodeType).toBe(3); 
      expect(div?.childNodes[2]?.textContent).toBe(' text after');
    });

    it('should handle void elements correctly', () => {
      const html = '<div><img src="test.jpg"><br><input type="text"></div>';
      
      const document = parseHTML(html);
      
      const img = document.querySelector('img');
      expect(img).toBeDefined();
      expect(img?.getAttribute('src')).toBe('test.jpg');
      
      const br = document.querySelector('br');
      expect(br).toBeDefined();
      
      const input = document.querySelector('input');
      expect(input).toBeDefined();
      expect(input?.getAttribute('type')).toBe('text');
    });
  });

  describe('HTML5 Semantic Structure', () => {
    it('should handle complete HTML5 document structure', () => {
      const html = `<!DOCTYPE html>
<html>
<head>
  <title>Test Document</title>
</head>
<body>
  <header>
    <nav>Navigation</nav>
  </header>
  <main>
    <article>
      <section>Content</section>
    </article>
  </main>
  <footer>Footer</footer>
</body>
</html>`;
      
      const document = parseHTML(html);
      
      expect(document).toBeDefined();
      expect(document.documentElement?.tagName).toBe('HTML');
      
      const head = document.querySelector('head');
      expect(head).toBeDefined();
      
      const title = document.querySelector('title');
      expect(title?.textContent).toBe('Test Document');
      
      const body = document.querySelector('body');
      expect(body).toBeDefined();
      
      const header = document.querySelector('header');
      expect(header).toBeDefined();
      
      const nav = document.querySelector('nav');
      expect(nav?.textContent).toBe('Navigation');
      
      const main = document.querySelector('main');
      expect(main).toBeDefined();
      
      const article = document.querySelector('article');
      expect(article).toBeDefined();
      
      const section = document.querySelector('section');
      expect(section?.textContent).toBe('Content');
      
      const footer = document.querySelector('footer');
      expect(footer?.textContent).toBe('Footer');
    });

    it('should handle HTML5 form elements', () => {
      const html = `<form>
  <fieldset>
    <legend>Contact Information</legend>
    <label for="email">Email:</label>
    <input type="email" id="email" required>
    <label for="phone">Phone:</label>
    <input type="tel" id="phone">
    <button type="submit">Submit</button>
  </fieldset>
</form>`;
      
      const document = parseHTML(html);
      
      const form = document.querySelector('form');
      expect(form).toBeDefined();
      
      const fieldset = document.querySelector('fieldset');
      expect(fieldset).toBeDefined();
      
      const legend = document.querySelector('legend');
      expect(legend?.textContent).toBe('Contact Information');
      
      const emailInput = document.querySelector('input[type="email"]');
      expect(emailInput).toBeDefined();
      expect(emailInput?.getAttribute('id')).toBe('email');
      expect(emailInput?.hasAttribute('required')).toBe(true);
      
      const phoneInput = document.querySelector('input[type="tel"]');
      expect(phoneInput).toBeDefined();
      expect(phoneInput?.getAttribute('id')).toBe('phone');
      
      const submitButton = document.querySelector('button[type="submit"]');
      expect(submitButton).toBeDefined();
      expect(submitButton?.textContent).toBe('Submit');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed HTML gracefully', () => {
      const malformedHTML = '<div><p>Unclosed paragraph<div>Another div</div>';
      
      const document = parseHTML(malformedHTML);
      
      expect(document).toBeDefined();
      expect(document.nodeType).toBe(9); 
      
      const divs = document.querySelectorAll('div');
      expect(divs.length).toBeGreaterThan(0);
    });

    it('should handle empty elements', () => {
      const html = '<div></div><p></p><span></span>';
      
      const document = parseHTML(html);
      
      const div = document.querySelector('div');
      expect(div).toBeDefined();
      expect(div?.textContent).toBe('');
      
      const p = document.querySelector('p');
      expect(p).toBeDefined();
      expect(p?.textContent).toBe('');
      
      const span = document.querySelector('span');
      expect(span).toBeDefined();
      expect(span?.textContent).toBe('');
    });

    it('should handle special characters in text', () => {
      const html = '<p>Special chars: &lt; &gt; &amp; &quot; &#39;</p>';
      
      const document = parseHTML(html);
      
      const p = document.querySelector('p');
      expect(p).toBeDefined();
      expect(p?.textContent).toContain('Special chars:');
      
    });

    it('should handle multiple top-level elements', () => {
      const html = '<div>First</div><p>Second</p><span>Third</span>';
      
      const document = parseHTML(html);
      
      const div = document.querySelector('div');
      expect(div?.textContent).toBe('First');
      
      const p = document.querySelector('p');
      expect(p?.textContent).toBe('Second');
      
      const span = document.querySelector('span');
      expect(span?.textContent).toBe('Third');
    });
  });

  describe('DOM API Compliance', () => {
    it('should support basic DOM queries', () => {
      const html = '<div id="test" class="container"><p class="text">Hello</p></div>';
      
      const document = parseHTML(html);
      
      
      const byId = document.getElementById('test');
      expect(byId).toBeDefined();
      expect(byId?.tagName).toBe('DIV');
      
      
      const bySelector = document.querySelector('.container');
      expect(bySelector).toBeDefined();
      expect(bySelector?.id).toBe('test');
      
      
      const byClass = document.querySelectorAll('.text');
      expect(byClass.length).toBe(1);
      expect(byClass[0]?.textContent).toBe('Hello');
    });

    it('should support element traversal', () => {
      const html = '<div><p>First</p><p>Second</p><p>Third</p></div>';
      
      const document = parseHTML(html);
      
      const div = document.querySelector('div');
      expect(div).toBeDefined();
      
      const children = div?.children;
      expect(children?.length).toBe(3);
      
      const firstP = children?.[0];
      expect(firstP?.textContent).toBe('First');
      
      const secondP = children?.[1];
      expect(secondP?.textContent).toBe('Second');
      
      const thirdP = children?.[2];
      expect(thirdP?.textContent).toBe('Third');
    });
  });
});
