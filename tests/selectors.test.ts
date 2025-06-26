import { describe, it, expect } from 'bun:test';
import { querySelector, querySelectorAll } from '../src/css-selector';
import { parseHTML } from '../index';
import type { Element, Document } from '../src/dom-simulator';

describe('CSS Selectors', () => {
    const htmlContent = `
        <html>
            <body>
                <p id="intro" class="first">
                    <span class="highlight">Hello</span>
                </p>
                <p class="second">World</p>
                <div>
                    <p class="note">Note</p>
                </div>
            </body>
        </html>
    `;
    
    const doc: Document = parseHTML(htmlContent);

    describe('querySelectorAll', () => {
        it('should be a function', () => {
            expect(typeof querySelectorAll).toBe('function');
        });

        it('should find all elements by tag name', () => {
            const paragraphs = querySelectorAll(doc, 'p');
            expect(paragraphs.length).toBe(3);
            expect(paragraphs[0]!.attributes.class).toBe('first');
            expect(paragraphs[1]!.attributes.class).toBe('second');
            expect(paragraphs[2]!.attributes.class).toBe('note');
        });

        it('should find all elements by class name', () => {
            const second = querySelectorAll(doc, '.second');
            expect(second.length).toBe(1);
            expect(second[0]!.tagName).toBe('P');
        });
    });

    describe('querySelector', () => {
        it('should be a function', () => {
            expect(typeof querySelector).toBe('function');
        });

        it('should find the first element by tag name', () => {
            const firstParagraph = querySelector(doc, 'p');
            expect(firstParagraph).not.toBeNull();
            expect(firstParagraph?.attributes.id).toBe('intro');
        });

        it('should find an element by ID', () => {
            const intro = querySelector(doc, '#intro');
            expect(intro).not.toBeNull();
            expect(intro?.tagName).toBe('P');
        });

        it('should return null if no element is found', () => {
            const nonExistent = querySelector(doc, '#nonexistent');
            expect(nonExistent).toBeNull();
        });
    });
});