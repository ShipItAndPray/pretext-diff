import React from "react";
import type { DiffLine as DiffLineType } from "../types";
import { CharHighlight } from "./CharHighlight";
import { DiffGutter } from "./DiffGutter";

interface DiffLineProps {
  line: DiffLineType;
  maxOldLineNumber: number;
  maxNewLineNumber: number;
  /** Whether to show both gutters (unified) or single gutter */
  showBothGutters?: boolean;
  style?: React.CSSProperties;
}

const TYPE_CLASS_MAP: Record<string, string> = {
  added: "ptd-line-added",
  removed: "ptd-line-removed",
  unchanged: "ptd-line-unchanged",
  "fold-placeholder": "ptd-line-fold",
};

/**
 * Renders a single diff line with gutter(s) and content.
 */
export const DiffLineComponent: React.FC<DiffLineProps> = ({
  line,
  maxOldLineNumber,
  maxNewLineNumber,
  showBothGutters = false,
  style,
}) => {
  const cls = `ptd-line ${TYPE_CLASS_MAP[line.type] || ""}`;

  if (line.type === "fold-placeholder") {
    return (
      <div className={cls} style={style} role="row">
        <span className="ptd-fold-label">{line.content}</span>
      </div>
    );
  }

  return (
    <div className={cls} style={style} role="row">
      {showBothGutters ? (
        <>
          <DiffGutter lineNumber={line.oldLineNumber} maxLineNumber={maxOldLineNumber} />
          <DiffGutter lineNumber={line.newLineNumber} maxLineNumber={maxNewLineNumber} />
        </>
      ) : (
        <DiffGutter
          lineNumber={line.oldLineNumber ?? line.newLineNumber}
          maxLineNumber={Math.max(maxOldLineNumber, maxNewLineNumber)}
        />
      )}
      <span className="ptd-content">
        <span className="ptd-prefix">
          {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
        </span>
        <CharHighlight
          content={line.content}
          charDiffs={line.charDiffs}
          lineType={line.type as "added" | "removed" | "unchanged"}
        />
      </span>
    </div>
  );
};
