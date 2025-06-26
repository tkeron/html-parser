import { expect, test, describe } from 'bun:test';
import { 
  tokenize, 
  TokenType, 
  type Token 
} from '../src/tokenizer';

describe('HTML Tokenizer', () => {
  
  describe('Basic Tags', () => {
    test('should tokenize simple opening tag', () => {
      const tokens = tokenize('<div>');
      
      expect(tokens).toHaveLength(2); // tag + EOF
      expect(tokens[0]!).toEqual({
        type: TokenType.TAG_OPEN,
        value: 'div',
        position: expect.any(Object),
        attributes: {},
        isSelfClosing: false
      });
      expect(tokens[1]!.type).toBe(TokenType.EOF);
    });

    test('should tokenize simple closing tag', () => {
      const tokens = tokenize('</div>');
      
      expect(tokens).toHaveLength(2); // tag + EOF
      expect(tokens[0]!).toEqual({
        type: TokenType.TAG_CLOSE,
        value: 'div',
        position: expect.any(Object),
        isClosing: true
      });
    });

    test('should tokenize self-closing tag', () => {
      const tokens = tokenize('<img/>');
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0]!).toEqual({
        type: TokenType.TAG_OPEN,
        value: 'img',
        position: expect.any(Object),
        attributes: {},
        isSelfClosing: true
      });
    });

    test('should handle case insensitive tag names', () => {
      const tokens = tokenize('<DIV></DIV>');
      
      expect(tokens[0]!.value).toBe('div');
      expect(tokens[1]!.value).toBe('div');
    });
  });

  describe('Attributes', () => {
    test('should parse attributes with double quotes', () => {
      const tokens = tokenize('<div class="container" id="main">');
      
      expect(tokens[0].attributes).toEqual({
        class: 'container',
        id: 'main'
      });
    });

    test('should parse attributes with single quotes', () => {
      const tokens = tokenize(`<div class='container' id='main'>`);
      
      expect(tokens[0].attributes).toEqual({
        class: 'container',
        id: 'main'
      });
    });

    test('should parse unquoted attributes', () => {
      const tokens = tokenize('<div class=container id=main>');
      
      expect(tokens[0].attributes).toEqual({
        class: 'container',
        id: 'main'
      });
    });

    test('should parse boolean attributes', () => {
      const tokens = tokenize('<input disabled checked>');
      
      expect(tokens[0].attributes).toEqual({
        disabled: '',
        checked: ''
      });
    });

    test('should handle mixed attribute types', () => {
      const tokens = tokenize('<input type="text" disabled value=test>');
      
      expect(tokens[0].attributes).toEqual({
        type: 'text',
        disabled: '',
        value: 'test'
      });
    });

    test('should handle attributes with special characters', () => {
      const tokens = tokenize('<div data-test="value" aria-label="test">');
      
      expect(tokens[0].attributes).toEqual({
        'data-test': 'value',
        'aria-label': 'test'
      });
    });
  });

  describe('Text Content', () => {
    test('should tokenize plain text', () => {
      const tokens = tokenize('Hello World');
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({
        type: TokenType.TEXT,
        value: 'Hello World',
        position: expect.any(Object)
      });
    });

    test('should handle text with whitespace', () => {
      const tokens = tokenize('  Hello   World  ');
      
      expect(tokens[0].value).toBe('  Hello   World  ');
    });

    test('should handle multiline text', () => {
      const tokens = tokenize('Line 1\nLine 2\nLine 3');
      
      expect(tokens[0].value).toBe('Line 1\nLine 2\nLine 3');
    });
  });

  describe('HTML Entities', () => {
    test('should parse named entities', () => {
      const tokens = tokenize('&amp; &lt; &gt; &quot; &nbsp;');
      
      expect(tokens[0].value).toBe('& < > " \u00A0');
    });

    test('should parse numeric entities', () => {
      const tokens = tokenize('&#65; &#66; &#67;');
      
      expect(tokens[0].value).toBe('A B C');
    });

    test('should parse hexadecimal entities', () => {
      const tokens = tokenize('&#x41; &#x42; &#x43;');
      
      expect(tokens[0].value).toBe('A B C');
    });

    test('should handle entities in attributes', () => {
      const tokens = tokenize('<div title="&quot;Hello&quot;">');
      
      expect(tokens[0].attributes!.title).toBe('"Hello"');
    });

    test('should handle unknown entities', () => {
      const tokens = tokenize('&unknown;');
      
      expect(tokens[0].value).toBe('&unknown;');
    });
  });

  describe('Comments', () => {
    test('should parse HTML comments', () => {
      const tokens = tokenize('<!-- This is a comment -->');
      
      expect(tokens[0]).toEqual({
        type: TokenType.COMMENT,
        value: ' This is a comment ',
        position: expect.any(Object)
      });
    });

    test('should handle multiline comments', () => {
      const tokens = tokenize(`<!-- 
        Multi line
        comment
      -->`);
      
      expect(tokens[0].type).toBe(TokenType.COMMENT);
      expect(tokens[0].value).toContain('Multi line');
    });

    test('should handle empty comments', () => {
      const tokens = tokenize('<!---->');
      
      expect(tokens[0]).toEqual({
        type: TokenType.COMMENT,
        value: '',
        position: expect.any(Object)
      });
    });
  });

  describe('CDATA Sections', () => {
    test('should parse CDATA sections', () => {
      const tokens = tokenize('<![CDATA[Some data]]>');
      
      expect(tokens[0]).toEqual({
        type: TokenType.CDATA,
        value: 'Some data',
        position: expect.any(Object)
      });
    });

    test('should handle CDATA with special characters', () => {
      const tokens = tokenize('<![CDATA[<script>alert("test");</script>]]>');
      
      expect(tokens[0].value).toBe('<script>alert("test");</script>');
    });
  });

  describe('DOCTYPE Declaration', () => {
    test('should parse DOCTYPE declaration', () => {
      const tokens = tokenize('<!DOCTYPE html>');
      
      expect(tokens[0]).toEqual({
        type: TokenType.DOCTYPE,
        value: '<!DOCTYPE html>',
        position: expect.any(Object)
      });
    });

    test('should parse complex DOCTYPE', () => {
      const tokens = tokenize('<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">');
      
      expect(tokens[0].type).toBe(TokenType.DOCTYPE);
      expect(tokens[0].value).toContain('PUBLIC');
    });
  });

  describe('Processing Instructions', () => {
    test('should parse XML processing instruction', () => {
      const tokens = tokenize('<?xml version="1.0" encoding="UTF-8"?>');
      
      expect(tokens[0]).toEqual({
        type: TokenType.PROCESSING_INSTRUCTION,
        value: '<?xml version="1.0" encoding="UTF-8"',
        position: expect.any(Object)
      });
    });

    test('should parse PHP-style processing instruction', () => {
      const tokens = tokenize('<?php echo "Hello"; ?>');
      
      expect(tokens[0].type).toBe(TokenType.PROCESSING_INSTRUCTION);
      expect(tokens[0].value).toBe('<?php echo "Hello"; ');
    });
  });

  describe('Complex HTML Documents', () => {
    test('should tokenize complete HTML document', () => {
      const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Test</title>
  </head>
  <body>
    <h1>Hello World</h1>
    <p>This is a test.</p>
  </body>
</html>`;
      
      const tokens = tokenize(html);
      
      // Should have: DOCTYPE + multiple tags + text content + EOF
      expect(tokens.length).toBeGreaterThan(10);
      expect(tokens[0].type).toBe(TokenType.DOCTYPE);
      expect(tokens[tokens.length - 1].type).toBe(TokenType.EOF);
      
      // Check some key elements
      const htmlTag = tokens.find(t => t.type === TokenType.TAG_OPEN && t.value === 'html');
      expect(htmlTag).toBeDefined();
      expect(htmlTag!.attributes!.lang).toBe('en');
    });

    test('should handle mixed content', () => {
      const html = `<div>
        Text before <!-- comment -->
        <span>nested</span>
        Text after &amp; entity
      </div>`;
      
      const tokens = tokenize(html);
      
      expect(tokens.some(t => t.type === TokenType.TAG_OPEN)).toBe(true);
      expect(tokens.some(t => t.type === TokenType.TEXT)).toBe(true);
      expect(tokens.some(t => t.type === TokenType.COMMENT)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty input', () => {
      const tokens = tokenize('');
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe(TokenType.EOF);
    });

    test('should handle whitespace only', () => {
      const tokens = tokenize('   \n\t  ');
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe(TokenType.TEXT);
      expect(tokens[0].value).toBe('   \n\t  ');
    });

    test('should handle malformed tags', () => {
      const tokens = tokenize('<div class="test>');
      
      // Should still attempt to parse
      expect(tokens[0].type).toBe(TokenType.TAG_OPEN);
      expect(tokens[0].value).toBe('div');
    });

    test('should handle unclosed comments', () => {
      const tokens = tokenize('<!-- unclosed comment');
      
      expect(tokens[0].type).toBe(TokenType.COMMENT);
      expect(tokens[0].value).toBe(' unclosed comment');
    });
  });

  describe('Position Tracking', () => {
    test('should track positions correctly', () => {
      const tokens = tokenize('<div>text</div>');
      
      expect(tokens[0].position.start).toBe(0);
      expect(tokens[0].position.end).toBeGreaterThan(0);
      expect(tokens[0].position.line).toBe(1);
      expect(tokens[0].position.column).toBeGreaterThan(0);
    });

    test('should track line numbers correctly', () => {
      const tokens = tokenize('<div>\n  <span>test</span>\n</div>');
      
      // Find the span tag which should be on line 2
      const spanToken = tokens.find(t => t.value === 'span');
      expect(spanToken?.position.line).toBeGreaterThan(1);
    });
  });
});
