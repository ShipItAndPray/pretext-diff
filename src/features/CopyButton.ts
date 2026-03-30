import type { DiffLine } from "../types";

/**
 * Extract the content of a range of diff lines for clipboard copy.
 */
export function extractContent(lines: DiffLine[], startIndex: number, endIndex: number): string {
  return lines
    .slice(startIndex, endIndex + 1)
    .filter((l) => l.type !== "fold-placeholder")
    .map((l) => l.content)
    .join("\n");
}
