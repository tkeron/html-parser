import { describe, it, expect } from 'bun:test';
import { parseHTML } from '../index';

describe('API Integration Tests - Real DOM Usage', () => {
    it('should work like real DOM API - querySelector and setAttribute integrated', () => {
        const doc = parseHTML(`
            <html>
                <head>
                    <title>Test Document</title>
                </head>
                <body>
                    <div id="container" class="main">
                        <h1>Welcome</h1>
                        <p class="intro">This is a paragraph.</p>
                        <ul>
                            <li>Item 1</li>
                            <li>Item 2</li>
                        </ul>
                    </div>
                </body>
            </html>
        `);

        expect(typeof doc.querySelector).toBe('function');
        expect(typeof doc.querySelectorAll).toBe('function');
        expect(typeof doc.createElement).toBe('function');
        expect(typeof doc.createTextNode).toBe('function');

        const container = doc.querySelector('#container');
        expect(container).toBeTruthy();
        expect(container?.tagName).toBe('DIV');

        expect(typeof container?.querySelector).toBe('function');
        expect(typeof container?.setAttribute).toBe('function');
        expect(typeof container?.getAttribute).toBe('function');

        const h1 = container?.querySelector('h1');
        expect(h1).toBeTruthy();
        expect(h1?.tagName).toBe('H1');
        expect(h1?.textContent).toBe('Welcome');

        h1?.setAttribute('class', 'title');
        expect(h1?.getAttribute('class')).toBe('title');
        expect(h1?.hasAttribute('class')).toBe(true);

        const allLi = doc.querySelectorAll('li');
        expect(allLi.length).toBe(2);
        expect(allLi[0]?.tagName).toBe('LI');
        expect(allLi[1]?.tagName).toBe('LI');

        const newElement = doc.createElement('span');
        newElement.setAttribute('id', 'new-span');
        container?.appendChild(newElement);

        const spanElement = container?.querySelector('#new-span');
        expect(spanElement).toBeTruthy();
        expect(spanElement?.tagName).toBe('SPAN');
        expect(spanElement?.getAttribute('id')).toBe('new-span');
    });

    it('should work for complex DOM manipulation scenarios', () => {
        const doc = parseHTML('<div><p>Hello</p></div>');
        
        const div = doc.querySelector('div');
        expect(div).toBeTruthy();
        
        const p = div?.querySelector('p');
        expect(p).toBeTruthy();
        expect(p?.textContent).toBe('Hello');
        
        p?.setAttribute('class', 'greeting');
        expect(p?.getAttribute('class')).toBe('greeting');
        
        const span = doc.createElement('span');
        span.setAttribute('id', 'dynamic');
        
        div?.appendChild(span);
        
        const foundSpan = div?.querySelector('#dynamic');
        expect(foundSpan).toBeTruthy();
        expect(foundSpan?.getAttribute('id')).toBe('dynamic');
    });

    it('should handle removeChild correctly', () => {
        const doc = parseHTML('<div><p>First</p><span>Second</span></div>');
        const div = doc.querySelector('div');
        const p = div?.querySelector('p');
        
        expect(div?.childNodes.length).toBe(2);
        expect(p?.textContent).toBe('First');
        
        if (p) {
            div?.removeChild(p);
        }
        
        expect(div?.childNodes.length).toBe(1);
        expect(div?.querySelector('p')).toBe(null);
        expect(div?.querySelector('span')).toBeTruthy();
    });

    it('should demonstrate clean API without helper functions', () => {
        const doc = parseHTML('<html><body><div id="test">Content</div></body></html>');
        
        const testDiv = doc.querySelector('#test');
        testDiv?.setAttribute('class', 'active');
        const className = testDiv?.getAttribute('class');
        const bodyDiv = doc.body?.querySelector('#test');
        
        expect(testDiv).toBeTruthy();
        expect(className).toBe('active');
        expect(bodyDiv).toBeTruthy();
        expect(testDiv === bodyDiv).toBe(true);
    });
});
