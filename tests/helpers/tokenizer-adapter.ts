// tests/helpers/tokenizer-adapter.ts

import type { Token } from '../../src/tokenizer';

export type Html5libToken = 
  | ['StartTag', string, Record<string, string>]
  | ['StartTag', string, Record<string, string>, boolean] // con self-closing flag
  | ['EndTag', string]
  | ['Character', string]
  | ['Comment', string]
  | ['DOCTYPE', string, string | null, string | null, boolean];

export function adaptTokens(tokens: Token[]): Html5libToken[] {
  const result: Html5libToken[] = [];
  
  for (const token of tokens) {
    if (token.type === 'EOF') continue;
    
    switch (token.type) {
      case 'TAG_OPEN':
        if (token.isClosing) {
          result.push(['EndTag', token.value]);
        } else {
          const attrs = token.attributes || {};
          if (token.isSelfClosing) {
            result.push(['StartTag', token.value, attrs, true]);
          } else {
            result.push(['StartTag', token.value, attrs]);
          }
        }
        break;
        
      case 'TAG_CLOSE':
        result.push(['EndTag', token.value]);
        break;
        
      case 'TEXT':
        result.push(['Character', token.value]);
        break;
        
      case 'COMMENT':
        result.push(['Comment', token.value]);
        break;
        
      case 'DOCTYPE':
        // Parsear DOCTYPE para extraer name, publicId, systemId
        result.push(['DOCTYPE', token.value, null, null, true]);
        break;
        
      case 'CDATA':
        result.push(['Character', token.value]);
        break;
    }
  }
  
  return result;
}

// Función para comparar tokens, manejando casos especiales
export function compareTokens(actual: Html5libToken[], expected: any[]): boolean {
  // Implementar comparación flexible
  // - Coalescer Characters consecutivos
  // - Ignorar diferencias de whitespace en algunos casos
  return JSON.stringify(actual) === JSON.stringify(expected);
}