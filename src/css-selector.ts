import type { Element, Node } from './dom-simulator';

interface SelectorToken {
    type: 'tag' | 'class' | 'id';
    value: string;
}

function parseSelector(selector: string): SelectorToken[] {
    const trimmed = selector.trim();
    if (trimmed.startsWith('#')) {
        return [{ type: 'id', value: trimmed.slice(1) }];
    } else if (trimmed.startsWith('.')) {
        return [{ type: 'class', value: trimmed.slice(1) }];
    } else {
        return [{ type: 'tag', value: trimmed.toLowerCase() }];
    }
}

function matchesToken(element: Element, token: SelectorToken): boolean {
    switch (token.type) {
        case 'tag':
            return element.tagName.toLowerCase() === token.value;
        case 'class':
            const classAttr = element.attributes.class || element.attributes.className || '';
            const classes = classAttr.split(/\s+/).filter(Boolean);
            return classes.includes(token.value);
        case 'id':
            return element.attributes.id === token.value;
        default:
            return false;
    }
}

function matchesSelector(element: Element, tokens: SelectorToken[]): boolean {
    return tokens.every(token => matchesToken(element, token));
}

function findElements(node: Node, tokens: SelectorToken[], results: Element[]): void {
    if (node.nodeType === 1) {
        const element = node as Element;
        if (matchesSelector(element, tokens)) {
            results.push(element);
        }
    }
    for (const child of node.childNodes) {
        findElements(child, tokens, results);
    }
}

export function querySelectorAll(root: Node, selector: string): Element[] {
    const tokens = parseSelector(selector);
    const results: Element[] = [];
    findElements(root, tokens, results);
    return results;
}

export function querySelector(root: Node, selector: string): Element | null {
    const results = querySelectorAll(root, selector);
    return results[0] || null;
}
