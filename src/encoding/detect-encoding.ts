import { normalizeEncoding } from "./normalize-encoding.js";

export const detectEncoding = (html: string): string | null => {
  const prefix = html.substring(0, 1024);

  const charsetMatch = prefix.match(
    /<meta[^>]*charset\s*=\s*["']?([^"'\s>]+)["']?/i,
  );
  if (charsetMatch) {
    return normalizeEncoding(charsetMatch[1]);
  }

  const contentTypeMatch = prefix.match(
    /<meta[^>]*http-equiv\s*=\s*["']?\s*content-type\s*["']?[^>]*content\s*=\s*["']?\s*text\/html;\s*charset\s*=\s*([^"'\s>]+)["']?/i,
  );
  if (contentTypeMatch) {
    return normalizeEncoding(contentTypeMatch[1]);
  }

  return "windows-1252";
};
