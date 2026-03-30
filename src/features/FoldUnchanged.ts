import type { DiffLine } from "../types";

/**
 * Collapse consecutive unchanged lines that exceed the threshold
 * into a single fold-placeholder line. Preserves `contextLines` lines
 * above and below each changed region for readability.
 */
export function foldUnchanged(
  lines: DiffLine[],
  threshold: number,
  contextLines = 3
): DiffLine[] {
  if (threshold <= 0) return lines;

  const result: DiffLine[] = [];
  let unchangedStart = -1;

  for (let i = 0; i <= lines.length; i++) {
    const isUnchanged = i < lines.length && lines[i].type === "unchanged";

    if (isUnchanged) {
      if (unchangedStart === -1) unchangedStart = i;
    } else {
      // End of an unchanged run (or end of array)
      if (unchangedStart !== -1) {
        const runLength = i - unchangedStart;

        if (runLength > threshold) {
          // Keep `contextLines` at the top of the run
          const keepTop = Math.min(contextLines, runLength);
          for (let j = unchangedStart; j < unchangedStart + keepTop; j++) {
            result.push(lines[j]);
          }

          // Fold placeholder
          const foldedCount = runLength - keepTop - Math.min(contextLines, runLength - keepTop);
          if (foldedCount > 0) {
            result.push({
              type: "fold-placeholder",
              oldLineNumber: null,
              newLineNumber: null,
              content: `... ${foldedCount} unchanged lines ...`,
            });
          }

          // Keep `contextLines` at the bottom of the run
          const keepBottom = Math.min(contextLines, runLength - keepTop);
          for (let j = i - keepBottom; j < i; j++) {
            result.push(lines[j]);
          }
        } else {
          // Run is short enough — keep all
          for (let j = unchangedStart; j < i; j++) {
            result.push(lines[j]);
          }
        }
        unchangedStart = -1;
      }

      if (i < lines.length) {
        result.push(lines[i]);
      }
    }
  }

  return result;
}
