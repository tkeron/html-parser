import { encodingAliases } from "./constants.ts";

export const normalizeEncoding = (name: string): string | null => {
  const lower = name.toLowerCase().replace(/[^a-z0-9-]/g, "");
  return encodingAliases[lower] || lower;
};
