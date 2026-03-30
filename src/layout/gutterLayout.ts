/**
 * Compute the width (in characters) needed for the line number gutter.
 */
export function gutterWidth(maxLineNumber: number): number {
  return Math.max(2, String(maxLineNumber).length);
}

/**
 * Format a line number for display, right-aligned with padding.
 */
export function formatLineNumber(
  lineNumber: number | null,
  width: number
): string {
  if (lineNumber == null) return " ".repeat(width);
  return String(lineNumber).padStart(width, " ");
}
