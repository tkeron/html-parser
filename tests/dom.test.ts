import { describe, it, expect } from 'bun:test';
import { parseHTML } from '../index';
import { NodeType } from '../src/dom-simulator';

describe('DOM Simulator - Phase 1: Structure and Conversion', () => {
    describe('parseHTML basic functionality', () => {
        it('should return a Document object', () => {
            const doc = parseHTML('<p>Hello</p>');
            expect(doc.nodeType).toBe(NodeType.DOCUMENT_NODE);
            expect(doc.nodeName).toBe('#document');
        });

        it('should parse simple HTML elements', () => {
            const doc = parseHTML('<p>Hello World</p>');
            
            expect(doc.childNodes.length).toBe(1);
            const paragraph = doc.childNodes[0]!;
            
            expect(paragraph.nodeType).toBe(NodeType.ELEMENT_NODE);
            expect(paragraph.nodeName).toBe('P');
            expect((paragraph as any).tagName).toBe('p');
        });

        it('should parse text content correctly', () => {
            const doc = parseHTML('<p>Hello World</p>');
            const paragraph = doc.childNodes[0]!;
            
            expect(paragraph.childNodes.length).toBe(1);
            const textNode = paragraph.childNodes[0]!;
            
            expect(textNode.nodeType).toBe(NodeType.TEXT_NODE);
            expect(textNode.nodeName).toBe('#text');
            expect(textNode.nodeValue).toBe('Hello World');
        });

        it('should parse nested elements', () => {
            const doc = parseHTML('<div><p>Hello</p><span>World</span></div>');
            
            const div = doc.childNodes[0]!;
            expect(div.nodeName).toBe('DIV');
            expect(div.childNodes.length).toBe(2);
            
            const p = div.childNodes[0]!;
            const span = div.childNodes[1]!;
            
            expect(p.nodeName).toBe('P');
            expect(span.nodeName).toBe('SPAN');
        });

        it('should handle attributes correctly', () => {
            const doc = parseHTML('<p id="test" class="highlight">Content</p>');
            const paragraph = doc.childNodes[0]! as any;
            
            expect(paragraph.attributes.id).toBe('test');
            expect(paragraph.attributes.class).toBe('highlight');
        });

        it('should parse comments', () => {
            const doc = parseHTML('<!-- This is a comment --><p>Hello</p>');
            
            expect(doc.childNodes.length).toBe(2);
            const comment = doc.childNodes[0]!;
            
            expect(comment.nodeType).toBe(NodeType.COMMENT_NODE);
            expect(comment.nodeName).toBe('#comment');
            expect(comment.nodeValue).toBe(' This is a comment ');
        });

        it('should set parent-child relationships correctly', () => {
            const doc = parseHTML('<div><p>Hello</p></div>');
            
            const div = doc.childNodes[0]!;
            const p = div.childNodes[0]!;
            
            expect(p.parentNode).toBe(div);
            expect(div.parentNode).toBe(doc);
            expect(div.firstChild).toBe(p);
            expect(div.lastChild).toBe(p);
        });

        it('should set sibling relationships correctly', () => {
            const doc = parseHTML('<div><p>First</p><span>Second</span><em>Third</em></div>');
            
            const div = doc.childNodes[0]!;
            const p = div.childNodes[0]!;
            const span = div.childNodes[1]!;
            const em = div.childNodes[2]!;
            
            expect(p.nextSibling).toBe(span);
            expect(span.previousSibling).toBe(p);
            expect(span.nextSibling).toBe(em);
            expect(em.previousSibling).toBe(span);
            
            expect(p.previousSibling).toBeNull();
            expect(em.nextSibling).toBeNull();
        });

        it('should handle self-closing elements', () => {
            const doc = parseHTML('<p>Before<br/>After</p>');
            
            const p = doc.childNodes[0]!;
            expect(p.childNodes.length).toBe(3); // "Before", <br>, "After"
            
            const br = p.childNodes[1]!;
            expect(br.nodeName).toBe('BR');
            expect(br.childNodes.length).toBe(0);
        });

        it('should handle empty elements', () => {
            const doc = parseHTML('<div></div>');
            
            const div = doc.childNodes[0]!;
            expect(div.childNodes.length).toBe(0);
            expect(div.firstChild).toBeNull();
            expect(div.lastChild).toBeNull();
        });
    });

    describe('Document special properties', () => {
        it('should identify documentElement (html)', () => {
            const doc = parseHTML('<html><head></head><body></body></html>');
            
            expect(doc.documentElement).toBeTruthy();
            expect((doc.documentElement as any)?.tagName).toBe('html');
        });

        it('should identify body element', () => {
            const doc = parseHTML('<html><body><p>Content</p></body></html>');
            
            expect(doc.body).toBeTruthy();
            expect((doc.body as any)?.tagName).toBe('body');
        });

        it('should identify head element', () => {
            const doc = parseHTML('<html><head><title>Test</title></head></html>');
            
            expect(doc.head).toBeTruthy();
            expect((doc.head as any)?.tagName).toBe('head');
        });
    });
});
