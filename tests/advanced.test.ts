// @ts-nocheck
import { expect, test, describe, it } from 'bun:test';
import { tokenize, TokenType } from '../src/tokenizer';
import { parse, ASTNodeType, domToAST, type ASTNode } from '../src/parser';

function parseToAST(html: string): ASTNode {
  const tokens = tokenize(html);
  const dom = parse(tokens);
  const ast = domToAST(dom);
  
  const hasExplicitHtml = html.includes('<html') || html.includes('<!DOCTYPE') || html.includes('<!doctype');
  if (hasExplicitHtml) {
    return ast;
  }
  
  const htmlEl = ast.children?.find(c => c.tagName === 'html');
  if (htmlEl) {
    const bodyEl = htmlEl.children?.find(c => c.tagName === 'body');
    if (bodyEl && bodyEl.children) {
      return { type: ASTNodeType.Document, children: bodyEl.children };
    }
  }
  return ast;
}

describe('HTML Parser & Tokenizer - Advanced Tests', () => {

  describe('Tokenizer Edge Cases', () => {
    it('should handle attributes with no spaces', () => {
      const tokens = tokenize('<div class="test"id="main"data-value="123">');
      expect(tokens.length).toBeGreaterThan(0);
      const tag = tokens[0]!;
      
      expect(tag.attributes).toEqual({
        class: 'test',
        id: 'main',
        'data-value': '123'
      });
    });

    it('should handle mixed quote styles', () => {
      const tokens = tokenize(`<div class='single' id="double" data-test='mix "quoted" content'>`);
      expect(tokens.length).toBeGreaterThan(0);
      const tag = tokens[0]!;
      
      expect(tag.attributes!.class).toBe('single');
      expect(tag.attributes!.id).toBe('double');
      expect(tag.attributes!['data-test']).toBe('mix "quoted" content');
    });

    it('should handle unicode characters', () => {
      const tokens = tokenize('<div title="测试" data-emoji="🚀" class="lorem">');
      expect(tokens.length).toBeGreaterThan(0);
      const tag = tokens[0]!;
      
      expect(tag.attributes).toEqual({
        title: '测试',
        'data-emoji': '🚀',
        class: 'lorem'
      });
    });

    it('should handle complex CDATA content as bogus comment', () => {
      const complexContent = `
        function test() {
          return "<div>HTML inside JS</div>";
        }
        var x = "String with <tags>";
      `;
      const tokens = tokenize(`<![CDATA[${complexContent}]]>`);
      expect(tokens.length).toBeGreaterThan(0);
      const cdataToken = tokens[0]!;
      
      expect(cdataToken.type).toBe(TokenType.COMMENT);
      expect(cdataToken.value).toBe('[CDATA[' + complexContent + ']]');
    });

    it('should handle performance with large documents', () => {
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
    it('should create proper parent-child relationships', () => {
      const ast = parseToAST('<div><section><article><h1>Title</h1><p>Content</p></article></section></div>');
      
      const divElement = ast.children![0]!;
      const sectionElement = divElement.children![0]!;
      const articleElement = sectionElement.children![0]!;
      
      expect(articleElement.children).toHaveLength(2);
      expect(articleElement.children![0]!.tagName).toBe('h1');
      expect(articleElement.children![1]!.tagName).toBe('p');
    });

    it('should handle complex navigation scenarios', () => {
      const html = `
        <nav>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      `;
      const ast = parseToAST(html);
      
      const navElement = ast.children!.find(child => child.tagName === 'nav')!;
      const ulElement = navElement.children!.find(child => child.tagName === 'ul')!;
      const liElements = ulElement.children!.filter(child => child.tagName === 'li');
      
      expect(liElements).toHaveLength(3);
      
      liElements.forEach((li, index) => {
        const anchor = li.children!.find(child => child.tagName === 'a')!;
        expect(anchor.attributes!.href).toBeDefined();
        expect(anchor.children![0]!.type).toBe(ASTNodeType.Text);
      });
    });

    it('should handle form elements with complex attributes', () => {
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
      const ast = parseToAST(html);
      
      const formElement = ast.children!.find(child => child.tagName === 'form')!;
      expect(formElement.attributes!.action).toBe('/submit');
      expect(formElement.attributes!.method).toBe('post');
      
      const formElements: ASTNode[] = [];
      const traverse = (node: ASTNode) => {
        if (node.type === ASTNodeType.Element) {
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

    it('should handle table structures', () => {
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
      const ast = parseToAST(html);
      
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

    it('should handle mixed inline content', () => {
      const html = `
        <p>This is <strong>bold</strong> and <em>italic</em>. 
        Here's a <a href="https://example.com">link</a> and 
        <code>inline code</code>.</p>
      `;
      const ast = parseToAST(html);
      
      const pElement = ast.children!.find(child => child.tagName === 'p')!;
      
      let textNodes = 0;
      let elementNodes = 0;
      
      const traverse = (node: ASTNode) => {
        if (node.type === ASTNodeType.Text && (node as any).content?.trim()) {
          textNodes++;
        } else if (node.type === ASTNodeType.Element) {
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

    it('should preserve complete document structure', () => {
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
      
      const ast = parseToAST(html);
      
      const doctype = ast.children!.find(child => child.type === ASTNodeType.Doctype);
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
    it('should handle SVG content', () => {
      const svg = `
        <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="red"/>
          <text x="50" y="50">SVG</text>
        </svg>
      `;
      
      const ast = parseToAST(svg);
      
      const svgElement = ast.children!.find(child => child.tagName === 'svg')!;
      expect(svgElement.attributes!.xmlns).toBe('http://www.w3.org/2000/svg');
      
      const circleElement = svgElement.children!.find(child => child.tagName === 'circle');
      expect(circleElement).toBeDefined();
      expect(circleElement!.attributes!.fill).toBe('red');
    });

    it('should handle script and style tags', () => {
      const html = `
        <body>
          <script type="text/javascript">
            function hello() {
              alert("Hello");
            }
          </script>
          <style type="text/css">
            .class { color: red; }
          </style>
        </body>
      `;
      
      const ast = parseToAST(html);
      
      function findByTagName(node: ASTNode, tagName: string): ASTNode | null {
        if (node.tagName === tagName) return node;
        if (node.children) {
          for (const child of node.children) {
            const found = findByTagName(child, tagName);
            if (found) return found;
          }
        }
        return null;
      }
      
      const scriptElement = findByTagName(ast, 'script');
      const styleElement = findByTagName(ast, 'style');
      
      expect(scriptElement!.attributes!.type).toBe('text/javascript');
      expect(styleElement!.attributes!.type).toBe('text/css');
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    it('should handle extreme nesting depth', () => {
      let html = '';
      const depth = 100;
      
      for (let i = 0; i < depth; i++) {
        html += `<div level="${i}">`;
      }
      html += 'Deep content';
      for (let i = 0; i < depth; i++) {
        html += '</div>';
      }
      
      const ast = parseToAST(html);
      
      let current = ast.children![0]!;
      for (let i = 0; i < depth - 1; i++) {
        expect(current.tagName).toBe('div');
        expect(current.attributes!.level).toBe(i.toString());
        current = current.children!.find(child => child.type === ASTNodeType.Element)!;
      }
      
      const textNode = current.children!.find(child => child.type === ASTNodeType.Text)!;
      expect((textNode as any).content).toBe('Deep content');
    });

    it('should handle malformed HTML gracefully', () => {
      const malformedHTML = '<div><p><span>Text</div></span></p>';
      const ast = parseToAST(malformedHTML);
      
      const divElement = ast.children![0]!;
      expect(divElement.tagName).toBe('div');
      expect(divElement.children!.length).toBeGreaterThan(0);
    });

    it('should handle orphaned closing tags', () => {
      const html = '</div><p>Valid content</p></span>';
      const ast = parseToAST(html);
      
      const pElement = ast.children!.find(
        child => child.type === ASTNodeType.Element && child.tagName === 'p'
      )!;
      expect(pElement).toBeDefined();
      expect((pElement.children![0]! as any).content).toBe('Valid content');
    });

    it.skip('should handle mixed content types in single document', () => {
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
      
      const ast = parseToAST(complexHTML);
      
      const nodeCounts: Record<string, number> = {
        'processing-instruction': 0,
        [ASTNodeType.Doctype]: 0,
        [ASTNodeType.Comment]: 0,
        [ASTNodeType.Element]: 0,
        [ASTNodeType.Text]: 0,
        [ASTNodeType.CDATA]: 0
      };
      
      const traverse = (node: ASTNode) => {
        if (node.type in nodeCounts) {
          nodeCounts[node.type]++;
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      
      ast.children!.forEach(traverse);
      
      expect(nodeCounts['processing-instruction']).toBeGreaterThan(0);
      expect(nodeCounts[ASTNodeType.Doctype]).toBeGreaterThan(0);
      expect(nodeCounts[ASTNodeType.Comment]).toBeGreaterThan(0);
      expect(nodeCounts[ASTNodeType.Element]).toBeGreaterThan(0);
      expect(nodeCounts[ASTNodeType.Text]).toBeGreaterThan(0);
      expect(nodeCounts[ASTNodeType.CDATA]).toBeGreaterThan(0);
    });
  });

  describe('Security and Template Edge Cases', () => {
    it('should treat javascript: urls as regular attribute values', () => {
      const html = `<a href="javascript:alert('XSS')">Click me</a>`;
      const ast = parseToAST(html);
      const aElement = ast.children!.find(child => child.tagName === 'a')!;
      expect(aElement).toBeDefined();
      expect(aElement.attributes!.href).toBe("javascript:alert('XSS')");
    });

    it('should correctly parse event handler attributes like onerror', () => {
      const html = `<img src="invalid" onerror="alert('XSS')">`;
      const ast = parseToAST(html);
      const imgElement = ast.children!.find(child => child.tagName === 'img')!;
      expect(imgElement).toBeDefined();
      expect(imgElement.attributes!.onerror).toBe("alert('XSS')");
    });

    it('should treat template engine syntax as plain text', () => {
      const html = `<div>{{ user.name }}</div><p>Hello, &lt;%= name %&gt;</p>`;
      const ast = parseToAST(html);

      const divElement = ast.children!.find(child => child.tagName === 'div')!;
      expect(divElement).toBeDefined();
      const divText = divElement.children!.find(child => child.type === ASTNodeType.Text)!;
      expect((divText as any).content).toBe('{{ user.name }}');

      const pElement = ast.children!.find(child => child.tagName === 'p')!;
      expect(pElement).toBeDefined();
      const pText = pElement.children!.find(child => child.type === ASTNodeType.Text)!;
      expect((pText as any).content).toBe('Hello, <%= name %>');
    });

    it('should handle null characters in content gracefully', () => {
        const html = '<div>Hello\0World</div>';
        const ast = parseToAST(html);
        const divElement = ast.children!.find(child => child.tagName === 'div')!;
        const textNode = divElement.children!.find(child => child.type === ASTNodeType.Text)!;
        expect((textNode as any).content).toBe('Hello\uFFFDWorld');
    });

    it('should handle control characters in content', () => {
        const html = '<div>Line1\x08\x09Line2\x0BLine3\x0CLine4\x0DLine5</div>';
        const ast = parseToAST(html);
        const divElement = ast.children!.find(child => child.tagName === 'div')!;
        const textNode = divElement.children!.find(child => child.type === ASTNodeType.Text)!;
        expect((textNode as any).content).toContain('\x09');
        expect((textNode as any).content).toContain('\x0D');
        expect((textNode as any).content).toContain('Line1');
        expect((textNode as any).content).toContain('Line5');    });
  });
});