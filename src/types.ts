export type DiffLineType = "added" | "removed" | "unchanged" | "fold-placeholder";

export interface CharDiff {
  start: number;
  end: number;
  type: "added" | "removed";
}

export interface DiffLine {
  type: DiffLineType;
  oldLineNumber: number | null;
  newLineNumber: number | null;
  content: string;
  charDiffs?: CharDiff[];
}

/**
 * A paired row for side-by-side view. Both sides share the same virtual index.
 * When one side has no corresponding line, it becomes a spacer.
 */
export interface SideBySidePair {
  virtualIndex: number;
  left: DiffLine | null;
  right: DiffLine | null;
}

export type DiffMode = "side-by-side" | "unified" | "inline";

export interface DiffViewerProps {
  oldText: string;
  newText: string;
  oldTitle?: string;
  newTitle?: string;
  mode?: DiffMode;
  font?: string;
  lineHeight?: number;
  height: number;
  width: number;
  wordWrap?: boolean;
  foldThreshold?: number;
  className?: string;
}

export interface VirtualItem {
  index: number;
  offsetTop: number;
  height: number;
}
