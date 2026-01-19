// tests/helpers/tree-adapter.ts

export function serializeToHtml5lib(doc: any): string {
  const lines: string[] = [];

  function serialize(node: any, depth: number): void {
    const indent = '| ' + '  '.repeat(depth);

    if (node.nodeType === 9) { // DOCUMENT
      for (const child of node.childNodes || []) {
        serialize(child, depth);
      }
    } else if (node.nodeType === 1) { // ELEMENT
      lines.push(`${indent}<${node.tagName.toLowerCase()}>`);
      
      // Atributos en orden alfabético
      const attrs = Object.entries(node.attributes || {}).sort(([a], [b]) => a.localeCompare(b));
      for (const [name, value] of attrs) {
        lines.push(`${indent}  ${name}="${value}"`);
      }
      
      // Template special case
      if (node.tagName.toLowerCase() === 'template' && node.content) {
        lines.push(`${indent}  content`);
        serialize(node.content, depth + 2);
      }
      
      // Children
      for (const child of node.childNodes || []) {
        serialize(child, depth + 1);
      }
    } else if (node.nodeType === 3) { // TEXT
      lines.push(`${indent}"${node.textContent}"`);
    } else if (node.nodeType === 8) { // COMMENT
      lines.push(`${indent}<!-- ${node.textContent} -->`);
    } else if (node.nodeType === 10) { // DOCTYPE
      lines.push(`${indent}<!DOCTYPE ${node.name || 'html'}>`);
    }
  }
  
  serialize(doc, 0);
  return lines.join('\n') + '\n';
}