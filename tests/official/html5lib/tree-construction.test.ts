import { describe, it, expect } from 'bun:test';
import { 
  loadHTML5libTreeTests, 
  runHTML5libTreeTestSuite,
  parseHTML5libDATFile,
  type HTML5libTreeTest 
} from './tree-construction-utils';

// Sample HTML5lib tree construction tests in DAT format
const basicTreeTestData = `#data
Test
#errors
(1,0): expected-doctype-but-got-chars
#document
| <html>
|   <head>
|   <body>
|     "Test"

#data
<p>One<p>Two
#errors
(1,3): expected-doctype-but-got-start-tag
#document
| <html>
|   <head>
|   <body>
|     <p>
|       "One"
|     <p>
|       "Two"

#data
<html>
#errors
(1,6): expected-doctype-but-got-start-tag
#document
| <html>
|   <head>
|   <body>

#data
<head>
#errors
(1,6): expected-doctype-but-got-start-tag
#document
| <html>
|   <head>
|   <body>

#data
<body>
#errors
(1,6): expected-doctype-but-got-start-tag
#document
| <html>
|   <head>
|   <body>

#data
<html><head></head><body></body>
#errors
(1,6): expected-doctype-but-got-start-tag
#document
| <html>
|   <head>
|   <body>

#data
Line1<br>Line2
#errors
(1,0): expected-doctype-but-got-chars
#document
| <html>
|   <head>
|   <body>
|     "Line1"
|     <br>
|     "Line2"

#data
<div>hello</div>
#errors
(1,5): expected-doctype-but-got-start-tag
#document
| <html>
|   <head>
|   <body>
|     <div>
|       "hello"

#data
<p><b>bold</b></p>
#errors
(1,3): expected-doctype-but-got-start-tag
#document
| <html>
|   <head>
|   <body>
|     <p>
|       <b>
|         "bold"

#data
<!--comment-->
#errors
(1,0): expected-doctype-but-got-chars
#document
| <html>
|   <head>
|   <body>
| <!-- comment -->`;

const doctypeTestData = `#data
<!DOCTYPE html>
#errors
#document
| <!DOCTYPE html>
| <html>
|   <head>
|   <body>

#data
<!DOCTYPE html><html><head><title>Test</title></head><body><p>Hello</p></body></html>
#errors
#document
| <!DOCTYPE html>
| <html>
|   <head>
|     <title>
|       "Test"
|   <body>
|     <p>
|       "Hello"

#data
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">
#errors
#document
| <!DOCTYPE html>
| <html>
|   <head>
|   <body>

#data
<!DOCTYPE html SYSTEM "about:legacy-compat">
#errors
#document
| <!DOCTYPE html>
| <html>
|   <head>
|   <body>`;

const errorHandlingTestData = `#data
<b><table><td></b><i></table>
#errors
(1,3): expected-doctype-but-got-start-tag
(1,14): unexpected-cell-in-table-body
(1,18): unexpected-end-tag
(1,29): unexpected-cell-end-tag
(1,29): expected-closing-tag-but-got-eof
#document
| <html>
|   <head>
|   <body>
|     <b>
|       <table>
|         <tbody>
|           <tr>
|             <td>
|               <i>

#data
<p><b><div><marquee></p></b></div>
#errors
(1,3): expected-doctype-but-got-start-tag
(1,11): unexpected-end-tag
(1,24): unexpected-end-tag
(1,28): unexpected-end-tag
(1,34): end-tag-too-early
(1,34): expected-closing-tag-but-got-eof
#document
| <html>
|   <head>
|   <body>
|     <p>
|       <b>
|     <div>
|       <b>
|         <marquee>
|           <p>

#data
<a><p><a></a></p></a>
#errors
(1,3): expected-doctype-but-got-start-tag
(1,9): unexpected-start-tag-implies-end-tag
(1,9): adoption-agency-1.3
(1,21): unexpected-end-tag
#document
| <html>
|   <head>
|   <body>
|     <a>
|     <p>
|       <a>
|     <a>`;

// Run the embedded tests
describe('HTML5lib Tree Construction Tests', () => {
  it('should parse DAT format correctly', () => {
    const tests = parseHTML5libDATFile(basicTreeTestData);
    expect(tests.length).toBeGreaterThan(0);
    
    // Check first test
    const firstTest = tests[0];
    if (firstTest) {
      expect(firstTest.data).toBe('Test');
      expect(firstTest.errors.length).toBeGreaterThan(0);
      expect(firstTest.document).toContain('<html>');
    }
  });
  
  it('should handle doctype tests', () => {
    const tests = parseHTML5libDATFile(doctypeTestData);
    expect(tests.length).toBeGreaterThan(0);
    
    // Check first doctype test
    const firstTest = tests[0];
    if (firstTest) {
      expect(firstTest.data).toBe('<!DOCTYPE html>');
      expect(firstTest.errors.length).toBe(0);
      expect(firstTest.document).toContain('<!DOCTYPE html>');
    }
  });
  
  it('should handle error cases', () => {
    const tests = parseHTML5libDATFile(errorHandlingTestData);
    expect(tests.length).toBeGreaterThan(0);
    
    // Check error handling
    const firstTest = tests[0];
    if (firstTest) {
      expect(firstTest.errors.length).toBeGreaterThan(0);
      expect(firstTest.errors[0]).toContain('expected-doctype-but-got-start-tag');
    }
  });
});

// Test for loading external test files (when available)
describe.skip('HTML5lib External Tree Tests', () => {
  it('should be able to load external DAT files', async () => {
    // This would be used to load actual HTML5lib test files
    // const testData = await Bun.file('/path/to/tests1.dat').text();
    // await loadHTML5libTreeTests(testData, 'External Tree Test');
    
    // For now, we'll just verify our utilities work
    await loadHTML5libTreeTests(basicTreeTestData, 'Loaded Basic Tree Tests');
  });
});

// Individual test suites for different aspects
describe.skip('HTML5lib Tree Construction - Basic Elements', () => {
  const tests = parseHTML5libDATFile(basicTreeTestData);
  runHTML5libTreeTestSuite(tests, 'Basic Elements');
});

describe.skip('HTML5lib Tree Construction - DOCTYPE Handling', () => {
  const tests = parseHTML5libDATFile(doctypeTestData);
  runHTML5libTreeTestSuite(tests, 'DOCTYPE Handling');
});

describe.skip('HTML5lib Tree Construction - Error Handling', () => {
  const tests = parseHTML5libDATFile(errorHandlingTestData);
  runHTML5libTreeTestSuite(tests, 'Error Handling');
});
