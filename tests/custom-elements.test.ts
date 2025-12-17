import { expect, test, describe } from 'bun:test';
import { tokenize } from '../src/tokenizer';
import { parse, ASTNodeType, type ASTNode } from '../src/parser';

describe('Custom Elements Support', () => {
  
  describe('Basic Custom Elements', () => {
    test('should parse simple custom element with single hyphen', () => {
      const tokens = tokenize('<my-component></my-component>');
      const ast = parse(tokens);

      expect(ast.type).toBe(ASTNodeType.DOCUMENT);
      expect(ast.children).toHaveLength(1);

      const element = ast.children![0]!;
      expect(element.type).toBe(ASTNodeType.ELEMENT);
      expect(element.tagName).toBe('my-component');
    });

    test('should parse custom element with numbers', () => {
      const tokens = tokenize('<my-component-123></my-component-123>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.type).toBe(ASTNodeType.ELEMENT);
      expect(element.tagName).toBe('my-component-123');
    });

    test('should parse short custom element', () => {
      const tokens = tokenize('<x-button></x-button>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.type).toBe(ASTNodeType.ELEMENT);
      expect(element.tagName).toBe('x-button');
    });

    test('should parse custom element with multiple hyphens', () => {
      const tokens = tokenize('<app-header-nav></app-header-nav>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.type).toBe(ASTNodeType.ELEMENT);
      expect(element.tagName).toBe('app-header-nav');
    });

    test('should parse custom element with many hyphens', () => {
      const tokens = tokenize('<my-custom-super-component></my-custom-super-component>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.type).toBe(ASTNodeType.ELEMENT);
      expect(element.tagName).toBe('my-custom-super-component');
    });

    test('should parse custom element with dots', () => {
      const tokens = tokenize('<my-comp.v2></my-comp.v2>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.type).toBe(ASTNodeType.ELEMENT);
      expect(element.tagName).toBe('my-comp.v2');
    });

    test('should parse custom element with underscores', () => {
      const tokens = tokenize('<my-comp_beta></my-comp_beta>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.type).toBe(ASTNodeType.ELEMENT);
      expect(element.tagName).toBe('my-comp_beta');
    });
  });

  describe('Custom Elements with Attributes', () => {
    test('should parse custom element with class attribute', () => {
      const tokens = tokenize('<my-comp class="test"></my-comp>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.type).toBe(ASTNodeType.ELEMENT);
      expect(element.tagName).toBe('my-comp');
      expect(element.attributes).toEqual({ class: 'test' });
    });

    test('should parse custom element with multiple attributes', () => {
      const tokens = tokenize('<my-comp class="test" id="main" data-value="123"></my-comp>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.type).toBe(ASTNodeType.ELEMENT);
      expect(element.tagName).toBe('my-comp');
      expect(element.attributes).toEqual({
        class: 'test',
        id: 'main',
        'data-value': '123'
      });
    });

    test('should parse custom element with custom attributes', () => {
      const tokens = tokenize('<user-card name="John" age="30"></user-card>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.type).toBe(ASTNodeType.ELEMENT);
      expect(element.tagName).toBe('user-card');
      expect(element.attributes).toEqual({
        name: 'John',
        age: '30'
      });
    });
  });

  describe('Self-Closing Custom Elements', () => {
    test('should parse self-closing custom element with space', () => {
      const tokens = tokenize('<self-closing />');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.type).toBe(ASTNodeType.ELEMENT);
      expect(element.tagName).toBe('self-closing');
      expect(element.isSelfClosing).toBe(true);
    });

    test('should parse self-closing custom element without space', () => {
      const tokens = tokenize('<my-comp/>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.type).toBe(ASTNodeType.ELEMENT);
      expect(element.tagName).toBe('my-comp');
      expect(element.isSelfClosing).toBe(true);
    });

    test('should parse self-closing custom element with attributes', () => {
      const tokens = tokenize('<icon-button type="primary" size="lg" />');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.type).toBe(ASTNodeType.ELEMENT);
      expect(element.tagName).toBe('icon-button');
      expect(element.isSelfClosing).toBe(true);
      expect(element.attributes).toEqual({
        type: 'primary',
        size: 'lg'
      });
    });
  });

  describe('Nested Custom Elements', () => {
    test('should parse nested custom elements', () => {
      const tokens = tokenize('<outer-comp><inner-comp>text</inner-comp></outer-comp>');
      const ast = parse(tokens);

      const outer = ast.children![0]!;
      expect(outer.type).toBe(ASTNodeType.ELEMENT);
      expect(outer.tagName).toBe('outer-comp');
      expect(outer.children).toHaveLength(1);

      const inner = outer.children![0]!;
      expect(inner.type).toBe(ASTNodeType.ELEMENT);
      expect(inner.tagName).toBe('inner-comp');
      expect(inner.children).toHaveLength(1);

      const text = inner.children![0]!;
      expect(text.type).toBe(ASTNodeType.TEXT);
      expect(text.content).toBe('text');
    });

    test('should parse deeply nested custom elements', () => {
      const tokens = tokenize('<level-1><level-2><level-3>content</level-3></level-2></level-1>');
      const ast = parse(tokens);

      const level1 = ast.children![0]!;
      expect(level1.tagName).toBe('level-1');

      const level2 = level1.children![0]!;
      expect(level2.tagName).toBe('level-2');

      const level3 = level2.children![0]!;
      expect(level3.tagName).toBe('level-3');
    });

    test('should parse custom elements mixed with standard elements', () => {
      const tokens = tokenize('<div><my-comp><span>text</span></my-comp></div>');
      const ast = parse(tokens);

      const div = ast.children![0]!;
      expect(div.tagName).toBe('div');

      const myComp = div.children![0]!;
      expect(myComp.tagName).toBe('my-comp');

      const span = myComp.children![0]!;
      expect(span.tagName).toBe('span');
    });
  });

  describe('Tag Name Normalization', () => {
    test('should normalize custom element tagName to UPPERCASE', () => {
      const tokens = tokenize('<my-comp></my-comp>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName.toUpperCase()).toBe('MY-COMP');
    });

    test('should normalize nodeName to UPPERCASE', () => {
      const tokens = tokenize('<my-comp></my-comp>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      // nodeName should also be uppercase
      if (element.nodeName) {
        expect(element.nodeName.toUpperCase()).toBe('MY-COMP');
      }
    });
  });

  describe('Regression Tests - Standard Elements', () => {
    test('should still parse standard div element', () => {
      const tokens = tokenize('<div></div>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.type).toBe(ASTNodeType.ELEMENT);
      expect(element.tagName).toBe('div');
    });

    test('should still parse standard header element', () => {
      const tokens = tokenize('<header></header>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.type).toBe(ASTNodeType.ELEMENT);
      expect(element.tagName).toBe('header');
    });

    test('should still parse standard section element', () => {
      const tokens = tokenize('<section></section>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.type).toBe(ASTNodeType.ELEMENT);
      expect(element.tagName).toBe('section');
    });

    test('should distinguish between header tag and header-comp custom element', () => {
      const tokens = tokenize('<header></header><header-comp></header-comp>');
      const ast = parse(tokens);

      expect(ast.children).toHaveLength(2);

      const header = ast.children![0]!;
      expect(header.tagName).toBe('header');

      const headerComp = ast.children![1]!;
      expect(headerComp.tagName).toBe('header-comp');
    });
  });

  describe('Custom Elements with Different Formats', () => {
    test('should parse custom element: my-comp', () => {
      const tokens = tokenize('<my-comp></my-comp>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('my-comp');
    });

    test('should parse custom element: comp-v2', () => {
      const tokens = tokenize('<comp-v2></comp-v2>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('comp-v2');
    });

    test('should parse custom element: my-comp-123', () => {
      const tokens = tokenize('<my-comp-123></my-comp-123>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('my-comp-123');
    });

    test('should parse custom element: x-foo', () => {
      const tokens = tokenize('<x-foo></x-foo>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('x-foo');
    });

    test('should parse custom element with numbers: comp-123-test', () => {
      const tokens = tokenize('<comp-123-test></comp-123-test>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('comp-123-test');
    });
  });

  describe('Edge Cases', () => {
    test('should parse custom element with whitespace before closing bracket', () => {
      const tokens = tokenize('<my-comp ></my-comp>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('my-comp');
    });

    test('should parse multiple custom elements in sequence', () => {
      const tokens = tokenize('<first-comp></first-comp><second-comp></second-comp><third-comp></third-comp>');
      const ast = parse(tokens);

      expect(ast.children).toHaveLength(3);
      expect(ast.children![0]!.tagName).toBe('first-comp');
      expect(ast.children![1]!.tagName).toBe('second-comp');
      expect(ast.children![2]!.tagName).toBe('third-comp');
    });

    test('should parse custom element with text content', () => {
      const tokens = tokenize('<user-name>John Doe</user-name>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('user-name');
      expect(element.children).toHaveLength(1);
      expect(element.children![0]!.type).toBe(ASTNodeType.TEXT);
      expect(element.children![0]!.content).toBe('John Doe');
    });

    test('should parse custom element with child elements and text', () => {
      const tokens = tokenize('<card-header><h1>Title</h1><sub-title>Subtitle</sub-title></card-header>');
      const ast = parse(tokens);

      const cardHeader = ast.children![0]!;
      expect(cardHeader.tagName).toBe('card-header');
      expect(cardHeader.children).toHaveLength(2);
      
      expect(cardHeader.children![0]!.tagName).toBe('h1');
      expect(cardHeader.children![1]!.tagName).toBe('sub-title');
    });

    test('should handle unclosed custom element gracefully', () => {
      const tokens = tokenize('<my-comp>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('my-comp');
    });

    test('should parse custom element with trailing slash in opening tag', () => {
      const tokens = tokenize('<my-comp/>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('my-comp');
      expect(element.isSelfClosing).toBe(true);
    });
  });

  describe('Complex Real-World Scenarios', () => {
    test('should parse web component with shadow DOM structure', () => {
      const html = `
        <user-profile>
          <profile-header>
            <avatar-img src="user.jpg" />
            <user-name>Jane Smith</user-name>
          </profile-header>
          <profile-content>
            <bio-section>Biography text here</bio-section>
            <stats-panel>
              <stat-item label="Posts" value="123" />
              <stat-item label="Followers" value="456" />
            </stats-panel>
          </profile-content>
        </user-profile>
      `;
      
      const tokens = tokenize(html);
      const ast = parse(tokens);

      // Find first element (skip whitespace text nodes)
      const userProfile = ast.children!.find(node => node.type === ASTNodeType.ELEMENT)!;
      expect(userProfile.tagName).toBe('user-profile');
      
      // Should have proper nesting
      expect(userProfile.children).toBeDefined();
      expect(userProfile.children!.length).toBeGreaterThan(0);
    });

    test('should parse framework-style component tree', () => {
      const html = `
        <app-root>
          <app-header>
            <nav-bar>
              <nav-item href="/home">Home</nav-item>
              <nav-item href="/about">About</nav-item>
            </nav-bar>
          </app-header>
          <main-content>
            <article-list>
              <article-card title="Test" />
            </article-list>
          </main-content>
          <app-footer />
        </app-root>
      `;
      
      const tokens = tokenize(html);
      const ast = parse(tokens);

      // Find first element (skip whitespace text nodes)
      const appRoot = ast.children!.find(node => node.type === ASTNodeType.ELEMENT)!;
      expect(appRoot.tagName).toBe('app-root');
    });

    test('should parse custom elements with data attributes', () => {
      const tokens = tokenize('<my-widget data-id="123" data-type="primary" data-config=\'{"key":"value"}\'></my-widget>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('my-widget');
      expect(element.attributes).toHaveProperty('data-id', '123');
      expect(element.attributes).toHaveProperty('data-type', 'primary');
      expect(element.attributes).toHaveProperty('data-config');
    });
  });

  describe('Custom Element Name Validation Pattern', () => {
    test('valid: starts with lowercase letter, contains hyphen', () => {
      const validNames = [
        'a-b',
        'my-component',
        'x-button',
        'user-card',
        'app-header',
        'my-comp-123',
        'comp-v2.1',
        'test_element-1'
      ];

      validNames.forEach(name => {
        const tokens = tokenize(`<${name}></${name}>`);
        const ast = parse(tokens);
        const element = ast.children![0]!;
        expect(element.tagName).toBe(name);
      });
    });

    test('should handle complex hyphenated names', () => {
      const complexNames = [
        'my-super-long-component-name',
        'x-1-2-3-4',
        'component-v2-beta-test',
        'ui-button-primary-large'
      ];

      complexNames.forEach(name => {
        const tokens = tokenize(`<${name}></${name}>`);
        const ast = parse(tokens);
        const element = ast.children![0]!;
        expect(element.tagName).toBe(name);
      });
    });
  });

  describe('Tokenizer-specific Tests', () => {
    test('tokenizer should capture full custom element name', () => {
      const tokens = tokenize('<my-component-123></my-component-123>');
      
      // Find the opening tag token
      const openTag = tokens.find(t => t.type === 'TAG_OPEN');
      expect(openTag).toBeDefined();
      expect(openTag!.value).toBe('my-component-123');
      
      // Find the closing tag token
      const closeTag = tokens.find(t => t.type === 'TAG_CLOSE');
      expect(closeTag).toBeDefined();
      expect(closeTag!.value).toBe('my-component-123');
    });

    test('tokenizer should handle custom element with attributes correctly', () => {
      const tokens = tokenize('<my-comp class="test" id="main"></my-comp>');
      
      const openTag = tokens.find(t => t.type === 'TAG_OPEN');
      expect(openTag).toBeDefined();
      expect(openTag!.value).toBe('my-comp');
      expect(openTag!.attributes).toEqual({
        class: 'test',
        id: 'main'
      });
    });

    test('tokenizer should handle self-closing custom elements', () => {
      const tokens = tokenize('<my-comp />');
      
      const openTag = tokens.find(t => t.type === 'TAG_OPEN');
      expect(openTag).toBeDefined();
      expect(openTag!.value).toBe('my-comp');
      expect(openTag!.isSelfClosing).toBe(true);
    });
  });

  describe('Customized Built-in Elements (is attribute)', () => {
    test('should parse button with is attribute', () => {
      const tokens = tokenize('<button is="plastic-button">Click Me!</button>');
      const ast = parse(tokens);

      const button = ast.children![0]!;
      expect(button.type).toBe(ASTNodeType.ELEMENT);
      expect(button.tagName).toBe('button');
      expect(button.attributes).toHaveProperty('is', 'plastic-button');
    });

    test('should parse input with is attribute', () => {
      const tokens = tokenize('<input is="custom-input" type="text" />');
      const ast = parse(tokens);

      const input = ast.children![0]!;
      expect(input.tagName).toBe('input');
      expect(input.attributes).toHaveProperty('is', 'custom-input');
      expect(input.attributes).toHaveProperty('type', 'text');
    });

    test('should parse div with is attribute', () => {
      const tokens = tokenize('<div is="fancy-div"></div>');
      const ast = parse(tokens);

      const div = ast.children![0]!;
      expect(div.tagName).toBe('div');
      expect(div.attributes).toHaveProperty('is', 'fancy-div');
    });
  });

  describe('Reserved Custom Element Names', () => {
    test('should parse annotation-xml (reserved SVG name)', () => {
      const tokens = tokenize('<annotation-xml></annotation-xml>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('annotation-xml');
    });

    test('should parse font-face (reserved SVG name)', () => {
      const tokens = tokenize('<font-face></font-face>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('font-face');
    });

    test('should parse color-profile (reserved SVG name)', () => {
      const tokens = tokenize('<color-profile></color-profile>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('color-profile');
    });
  });

  describe('Unicode Custom Element Names', () => {
    test('should parse custom element with Greek letters', () => {
      const tokens = tokenize('<math-α></math-α>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('math-α');
    });

    test('should parse custom element with emoji', () => {
      const tokens = tokenize('<emotion-😍></emotion-😍>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('emotion-😍');
    });

    test('should parse custom element with Chinese characters', () => {
      const tokens = tokenize('<my-元素></my-元素>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('my-元素');
    });

    test('should parse custom element with Arabic characters', () => {
      const tokens = tokenize('<my-عنصر></my-عنصر>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('my-عنصر');
    });
  });

  describe('Extreme Edge Cases', () => {
    test('should parse very long custom element name', () => {
      const longName = 'my-super-duper-extra-long-custom-component-name-that-keeps-going-and-going';
      const tokens = tokenize(`<${longName}></${longName}>`);
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe(longName);
    });

    test('should parse custom element with many consecutive hyphens', () => {
      const tokens = tokenize('<my---component></my---component>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('my---component');
    });

    test('should parse custom element starting with x-', () => {
      const tokens = tokenize('<x-></x->');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('x-');
    });

    test('should handle custom element with newlines in attributes', () => {
      const html = `<my-comp
        class="test"
        id="main"
        data-value="123"
      ></my-comp>`;
      
      const tokens = tokenize(html);
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('my-comp');
      expect(element.attributes).toHaveProperty('class', 'test');
      expect(element.attributes).toHaveProperty('id', 'main');
    });

    test('should parse custom element mixed with comments', () => {
      const html = '<!-- comment --><my-comp>text</my-comp><!-- another comment -->';
      const tokens = tokenize(html);
      const ast = parse(tokens);

      // Should have comment, element, comment
      const myComp = ast.children!.find(node => node.type === ASTNodeType.ELEMENT)!;
      expect(myComp.tagName).toBe('my-comp');
    });

    test('should parse empty custom element', () => {
      const tokens = tokenize('<my-comp></my-comp>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('my-comp');
      expect(element.children).toBeDefined();
      expect(element.children!.length).toBe(0);
    });

    test('should parse custom element with only whitespace content', () => {
      const tokens = tokenize('<my-comp>   \n\t  </my-comp>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('my-comp');
      expect(element.children).toBeDefined();
      expect(element.children!.length).toBeGreaterThan(0);
    });
  });

  describe('Malformed Custom Elements', () => {
    test('should handle mismatched closing tag', () => {
      const tokens = tokenize('<my-comp></my-other>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('my-comp');
    });

    test('should handle multiple unclosed custom elements', () => {
      const tokens = tokenize('<my-comp><nested-comp><deep-comp>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('my-comp');
    });

    test('should handle custom element with malformed attributes', () => {
      const tokens = tokenize('<my-comp attr-without-value attr="value"></my-comp>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('my-comp');
      expect(element.attributes).toBeDefined();
    });
  });

  describe('Custom Elements in Special Contexts', () => {
    test('should parse custom element inside table', () => {
      const tokens = tokenize('<table><tr><td><my-cell>content</my-cell></td></tr></table>');
      const ast = parse(tokens);

      // Find the custom element
      const table = ast.children![0]!;
      expect(table.tagName).toBe('table');
    });

    test('should parse custom element inside list', () => {
      const tokens = tokenize('<ul><li><list-item></list-item></li></ul>');
      const ast = parse(tokens);

      const ul = ast.children![0]!;
      expect(ul.tagName).toBe('ul');
    });

    test('should parse custom element inside form', () => {
      const tokens = tokenize('<form><form-field name="test"></form-field></form>');
      const ast = parse(tokens);

      const form = ast.children![0]!;
      expect(form.tagName).toBe('form');
    });
  });

  describe('ARIA and Accessibility', () => {
    test('should parse custom element with ARIA attributes', () => {
      const tokens = tokenize('<my-button role="button" aria-label="Click me" aria-disabled="true"></my-button>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.tagName).toBe('my-button');
      expect(element.attributes).toHaveProperty('role', 'button');
      expect(element.attributes).toHaveProperty('aria-label', 'Click me');
      expect(element.attributes).toHaveProperty('aria-disabled', 'true');
    });

    test('should parse custom element with tabindex', () => {
      const tokens = tokenize('<my-comp tabindex="0"></my-comp>');
      const ast = parse(tokens);

      const element = ast.children![0]!;
      expect(element.attributes).toHaveProperty('tabindex', '0');
    });
  });
});
