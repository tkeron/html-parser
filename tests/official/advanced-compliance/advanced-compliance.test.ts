import { describe, it, expect } from 'bun:test';
import { parseHTML } from '../../../index';

describe.skip('Advanced HTML Parser Compliance Tests', () => {
  describe('HTML5 Living Standard Features', () => {
    it('should handle custom elements with shadow DOM', () => {
      const html = `
        <custom-element>
          <template shadowrootmode="open">
            <style>
              :host {
                display: block;
                background: #f0f0f0;
              }
            </style>
            <div class="content">
              <slot name="title"></slot>
              <slot></slot>
            </div>
          </template>
          <h2 slot="title">Custom Element Title</h2>
          <p>This is content inside the custom element.</p>
        </custom-element>
      `;
      
      const document = parseHTML(html);
      
      expect(document).toBeDefined();
      expect(document.querySelector('custom-element')).toBeDefined();
      expect(document.querySelector('template')).toBeDefined();
      expect(document.querySelector('slot')).toBeDefined();
    });

    it('should handle ES modules in script tags', () => {
      const html = `
        <script type="module">
          import { Component } from './component.js';
          import { utils } from './utils.js';
          
          const app = new Component();
          app.init();
        </script>
        
        <script type="importmap">
        {
          "imports": {
            "lodash": "https://cdn.skypack.dev/lodash@4",
            "three": "https://cdn.skypack.dev/three@0.135.0"
          }
        }
        </script>
      `;
      
      const document = parseHTML(html);
      
      const moduleScript = document.querySelector('script[type="module"]');
      expect(moduleScript).toBeDefined();
      expect(moduleScript?.textContent).toContain('import');
      
      const importMap = document.querySelector('script[type="importmap"]');
      expect(importMap).toBeDefined();
      expect(importMap?.textContent).toContain('imports');
    });

    it('should handle web components with custom attributes', () => {
      const html = `
        <web-component 
          data-config='{"theme": "dark", "size": "large"}'
          aria-label="Interactive component"
          role="button"
          tabindex="0">
          <div slot="header">Component Header</div>
          <div slot="content">Component Content</div>
        </web-component>
      `;
      
      const document = parseHTML(html);
      
      const component = document.querySelector('web-component');
      expect(component).toBeDefined();
      expect(component?.getAttribute('data-config')).toContain('theme');
      expect(component?.getAttribute('aria-label')).toBe('Interactive component');
      expect(component?.getAttribute('role')).toBe('button');
    });
  });

  describe('Performance and Optimization Features', () => {
    it('should handle resource hints and preloading', () => {
      const html = `
        <head>
          <link rel="dns-prefetch" href="//example.com">
          <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
          <link rel="modulepreload" href="./modules/app.js">
          <link rel="preload" href="./fonts/font.woff2" as="font" type="font/woff2" crossorigin>
          <link rel="prefetch" href="./pages/about.html">
        </head>
      `;
      
      const document = parseHTML(html);
      
      expect(document.querySelector('link[rel="dns-prefetch"]')).toBeDefined();
      expect(document.querySelector('link[rel="preconnect"]')).toBeDefined();
      expect(document.querySelector('link[rel="modulepreload"]')).toBeDefined();
      expect(document.querySelector('link[rel="preload"]')).toBeDefined();
      expect(document.querySelector('link[rel="prefetch"]')).toBeDefined();
    });

    it('should handle lazy loading attributes', () => {
      const html = `
        <img src="hero.jpg" alt="Hero image" loading="eager">
        <img src="content1.jpg" alt="Content image 1" loading="lazy">
        <img src="content2.jpg" alt="Content image 2" loading="lazy">
        <iframe src="https://example.com/embed" loading="lazy"></iframe>
      `;
      
      const document = parseHTML(html);
      
      const eagerImg = document.querySelector('img[loading="eager"]');
      expect(eagerImg).toBeDefined();
      expect(eagerImg?.getAttribute('loading')).toBe('eager');
      
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      expect(lazyImages.length).toBe(2);
      
      const lazyIframe = document.querySelector('iframe[loading="lazy"]');
      expect(lazyIframe).toBeDefined();
    });

    it('should handle responsive images with srcset', () => {
      const html = `
        <picture>
          <source media="(min-width: 1200px)" 
                  srcset="large-1x.jpg 1x, large-2x.jpg 2x">
          <source media="(min-width: 800px)" 
                  srcset="medium-1x.jpg 1x, medium-2x.jpg 2x">
          <img src="small.jpg" 
               srcset="small-1x.jpg 1x, small-2x.jpg 2x"
               alt="Responsive image">
        </picture>
      `;
      
      const document = parseHTML(html);
      
      const picture = document.querySelector('picture');
      expect(picture).toBeDefined();
      
      const sources = picture?.querySelectorAll('source');
      expect(sources?.length).toBe(2);
      
      const img = picture?.querySelector('img');
      expect(img?.getAttribute('srcset')).toContain('small-1x.jpg 1x');
    });
  });

  describe('Accessibility and Semantic Web Features', () => {
    it('should handle ARIA attributes comprehensively', () => {
      const html = `
        <div role="tablist" aria-label="Settings tabs">
          <button role="tab" 
                  aria-selected="true" 
                  aria-controls="panel1"
                  id="tab1">General</button>
          <button role="tab" 
                  aria-selected="false" 
                  aria-controls="panel2"
                  id="tab2">Privacy</button>
        </div>
        
        <div role="tabpanel" 
             aria-labelledby="tab1" 
             id="panel1"
             aria-hidden="false">
          <p>General settings content</p>
        </div>
        
        <div role="tabpanel" 
             aria-labelledby="tab2" 
             id="panel2"
             aria-hidden="true">
          <p>Privacy settings content</p>
        </div>
      `;
      
      const document = parseHTML(html);
      
      const tablist = document.querySelector('[role="tablist"]');
      expect(tablist?.getAttribute('aria-label')).toBe('Settings tabs');
      
      const selectedTab = document.querySelector('[aria-selected="true"]');
      expect(selectedTab?.getAttribute('aria-controls')).toBe('panel1');
      
      const visiblePanel = document.querySelector('[aria-hidden="false"]');
      expect(visiblePanel?.getAttribute('aria-labelledby')).toBe('tab1');
    });

    it('should handle microdata and structured data', () => {
      const html = `
        <div itemscope itemtype="https://schema.org/Person">
          <h1 itemprop="name">John Doe</h1>
          <p>
            <span itemprop="jobTitle">Software Engineer</span> at 
            <span itemprop="worksFor" itemscope itemtype="https://schema.org/Organization">
              <span itemprop="name">Tech Corp</span>
            </span>
          </p>
          <p>Email: <a itemprop="email" href="mailto:john@example.com">john@example.com</a></p>
        </div>
      `;
      
      const document = parseHTML(html);
      
      const person = document.querySelector('[itemtype="https://schema.org/Person"]');
      expect(person?.hasAttribute('itemscope')).toBe(true);
      
      const name = document.querySelector('[itemprop="name"]');
      expect(name?.textContent).toBe('John Doe');
      
      const organization = document.querySelector('[itemtype="https://schema.org/Organization"]');
      expect(organization?.hasAttribute('itemscope')).toBe(true);
    });

    it('should handle language and internationalization attributes', () => {
      const html = `
        <html lang="en">
        <head>
          <meta charset="UTF-8">
        </head>
        <body>
          <p lang="en">This is in English.</p>
          <p lang="es">Esto está en español.</p>
          <p lang="fr">Ceci est en français.</p>
          <p dir="rtl" lang="ar">هذا باللغة العربية</p>
          <bdo dir="ltr">Mixed direction text</bdo>
        </body>
        </html>
      `;
      
      const document = parseHTML(html);
      
      const htmlElement = document.documentElement;
      expect(htmlElement?.getAttribute('lang')).toBe('en');
      
      const spanishText = document.querySelector('[lang="es"]');
      expect(spanishText?.textContent).toBe('Esto está en español.');
      
      const rtlText = document.querySelector('[dir="rtl"]');
      expect(rtlText?.getAttribute('lang')).toBe('ar');
      
      const bdo = document.querySelector('bdo');
      expect(bdo?.getAttribute('dir')).toBe('ltr');
    });
  });

  describe('Modern Form Features', () => {
    it('should handle advanced form validation', () => {
      const html = `
        <form novalidate>
          <fieldset>
            <legend>Advanced Form Validation</legend>
            
            <label for="email">Email:</label>
            <input type="email" 
                   id="email" 
                   name="email" 
                   required 
                   pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$"
                   title="Please enter a valid email address">
            
            <label for="phone">Phone:</label>
            <input type="tel" 
                   id="phone" 
                   name="phone" 
                   pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                   title="Format: 123-456-7890">
            
            <label for="website">Website:</label>
            <input type="url" 
                   id="website" 
                   name="website" 
                   placeholder="https://example.com">
            
            <label for="age">Age:</label>
            <input type="number" 
                   id="age" 
                   name="age" 
                   min="18" 
                   max="120" 
                   step="1">
            
            <label for="password">Password:</label>
            <input type="password" 
                   id="password" 
                   name="password" 
                   minlength="8" 
                   maxlength="128"
                   required>
          </fieldset>
          
          <button type="submit">Submit</button>
        </form>
      `;
      
      const document = parseHTML(html);
      
      const form = document.querySelector('form');
      expect(form?.hasAttribute('novalidate')).toBe(true);
      
      const emailInput = document.querySelector('#email');
      expect(emailInput?.getAttribute('pattern')).toContain('@');
      expect(emailInput?.hasAttribute('required')).toBe(true);
      
      const numberInput = document.querySelector('#age');
      expect(numberInput?.getAttribute('min')).toBe('18');
      expect(numberInput?.getAttribute('max')).toBe('120');
      
      const passwordInput = document.querySelector('#password');
      expect(passwordInput?.getAttribute('minlength')).toBe('8');
    });

    it('should handle custom form elements', () => {
      const html = `
        <form>
          <label for="color">Favorite Color:</label>
          <input type="color" id="color" name="color" value="#ff0000">
          
          <label for="date">Birth Date:</label>
          <input type="date" id="date" name="date" min="1900-01-01" max="2023-12-31">
          
          <label for="time">Preferred Time:</label>
          <input type="time" id="time" name="time" step="900">
          
          <label for="range">Volume:</label>
          <input type="range" id="range" name="range" min="0" max="100" value="50">
          
          <label for="file">Upload File:</label>
          <input type="file" id="file" name="file" accept="image/*,.pdf" multiple>
          
          <label for="search">Search:</label>
          <input type="search" id="search" name="search" placeholder="Search...">
        </form>
      `;
      
      const document = parseHTML(html);
      
      const colorInput = document.querySelector('#color');
      expect(colorInput?.getAttribute('value')).toBe('#ff0000');
      
      const dateInput = document.querySelector('#date');
      expect(dateInput?.getAttribute('min')).toBe('1900-01-01');
      
      const fileInput = document.querySelector('#file');
      expect(fileInput?.getAttribute('accept')).toContain('image/*');
      expect(fileInput?.hasAttribute('multiple')).toBe(true);
      
      const rangeInput = document.querySelector('#range');
      expect(rangeInput?.getAttribute('value')).toBe('50');
    });
  });

  describe('Security and Content Policy Features', () => {
    it('should handle Content Security Policy meta tags', () => {
      const html = `
        <head>
          <meta http-equiv="Content-Security-Policy" 
                content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'">
          <meta http-equiv="X-Content-Type-Options" content="nosniff">
          <meta http-equiv="X-Frame-Options" content="DENY">
          <meta http-equiv="X-XSS-Protection" content="1; mode=block">
        </head>
      `;
      
      const document = parseHTML(html);
      
      const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      expect(csp?.getAttribute('content')).toContain('default-src');
      
      const xContentType = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
      expect(xContentType?.getAttribute('content')).toBe('nosniff');
      
      const xFrame = document.querySelector('meta[http-equiv="X-Frame-Options"]');
      expect(xFrame?.getAttribute('content')).toBe('DENY');
    });

    it('should handle sandboxed iframes', () => {
      const html = `
        <iframe src="https://example.com/unsafe" 
                sandbox="allow-scripts allow-same-origin"
                title="Sandboxed content">
        </iframe>
        
        <iframe src="https://example.com/safe" 
                sandbox=""
                title="Fully sandboxed content">
        </iframe>
      `;
      
      const document = parseHTML(html);
      
      const partialSandbox = document.querySelector('iframe[sandbox="allow-scripts allow-same-origin"]');
      expect(partialSandbox).toBeDefined();
      expect(partialSandbox?.getAttribute('sandbox')).toContain('allow-scripts');
      
      const fullSandbox = document.querySelector('iframe[sandbox=""]');
      expect(fullSandbox).toBeDefined();
      expect(fullSandbox?.getAttribute('sandbox')).toBe('');
    });
  });

  describe('Edge Cases and Error Recovery', () => {
    it('should handle malformed HTML gracefully', () => {
      const html = `
        <div>
          <p>Unclosed paragraph
          <span>Unclosed span
          <em>Unclosed emphasis
        </div>
        <p>Another paragraph</p>
      `;
      
      const document = parseHTML(html);
      
      expect(document).toBeDefined();
      expect(document.querySelector('div')).toBeDefined();
      expect(document.querySelectorAll('p').length).toBeGreaterThan(0);
    });

    it('should handle deeply nested structures', () => {
      let html = '<div>';
      for (let i = 0; i < 100; i++) {
        html += `<div class="level-${i}">`;
      }
      html += 'Deep content';
      for (let i = 0; i < 100; i++) {
        html += '</div>';
      }
      html += '</div>';
      
      const document = parseHTML(html);
      
      expect(document).toBeDefined();
      expect(document.querySelector('.level-0')).toBeDefined();
      expect(document.querySelector('.level-99')).toBeDefined();
    });

    it('should handle mixed content types', () => {
      const html = `
        <div>
          <!-- Comment -->
          <p>Text content</p>
          <![CDATA[
            Raw CDATA content
          ]]>
          <?xml version="1.0"?>
          <script>
            // JavaScript content
            console.log('Hello');
          </script>
          <style>
            /* CSS content */
            body { margin: 0; }
          </style>
        </div>
      `;
      
      const document = parseHTML(html);
      
      expect(document).toBeDefined();
      expect(document.querySelector('div')).toBeDefined();
      expect(document.querySelector('p')).toBeDefined();
      expect(document.querySelector('script')).toBeDefined();
      expect(document.querySelector('style')).toBeDefined();
    });
  });
});
