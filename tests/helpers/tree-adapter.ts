// tests/helpers/tree-adapter.ts

export interface SerializeOptions {
  skipImplicitDoctype?: boolean;
}

export function serializeToHtml5lib(
  doc: any,
  options: SerializeOptions = {},
): string {
  const lines: string[] = [];

  function serialize(node: any, depth: number): void {
    const indent = "| " + "  ".repeat(depth);

    if (node.nodeType === 9) {
      // DOCUMENT
      for (const child of node.childNodes || []) {
        serialize(child, depth);
      }
    } else if (node.nodeType === 1) {
      // ELEMENT
      const tagName = node.tagName.toLowerCase();
      const ns = node.namespaceURI;

      let nsPrefix = "";
      if (ns === "http://www.w3.org/2000/svg") {
        nsPrefix = "svg ";
      } else if (ns === "http://www.w3.org/1998/Math/MathML") {
        nsPrefix = "math ";
      }

      lines.push(`${indent}<${nsPrefix}${tagName}>`);

      // Atributos en orden alfabético
      const attrs = Object.entries(node.attributes || {}).sort(([a], [b]) =>
        a.localeCompare(b),
      );
      for (const [name, value] of attrs) {
        lines.push(`${indent}  ${name}="${value}"`);
      }

      // Template special case
      if (node.tagName.toLowerCase() === "template" && node.content) {
        lines.push(`${indent}  content`);
        serialize(node.content, depth + 2);
      }

      // Children
      for (const child of node.childNodes || []) {
        serialize(child, depth + 1);
      }
    } else if (node.nodeType === 3) {
      // TEXT
      lines.push(`${indent}"${node.textContent}"`);
    } else if (node.nodeType === 8) {
      // COMMENT
      const commentData = node.data || node.nodeValue || node.textContent || "";
      lines.push(`${indent}<!-- ${commentData} -->`);
    } else if (node.nodeType === 10) {
      // DOCTYPE
      if (!options.skipImplicitDoctype) {
        lines.push(`${indent}<!DOCTYPE ${node.name || "html"}>`);
      }
    }
  }

  serialize(doc, 0);
  return lines.join("\n") + "\n";
}

export function serializeFragmentToHtml5lib(nodes: any[]): string {
  const lines: string[] = [];

  function serialize(node: any, depth: number): void {
    const indent = "| " + "  ".repeat(depth);

    if (node.nodeType === 1) {
      const tagName = node.tagName.toLowerCase();
      const ns = node.namespaceURI;

      let nsPrefix = "";
      if (ns === "http://www.w3.org/2000/svg") {
        nsPrefix = "svg ";
      } else if (ns === "http://www.w3.org/1998/Math/MathML") {
        nsPrefix = "math ";
      }

      lines.push(`${indent}<${nsPrefix}${tagName}>`);

      const attrs = Object.entries(node.attributes || {}).sort(([a], [b]) =>
        a.localeCompare(b),
      );
      for (const [name, value] of attrs) {
        lines.push(`${indent}  ${name}="${value}"`);
      }

      if (node.tagName.toLowerCase() === "template" && node.content) {
        lines.push(`${indent}  content`);
        serialize(node.content, depth + 2);
      }

      for (const child of node.childNodes || []) {
        serialize(child, depth + 1);
      }
    } else if (node.nodeType === 3) {
      lines.push(`${indent}"${node.textContent}"`);
    } else if (node.nodeType === 8) {
      const commentData = node.data || node.nodeValue || node.textContent || "";
      lines.push(`${indent}<!-- ${commentData} -->`);
    }
  }

  for (const node of nodes) {
    serialize(node, 0);
  }

  return lines.join("\n") + "\n";
}
