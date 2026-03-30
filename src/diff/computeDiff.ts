import { diffLines } from "diff";
import { computeCharDiffs } from "./characterDiff";
import type { DiffLine } from "../types";

/**
 * Compute a line-level diff between two strings.
 * Returns an array of DiffLine objects with line numbers and optional character-level diffs.
 */
export function computeDiff(oldText: string, newText: string): DiffLine[] {
  const changes = diffLines(oldText, newText);
  const result: DiffLine[] = [];

  let oldLineNum = 1;
  let newLineNum = 1;

  for (let i = 0; i < changes.length; i++) {
    const change = changes[i];
    // diffLines may include trailing newline in the value — split and filter
    const lines = change.value.replace(/\n$/, "").split("\n");

    if (change.added) {
      // Check if previous change was a removal (for character-level diff pairing)
      const prevChange = i > 0 ? changes[i - 1] : null;
      const prevRemoved =
        prevChange?.removed
          ? prevChange.value.replace(/\n$/, "").split("\n")
          : null;

      for (let j = 0; j < lines.length; j++) {
        const pairedOldLine = prevRemoved && j < prevRemoved.length ? prevRemoved[j] : null;
        const charDiffs = pairedOldLine != null
          ? computeCharDiffs(pairedOldLine, lines[j]).added
          : undefined;

        result.push({
          type: "added",
          oldLineNumber: null,
          newLineNumber: newLineNum++,
          content: lines[j],
          charDiffs,
        });
      }
    } else if (change.removed) {
      // Check if next change is an addition (for character-level diff pairing)
      const nextChange = i + 1 < changes.length ? changes[i + 1] : null;
      const nextAdded =
        nextChange?.added
          ? nextChange.value.replace(/\n$/, "").split("\n")
          : null;

      for (let j = 0; j < lines.length; j++) {
        const pairedNewLine = nextAdded && j < nextAdded.length ? nextAdded[j] : null;
        const charDiffs = pairedNewLine != null
          ? computeCharDiffs(lines[j], pairedNewLine).removed
          : undefined;

        result.push({
          type: "removed",
          oldLineNumber: oldLineNum++,
          newLineNumber: null,
          content: lines[j],
          charDiffs,
        });
      }
    } else {
      for (const line of lines) {
        result.push({
          type: "unchanged",
          oldLineNumber: oldLineNum++,
          newLineNumber: newLineNum++,
          content: line,
        });
      }
    }
  }

  return result;
}

/**
 * Build side-by-side pairs from a flat diff.
 * Removed lines pair with added lines where possible; unmatched lines get null on the other side.
 */
export function buildSideBySidePairs(
  lines: DiffLine[]
): Array<{ left: DiffLine | null; right: DiffLine | null }> {
  const pairs: Array<{ left: DiffLine | null; right: DiffLine | null }> = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.type === "unchanged" || line.type === "fold-placeholder") {
      pairs.push({ left: line, right: line });
      i++;
    } else if (line.type === "removed") {
      // Collect consecutive removed lines
      const removed: DiffLine[] = [];
      while (i < lines.length && lines[i].type === "removed") {
        removed.push(lines[i]);
        i++;
      }
      // Collect consecutive added lines that follow
      const added: DiffLine[] = [];
      while (i < lines.length && lines[i].type === "added") {
        added.push(lines[i]);
        i++;
      }
      // Pair them up
      const maxLen = Math.max(removed.length, added.length);
      for (let j = 0; j < maxLen; j++) {
        pairs.push({
          left: j < removed.length ? removed[j] : null,
          right: j < added.length ? added[j] : null,
        });
      }
    } else if (line.type === "added") {
      // Added without a preceding removal
      pairs.push({ left: null, right: line });
      i++;
    } else {
      i++;
    }
  }

  return pairs;
}
