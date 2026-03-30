import React, { useMemo } from "react";
import type { DiffViewerProps, DiffLine } from "./types";
import { computeDiff } from "./diff/computeDiff";
import { foldUnchanged } from "./features/FoldUnchanged";
import { SideBySideView } from "./views/SideBySideView";
import { UnifiedView } from "./views/UnifiedView";
import { InlineView } from "./views/InlineView";

const DEFAULT_FONT = '13px "JetBrains Mono", "Fira Code", "Cascadia Code", monospace';
const DEFAULT_LINE_HEIGHT = 20;
const DEFAULT_FOLD_THRESHOLD = 8;

/**
 * Main diff viewer component.
 *
 * Computes a line-level diff between oldText and newText,
 * folds unchanged regions, and renders in the chosen mode
 * (side-by-side, unified, or inline) with virtualized scroll.
 *
 * @example
 * ```tsx
 * <DiffViewer
 *   oldText={before}
 *   newText={after}
 *   mode="side-by-side"
 *   height={600}
 *   width={1200}
 * />
 * ```
 */
export const DiffViewer: React.FC<DiffViewerProps> = ({
  oldText,
  newText,
  oldTitle,
  newTitle,
  mode = "side-by-side",
  font = DEFAULT_FONT,
  lineHeight = DEFAULT_LINE_HEIGHT,
  height,
  width,
  wordWrap = false,
  foldThreshold = DEFAULT_FOLD_THRESHOLD,
  className,
}) => {
  const rawLines = useMemo(() => computeDiff(oldText, newText), [oldText, newText]);

  const lines: DiffLine[] = useMemo(
    () => (foldThreshold > 0 ? foldUnchanged(rawLines, foldThreshold) : rawLines),
    [rawLines, foldThreshold]
  );

  const viewProps = {
    lines,
    height,
    width,
    lineHeight,
    font,
    wordWrap,
  };

  return (
    <div className={`ptd-root ${className || ""}`}>
      {mode === "side-by-side" && (
        <SideBySideView {...viewProps} oldTitle={oldTitle} newTitle={newTitle} />
      )}
      {mode === "unified" && <UnifiedView {...viewProps} />}
      {mode === "inline" && <InlineView {...viewProps} />}
    </div>
  );
};
