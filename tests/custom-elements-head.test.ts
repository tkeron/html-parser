import { describe, it, expect } from 'bun:test';
import { parseHTML } from '../index';

describe('Custom Elements in <head>', () => {

  it('should keep <meta-tags> custom element in head', () => {
    const doc = parseHTML(
      '<!DOCTYPE html><html><head><meta-tags></meta-tags></head><body></body></html>'
    );
    
    const metaTags = doc.head?.querySelector('meta-tags');
    expect(metaTags).toBeTruthy();
    expect(metaTags?.parentElement?.tagName).toBe('HEAD');
  });

  it('should keep <social-meta> custom element in head', () => {
    const doc = parseHTML(
      '<!DOCTYPE html><html><head><social-meta></social-meta></head><body></body></html>'
    );
    
    const socialMeta = doc.head?.querySelector('social-meta');
    expect(socialMeta).toBeTruthy();
    expect(socialMeta?.parentElement?.tagName).toBe('HEAD');
  });

  it('should keep any <custom-element> with hyphen in head', () => {
    const doc = parseHTML(
      '<!DOCTYPE html><html><head><my-component></my-component></head><body></body></html>'
    );
    
    const myComponent = doc.head?.querySelector('my-component');
    expect(myComponent).toBeTruthy();
    expect(myComponent?.parentElement?.tagName).toBe('HEAD');
  });

  it('should still eject non-custom elements like <div> to body', () => {
    const doc = parseHTML(
      '<!DOCTYPE html><html><head><div>test</div></head><body></body></html>'
    );
    
    const divInHead = doc.head?.querySelector('div');
    const divInBody = doc.body?.querySelector('div');
    expect(divInHead).toBeFalsy();
    expect(divInBody).toBeTruthy();
  });

  it('should handle nested custom elements in head', () => {
    const doc = parseHTML(
      '<!DOCTYPE html><html><head><my-wrapper><inner-comp></inner-comp></my-wrapper></head><body></body></html>'
    );
    
    const myWrapper = doc.head?.querySelector('my-wrapper');
    expect(myWrapper).toBeTruthy();
    expect(myWrapper?.parentElement?.tagName).toBe('HEAD');
    
    const innerComp = myWrapper?.querySelector('inner-comp');
    expect(innerComp).toBeTruthy();
  });

  it('should keep custom elements with attributes in head', () => {
    const doc = parseHTML(
      '<!DOCTYPE html><html><head><seo-meta property="og:title" content="Test"></seo-meta></head><body></body></html>'
    );
    
    const seoMeta = doc.head?.querySelector('seo-meta');
    expect(seoMeta).toBeTruthy();
    expect(seoMeta?.getAttribute('property')).toBe('og:title');
    expect(seoMeta?.getAttribute('content')).toBe('Test');
    expect(seoMeta?.parentElement?.tagName).toBe('HEAD');
  });

  it('should keep self-closing custom elements in head', () => {
    const doc = parseHTML(
      '<!DOCTYPE html><html><head><custom-void /></head><body></body></html>'
    );
    
    const customVoid = doc.head?.querySelector('custom-void');
    expect(customVoid).toBeTruthy();
    expect(customVoid?.parentElement?.tagName).toBe('HEAD');
  });

  it('should handle custom elements mixed with standard head elements', () => {
    const doc = parseHTML(
      '<!DOCTYPE html><html><head><title>Test</title><meta-tags></meta-tags><link rel="stylesheet" href="style.css"></head><body></body></html>'
    );
    
    const title = doc.head?.querySelector('title');
    const metaTags = doc.head?.querySelector('meta-tags');
    const link = doc.head?.querySelector('link');
    
    expect(title).toBeTruthy();
    expect(metaTags).toBeTruthy();
    expect(link).toBeTruthy();
  });

  it('should handle custom element containing text in head', () => {
    const doc = parseHTML(
      '<!DOCTYPE html><html><head><inline-script>console.log("test")</inline-script></head><body></body></html>'
    );
    
    const inlineScript = doc.head?.querySelector('inline-script');
    expect(inlineScript).toBeTruthy();
    expect(inlineScript?.parentElement?.tagName).toBe('HEAD');
  });
});
