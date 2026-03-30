import { diffChars } from "diff";
import type { CharDiff } from "../types";

interface CharDiffResult {
  removed: CharDiff[];
  added: CharDiff[];
}

/**
 * Compute character-level diffs between two lines.
 * Returns separate arrays for highlights on the old (removed) and new (added) lines.
 */
export function computeCharDiffs(oldLine: string, newLine: string): CharDiffResult {
  const changes = diffChars(oldLine, newLine);
  const removed: CharDiff[] = [];
  const added: CharDiff[] = [];

  let oldOffset = 0;
  let newOffset = 0;

  for (const change of changes) {
    const len = change.value.length;

    if (change.removed) {
      removed.push({ start: oldOffset, end: oldOffset + len, type: "removed" });
      oldOffset += len;
    } else if (change.added) {
      added.push({ start: newOffset, end: newOffset + len, type: "added" });
      newOffset += len;
    } else {
      oldOffset += len;
      newOffset += len;
    }
  }

  return { removed, added };
}
