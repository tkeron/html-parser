import { expect, test, describe } from 'bun:test';
import { tokenize } from '../src/tokenizer';
import { parse, ASTNodeType, type ASTNode } from '../src/parser';
import { file } from 'bun';
import { join } from 'path';

describe('HTML Parser', () => {

  describe('Basic Elements', () => {
    test('should parse simple element', () => {
      const tokens = tokenize('<div></div>');
      const ast = parse(tokens);

      expect(ast.type).toBe(ASTNodeType.DOCUMENT);
      expect(ast.children).toHaveLength(1);

      const divElement = ast.children![0]!;
      expect(divElement.type).toBe(ASTNodeType.ELEMENT);
      expect(divElement.tagName).toBe('div');
      expect(divElement.children).toHaveLength(0);
    });

    test('should parse element with attributes', () => {
      const tokens = tokenize('<div class="container" id="main"></div>');
      const ast = parse(tokens);

      const divElement = ast.children![0]!;
      expect(divElement.attributes).toEqual({
        class: 'container',
        id: 'main'
      });
    });

    test('should parse self-closing elements', () => {
      const tokens = tokenize('<img src="test.jpg" alt="test"/>');
      const ast = parse(tokens);

      const imgElement = ast.children![0]!;
      expect(imgElement.type).toBe(ASTNodeType.ELEMENT);
      expect(imgElement.tagName).toBe('img');
      expect(imgElement.isSelfClosing).toBe(true);
      expect(imgElement.attributes).toEqual({
        src: 'test.jpg',
        alt: 'test'
      });
    });

    test('should parse void elements correctly', () => {
      const tokens = tokenize('<br><hr><input type="text">');
      const ast = parse(tokens);

      expect(ast.children).toHaveLength(3);
      expect(ast.children![0]!.tagName).toBe('br');
      expect(ast.children![0]!.isSelfClosing).toBe(true);
      expect(ast.children![1]!.tagName).toBe('hr');
      expect(ast.children![1]!.isSelfClosing).toBe(true);
      expect(ast.children![2]!.tagName).toBe('input');
      expect(ast.children![2]!.isSelfClosing).toBe(true);
    });
  });

  describe('Nested Elements', () => {
    test('should parse nested elements', () => {
      const tokens = tokenize('<div><p>Hello</p></div>');
      const ast = parse(tokens);

      const divElement = ast.children![0]!;
      expect(divElement.tagName).toBe('div');
      expect(divElement.children).toHaveLength(1);

      const pElement = divElement.children![0]!;
      expect(pElement.tagName).toBe('p');
      expect(pElement.children).toHaveLength(1);

      const textNode = pElement.children![0]!;
      expect(textNode.type).toBe(ASTNodeType.TEXT);
      expect(textNode.content).toBe('Hello');
    });

    test('should parse deeply nested elements', () => {
      const tokens = tokenize('<div><section><article><h1>Title</h1></article></section></div>');
      const ast = parse(tokens);

      const divElement = ast.children![0]!;
      const sectionElement = divElement.children![0]!;
      const articleElement = sectionElement.children![0]!;
      const h1Element = articleElement.children![0]!;

      expect(h1Element.tagName).toBe('h1');
      expect(h1Element.children![0]!.content).toBe('Title');
    });

    test('should handle multiple siblings', () => {
      const tokens = tokenize('<div><p>First</p><p>Second</p><p>Third</p></div>');
      const ast = parse(tokens);

      const divElement = ast.children![0]!;
      expect(divElement.children).toHaveLength(3);

      expect(divElement.children![0]!.tagName).toBe('p');
      expect(divElement.children![0]!.children![0]!.content).toBe('First');
      expect(divElement.children![1]!.children![0]!.content).toBe('Second');
      expect(divElement.children![2]!.children![0]!.content).toBe('Third');
    });
  });

  describe('Text Content', () => {
    test('should parse text content', () => {
      const tokens = tokenize('Hello World');
      const ast = parse(tokens);

      expect(ast.children).toHaveLength(1);
      const textNode = ast.children![0]!;
      expect(textNode.type).toBe(ASTNodeType.TEXT);
      expect(textNode.content).toBe('Hello World');
    });

    test('should parse mixed text and elements', () => {
      const tokens = tokenize('Before <strong>bold</strong> after');
      const ast = parse(tokens);

      expect(ast.children).toHaveLength(3);
      expect(ast.children![0]!.content).toBe('Before ');
      expect(ast.children![1]!.tagName).toBe('strong');
      expect(ast.children![1]!.children![0]!.content).toBe('bold');
      expect(ast.children![2]!.content).toBe(' after');
    });

    test('should handle entities in text', () => {
      const tokens = tokenize('<p>&amp; &lt; &gt;</p>');
      const ast = parse(tokens);

      const pElement = ast.children![0]!;
      const textNode = pElement.children![0]!;
      expect(textNode.content).toBe('& < >');
    });
  });

  describe('Comments and Special Nodes', () => {
    test('should parse HTML comments', () => {
      const tokens = tokenize('<!-- This is a comment -->');
      const ast = parse(tokens);

      expect(ast.children).toHaveLength(1);
      const commentNode = ast.children![0]!;
      expect(commentNode.type).toBe(ASTNodeType.COMMENT);
      expect(commentNode.content).toBe(' This is a comment ');
    });

    test('should parse DOCTYPE', () => {
      const tokens = tokenize('<!DOCTYPE html>');
      const ast = parse(tokens);

      expect(ast.children).toHaveLength(1);
      const doctypeNode = ast.children![0]!;
      expect(doctypeNode.type).toBe(ASTNodeType.DOCTYPE);
      expect(doctypeNode.content).toBe('html');
    });

    test('should parse CDATA sections', () => {
      const tokens = tokenize('<![CDATA[Some raw data]]>');
      const ast = parse(tokens);

      expect(ast.children).toHaveLength(1);
      const cdataNode = ast.children![0]!;
      expect(cdataNode.type).toBe(ASTNodeType.CDATA);
      expect(cdataNode.content).toBe('Some raw data');
    });

    test('should parse processing instructions', () => {
      const tokens = tokenize('<?xml version="1.0"?>');
      const ast = parse(tokens);

      expect(ast.children).toHaveLength(1);
      const piNode = ast.children![0]!;
      expect(piNode.type).toBe(ASTNodeType.PROCESSING_INSTRUCTION);
      expect(piNode.content).toBe('<?xml version="1.0"');
    });
  });

  describe('Complete HTML Documents', () => {
    test('should parse complete HTML document', () => {
      const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Test Document</title>
    <meta charset="UTF-8">
  </head>
  <body>
    <h1>Hello World</h1>
    <p>This is a test paragraph.</p>
    <!-- This is a comment -->
  </body>
</html>`;

      const tokens = tokenize(html);
      const ast = parse(tokens);

      expect(ast.children!.length).toBeGreaterThan(1);

      const htmlElement = ast.children!.find(
        child => child.type === ASTNodeType.ELEMENT && child.tagName === 'html'
      )!;

      expect(htmlElement).toBeDefined();
      expect(htmlElement.attributes!.lang).toBe('en');

      const elementChildren = htmlElement.children!.filter(
        child => child.type === ASTNodeType.ELEMENT
      );
      expect(elementChildren).toHaveLength(2);

      const headElement = elementChildren.find(child => child.tagName === 'head')!;
      const bodyElement = elementChildren.find(child => child.tagName === 'body')!;

      expect(headElement).toBeDefined();
      expect(bodyElement).toBeDefined();
    });
  });

  describe('real web scenarios', () => {
    test('should parse real-world HTML', async () => {
      const html = await file(join(__dirname, "test-page-0.txt")).text();
      const tokens = tokenize(html);
      const ast = parse(tokens);
    });
  });

  describe('Error Recovery', () => {
    test('should handle unclosed tags', () => {
      const tokens = tokenize('<div><p>Unclosed paragraph</div>');
      const ast = parse(tokens);

      const divElement = ast.children![0]!;
      expect(divElement.tagName).toBe('div');

      const pElement = divElement.children![0]!;
      expect(pElement.tagName).toBe('p');
    });

    test('should handle unexpected closing tags', () => {
      const tokens = tokenize('<div></span></div>');
      const ast = parse(tokens);

      const divElement = ast.children![0]!;
      expect(divElement.tagName).toBe('div');
    });

    test('should handle malformed attributes', () => {
      const tokens = tokenize('<div class="test id="main">Content</div>');
      const ast = parse(tokens);

      const divElement = ast.children![0]!;
      expect(divElement.tagName).toBe('div');
      expect(divElement.attributes).toBeDefined();
    });
  });

  describe('Auto-closing Tags', () => {
    test('should auto-close list items', () => {
      const tokens = tokenize('<ul><li>First<li>Second</ul>');
      const ast = parse(tokens);

      const ulElement = ast.children![0]!;
      const liElements = ulElement.children!.filter(
        child => child.type === ASTNodeType.ELEMENT && child.tagName === 'li'
      );

      expect(liElements).toHaveLength(2);
      expect(liElements[0]!.children![0]!.content).toBe('First');
      expect(liElements[1]!.children![0]!.content).toBe('Second');
    });

    test('should auto-close paragraph tags', () => {
      const tokens = tokenize('<p>First paragraph<p>Second paragraph');
      const ast = parse(tokens);

      const pElements = ast.children!.filter(
        child => child.type === ASTNodeType.ELEMENT && child.tagName === 'p'
      );

      expect(pElements).toHaveLength(2);
      expect(pElements[0]!.children![0]!.content).toBe('First paragraph');
      expect(pElements[1]!.children![0]!.content).toBe('Second paragraph');
    });
  });

  describe('Whitespace Handling', () => {
    test('should preserve significant whitespace', () => {
      const tokens = tokenize('<p>  Hello   World  </p>');
      const ast = parse(tokens);

      const pElement = ast.children![0]!;
      const textNode = pElement.children![0]!;
      expect(textNode.content).toBe('  Hello   World  ');
    });

    test('should skip insignificant whitespace', () => {
      const tokens = tokenize(`<html>
  <head>
    <title>Test</title>
  </head>
</html>`);
      const ast = parse(tokens);

      const htmlElement = ast.children!.find(
        child => child.type === ASTNodeType.ELEMENT && child.tagName === 'html'
      )!;

      const headElement = htmlElement.children!.find(
        child => child.type === ASTNodeType.ELEMENT && child.tagName === 'head'
      )!;

      expect(headElement).toBeDefined();
    });
  });

  describe("complete web page", () => {
    test('should parse a complete web page', async () => {
      const html = await file(join(__dirname, "test-page-0.txt")).text();
      const tokens = tokenize(html);
      const ast = parse(tokens);
      expect(ast.children!.length).toBeGreaterThanOrEqual(3);
      const htmlElement = ast.children!.find(
        child => child.type === ASTNodeType.ELEMENT && child.tagName === 'html'
      )!;
      expect(htmlElement.type).toBe(ASTNodeType.ELEMENT);
      expect(htmlElement.tagName).toBe('html');
      expect(htmlElement.attributes!.lang).toBe('es');
      const headElement = htmlElement.children!.find(
        child => child.type === ASTNodeType.ELEMENT && child.tagName === 'head'
      )!;
      const bodyElement = htmlElement.children!.find(
        child => child.type === ASTNodeType.ELEMENT && child.tagName === 'body'
      )!;
      expect(headElement).toBeDefined();
      expect(bodyElement).toBeDefined();
    })
  })

  describe('Advanced Edge Cases', () => {
    test('should handle empty attributes', () => {
      const tokens = tokenize('<input disabled checked="" value="">');
      const ast = parse(tokens);
      const inputElement = ast.children![0]!;
      expect(inputElement.attributes).toEqual({
        disabled: '',
        checked: '',
        value: ''
      });
    });

    test('should handle attributes with special characters', () => {
      const tokens = tokenize('<div data-test="hello-world" class="my_class-123">');
      const ast = parse(tokens);
      const divElement = ast.children![0]!;
      expect(divElement.attributes).toEqual({
        'data-test': 'hello-world',
        'class': 'my_class-123'
      });
    });

    test('should handle mixed quotes in attributes', () => {
      const tokens = tokenize(`<div title='He said "Hello"' data-info="She's here">`);
      const ast = parse(tokens);
      const divElement = ast.children![0]!;
      expect(divElement.attributes!.title).toBe('He said "Hello"');
      expect(divElement.attributes!['data-info']).toBe("She's here");
    });    test('should handle deeply nested comments', () => {
      const tokens = tokenize('<div><!-- Outer <!-- Inner --> comment --></div>');
      const ast = parse(tokens);
      const divElement = ast.children![0]!;
      expect(divElement.children!.length).toBeGreaterThanOrEqual(1);
      expect(divElement.children![0]!.type).toBe(ASTNodeType.COMMENT);
    });

    test('should handle multiple consecutive whitespace', () => {
      const tokens = tokenize('<p>    \n\t   Hello    \n\t   World    \n\t   </p>');
      const ast = parse(tokens);
      const pElement = ast.children![0]!;
      const textNode = pElement.children![0]!;
      expect(textNode.content).toContain('Hello');
      expect(textNode.content).toContain('World');
    });

    test('should handle malformed nested tags', () => {
      const tokens = tokenize('<div><p><span>Text</div></span></p>');
      const ast = parse(tokens);
      const divElement = ast.children![0]!;
      expect(divElement.tagName).toBe('div');
      expect(divElement.children!.length).toBeGreaterThan(0);
    });

    test('should handle orphaned closing tags', () => {
      const tokens = tokenize('</div><p>Content</p></span>');
      const ast = parse(tokens);
      const pElement = ast.children!.find(
        child => child.type === ASTNodeType.ELEMENT && child.tagName === 'p'
      )!;
      expect(pElement).toBeDefined();
      expect(pElement.children![0]!.content).toBe('Content');
    });

    test('should handle extreme nesting depth', () => {
      let html = '';
      const depth = 50;
      for (let i = 0; i < depth; i++) {
        html += `<div level="${i}">`;
      }
      html += 'Deep content';
      for (let i = 0; i < depth; i++) {
        html += '</div>';
      }
      const tokens = tokenize(html);
      const ast = parse(tokens);
      let current = ast.children![0]!;
      for (let i = 0; i < depth - 1; i++) {
        expect(current.tagName).toBe('div');
        expect(current.attributes!.level).toBe(i.toString());
        current = current.children!.find(child => child.type === ASTNodeType.ELEMENT)!;
      }
      const textNode = current.children!.find(child => child.type === ASTNodeType.TEXT)!;
      expect(textNode.content).toBe('Deep content');
    });
  })

  describe('Complex Entity Handling', () => {
    test('should handle numeric character references', () => {
      const tokens = tokenize('<p>&#65; &#8364; &#x41; &#x20AC;</p>');
      const ast = parse(tokens);
      const pElement = ast.children![0]!;
      const textNode = pElement.children![0]!;
      expect(textNode.content).toBe('A € A €');
    });

    test('should handle mixed entities and text', () => {
      const tokens = tokenize('<p>R&amp;D &lt;testing&gt; &quot;quotes&quot; &apos;apostrophe&apos;</p>');
      const ast = parse(tokens);
      const pElement = ast.children![0]!;
      const textNode = pElement.children![0]!;
      expect(textNode.content).toBe('R&D <testing> "quotes" \'apostrophe\'');
    });

    test('should handle entities in attributes', () => {
      const tokens = tokenize('<div title="R&amp;D &lt;section&gt;" data-test="&quot;hello&quot;">');
      const ast = parse(tokens);
      const divElement = ast.children![0]!;
      expect(divElement.attributes!.title).toBe('R&D <section>');
      expect(divElement.attributes!['data-test']).toBe('"hello"');
    });
  })

  describe('DOM-like Functionality Tests', () => {
    test('should maintain parent-child relationships', () => {
      const tokens = tokenize('<div><section><article><h1>Title</h1><p>Content</p></article></section></div>');
      const ast = parse(tokens);
      const divElement = ast.children![0]!;
      const sectionElement = divElement.children![0]!;
      const articleElement = sectionElement.children![0]!;
      expect(sectionElement.parent).toBe(divElement);
      expect(articleElement.parent).toBe(sectionElement);
      expect(articleElement.children).toHaveLength(2);
      expect(articleElement.children![0]!.tagName).toBe('h1');
      expect(articleElement.children![1]!.tagName).toBe('p');
    });

    test('should handle sibling navigation scenarios', () => {
      const tokens = tokenize('<nav><a href="#home">Home</a><a href="#about">About</a><a href="#contact">Contact</a></nav>');
      const ast = parse(tokens);
      const navElement = ast.children![0]!;
      const links = navElement.children!.filter(child => child.type === ASTNodeType.ELEMENT);
      expect(links).toHaveLength(3);
      links.forEach((link, index) => {
        expect(link.tagName).toBe('a');
        expect(link.attributes!.href).toBeDefined();
        expect(link.children![0]!.type).toBe(ASTNodeType.TEXT);
      });
      expect(links[0]!.children![0]!.content).toBe('Home');
      expect(links[1]!.children![0]!.content).toBe('About');
      expect(links[2]!.children![0]!.content).toBe('Contact');
    });

    test('should handle form elements with all attribute types', () => {
      const tokens = tokenize(`
        <form action="/submit" method="post" enctype="multipart/form-data">
          <input type="text" name="username" required placeholder="Enter username" maxlength="50">
          <input type="password" name="password" required>
          <input type="email" name="email" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$">
          <select name="country" multiple size="5">
            <option value="us" selected>United States</option>
            <option value="ca">Canada</option>
            <option value="mx">Mexico</option>
          </select>
          <textarea name="comments" rows="4" cols="50" placeholder="Enter comments"></textarea>
          <input type="checkbox" name="terms" id="terms" checked>
          <label for="terms">I agree to the terms</label>
          <button type="submit" disabled>Submit</button>
        </form>
      `);
      const ast = parse(tokens);
      const formElement = ast.children!.find(child => child.tagName === 'form')!;
      expect(formElement.attributes!.action).toBe('/submit');
      expect(formElement.attributes!.method).toBe('post');
      const inputs: ASTNode[] = [];
      const traverse = (node: ASTNode) => {
        if (node.type === ASTNodeType.ELEMENT) {
          if (['input', 'select', 'textarea', 'button'].includes(node.tagName!)) {
            inputs.push(node);
          }
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      traverse(formElement);
      expect(inputs.length).toBeGreaterThan(5);
      const usernameInput = inputs.find(input => input.attributes?.name === 'username');
      expect(usernameInput!.attributes!.required).toBe('');
      expect(usernameInput!.attributes!.placeholder).toBe('Enter username');
      const selectElement = inputs.find(input => input.tagName === 'select');
      expect(selectElement!.attributes!.multiple).toBe('');
    });

    test('should handle table structures correctly', () => {
      const tokens = tokenize(`
        <table border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Age</th>
              <th scope="col">City</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John Doe</td>
              <td>30</td>
              <td>New York</td>
            </tr>
            <tr>
              <td>Jane Smith</td>
              <td>25</td>
              <td>Los Angeles</td>
            </tr>
          </tbody>
        </table>
      `);
      const ast = parse(tokens);
      const tableElement = ast.children!.find(child => child.tagName === 'table')!;
      const thead = tableElement.children!.find(child => child.tagName === 'thead');
      const tbody = tableElement.children!.find(child => child.tagName === 'tbody');
      expect(thead).toBeDefined();
      expect(tbody).toBeDefined();
      const rows: ASTNode[] = [];
      const traverse = (node: ASTNode) => {
        if (node.tagName === 'tr') {
          rows.push(node);
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      traverse(tableElement);
      expect(rows).toHaveLength(3);
    });

    test('should handle mixed content with inline elements', () => {
      const tokens = tokenize(`
        <p>This is <strong>bold text</strong> and this is <em>italic text</em>. 
        Here's a <a href="https://example.com" target="_blank">link</a> and some 
        <code>inline code</code>. Also <span class="highlight">highlighted text</span>.</p>
      `);
      const ast = parse(tokens);
      const pElement = ast.children!.find(child => child.tagName === 'p')!;
      let textNodes = 0;
      let elementNodes = 0;
      let totalChildren = 0;
      const traverse = (node: ASTNode) => {
        totalChildren++;
        if (node.type === ASTNodeType.TEXT && node.content!.trim()) {
          textNodes++;
        } else if (node.type === ASTNodeType.ELEMENT) {
          elementNodes++;
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      if (pElement.children) {
        pElement.children.forEach(traverse);
      }
      expect(elementNodes).toBeGreaterThan(3);
      expect(textNodes).toBeGreaterThan(0);
    });

    test('should preserve document structure integrity', () => {
      const tokens = tokenize(`<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>Test Document</title>
            <style>body { margin: 0; }</style>
            <script>console.log('Hello');</script>
          </head>
          <body>
            <header id="main-header">
              <h1>Welcome</h1>
            </header>
            <main>
              <section class="content">
                <article>
                  <h2>Article Title</h2>
                  <p>Article content goes here.</p>
                </article>
              </section>
            </main>
            <footer>
              <p>&copy; 2025 Test Company</p>
            </footer>
          </body>
        </html>`);
      const ast = parse(tokens);
      const doctype = ast.children!.find(child => child.type === ASTNodeType.DOCTYPE);
      expect(doctype).toBeDefined();
      const htmlElement = ast.children!.find(child => child.tagName === 'html')!;
      expect(htmlElement.attributes!.lang).toBe('en');
      const headElement = htmlElement.children!.find(child => child.tagName === 'head');
      const bodyElement = htmlElement.children!.find(child => child.tagName === 'body');
      expect(headElement).toBeDefined();
      expect(bodyElement).toBeDefined();
      const headerElement = bodyElement!.children!.find(child => child.tagName === 'header');
      const mainElement = bodyElement!.children!.find(child => child.tagName === 'main');
      const footerElement = bodyElement!.children!.find(child => child.tagName === 'footer');
      expect(headerElement).toBeDefined();
      expect(mainElement).toBeDefined();
      expect(footerElement).toBeDefined();
      expect(headerElement!.attributes!.id).toBe('main-header');
    });
  })


});