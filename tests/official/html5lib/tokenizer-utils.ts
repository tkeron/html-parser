import { expect, describe, it } from 'bun:test';
import { tokenize, TokenType } from '../../../src/tokenizer';
import type { Token } from '../../../src/tokenizer';

// HTML5lib tokenizer test format
export interface HTML5libTokenizerTest {
  description: string;
  input: string;
  output: HTML5libTokenOutput[];
  initialStates?: string[];
  lastStartTag?: string;
  errors?: HTML5libError[];
  doubleEscaped?: boolean;
}

export interface HTML5libTokenizerTestSuite {
  tests: HTML5libTokenizerTest[];
}

export type HTML5libTokenOutput = 
  | ['StartTag', string, Record<string, string>] // StartTag without self-closing
  | ['StartTag', string, Record<string, string>, boolean] // StartTag with self-closing
  | ['EndTag', string] // EndTag
  | ['Comment', string] // Comment
  | ['Character', string] // Character
  | ['DOCTYPE', string, string | null, string | null, boolean]; // DOCTYPE

export interface HTML5libError {
  code: string;
  line: number;
  col: number;
}

/**
 * Converts HTML5lib token format to our internal token format
 */
export function convertHTML5libToken(html5libToken: HTML5libTokenOutput): Partial<Token> {
  const type = html5libToken[0];
  const nameOrData = html5libToken[1];
  
  switch (type) {
    case 'DOCTYPE':
      return {
        type: TokenType.DOCTYPE,
        value: nameOrData || '',
        attributes: {}
      };
    case 'StartTag':
      const attributes = html5libToken[2];
      const selfClosing = html5libToken[3];
      return {
        type: TokenType.TAG_OPEN,
        value: nameOrData || '',
        attributes: (typeof attributes === 'object' && attributes !== null) ? attributes : {},
        isSelfClosing: typeof selfClosing === 'boolean' ? selfClosing : false
      };
    case 'EndTag':
      return {
        type: TokenType.TAG_CLOSE,
        value: nameOrData || '',
        attributes: {},
        isClosing: true
      };
    case 'Comment':
      return {
        type: TokenType.COMMENT,
        value: nameOrData || '',
        attributes: {}
      };
    case 'Character':
      return {
        type: TokenType.TEXT,
        value: nameOrData || '',
        attributes: {}
      };
    default:
      throw new Error(`Unknown HTML5lib token type: ${type}`);
  }
}

/**
 * Converts our internal token format to HTML5lib format for comparison
 */
export function convertToHTML5libToken(token: Token): HTML5libTokenOutput {
  switch (token.type) {
    case TokenType.DOCTYPE:
      return ['DOCTYPE', token.value, null, null, true];
    case TokenType.TAG_OPEN:
      if (token.isSelfClosing) {
        return ['StartTag', token.value, token.attributes || {}, true];
      } else {
        return ['StartTag', token.value, token.attributes || {}];
      }
    case TokenType.TAG_CLOSE:
      return ['EndTag', token.value];
    case TokenType.COMMENT:
      return ['Comment', token.value];
    case TokenType.TEXT:
      return ['Character', token.value];
    default:
      throw new Error(`Unknown token type: ${token.type}`);
  }
}

/**
 * Normalizes adjacent character tokens as per HTML5lib spec
 */
export function normalizeCharacterTokens(tokens: Token[]): Token[] {
  const normalized: Token[] = [];
  let currentText = '';
  
  for (const token of tokens) {
    if (token.type === TokenType.TEXT) {
      currentText += token.value;
    } else {
      if (currentText) {
        normalized.push({
          type: TokenType.TEXT,
          value: currentText,
          position: token.position,
          attributes: {}
        });
        currentText = '';
      }
      if (token.type !== TokenType.EOF) {
        normalized.push(token);
      }
    }
  }
  
  if (currentText) {
    normalized.push({
      type: TokenType.TEXT,
      value: currentText,
      position: { line: 1, column: 1, offset: 0 },
      attributes: {}
    });
  }
  
  return normalized;
}

/**
 * Runs a single HTML5lib tokenizer test
 */
export function runHTML5libTokenizerTest(test: HTML5libTokenizerTest): void {
  const { description, input, output: expectedOutput, initialStates = ['Data state'] } = test;
  
  // Process double-escaped input if needed
  let processedInput = input;
  if (test.doubleEscaped) {
    processedInput = processedInput.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
  }
  
  for (const initialState of initialStates) {
    it(`${description} (${initialState})`, () => {
      // Tokenize the input
      const tokens = tokenize(processedInput);
      
      // Normalize character tokens
      const normalizedTokens = normalizeCharacterTokens(tokens);
      
      // Convert to HTML5lib format for comparison
      const actualOutput = normalizedTokens.map(convertToHTML5libToken);
      
      // Process expected output if double-escaped
      let processedExpectedOutput = expectedOutput;
      if (test.doubleEscaped) {
        processedExpectedOutput = expectedOutput.map(token => {
          if (typeof token[1] === 'string') {
            token[1] = token[1].replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
              return String.fromCharCode(parseInt(hex, 16));
            });
          }
          return token;
        });
      }
      
      // Compare outputs
      expect(actualOutput).toEqual(processedExpectedOutput);
    });
  }
}

/**
 * Runs all tests from an HTML5lib tokenizer test suite
 */
export function runHTML5libTokenizerTestSuite(testSuite: HTML5libTokenizerTestSuite, suiteName: string): void {
  describe(`HTML5lib Tokenizer Tests: ${suiteName}`, () => {
    testSuite.tests.forEach(test => {
      runHTML5libTokenizerTest(test);
    });
  });
}

/**
 * Loads and runs HTML5lib tokenizer tests from JSON
 */
export async function loadHTML5libTokenizerTests(testData: string, suiteName: string): Promise<void> {
  const testSuite: HTML5libTokenizerTestSuite = JSON.parse(testData);
  runHTML5libTokenizerTestSuite(testSuite, suiteName);
}
