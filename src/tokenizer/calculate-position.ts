import { Position } from "./types.js";

export const calculatePosition = (text: string, offset: number): Position => {
  const lines = text.slice(0, offset).split("\n");
  return {
    line: lines.length,
    column: lines[lines.length - 1]?.length ?? 0,
    offset,
  };
};
