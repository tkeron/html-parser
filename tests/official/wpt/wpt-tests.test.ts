import { describe, it, expect } from 'bun:test';
import { tokenize } from '../../../src/tokenizer';
import { parse } from '../../../src/parser';

describe.skip('Web Platform Tests (WPT) Compliance', () => {
  describe('HTML5 Parsing Semantics', () => {
    it('should handle DOCTYPE variations', () => {
      const doctypes = [
        '<!DOCTYPE html>',
        '<!DOCTYPE HTML>',
        '<!doctype html>',
        '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">',
        '<!DOCTYPE html SYSTEM "about:legacy-compat">'
      ];
      
      doctypes.forEach(doctype => {
        const html = `${doctype}<html><body>Test</body></html>`;
        const tokens = tokenize(html);
        const ast = parse(tokens);
        
        expect(ast).toBeDefined();
        expect((ast as any).children?.length).toBeGreaterThan(0);
      });
    });
    
    it('should handle HTML5 semantic elements', () => {
      const html5Elements = [
        '<article>Content</article>',
        '<section>Content</section>',
        '<nav>Navigation</nav>',
        '<header>Header</header>',
        '<footer>Footer</footer>',
        '<aside>Sidebar</aside>',
        '<main>Main content</main>',
        '<figure><figcaption>Caption</figcaption></figure>'
      ];
      
      html5Elements.forEach(element => {
        const tokens = tokenize(element);
        const ast = parse(tokens);
        
        expect(ast).toBeDefined();
      });
    });
    
    it('should handle void elements correctly', () => {
      const voidElements = [
        '<area>',
        '<base>',
        '<br>',
        '<col>',
        '<embed>',
        '<hr>',
        '<img>',
        '<input>',
        '<link>',
        '<meta>',
        '<param>',
        '<source>',
        '<track>',
        '<wbr>'
      ];
      
      voidElements.forEach(element => {
        const tokens = tokenize(element);
        const ast = parse(tokens);
        
        expect(ast).toBeDefined();
      });
    });
  });
  
  describe('Foreign Content (SVG/MathML)', () => {
    it('should handle SVG elements', () => {
      const svgHtml = `
        <div>
          <svg width="100" height="100">
            <circle cx="50" cy="50" r="40" stroke="black" fill="red"/>
            <rect x="10" y="10" width="80" height="80"/>
            <path d="M 10 10 L 90 90"/>
          </svg>
        </div>
      `;
      
      const tokens = tokenize(svgHtml);
      const ast = parse(tokens);
      
      expect(ast).toBeDefined();
    });
    
    it('should handle MathML elements', () => {
      const mathmlHtml = `
        <div>
          <math>
            <mrow>
              <mi>x</mi>
              <mo>=</mo>
              <mfrac>
                <mi>a</mi>
                <mi>b</mi>
              </mfrac>
            </mrow>
          </math>
        </div>
      `;
      
      const tokens = tokenize(mathmlHtml);
      const ast = parse(tokens);
      
      expect(ast).toBeDefined();
    });
  });
  
  describe('Character References', () => {
    it('should handle named character references', () => {
      const namedRefs = [
        '&amp;',
        '&lt;',
        '&gt;',
        '&quot;',
        '&apos;',
        '&nbsp;',
        '&copy;',
        '&reg;'
      ];
      
      namedRefs.forEach(ref => {
        const html = `<p>Test ${ref} reference</p>`;
        const tokens = tokenize(html);
        const ast = parse(tokens);
        
        expect(ast).toBeDefined();
      });
    });
    
    it('should handle numeric character references', () => {
      const numericRefs = [
        '&#65;',   // A
        '&#x41;',  // A (hex)
        '&#8364;', // Euro symbol
        '&#x20AC;' // Euro symbol (hex)
      ];
      
      numericRefs.forEach(ref => {
        const html = `<p>Test ${ref} reference</p>`;
        const tokens = tokenize(html);
        const ast = parse(tokens);
        
        expect(ast).toBeDefined();
      });
    });
    
    it('should handle malformed character references', () => {
      const malformedRefs = [
        '&unknown;',
        '&#;',
        '&#x;',
        '&amp',
        '&#999999;'
      ];
      
      malformedRefs.forEach(ref => {
        const html = `<p>Test ${ref} reference</p>`;
        const tokens = tokenize(html);
        const ast = parse(tokens);
        
        expect(ast).toBeDefined();
      });
    });
  });
  
  describe('Template Elements', () => {
    it('should handle template elements', () => {
      const templateHtml = `
        <template id="my-template">
          <div class="template-content">
            <h2>Template Title</h2>
            <p>Template content</p>
          </div>
        </template>
      `;
      
      const tokens = tokenize(templateHtml);
      const ast = parse(tokens);
      
      expect(ast).toBeDefined();
    });
    
    it('should handle nested templates', () => {
      const nestedTemplateHtml = `
        <template>
          <div>
            <template>
              <span>Nested template</span>
            </template>
          </div>
        </template>
      `;
      
      const tokens = tokenize(nestedTemplateHtml);
      const ast = parse(tokens);
      
      expect(ast).toBeDefined();
    });
  });
  
  describe('Adoption Agency Algorithm', () => {
    it('should handle adoption agency cases', () => {
      const adoptionCases = [
        '<b><i></b></i>',
        '<p><b><div></b></div></p>',
        '<a><p><a></a></p></a>',
        '<b><table><td></b><i></table>',
        '<font><p>hello<b>cruel</font>world</b>'
      ];
      
      adoptionCases.forEach(html => {
        const tokens = tokenize(html);
        const ast = parse(tokens);
        
        expect(ast).toBeDefined();
      });
    });
  });
  
  describe('Table Parsing', () => {
    it('should handle table structure', () => {
      const tableHtml = `
        <table>
          <caption>Table Caption</caption>
          <colgroup>
            <col span="2">
          </colgroup>
          <thead>
            <tr>
              <th>Header 1</th>
              <th>Header 2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cell 1</td>
              <td>Cell 2</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>Footer 1</td>
              <td>Footer 2</td>
            </tr>
          </tfoot>
        </table>
      `;
      
      const tokens = tokenize(tableHtml);
      const ast = parse(tokens);
      
      expect(ast).toBeDefined();
    });
    
    it('should handle malformed tables', () => {
      const malformedTables = [
        '<table><div>Content outside cells</div><tr><td>Cell</td></tr></table>',
        '<table><tr><td><table><tr><td>Nested</td></tr></table></td></tr></table>',
        '<table><tbody><tr><td>Cell</td></tbody><tbody><tr><td>Cell</td></tr></tbody></table>'
      ];
      
      malformedTables.forEach(html => {
        const tokens = tokenize(html);
        const ast = parse(tokens);
        
        expect(ast).toBeDefined();
      });
    });
  });
  
  describe('Script and Style Elements', () => {
    it('should handle script elements', () => {
      const scriptHtml = `
        <script>
          console.log('Hello World');
          var x = 1 < 2;
        </script>
        <script type="text/javascript">
          // Another script
        </script>
      `;
      
      const tokens = tokenize(scriptHtml);
      const ast = parse(tokens);
      
      expect(ast).toBeDefined();
    });
    
    it('should handle style elements', () => {
      const styleHtml = `
        <style>
          body { margin: 0; }
          .class { color: red; }
          /* Comment in CSS */
        </style>
      `;
      
      const tokens = tokenize(styleHtml);
      const ast = parse(tokens);
      
      expect(ast).toBeDefined();
    });
  });
});

describe.skip('WPT Integration Tests', () => {
  it('should handle complex real-world HTML', () => {
    const complexHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complex HTML Document</title>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 1200px; margin: 0 auto; }
        </style>
      </head>
      <body>
        <header>
          <nav>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
        </header>
        
        <main class="container">
          <article>
            <header>
              <h1>Article Title</h1>
              <time datetime="2025-07-10">July 10, 2025</time>
            </header>
            
            <section>
              <p>This is a paragraph with <strong>strong text</strong> and <em>emphasized text</em>.</p>
              <p>Here's some code: <code>console.log('Hello');</code></p>
              
              <blockquote cite="https://example.com">
                <p>This is a blockquote with a citation.</p>
              </blockquote>
              
              <figure>
                <img src="image.jpg" alt="Description" loading="lazy">
                <figcaption>Image caption</figcaption>
              </figure>
              
              <table>
                <thead>
                  <tr>
                    <th>Column 1</th>
                    <th>Column 2</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Data 1</td>
                    <td>Data 2</td>
                  </tr>
                </tbody>
              </table>
            </section>
            
            <footer>
              <p>Article footer</p>
            </footer>
          </article>
          
          <aside>
            <h2>Related Articles</h2>
            <ul>
              <li><a href="/article1">Article 1</a></li>
              <li><a href="/article2">Article 2</a></li>
            </ul>
          </aside>
        </main>
        
        <footer>
          <p>&copy; 2025 Test Company. All rights reserved.</p>
        </footer>
        
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            console.log('Page loaded');
          });
        </script>
      </body>
      </html>
    `;
    
    const start = performance.now();
    const tokens = tokenize(complexHtml);
    const ast = parse(tokens);
    const end = performance.now();
    
    expect(ast).toBeDefined();
    expect((ast as any).children?.length).toBeGreaterThan(0);
    expect(end - start).toBeLessThan(1000); // Should parse within 1 second
  });
});
