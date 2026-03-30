import React from "react";
import type { CharDiff } from "../types";

interface CharHighlightProps {
  content: string;
  charDiffs?: CharDiff[];
  lineType: "added" | "removed" | "unchanged";
}

/**
 * Renders a line of text with character-level diff highlights.
 * Wraps changed character ranges in <mark> elements.
 */
export const CharHighlight: React.FC<CharHighlightProps> = ({
  content,
  charDiffs,
  lineType,
}) => {
  if (!charDiffs || charDiffs.length === 0) {
    return <span>{content}</span>;
  }

  const segments: React.ReactNode[] = [];
  let cursor = 0;

  for (let i = 0; i < charDiffs.length; i++) {
    const cd = charDiffs[i];

    // Text before this highlight
    if (cursor < cd.start) {
      segments.push(
        <span key={`t-${i}`}>{content.slice(cursor, cd.start)}</span>
      );
    }

    // Highlighted text
    const highlightClass =
      lineType === "added"
        ? "ptd-char-added"
        : "ptd-char-removed";

    segments.push(
      <mark key={`h-${i}`} className={highlightClass}>
        {content.slice(cd.start, cd.end)}
      </mark>
    );

    cursor = cd.end;
  }

  // Remaining text after last highlight
  if (cursor < content.length) {
    segments.push(
      <span key="tail">{content.slice(cursor)}</span>
    );
  }

  return <>{segments}</>;
};
