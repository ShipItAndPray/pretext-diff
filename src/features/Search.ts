import type { DiffLine } from "../types";

export interface SearchMatch {
  lineIndex: number;
  start: number;
  end: number;
}

/**
 * Search for a query string within diff lines.
 * Returns all matches with their line index and character range.
 */
export function searchInDiff(
  lines: DiffLine[],
  query: string,
  caseSensitive = false
): SearchMatch[] {
  if (!query) return [];

  const matches: SearchMatch[] = [];
  const q = caseSensitive ? query : query.toLowerCase();

  for (let i = 0; i < lines.length; i++) {
    const content = caseSensitive ? lines[i].content : lines[i].content.toLowerCase();
    let pos = 0;

    while (pos < content.length) {
      const idx = content.indexOf(q, pos);
      if (idx === -1) break;
      matches.push({ lineIndex: i, start: idx, end: idx + q.length });
      pos = idx + 1;
    }
  }

  return matches;
}
