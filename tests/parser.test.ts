import { expect, test, describe } from 'bun:test';
import { tokenize } from '../src/tokenizer';
import { parse, ASTNodeType, type ASTNode } from '../src/parser';

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
      expect(doctypeNode.content).toBe('<!DOCTYPE html>');
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
      
      // Should have DOCTYPE, whitespace, html element, whitespace
      expect(ast.children!.length).toBeGreaterThan(1);
      
      // Find the HTML element
      const htmlElement = ast.children!.find(
        child => child.type === ASTNodeType.ELEMENT && child.tagName === 'html'
      )!;
      
      expect(htmlElement).toBeDefined();
      expect(htmlElement.attributes!.lang).toBe('en');
      
      // Should have head and body
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

  describe('Error Recovery', () => {
    test('should handle unclosed tags', () => {
      const tokens = tokenize('<div><p>Unclosed paragraph</div>');
      const ast = parse(tokens);
      
      // Should still create a valid tree structure
      const divElement = ast.children![0]!;
      expect(divElement.tagName).toBe('div');
      
      // The p element should be created even though it's not properly closed
      const pElement = divElement.children![0]!;
      expect(pElement.tagName).toBe('p');
    });

    test('should handle unexpected closing tags', () => {
      const tokens = tokenize('<div></span></div>');
      const ast = parse(tokens);
      
      // Should still create div element
      const divElement = ast.children![0]!;
      expect(divElement.tagName).toBe('div');
    });

    test('should handle malformed attributes', () => {
      const tokens = tokenize('<div class="test id="main">Content</div>');
      const ast = parse(tokens);
      
      const divElement = ast.children![0]!;
      expect(divElement.tagName).toBe('div');
      // Should still parse what it can
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
      
      // Should have head element but whitespace-only text nodes should be minimal
      const headElement = htmlElement.children!.find(
        child => child.type === ASTNodeType.ELEMENT && child.tagName === 'head'
      )!;
      
      expect(headElement).toBeDefined();
    });
  });
});
