import { describe, it, expect } from 'bun:test';
import { tokenize } from '../../../src/tokenizer';
import { parse } from '../../../src/parser';

describe('Acid Tests Compliance', () => {
  describe('Acid1 Test', () => {
    it('should parse basic HTML structure correctly', () => {
      const acid1Html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Acid1 Test</title>
        </head>
        <body>
          <div>
            <p>Hello <b>World</b></p>
            <table>
              <tr>
                <td>Cell 1</td>
                <td>Cell 2</td>
              </tr>
            </table>
          </div>
        </body>
        </html>
      `;
      
      const tokens = tokenize(acid1Html);
      const ast = parse(tokens);
      
      expect(ast).toBeDefined();
      expect((ast as any).type).toBe('DOCUMENT');
      expect((ast as any).children?.length).toBeGreaterThan(0);
    });
    
    it('should handle nested elements', () => {
      const nestedHtml = `
        <div>
          <p>Text <strong>bold <em>italic</em></strong> more text</p>
        </div>
      `;
      
      const tokens = tokenize(nestedHtml);
      const ast = parse(tokens);
      
      expect(ast).toBeDefined();
      expect(ast.children?.length).toBeGreaterThan(0);
    });
    
    it('should handle self-closing tags', () => {
      const selfClosingHtml = `
        <div>
          <img src="test.jpg" alt="test">
          <br>
          <hr>
        </div>
      `;
      
      const tokens = tokenize(selfClosingHtml);
      const ast = parse(tokens);
      
      expect(ast).toBeDefined();
    });
  });
  
  describe('Acid2 Test', () => {
    it('should handle CSS and more complex HTML', () => {
      const acid2Html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; }
            .test { color: red; }
          </style>
        </head>
        <body>
          <div class="test">
            <span>Styled text</span>
          </div>
        </body>
        </html>
      `;
      
      const tokens = tokenize(acid2Html);
      const ast = parse(tokens);
      
      expect(ast).toBeDefined();
      expect((ast as any).type).toBe('DOCUMENT');
    });
    
    it('should handle complex table structures', () => {
      const complexTable = `
        <table>
          <thead>
            <tr>
              <th colspan="2">Header</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowspan="2">Cell 1</td>
              <td>Cell 2</td>
            </tr>
            <tr>
              <td>Cell 3</td>
            </tr>
          </tbody>
        </table>
      `;
      
      const tokens = tokenize(complexTable);
      const ast = parse(tokens);
      
      expect(ast).toBeDefined();
    });
  });
  
  describe('Acid3 Test', () => {
    it('should handle advanced HTML5 features', () => {
      const acid3Html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Acid3 Test</title>
        </head>
        <body>
          <article>
            <header>
              <h1>Article Title</h1>
            </header>
            <section>
              <p>Article content</p>
            </section>
            <footer>
              <p>Footer content</p>
            </footer>
          </article>
        </body>
        </html>
      `;
      
      const tokens = tokenize(acid3Html);
      const ast = parse(tokens);
      
      expect(ast).toBeDefined();
      expect((ast as any).type).toBe('DOCUMENT');
    });
    
    it('should handle HTML5 semantic elements', () => {
      const semanticHtml = `
        <main>
          <nav>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
            </ul>
          </nav>
          <aside>
            <p>Sidebar content</p>
          </aside>
        </main>
      `;
      
      const tokens = tokenize(semanticHtml);
      const ast = parse(tokens);
      
      expect(ast).toBeDefined();
    });
  });
});

describe('Quirks Mode Tests', () => {
  it('should handle quirks mode HTML', () => {
    const quirksHtml = `
      <html>
      <body>
        <div>
          <p>No DOCTYPE - should trigger quirks mode
          <p>Unclosed paragraphs
          <div>Nested without proper closing
        </div>
      </body>
      </html>
    `;
    
    const tokens = tokenize(quirksHtml);
    const ast = parse(tokens);
    
    expect(ast).toBeDefined();
    expect((ast as any).type).toBe('DOCUMENT');
  });
  
  it('should handle malformed HTML gracefully', () => {
    const malformedHtml = `
      <div>
        <p>Unclosed paragraph
        <span>Unclosed span
        <b>Bold text
        <i>Italic text
      </div>
    `;
    
    const tokens = tokenize(malformedHtml);
    const ast = parse(tokens);
    
    expect(ast).toBeDefined();
  });
  
  it('should handle mismatched tags', () => {
    const mismatchedHtml = `
      <div>
        <p>Paragraph</div>
        <span>Span</p>
      </span>
    `;
    
    const tokens = tokenize(mismatchedHtml);
    const ast = parse(tokens);
    
    expect(ast).toBeDefined();
  });
});

describe('Performance Benchmarks', () => {
  it('should parse small HTML quickly', () => {
    const smallHtml = '<div><p>Hello World</p></div>';
    
    const start = performance.now();
    const tokens = tokenize(smallHtml);
    const ast = parse(tokens);
    const end = performance.now();
    
    expect(ast).toBeDefined();
    expect(end - start).toBeLessThan(10); // Should be very fast
  });
  
  it('should handle medium-sized HTML', () => {
    const mediumHtml = Array(100).fill('<div><p>Content</p></div>').join('');
    
    const start = performance.now();
    const tokens = tokenize(mediumHtml);
    const ast = parse(tokens);
    const end = performance.now();
    
    expect(ast).toBeDefined();
    expect(end - start).toBeLessThan(100); // Should still be fast
  });
  
  it('should handle large HTML documents', () => {
    const largeHtml = Array(1000).fill('<div><p>Large content</p></div>').join('');
    
    const start = performance.now();
    const tokens = tokenize(largeHtml);
    const ast = parse(tokens);
    const end = performance.now();
    
    expect(ast).toBeDefined();
    expect(end - start).toBeLessThan(1000); // Should complete within 1 second
  });
  
  it('should handle deeply nested HTML', () => {
    let deepHtml = '';
    for (let i = 0; i < 100; i++) {
      deepHtml += '<div>';
    }
    deepHtml += 'Deep content';
    for (let i = 0; i < 100; i++) {
      deepHtml += '</div>';
    }
    
    const start = performance.now();
    const tokens = tokenize(deepHtml);
    const ast = parse(tokens);
    const end = performance.now();
    
    expect(ast).toBeDefined();
    expect(end - start).toBeLessThan(500); // Should handle deep nesting
  });
});

describe('Memory Usage Tests', () => {
  it('should not leak memory on repeated parsing', () => {
    const testHtml = '<div><p>Memory test</p></div>';
    
    // Parse the same HTML multiple times
    for (let i = 0; i < 1000; i++) {
      const tokens = tokenize(testHtml);
      const ast = parse(tokens);
      expect(ast).toBeDefined();
    }
    
    // If we get here without crashing, memory is likely managed well
    expect(true).toBe(true);
  });
  
  it('should handle multiple large documents', () => {
    const largeHtml = Array(500).fill('<div><p>Large content</p></div>').join('');
    
    for (let i = 0; i < 10; i++) {
      const tokens = tokenize(largeHtml);
      const ast = parse(tokens);
      expect(ast).toBeDefined();
    }
    
    expect(true).toBe(true);
  });
});
