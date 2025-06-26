import { tokenize } from './src/tokenizer.js';
import { parse, type ASTNode } from './src/parser.js';

// Test también los tokens
console.log('=== TOKENIZER OUTPUT ===');
const tokens = tokenize('<ul><li>First<li>Second</ul>');
tokens.forEach((token, i) => {
  console.log(`${i}: ${token.type} = "${token.value}"`);
});

console.log('\n=== PARSER OUTPUT ===');
const ast = parse(tokens);

console.log('Root children count:', ast.children!.length);

const ulElement = ast.children![0]!;
console.log('UL element children count:', ulElement.children!.length);
console.log('UL element children:');
ulElement.children!.forEach((child: ASTNode, index: number) => {
  console.log(`${index}: type=${child.type}, tagName=${child.tagName}, content=${child.content}`);
  if (child.children && child.children.length > 0) {
    console.log(`  Children: ${child.children.length}`);
    child.children.forEach((grandchild: ASTNode, i: number) => {
      console.log(`    ${i}: type=${grandchild.type}, tagName=${grandchild.tagName}, content=${grandchild.content}`);
    });
  }
});
