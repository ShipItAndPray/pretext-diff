import React, { useRef, useCallback, useMemo } from "react";
import type { DiffLine, VirtualItem } from "../types";
import { SyncedVirtualizer } from "../layout/syncedVirtualizer";
import { DiffLineComponent } from "../render/DiffLine";

interface UnifiedViewProps {
  lines: DiffLine[];
  height: number;
  width: number;
  lineHeight: number;
  font: string;
  wordWrap: boolean;
}

/**
 * Single-panel unified diff view.
 * Shows all lines in one scrollable panel with +/- prefixes.
 */
export const UnifiedView: React.FC<UnifiedViewProps> = ({
  lines,
  height,
  width,
  lineHeight,
  font,
}) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const heights = useMemo(() => {
    const h = new Float64Array(lines.length);
    h.fill(lineHeight);
    return h;
  }, [lines.length, lineHeight]);

  // Use SyncedVirtualizer with identical heights on both sides (single panel)
  const virtualizer = useMemo(
    () => new SyncedVirtualizer(heights, heights),
    [heights]
  );

  const visibleItems = useMemo(
    () => virtualizer.getVisibleRange(scrollTop, height),
    [virtualizer, scrollTop, height]
  );

  const totalHeight = virtualizer.getTotalHeight();

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

  return (
    <div className="ptd-unified" style={{ height, width, font }}>
      <div
        className="ptd-scroll-container"
        style={{ height, overflow: "auto" }}
        onScroll={handleScroll}
      >
        <div style={{ position: "relative", height: totalHeight }}>
          {visibleItems.map((item) => (
            <DiffLineComponent
              key={item.index}
              line={lines[item.index]}
              maxOldLineNumber={maxOldLine}
              maxNewLineNumber={maxNewLine}
              showBothGutters
              style={{
                position: "absolute",
                top: item.offsetTop,
                height: item.height,
                width,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
