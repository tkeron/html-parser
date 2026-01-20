import { describe, it, expect } from "bun:test";
import { parseHTML } from "../src/index";

describe("innerHTML with void elements", () => {
  it('innerHTML should work with void elements', () => {
    const doc = parseHTML('<custom></custom>');
    const element = doc.querySelector('custom');

    element!.innerHTML = '<meta name="test">';
    expect(element!.innerHTML).toBe('<meta name="test">');
    expect(element!.childNodes.length).toBe(1);
  });

  it('innerHTML should work with multiple void elements', () => {
    const doc = parseHTML('<custom></custom>');
    const element = doc.querySelector('custom');

    element!.innerHTML = '<meta name="a"><link rel="b"><input type="c">';
    expect(element!.childNodes.length).toBe(3);
  });

  it('innerHTML should work with mixed void and non-void elements', () => {
    const doc = parseHTML('<custom></custom>');
    const element = doc.querySelector('custom');

    element!.innerHTML = '<meta name="test"><div>Hello</div><br><span>World</span>';
    expect(element!.childNodes.length).toBe(4);
    expect(element!.children[0].tagName).toBe('META');
    expect(element!.children[1].tagName).toBe('DIV');
    expect(element!.children[2].tagName).toBe('BR');
    expect(element!.children[3].tagName).toBe('SPAN');
  });

  it('innerHTML should work with void elements nested inside containers', () => {
    const doc = parseHTML('<custom></custom>');
    const element = doc.querySelector('custom');

    element!.innerHTML = '<div><img src="test.jpg"><input type="text"></div>';
    expect(element!.childNodes.length).toBe(1);
    const div = element!.children[0];
    expect(div.childNodes.length).toBe(2);
    expect(div.children[0].tagName).toBe('IMG');
    expect(div.children[1].tagName).toBe('INPUT');
  });

  it('innerHTML can be replaced multiple times with void elements', () => {
    const doc = parseHTML('<custom></custom>');
    const element = doc.querySelector('custom');

    element!.innerHTML = '<meta name="first">';
    expect(element!.childNodes.length).toBe(1);

    element!.innerHTML = '<link rel="second"><hr>';
    expect(element!.childNodes.length).toBe(2);

    element!.innerHTML = '';
    expect(element!.childNodes.length).toBe(0);
  });

  it('innerHTML should work with all void element types', () => {
    const doc = parseHTML('<custom></custom>');
    const element = doc.querySelector('custom');

    // Test all void elements
    const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'];
    
    for (const tag of voidElements) {
      element!.innerHTML = `<${tag}>`;
      expect(element!.childNodes.length).toBe(1);
      expect(element!.children[0].tagName).toBe(tag.toUpperCase());
    }
  });

  it('innerHTML with void elements preserves attributes', () => {
    const doc = parseHTML('<custom></custom>');
    const element = doc.querySelector('custom');

    element!.innerHTML = '<meta charset="utf-8" name="viewport" content="width=device-width">';
    const meta = element!.children[0];
    expect(meta.getAttribute('charset')).toBe('utf-8');
    expect(meta.getAttribute('name')).toBe('viewport');
    expect(meta.getAttribute('content')).toBe('width=device-width');
  });
});