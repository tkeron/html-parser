import { expect, describe, it } from 'bun:test';
import { parse } from '../../../src/parser';
import { tokenize } from '../../../src/tokenizer';
import type { ASTNode } from '../../../src/parser';


export interface HTML5libTreeTest {
  data: string;
  errors: string[];
  newErrors?: string[];
  documentFragment?: string;
  scriptOff?: boolean;
  scriptOn?: boolean;
  document: string;
}


export function parseHTML5libDATFile(content: string): HTML5libTreeTest[] {
  const tests: HTML5libTreeTest[] = [];
  const sections = content.split('\n\n').filter(section => section.trim());
  
  for (const section of sections) {
    const lines = section.split('\n');
    const test: Partial<HTML5libTreeTest> = {
      errors: [] 
    };
    
    let currentSection = '';
    let currentContent: string[] = [];
    
    for (const line of lines) {
      if (line.startsWith('#')) {
        
        if (currentSection) {
          switch (currentSection) {
            case 'data':
              test.data = currentContent.join('\n');
              break;
            case 'errors':
              test.errors = currentContent.filter(l => l.trim());
              break;
            case 'new-errors':
              test.newErrors = currentContent.filter(l => l.trim());
              break;
            case 'document-fragment':
              test.documentFragment = currentContent.join('\n');
              break;
            case 'document':
              test.document = currentContent.join('\n');
              break;
          }
        }
        
        
        currentSection = line.substring(1);
        currentContent = [];
        
        
        if (currentSection === 'script-off') {
          test.scriptOff = true;
        } else if (currentSection === 'script-on') {
          test.scriptOn = true;
        }
      } else {
        currentContent.push(line);
      }
    }
    
    
    if (currentSection) {
      switch (currentSection) {
        case 'data':
          test.data = currentContent.join('\n');
          break;
        case 'errors':
          test.errors = currentContent.filter(l => l.trim());
          break;
        case 'new-errors':
          test.newErrors = currentContent.filter(l => l.trim());
          break;
        case 'document-fragment':
          test.documentFragment = currentContent.join('\n');
          break;
        case 'document':
          test.document = currentContent.join('\n');
          break;
      }
    }
    
    if (test.data && test.document) {
      tests.push(test as HTML5libTreeTest);
    }
  }
  
  return tests;
}


export function convertASTToHTML5libTree(node: ASTNode, depth: number = 0): string[] {
  const lines: string[] = [];
  const indent = '| ' + '  '.repeat(depth);
  
  switch (node.type) {
    case 'DOCUMENT':
      
      break;
    case 'DOCTYPE':
      lines.push(`${indent}<!DOCTYPE ${node.tagName || 'html'}>`);
      break;
    case 'ELEMENT':
      const tagName = node.tagName || 'unknown';
      lines.push(`${indent}<${tagName}>`);
      
      
      if (node.attributes) {
        for (const [name, value] of Object.entries(node.attributes).sort()) {
          lines.push(`${indent}  ${name}="${value}"`);
        }
      }
      break;
    case 'TEXT':
      if (node.content && node.content.trim()) {
        lines.push(`${indent}"${node.content}"`);
      }
      break;
    case 'COMMENT':
      lines.push(`${indent}<!-- ${node.content || ''} -->`);
      break;
    case 'CDATA':
      lines.push(`${indent}<![CDATA[${node.content || ''}]]>`);
      break;
  }
  
  
  if (node.children) {
    for (const child of node.children) {
      lines.push(...convertASTToHTML5libTree(child, depth + 1));
    }
  }
  
  return lines;
}


export function normalizeHTML5libTree(tree: string): string {
  return tree
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
}


export function runHTML5libTreeTest(test: HTML5libTreeTest, testName: string): void {
  it(testName, () => {
    const { data, document: expectedTree, documentFragment, scriptOff, scriptOn } = test;
    
    
    const tokens = tokenize(data);
    const ast = parse(tokens);
    
    
    const actualTreeLines = convertASTToHTML5libTree(ast);
    const actualTree = actualTreeLines.join('\n');
    
    
    const normalizedActual = normalizeHTML5libTree(actualTree);
    const normalizedExpected = normalizeHTML5libTree(expectedTree);
    
    
    expect(normalizedActual).toBe(normalizedExpected);
  });
}


export function runHTML5libTreeTestSuite(tests: HTML5libTreeTest[], suiteName: string): void {
  describe(`HTML5lib Tree Construction Tests: ${suiteName}`, () => {
    tests.forEach((test, index) => {
      const testName = `Test ${index + 1}: ${test.data.substring(0, 50).replace(/\n/g, ' ')}...`;
      runHTML5libTreeTest(test, testName);
    });
  });
}


export async function loadHTML5libTreeTests(testData: string, suiteName: string): Promise<void> {
  const tests = parseHTML5libDATFile(testData);
  runHTML5libTreeTestSuite(tests, suiteName);
}


export function validateHTML5libTreeTest(test: HTML5libTreeTest): boolean {
  return !!(test.data && test.document && test.errors !== undefined);
}
