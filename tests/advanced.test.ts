import { expect, test, describe } from 'bun:test';
import { tokenize, TokenType } from '../src/tokenizer';
import { parse, ASTNodeType, type ASTNode } from '../src/parser';

describe('HTML Parser & Tokenizer - Advanced Tests', () => {

  describe('Tokenizer Edge Cases', () => {
    test('should handle attributes with no spaces', () => {
      const tokens = tokenize('<div class="test"id="main"data-value="123">');
      expect(tokens.length).toBeGreaterThan(0);
      const tag = tokens[0]!;
      
      expect(tag.attributes).toEqual({
        class: 'test',
        id: 'main',
        'data-value': '123'
      });
    });

    test('should handle mixed quote styles', () => {
      const tokens = tokenize(`<div class='single' id="double" data-test='mix "quoted" content'>`);
      expect(tokens.length).toBeGreaterThan(0);
      const tag = tokens[0]!;
      
      expect(tag.attributes!.class).toBe('single');
      expect(tag.attributes!.id).toBe('double');
      expect(tag.attributes!['data-test']).toBe('mix "quoted" content');
    });

    test('should handle unicode characters', () => {
      const tokens = tokenize('<div title="测试" data-emoji="🚀" class="café">');
      expect(tokens.length).toBeGreaterThan(0);
      const tag = tokens[0]!;
      
      expect(tag.attributes).toEqual({
        title: '测试',
        'data-emoji': '🚀',
        class: 'café'
      });
    });

    test('should handle complex CDATA content', () => {
      const complexContent = `
        function test() {
          return "<div>HTML inside JS</div>";
        }
        var x = "String with <tags>";
      `;
      const tokens = tokenize(`<![CDATA[${complexContent}]]>`);
      expect(tokens.length).toBeGreaterThan(0);
      const cdataToken = tokens[0]!;
      
      expect(cdataToken.type).toBe(TokenType.CDATA);
      expect(cdataToken.value).toBe(complexContent);
    });

    test('should handle performance with large documents', () => {
      let html = '<div>';
      for (let i = 0; i < 1000; i++) {
        html += `<p id="para-${i}">Content ${i}</p>`;
      }
      html += '</div>';
      
      const startTime = Date.now();
      const tokens = tokenize(html);
      const endTime = Date.now();
      
      expect(tokens.length).toBeGreaterThan(2000);
      expect(endTime - startTime).toBeLessThan(1000); 
    });
  });

  describe('Parser DOM-like Functionality', () => {
    test('should create proper parent-child relationships', () => {
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

    test('should handle complex navigation scenarios', () => {
      const html = `
        <nav>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      `;
      const tokens = tokenize(html);
      const ast = parse(tokens);
      
      const navElement = ast.children!.find(child => child.tagName === 'nav')!;
      const ulElement = navElement.children!.find(child => child.tagName === 'ul')!;
      const liElements = ulElement.children!.filter(child => child.tagName === 'li');
      
      expect(liElements).toHaveLength(3);
      
      liElements.forEach((li, index) => {
        const anchor = li.children!.find(child => child.tagName === 'a')!;
        expect(anchor.attributes!.href).toBeDefined();
        expect(anchor.children![0]!.type).toBe(ASTNodeType.TEXT);
      });
    });

    test('should handle form elements with complex attributes', () => {
      const html = `
        <form action="/submit" method="post">
          <input type="email" name="email" required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$">
          <select name="country" multiple>
            <option value="us" selected>United States</option>
            <option value="ca">Canada</option>
          </select>
          <textarea name="comments" rows="4" cols="50"></textarea>
        </form>
      `;
      const tokens = tokenize(html);
      const ast = parse(tokens);
      
      const formElement = ast.children!.find(child => child.tagName === 'form')!;
      expect(formElement.attributes!.action).toBe('/submit');
      expect(formElement.attributes!.method).toBe('post');
      
      const formElements: ASTNode[] = [];
      const traverse = (node: ASTNode) => {
        if (node.type === ASTNodeType.ELEMENT) {
          if (['input', 'select', 'textarea', 'option'].includes(node.tagName!)) {
            formElements.push(node);
          }
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      traverse(formElement);
      
      expect(formElements.length).toBeGreaterThan(3);
      
      const emailInput = formElements.find(el => el.attributes?.name === 'email');
      expect(emailInput!.attributes!.required).toBe('');
      expect(emailInput!.attributes!.pattern).toContain('@');
      
      const selectElement = formElements.find(el => el.tagName === 'select');
      expect(selectElement!.attributes!.multiple).toBe('');
    });

    test('should handle table structures', () => {
      const html = `
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John</td>
              <td>30</td>
            </tr>
            <tr>
              <td>Jane</td>
              <td>25</td>
            </tr>
          </tbody>
        </table>
      `;
      const tokens = tokenize(html);
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

    test('should handle mixed inline content', () => {
      const html = `
        <p>This is <strong>bold</strong> and <em>italic</em>. 
        Here's a <a href="https://example.com">link</a> and 
        <code>inline code</code>.</p>
      `;
      const tokens = tokenize(html);
      const ast = parse(tokens);
      
      const pElement = ast.children!.find(child => child.tagName === 'p')!;
      
      let textNodes = 0;
      let elementNodes = 0;
      
      const traverse = (node: ASTNode) => {
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

    test('should preserve complete document structure', () => {
      const html = `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>Test Document</title>
          </head>
          <body>
            <header id="main-header">
              <h1>Welcome</h1>
            </header>
            <main>
              <section class="content">
                <article>
                  <h2>Article Title</h2>
                  <p>Content here.</p>
                </article>
              </section>
            </main>
            <footer>
              <p>&copy; 2025 Test</p>
            </footer>
          </body>
        </html>`;
      
      const tokens = tokenize(html);
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
  });

  describe('Real-world Content Handling', () => {
    test('should handle SVG content', () => {
      const svg = `
        <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="red"/>
          <text x="50" y="50">SVG</text>
        </svg>
      `;
      
      const tokens = tokenize(svg);
      const ast = parse(tokens);
      
      const svgElement = ast.children!.find(child => child.tagName === 'svg')!;
      expect(svgElement.attributes!.xmlns).toBe('http://www.w3.org/2000/svg');
      
      const circleElement = svgElement.children!.find(child => child.tagName === 'circle');
      expect(circleElement).toBeDefined();
      expect(circleElement!.attributes!.fill).toBe('red');
    });

    test('should handle script and style tags', () => {
      const html = `
        <script type="text/javascript">
          function hello() {
            alert("Hello");
          }
        </script>
        <style type="text/css">
          .class { color: red; }
        </style>
      `;
      
      const tokens = tokenize(html);
      const ast = parse(tokens);
      
      const scriptElement = ast.children!.find(child => child.tagName === 'script');
      const styleElement = ast.children!.find(child => child.tagName === 'style');
      
      expect(scriptElement!.attributes!.type).toBe('text/javascript');
      expect(styleElement!.attributes!.type).toBe('text/css');
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    test('should handle extreme nesting depth', () => {
      let html = '';
      const depth = 100;
      
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

    test('should handle malformed HTML gracefully', () => {
      const malformedHTML = '<div><p><span>Text</div></span></p>';
      const tokens = tokenize(malformedHTML);
      const ast = parse(tokens);
      
      const divElement = ast.children![0]!;
      expect(divElement.tagName).toBe('div');
      expect(divElement.children!.length).toBeGreaterThan(0);
    });

    test('should handle orphaned closing tags', () => {
      const html = '</div><p>Valid content</p></span>';
      const tokens = tokenize(html);
      const ast = parse(tokens);
      
      const pElement = ast.children!.find(
        child => child.type === ASTNodeType.ELEMENT && child.tagName === 'p'
      )!;
      expect(pElement).toBeDefined();
      expect(pElement.children![0]!.content).toBe('Valid content');
    });

    test('should handle mixed content types in single document', () => {
      const complexHTML = `
        <?xml version="1.0"?>
        <!DOCTYPE html>
        <!-- Document start -->
        <html>
          <head>
            <title>Test &amp; Demo</title>
            <![CDATA[Raw data here]]>
          </head>
          <body>
            <h1>Main Title</h1>
            <p>Paragraph with <strong>bold</strong> text.</p>
            <!-- Body content -->
          </body>
        </html>
        <!-- Document end -->
      `;
      
      const tokens = tokenize(complexHTML);
      const ast = parse(tokens);
      
      const nodeCounts = {
        [ASTNodeType.PROCESSING_INSTRUCTION]: 0,
        [ASTNodeType.DOCTYPE]: 0,
        [ASTNodeType.COMMENT]: 0,
        [ASTNodeType.ELEMENT]: 0,
        [ASTNodeType.TEXT]: 0,
        [ASTNodeType.CDATA]: 0
      };
      
      const traverse = (node: ASTNode) => {
        if (node.type in nodeCounts) {
          nodeCounts[node.type as keyof typeof nodeCounts]++;
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      
      ast.children!.forEach(traverse);
      
      expect(nodeCounts[ASTNodeType.PROCESSING_INSTRUCTION]).toBeGreaterThan(0);
      expect(nodeCounts[ASTNodeType.DOCTYPE]).toBeGreaterThan(0);
      expect(nodeCounts[ASTNodeType.COMMENT]).toBeGreaterThan(0);
      expect(nodeCounts[ASTNodeType.ELEMENT]).toBeGreaterThan(0);
      expect(nodeCounts[ASTNodeType.TEXT]).toBeGreaterThan(0);
      expect(nodeCounts[ASTNodeType.CDATA]).toBeGreaterThan(0);
    });
  });
});
