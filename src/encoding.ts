/**
 * Detects the character encoding of an HTML document.
 * Based on HTML5 specification for encoding detection.
 */

const encodingAliases: Record<string, string> = {
  'iso-8859-1': 'windows-1252',
  'iso8859-1': 'windows-1252',
  'iso-8859-2': 'iso-8859-2',
  'iso8859-2': 'iso-8859-2',
  'utf-8': 'utf-8',
  'utf8': 'utf-8',
  // Add more as needed
};

function normalizeEncoding(name: string): string | null {
  const lower = name.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return encodingAliases[lower] || lower;
}

export function detectEncoding(html: string): string | null {
  // Limit to first 1024 characters for performance
  const prefix = html.substring(0, 1024);

  // Look for <meta charset="...">
  const charsetMatch = prefix.match(/<meta[^>]*charset\s*=\s*["']?([^"'\s>]+)["']?/i);
  if (charsetMatch) {
    return normalizeEncoding(charsetMatch[1]);
  }

  // Look for <meta http-equiv="Content-Type" content="text/html; charset=...">
  const contentTypeMatch = prefix.match(/<meta[^>]*http-equiv\s*=\s*["']?\s*content-type\s*["']?[^>]*content\s*=\s*["']?\s*text\/html;\s*charset\s*=\s*([^"'\s>]+)["']?/i);
  if (contentTypeMatch) {
    return normalizeEncoding(contentTypeMatch[1]);
  }

  // Default to Windows-1252 if no encoding found (as per HTML5 spec)
  return 'windows-1252';
}