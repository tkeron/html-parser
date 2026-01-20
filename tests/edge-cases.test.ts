import { describe, it, expect } from "bun:test";
import { parseHTML } from "../src/index";

describe("Edge Cases: Scripts with HTML inside", () => {
  it("should handle script with less-than and greater-than operators", () => {
    const doc = parseHTML('<script>if (a < b && c > d) { console.log("ok"); }</script>');
    const script = doc.querySelector('script');
    expect(script).toBeTruthy();
    expect(script!.textContent).toContain('a < b');
    expect(script!.textContent).toContain('c > d');
  });

  it("should handle script containing </script> as a string", () => {
    const doc = parseHTML('<script>var html = "<\\/script>";</script>');
    const script = doc.querySelector('script');
    expect(script).toBeTruthy();
  });

  it("should handle script with HTML-like content in strings", () => {
    const doc = parseHTML('<script>var html = "<div class=\\"test\\">Hello</div>";</script>');
    const script = doc.querySelector('script');
    expect(script).toBeTruthy();
    expect(script!.textContent).toContain('<div');
  });

  it("should handle script with template literals containing HTML", () => {
    const doc = parseHTML('<script>const tpl = `<div>${name}</div>`;</script>');
    const script = doc.querySelector('script');
    expect(script).toBeTruthy();
    expect(script!.textContent).toContain('<div>');
  });

  it("should handle multiple scripts with complex content", () => {
    const html = `
      <script>var a = 1 < 2;</script>
      <script>var b = 3 > 1;</script>
    `;
    const doc = parseHTML(html);
    const scripts = doc.querySelectorAll('script');
    expect(scripts.length).toBe(2);
  });
});

describe("Edge Cases: Template placeholders", () => {
  it("should preserve template placeholders", () => {
    const doc = parseHTML('<div>{{user.name}}</div>');
    const div = doc.querySelector('div');
    expect(div!.textContent).toBe('{{user.name}}');
  });

  it("should preserve placeholders in attributes", () => {
    const doc = parseHTML('<img src="{{imageUrl}}">');
    const img = doc.querySelector('img');
    expect(img!.getAttribute('src')).toBe('{{imageUrl}}');
  });

  it("should preserve custom attribute prefixes", () => {
    const doc = parseHTML('<div data-bind="value" x-on:click="handler" custom-attr="test"></div>');
    const div = doc.querySelector('div');
    expect(div!.getAttribute('data-bind')).toBe('value');
    expect(div!.getAttribute('x-on:click')).toBe('handler');
    expect(div!.getAttribute('custom-attr')).toBe('test');
  });

  it("should preserve EJS/ERB style placeholders", () => {
    const doc = parseHTML('<div><%= user.name %></div>');
    const div = doc.querySelector('div');
    expect(div!.textContent).toBe('<%= user.name %>');
  });

  it("should handle nested template expressions", () => {
    const doc = parseHTML('<div>{{#each items}}{{this}}{{/each}}</div>');
    const div = doc.querySelector('div');
    expect(div!.textContent).toContain('{{#each items}}');
    expect(div!.textContent).toContain('{{/each}}');
  });
});

describe("Edge Cases: Malformed but common HTML", () => {
  it("should handle unclosed paragraph tags", () => {
    const doc = parseHTML('<p>Párrafo 1<p>Párrafo 2');
    const paragraphs = doc.querySelectorAll('p');
    expect(paragraphs.length).toBe(2);
  });

  it("should handle list items without parent list", () => {
    const doc = parseHTML('<li>Item 1</li><li>Item 2</li>');
    const items = doc.querySelectorAll('li');
    expect(items.length).toBe(2);
  });

  it("should handle nested unclosed tags", () => {
    const doc = parseHTML('<div><span>Text<div>Nested</div></span></div>');
    const div = doc.querySelector('div');
    expect(div).toBeTruthy();
  });

  it("should handle missing closing tags at end", () => {
    const doc = parseHTML('<div><span>Text');
    const div = doc.querySelector('div');
    const span = doc.querySelector('span');
    expect(div).toBeTruthy();
    expect(span).toBeTruthy();
  });

  it("should handle extra closing tags", () => {
    const doc = parseHTML('<div>Text</div></div></span>');
    const div = doc.querySelector('div');
    expect(div).toBeTruthy();
    expect(div!.textContent).toBe('Text');
  });

  it("should handle incorrectly nested tags", () => {
    const doc = parseHTML('<b><i>Bold and italic</b></i>');
    const b = doc.querySelector('b');
    const i = doc.querySelector('i');
    expect(b).toBeTruthy();
    expect(i).toBeTruthy();
  });
});

describe("Edge Cases: Significant whitespace", () => {
  it("should preserve whitespace in pre tags", () => {
    const doc = parseHTML('<pre>  multiple   spaces   here  </pre>');
    const pre = doc.querySelector('pre');
    expect(pre!.textContent).toBe('  multiple   spaces   here  ');
  });

  it("should preserve newlines in pre tags", () => {
    const doc = parseHTML('<pre>line1\nline2\nline3</pre>');
    const pre = doc.querySelector('pre');
    expect(pre!.textContent).toContain('\n');
  });

  it("should preserve whitespace in code tags", () => {
    const doc = parseHTML('<code>function()  {  }</code>');
    const code = doc.querySelector('code');
    expect(code!.textContent).toBe('function()  {  }');
  });

  it("should preserve whitespace in textarea", () => {
    const doc = parseHTML('<textarea>  indented\n    more indented  </textarea>');
    const textarea = doc.querySelector('textarea');
    expect(textarea!.textContent).toContain('  indented');
  });

  it("should handle tabs in pre", () => {
    const doc = parseHTML('<pre>\ttab\t\ttabs</pre>');
    const pre = doc.querySelector('pre');
    expect(pre!.textContent).toBe('\ttab\t\ttabs');
  });
});

describe("Edge Cases: Special characters in attributes", () => {
  it("should handle JSON in data attributes", () => {
    const doc = parseHTML('<div data-json=\'{"key": "value", "num": 123}\'></div>');
    const div = doc.querySelector('div');
    const json = div!.getAttribute('data-json');
    expect(json).toBe('{"key": "value", "num": 123}');
  });

  it("should handle double quotes inside single-quoted attributes", () => {
    const doc = parseHTML("<div title='He said \"Hello\"'></div>");
    const div = doc.querySelector('div');
    expect(div!.getAttribute('title')).toBe('He said "Hello"');
  });

  it("should handle single quotes inside double-quoted attributes", () => {
    const doc = parseHTML('<div title="It\'s working"></div>');
    const div = doc.querySelector('div');
    expect(div!.getAttribute('title')).toBe("It's working");
  });

  it("should handle HTML entities in attributes", () => {
    const doc = parseHTML('<div title="&lt;html&gt;"></div>');
    const div = doc.querySelector('div');
    // Depending on parser behavior, entities may or may not be decoded
    const title = div!.getAttribute('title');
    expect(title === '&lt;html&gt;' || title === '<html>').toBe(true);
  });

  it("should handle unicode characters in attributes", () => {
    const doc = parseHTML('<div title="Hello 世界 🌍"></div>');
    const div = doc.querySelector('div');
    expect(div!.getAttribute('title')).toBe('Hello 世界 🌍');
  });

  it("should handle newlines in attributes", () => {
    const doc = parseHTML('<div title="line1\nline2"></div>');
    const div = doc.querySelector('div');
    expect(div!.getAttribute('title')).toContain('line1');
  });

  it("should handle equals signs in attribute values", () => {
    const doc = parseHTML('<div data-equation="a=b+c"></div>');
    const div = doc.querySelector('div');
    expect(div!.getAttribute('data-equation')).toBe('a=b+c');
  });
});

describe("Edge Cases: SVG and MathML inline", () => {
  it("should parse inline SVG", () => {
    const doc = parseHTML('<svg width="100" height="100"><circle cx="50" cy="50" r="40"/></svg>');
    const svg = doc.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg!.getAttribute('width')).toBe('100');
  });

  it("should parse SVG with nested elements", () => {
    const doc = parseHTML('<svg><g><rect width="10" height="10"/><text>Hello</text></g></svg>');
    const svg = doc.querySelector('svg');
    const g = doc.querySelector('g');
    const rect = doc.querySelector('rect');
    const text = doc.querySelector('text');
    expect(svg).toBeTruthy();
    expect(g).toBeTruthy();
    expect(rect).toBeTruthy();
    expect(text).toBeTruthy();
  });

  it("should handle foreignObject with HTML inside SVG", () => {
    const doc = parseHTML('<svg><foreignObject><div>HTML inside SVG</div></foreignObject></svg>');
    const svg = doc.querySelector('svg');
    const fo = doc.querySelector('foreignObject');
    const div = doc.querySelector('div');
    expect(svg).toBeTruthy();
    expect(fo).toBeTruthy();
    expect(div).toBeTruthy();
  });

  it("should parse inline MathML", () => {
    const doc = parseHTML('<math><mi>x</mi><mo>=</mo><mn>2</mn></math>');
    const math = doc.querySelector('math');
    expect(math).toBeTruthy();
  });

  it("should handle SVG with CDATA-like content in style", () => {
    const doc = parseHTML('<svg><style>/* styles */</style></svg>');
    const svg = doc.querySelector('svg');
    const style = doc.querySelector('style');
    expect(svg).toBeTruthy();
    expect(style).toBeTruthy();
  });
});

describe("Edge Cases: CDATA sections", () => {
  it("should handle CDATA in script", () => {
    const doc = parseHTML('<script>//<![CDATA[\nvar x = 1;\n//]]></script>');
    const script = doc.querySelector('script');
    expect(script).toBeTruthy();
  });

  it("should handle CDATA in style", () => {
    const doc = parseHTML('<style>/*<![CDATA[*/ body { color: red; } /*]]>*/</style>');
    const style = doc.querySelector('style');
    expect(style).toBeTruthy();
  });

  it("should handle XML CDATA sections", () => {
    const doc = parseHTML('<div><![CDATA[Some <special> content]]></div>');
    const div = doc.querySelector('div');
    expect(div).toBeTruthy();
  });
});

describe("Edge Cases: IE Conditional Comments", () => {
  it("should handle basic IE conditional comments", () => {
    const doc = parseHTML('<!--[if IE]><link href="ie.css"><![endif]-->');
    // Should parse without errors, comment handling varies by parser
    expect(doc).toBeTruthy();
  });

  it("should handle IE conditional with version", () => {
    const doc = parseHTML('<!--[if lt IE 9]><script src="html5shiv.js"></script><![endif]-->');
    expect(doc).toBeTruthy();
  });

  it("should handle downlevel-hidden conditional", () => {
    const doc = parseHTML('<!--[if !IE]>--><link href="modern.css"><!--<![endif]-->');
    expect(doc).toBeTruthy();
  });

  it("should preserve content around conditional comments", () => {
    const doc = parseHTML('<div>Before</div><!--[if IE]>IE only<![endif]--><div>After</div>');
    const divs = doc.querySelectorAll('div');
    expect(divs.length).toBe(2);
    expect(divs[0].textContent).toBe('Before');
    expect(divs[1].textContent).toBe('After');
  });
});

describe("Edge Cases: innerHTML on special elements", () => {
  it("should handle innerHTML on table with tr/td", () => {
    const doc = parseHTML('<table></table>');
    const table = doc.querySelector('table');
    table!.innerHTML = '<tr><td>Cell 1</td><td>Cell 2</td></tr>';
    // Browser auto-wraps in tbody, parser behavior may vary
    const tr = table!.querySelector('tr');
    const tds = table!.querySelectorAll('td');
    expect(tr).toBeTruthy();
    expect(tds.length).toBe(2);
  });

  it("should handle innerHTML on select with options", () => {
    const doc = parseHTML('<select></select>');
    const select = doc.querySelector('select');
    select!.innerHTML = '<option value="1">One</option><option value="2">Two</option>';
    const options = select!.querySelectorAll('option');
    expect(options.length).toBe(2);
  });

  it("should handle innerHTML on ul with li", () => {
    const doc = parseHTML('<ul></ul>');
    const ul = doc.querySelector('ul');
    ul!.innerHTML = '<li>Item 1</li><li>Item 2</li><li>Item 3</li>';
    const items = ul!.querySelectorAll('li');
    expect(items.length).toBe(3);
  });

  it("should handle innerHTML on template element", () => {
    const doc = parseHTML('<template></template>');
    const template = doc.querySelector('template');
    template!.innerHTML = '<div>Template content</div>';
    // Template behavior is special in browsers
    expect(template).toBeTruthy();
  });

  it("should handle innerHTML on colgroup", () => {
    const doc = parseHTML('<table><colgroup></colgroup></table>');
    const colgroup = doc.querySelector('colgroup');
    colgroup!.innerHTML = '<col span="2"><col>';
    const cols = colgroup!.querySelectorAll('col');
    expect(cols.length).toBe(2);
  });

  it("should handle innerHTML replacement multiple times on table", () => {
    const doc = parseHTML('<table></table>');
    const table = doc.querySelector('table');
    
    table!.innerHTML = '<tr><td>First</td></tr>';
    expect(table!.querySelector('td')!.textContent).toBe('First');
    
    table!.innerHTML = '<tr><td>Second</td></tr>';
    expect(table!.querySelector('td')!.textContent).toBe('Second');
  });
});

describe("Edge Cases: Self-closing tags in HTML5", () => {
  it("should handle self-closing div (invalid in HTML5)", () => {
    const doc = parseHTML('<div/>');
    const div = doc.querySelector('div');
    expect(div).toBeTruthy();
    // In HTML5, <div/> is treated as <div> (not closed)
  });

  it("should handle self-closing span", () => {
    const doc = parseHTML('<span/>text');
    const span = doc.querySelector('span');
    expect(span).toBeTruthy();
  });

  it("should handle valid self-closing void elements", () => {
    const doc = parseHTML('<br/><hr/><img/>');
    const br = doc.querySelector('br');
    const hr = doc.querySelector('hr');
    const img = doc.querySelector('img');
    expect(br).toBeTruthy();
    expect(hr).toBeTruthy();
    expect(img).toBeTruthy();
  });

  it("should handle self-closing with space before slash", () => {
    const doc = parseHTML('<br />');
    const br = doc.querySelector('br');
    expect(br).toBeTruthy();
  });

  it("should handle self-closing in XHTML style", () => {
    const doc = parseHTML('<input type="text" />');
    const input = doc.querySelector('input');
    expect(input).toBeTruthy();
    expect(input!.getAttribute('type')).toBe('text');
  });

  it("should handle mixed self-closing styles", () => {
    const doc = parseHTML('<div><br><br/><br /></div>');
    const brs = doc.querySelectorAll('br');
    expect(brs.length).toBe(3);
  });
});

describe("Edge Cases: Additional common scenarios", () => {
  it("should handle empty attributes", () => {
    const doc = parseHTML('<input disabled readonly>');
    const input = doc.querySelector('input');
    expect(input!.hasAttribute('disabled')).toBe(true);
    expect(input!.hasAttribute('readonly')).toBe(true);
  });

  it("should handle unquoted attribute values", () => {
    const doc = parseHTML('<div class=myclass id=myid></div>');
    const div = doc.querySelector('div');
    expect(div!.getAttribute('class')).toBe('myclass');
    expect(div!.getAttribute('id')).toBe('myid');
  });

  it("should handle attributes with no value", () => {
    const doc = parseHTML('<option selected>Choice</option>');
    const option = doc.querySelector('option');
    expect(option!.hasAttribute('selected')).toBe(true);
  });

  it("should handle doctype", () => {
    const doc = parseHTML('<!DOCTYPE html><html><body>Test</body></html>');
    expect(doc.body).toBeTruthy();
    expect(doc.body.textContent).toBe('Test');
  });

  it("should handle comments between tags", () => {
    const doc = parseHTML('<div><!-- comment --><span>Text</span></div>');
    const span = doc.querySelector('span');
    expect(span).toBeTruthy();
    expect(span!.textContent).toBe('Text');
  });

  it("should handle deeply nested structure", () => {
    const doc = parseHTML('<div><div><div><div><div><span>Deep</span></div></div></div></div></div>');
    const span = doc.querySelector('span');
    expect(span).toBeTruthy();
    expect(span!.textContent).toBe('Deep');
  });

  it("should handle adjacent text nodes conceptually", () => {
    const doc = parseHTML('<div>Hello World</div>');
    const div = doc.querySelector('div');
    expect(div!.textContent).toBe('Hello World');
  });

  it("should handle style tags with CSS", () => {
    const doc = parseHTML('<style>.class { color: red; } #id > div { margin: 0; }</style>');
    const style = doc.querySelector('style');
    expect(style).toBeTruthy();
    expect(style!.textContent).toContain('color: red');
  });

  it("should handle noscript content", () => {
    const doc = parseHTML('<noscript><div>Please enable JavaScript</div></noscript>');
    const noscript = doc.querySelector('noscript');
    expect(noscript).toBeTruthy();
  });

  it("should handle data URLs in attributes", () => {
    const doc = parseHTML('<img src="data:image/png;base64,iVBORw0KGgo=">');
    const img = doc.querySelector('img');
    expect(img!.getAttribute('src')).toContain('data:image/png');
  });
});
