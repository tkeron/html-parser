import { describe, it, expect } from 'bun:test';
import { parseHTML } from '../index.js';

describe('API Integration Tests - Real DOM Usage', () => {
    it('should work like real DOM API - querySelector and setAttribute integrated', () => {
        // Parse HTML document
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

        // Test Document methods
        expect(typeof doc.querySelector).toBe('function');
        expect(typeof doc.querySelectorAll).toBe('function');
        expect(typeof doc.createElement).toBe('function');
        expect(typeof doc.createTextNode).toBe('function');

        // Find elements using querySelector (integrated method)
        const container = doc.querySelector('#container');
        expect(container).toBeTruthy();
        expect(container?.tagName).toBe('DIV');

        // Test Element methods
        expect(typeof container?.querySelector).toBe('function');
        expect(typeof container?.setAttribute).toBe('function');
        expect(typeof container?.getAttribute).toBe('function');

        // Use querySelector on element (not document)
        const h1 = container?.querySelector('h1');
        expect(h1).toBeTruthy();
        expect(h1?.tagName).toBe('H1');
        expect(h1?.textContent).toBe('Welcome');

        // Modify attributes using integrated methods
        h1?.setAttribute('class', 'title');
        expect(h1?.getAttribute('class')).toBe('title');
        expect(h1?.hasAttribute('class')).toBe(true);

        // Find multiple elements
        const allLi = doc.querySelectorAll('li');
        expect(allLi.length).toBe(2);
        expect(allLi[0]?.tagName).toBe('LI');
        expect(allLi[1]?.tagName).toBe('LI');

        // Test appendChild integrated method
        const newElement = doc.createElement('span');
        newElement.setAttribute('id', 'new-span');
        container?.appendChild(newElement);

        // Verify the new element was added
        const spanElement = container?.querySelector('#new-span');
        expect(spanElement).toBeTruthy();
        expect(spanElement?.tagName).toBe('SPAN');
        expect(spanElement?.getAttribute('id')).toBe('new-span');
    });

    it('should work for complex DOM manipulation scenarios', () => {
        const doc = parseHTML('<div><p>Hello</p></div>');
        
        // Get the div using document.querySelector
        const div = doc.querySelector('div');
        expect(div).toBeTruthy();
        
        // Get the p using div.querySelector  
        const p = div?.querySelector('p');
        expect(p).toBeTruthy();
        expect(p?.textContent).toBe('Hello');
        
        // Modify attributes
        p?.setAttribute('class', 'greeting');
        expect(p?.getAttribute('class')).toBe('greeting');
        
        // Create new elements
        const span = doc.createElement('span');
        span.setAttribute('id', 'dynamic');
        
        // Add to DOM
        div?.appendChild(span);
        
        // Find it again
        const foundSpan = div?.querySelector('#dynamic');
        expect(foundSpan).toBeTruthy();
        expect(foundSpan?.getAttribute('id')).toBe('dynamic');
    });

    it('should handle removeChild correctly', () => {
        const doc = parseHTML('<div><p>First</p><span>Second</span></div>');
        const div = doc.querySelector('div');
        const p = div?.querySelector('p');
        
        // Verify initial state
        expect(div?.childNodes.length).toBe(2);
        expect(p?.textContent).toBe('First');
        
        // Remove the p element
        if (p) {
            div?.removeChild(p);
        }
        
        // Verify it was removed
        expect(div?.childNodes.length).toBe(1);
        expect(div?.querySelector('p')).toBe(null);
        expect(div?.querySelector('span')).toBeTruthy();
    });

    it('should demonstrate clean API without helper functions', () => {
        // This test demonstrates that users don't need to import helper functions
        // Everything works through the objects themselves
        const doc = parseHTML('<html><body><div id="test">Content</div></body></html>');
        
        // No need for: import { querySelector, getAttribute } from 'html-parser'
        // Everything is available on the objects:
        
        const testDiv = doc.querySelector('#test');           // ✅ Works
        testDiv?.setAttribute('class', 'active');             // ✅ Works  
        const className = testDiv?.getAttribute('class');     // ✅ Works
        const bodyDiv = doc.body?.querySelector('#test');     // ✅ Works
        
        expect(testDiv).toBeTruthy();
        expect(className).toBe('active');
        expect(bodyDiv).toBeTruthy();
        expect(testDiv === bodyDiv).toBe(true); // Same element
    });
});
