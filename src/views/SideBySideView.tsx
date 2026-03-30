import React, { useRef, useCallback, useMemo } from "react";
import type { DiffLine, DiffViewerProps, VirtualItem } from "../types";
import { buildSideBySidePairs } from "../diff/computeDiff";
import { SyncedVirtualizer } from "../layout/syncedVirtualizer";
import { DiffGutter } from "../render/DiffGutter";
import { CharHighlight } from "../render/CharHighlight";

interface SideBySideViewProps {
  lines: DiffLine[];
  height: number;
  width: number;
  lineHeight: number;
  font: string;
  wordWrap: boolean;
  oldTitle?: string;
  newTitle?: string;
}

/**
 * Two-panel synchronized scroll diff view.
 * Left panel shows old text (removals highlighted), right panel shows new text (additions highlighted).
 * Spacers are inserted so rows always align between panels.
 */
export const SideBySideView: React.FC<SideBySideViewProps> = ({
  lines,
  height,
  width,
  lineHeight,
  font,
  wordWrap,
  oldTitle,
  newTitle,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = React.useState(0);

  const pairs = useMemo(() => buildSideBySidePairs(lines), [lines]);

  // For now, uniform row heights (pretext measurement plugs in here for word-wrap)
  const leftHeights = useMemo(() => {
    const h = new Float64Array(pairs.length);
    h.fill(lineHeight);
    return h;
  }, [pairs.length, lineHeight]);

  const rightHeights = useMemo(() => {
    const h = new Float64Array(pairs.length);
    h.fill(lineHeight);
    return h;
  }, [pairs.length, lineHeight]);

  const virtualizer = useMemo(
    () => new SyncedVirtualizer(leftHeights, rightHeights),
    [leftHeights, rightHeights]
  );

  const visibleItems = useMemo(
    () => virtualizer.getVisibleRange(scrollTop, height),
    [virtualizer, scrollTop, height]
  );

  const totalHeight = virtualizer.getTotalHeight();
  const panelWidth = Math.floor((width - 2) / 2); // 2px for divider

  // Compute max line numbers for gutter width
  const maxOldLine = lines.reduce(
    (m, l) => (l.oldLineNumber != null && l.oldLineNumber > m ? l.oldLineNumber : m),
    0
  );
  const maxNewLine = lines.reduce(
    (m, l) => (l.newLineNumber != null && l.newLineNumber > m ? l.newLineNumber : m),
    0
  );

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const renderLine = (line: DiffLine | null, side: "left" | "right", item: VirtualItem) => {
    if (!line) {
      return (
        <div
          key={`${side}-${item.index}`}
          className="ptd-line ptd-line-spacer"
          style={{
            position: "absolute",
            top: item.offsetTop,
            height: item.height,
            width: panelWidth,
          }}
        />
      );
    }

    const isFold = line.type === "fold-placeholder";
    const cls = `ptd-line ${
      line.type === "removed"
        ? "ptd-line-removed"
        : line.type === "added"
        ? "ptd-line-added"
        : isFold
        ? "ptd-line-fold"
        : "ptd-line-unchanged"
    }`;

    return (
      <div
        key={`${side}-${item.index}`}
        className={cls}
        style={{
          position: "absolute",
          top: item.offsetTop,
          height: item.height,
          width: panelWidth,
        }}
        role="row"
      >
        {isFold ? (
          <span className="ptd-fold-label">{line.content}</span>
        ) : (
          <>
            <DiffGutter
              lineNumber={side === "left" ? line.oldLineNumber : line.newLineNumber}
              maxLineNumber={side === "left" ? maxOldLine : maxNewLine}
            />
            <span className="ptd-content">
              <CharHighlight
                content={line.content}
                charDiffs={line.charDiffs}
                lineType={line.type === "fold-placeholder" ? "unchanged" : line.type}
              />
            </span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="ptd-side-by-side" style={{ height, width, font }}>
      {(oldTitle || newTitle) && (
        <div className="ptd-header">
          <div className="ptd-header-left" style={{ width: panelWidth }}>
            {oldTitle || ""}
          </div>
          <div className="ptd-header-right" style={{ width: panelWidth }}>
            {newTitle || ""}
          </div>
        </div>
      )}
      <div
        ref={scrollRef}
        className="ptd-scroll-container"
        style={{ height, overflow: "auto" }}
        onScroll={handleScroll}
      >
        <div style={{ position: "relative", height: totalHeight, display: "flex" }}>
          {/* Left panel */}
          <div style={{ position: "relative", width: panelWidth, height: totalHeight }}>
            {visibleItems.map((item) =>
              renderLine(pairs[item.index]?.left ?? null, "left", item)
            )}
          </div>
          {/* Divider */}
          <div className="ptd-divider" style={{ width: 2, height: totalHeight }} />
          {/* Right panel */}
          <div style={{ position: "relative", width: panelWidth, height: totalHeight }}>
            {visibleItems.map((item) =>
              renderLine(pairs[item.index]?.right ?? null, "right", item)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
