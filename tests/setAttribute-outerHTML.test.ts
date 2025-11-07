import { describe, it, expect } from "bun:test";
import { parseHTML } from "../index";

describe("setAttribute and outerHTML synchronization", () => {
  it("should update outerHTML after setAttribute on img element", () => {
    const doc = parseHTML('<html><body><img class="test" src="old.png" alt="test"/></body></html>');
    const img = doc.querySelector('.test');
    
    expect(img).not.toBeNull();
    expect(img!.getAttribute('src')).toBe('old.png');
    expect(img!.outerHTML).toContain('src="old.png"');
    
    img!.setAttribute('src', 'new.png');
    
    expect(img!.getAttribute('src')).toBe('new.png');
    expect(img!.outerHTML).toContain('src="new.png"');
    expect(img!.outerHTML).not.toContain('src="old.png"');
  });

  it("should update outerHTML after setAttribute on any element", () => {
    const doc = parseHTML('<div id="test" class="old-class">Content</div>');
    const div = doc.querySelector('#test');
    
    expect(div).not.toBeNull();
    expect(div!.getAttribute('class')).toBe('old-class');
    
    div!.setAttribute('class', 'new-class');
    div!.setAttribute('data-value', '123');
    
    expect(div!.getAttribute('class')).toBe('new-class');
    expect(div!.getAttribute('data-value')).toBe('123');
    expect(div!.outerHTML).toContain('class="new-class"');
    expect(div!.outerHTML).toContain('data-value="123"');
    expect(div!.outerHTML).not.toContain('class="old-class"');
  });

  it("should update parent innerHTML when child attribute changes", () => {
    const doc = parseHTML('<html><body><img class="no-linked" src="" alt="test"/></body></html>');
    const body = doc.querySelector('body');
    const img = doc.querySelector('.no-linked');
    
    expect(img).not.toBeNull();
    expect(body).not.toBeNull();
    
    img!.setAttribute('src', './new-image.png');
    
    expect(body!.innerHTML).toContain('src="./new-image.png"');
    expect(body!.innerHTML).not.toContain('src=""');
  });

  it("should update documentElement outerHTML after nested setAttribute", () => {
    const doc = parseHTML(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Test</title>
  </head>
  <body>
    <img class="no-linked" src="" alt="test" />
  </body>
</html>`);
    
    const img = doc.querySelector('.no-linked');
    expect(img).not.toBeNull();
    
    img!.setAttribute('src', './profile.png');
    
    const finalHTML = doc.documentElement!.outerHTML;
    expect(finalHTML).toContain('src="./profile.png"');
    expect(finalHTML).not.toContain('src=""');
  });

  it("should handle multiple setAttribute calls", () => {
    const doc = parseHTML('<a href="#" class="link">Click</a>');
    const link = doc.querySelector('a');
    
    expect(link).not.toBeNull();
    
    link!.setAttribute('href', 'https://example.com');
    link!.setAttribute('target', '_blank');
    link!.setAttribute('rel', 'noopener');
    
    const html = link!.outerHTML;
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener"');
    expect(html).not.toContain('href="#"');
  });

  it("should update outerHTML after removeAttribute", () => {
    const doc = parseHTML('<div id="test" class="my-class" data-value="123">Content</div>');
    const div = doc.querySelector('#test');
    
    expect(div).not.toBeNull();
    expect(div!.outerHTML).toContain('data-value="123"');
    
    div!.removeAttribute('data-value');
    
    expect(div!.getAttribute('data-value')).toBeNull();
    expect(div!.outerHTML).not.toContain('data-value');
  });
});
