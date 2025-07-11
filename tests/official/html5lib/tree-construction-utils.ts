import { expect, describe, it } from 'bun:test';
import { parse } from '../../../src/parser';
import { tokenize } from '../../../src/tokenizer';
import type { ASTNode } from '../../../src/parser';

// HTML5lib tree construction test format
export interface HTML5libTreeTest {
  data: string;
  errors: string[];
  newErrors?: string[];
  documentFragment?: string;
  scriptOff?: boolean;
  scriptOn?: boolean;
  document: string;
}

/**
 * Parses HTML5lib DAT format test files
 */
export function parseHTML5libDATFile(content: string): HTML5libTreeTest[] {
  const tests: HTML5libTreeTest[] = [];
  const sections = content.split('\n\n').filter(section => section.trim());
  
  for (const section of sections) {
    const lines = section.split('\n');
    const test: Partial<HTML5libTreeTest> = {
      errors: [] // Initialize errors as empty array
    };
    
    let currentSection = '';
    let currentContent: string[] = [];
    
    for (const line of lines) {
      if (line.startsWith('#')) {
        // Save previous section
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
        
        // Start new section
        currentSection = line.substring(1);
        currentContent = [];
        
        // Handle script flags
        if (currentSection === 'script-off') {
          test.scriptOff = true;
        } else if (currentSection === 'script-on') {
          test.scriptOn = true;
        }
      } else {
        currentContent.push(line);
      }
    }
    
    // Save last section
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

/**
 * Converts AST to HTML5lib tree format
 */
export function convertASTToHTML5libTree(node: ASTNode, depth: number = 0): string[] {
  const lines: string[] = [];
  const indent = '| ' + '  '.repeat(depth);
  
  switch (node.type) {
    case 'DOCUMENT':
      // Document node doesn't have a line representation
      break;
    case 'DOCTYPE':
      lines.push(`${indent}<!DOCTYPE ${node.tagName || 'html'}>`);
      break;
    case 'ELEMENT':
      const tagName = node.tagName || 'unknown';
      lines.push(`${indent}<${tagName}>`);
      
      // Add attributes
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
  
  // Add children
  if (node.children) {
    for (const child of node.children) {
      lines.push(...convertASTToHTML5libTree(child, depth + 1));
    }
  }
  
  return lines;
}

/**
 * Normalizes HTML5lib tree format for comparison
 */
export function normalizeHTML5libTree(tree: string): string {
  return tree
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
}

/**
 * Runs a single HTML5lib tree construction test
 */
export function runHTML5libTreeTest(test: HTML5libTreeTest, testName: string): void {
  it(testName, () => {
    const { data, document: expectedTree, documentFragment, scriptOff, scriptOn } = test;
    
    // Parse the HTML
    const tokens = tokenize(data);
    const ast = parse(tokens);
    
    // Convert to HTML5lib tree format
    const actualTreeLines = convertASTToHTML5libTree(ast);
    const actualTree = actualTreeLines.join('\n');
    
    // Normalize both trees for comparison
    const normalizedActual = normalizeHTML5libTree(actualTree);
    const normalizedExpected = normalizeHTML5libTree(expectedTree);
    
    // Compare trees
    expect(normalizedActual).toBe(normalizedExpected);
  });
}

/**
 * Runs all tests from an HTML5lib tree construction test suite
 */
export function runHTML5libTreeTestSuite(tests: HTML5libTreeTest[], suiteName: string): void {
  describe(`HTML5lib Tree Construction Tests: ${suiteName}`, () => {
    tests.forEach((test, index) => {
      const testName = `Test ${index + 1}: ${test.data.substring(0, 50).replace(/\n/g, ' ')}...`;
      runHTML5libTreeTest(test, testName);
    });
  });
}

/**
 * Loads and runs HTML5lib tree construction tests from DAT format
 */
export async function loadHTML5libTreeTests(testData: string, suiteName: string): Promise<void> {
  const tests = parseHTML5libDATFile(testData);
  runHTML5libTreeTestSuite(tests, suiteName);
}

/**
 * Validates HTML5lib tree construction test format
 */
export function validateHTML5libTreeTest(test: HTML5libTreeTest): boolean {
  return !!(test.data && test.document && test.errors !== undefined);
}
