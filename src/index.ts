// Main component
export { DiffViewer } from "./DiffViewer";

// Views
export { SideBySideView } from "./views/SideBySideView";
export { UnifiedView } from "./views/UnifiedView";
export { InlineView } from "./views/InlineView";

// Diff computation
export { computeDiff, buildSideBySidePairs } from "./diff/computeDiff";
export { computeCharDiffs } from "./diff/characterDiff";

// Layout
export { measureLineHeight, measureAllHeights, buildPrefixSums } from "./layout/diffMeasurer";
export { SyncedVirtualizer } from "./layout/syncedVirtualizer";
export { gutterWidth, formatLineNumber } from "./layout/gutterLayout";

// Render components
export { DiffLineComponent } from "./render/DiffLine";
export { DiffGutter } from "./render/DiffGutter";
export { CharHighlight } from "./render/CharHighlight";

// Features
export { foldUnchanged } from "./features/FoldUnchanged";
export { searchInDiff } from "./features/Search";
export { extractContent } from "./features/CopyButton";

// Types
export type {
  DiffViewerProps,
  DiffLine,
  DiffLineType,
  CharDiff,
  SideBySidePair,
  DiffMode,
  VirtualItem,
} from "./types";
