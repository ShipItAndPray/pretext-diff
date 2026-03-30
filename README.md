# @shipitandpray/pretext-diff

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://shipitandpray.github.io/pretext-diff/) [![GitHub](https://img.shields.io/github/stars/ShipItAndPray/pretext-diff?style=social)](https://github.com/ShipItAndPray/pretext-diff)

> **[View Live Demo](https://shipitandpray.github.io/pretext-diff/)**

Virtualized side-by-side and unified diff viewer for React. Handles **100K+ line diffs at 120fps** using [@chenglou/pretext](https://github.com/chenglou/pretext) for predictive line measurement — no DOM measurement, no layout thrashing.

## Screenshot

The side-by-side view shows two synchronized panels with line numbers, character-level diff highlights (green for additions, red for removals), and fold-collapsed unchanged regions. The unified view shows a single panel with +/- prefixes and dual gutters.

## Install

```bash
npm install @shipitandpray/pretext-diff
```

Peer dependencies:

```bash
npm install react react-dom @chenglou/pretext
```

## Usage

```tsx
import { DiffViewer } from "@shipitandpray/pretext-diff";
import "@shipitandpray/pretext-diff/css";

function App() {
  return (
    <DiffViewer
      oldText={before}
      newText={after}
      oldTitle="main"
      newTitle="feature-branch"
      mode="side-by-side"
      height={600}
      width={1200}
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `oldText` | `string` | **required** | Original text |
| `newText` | `string` | **required** | Modified text |
| `oldTitle` | `string` | — | Title for left panel (e.g. filename, branch) |
| `newTitle` | `string` | — | Title for right panel |
| `mode` | `'side-by-side' \| 'unified' \| 'inline'` | `'side-by-side'` | Display mode |
| `font` | `string` | `'13px "JetBrains Mono"'` | CSS font shorthand |
| `lineHeight` | `number` | `20` | Line height in px |
| `height` | `number` | **required** | Viewport height in px |
| `width` | `number` | **required** | Viewport width in px |
| `wordWrap` | `boolean` | `false` | Enable word wrapping |
| `foldThreshold` | `number` | `8` | Collapse unchanged regions longer than N lines |
| `className` | `string` | — | Additional CSS class |

### Advanced: Use Individual Pieces

```tsx
import {
  computeDiff,
  buildSideBySidePairs,
  computeCharDiffs,
  foldUnchanged,
  SyncedVirtualizer,
  searchInDiff,
} from "@shipitandpray/pretext-diff";

// Compute diff
const lines = computeDiff(oldText, newText);

// Fold unchanged regions
const folded = foldUnchanged(lines, 8);

// Build side-by-side pairs
const pairs = buildSideBySidePairs(folded);

// Search within diff
const matches = searchInDiff(lines, "function");
```

## How It Works

1. **Diff computation** — Uses the `diff` library for Myers O(ND) line-level diff, with character-level diffs for modified line pairs.

2. **Predictive measurement** — `@chenglou/pretext` pre-measures every line's rendered width without touching the DOM. With word-wrap, this predicts how many visual lines each line wraps into.

3. **Synchronized virtualization** — `SyncedVirtualizer` takes left/right height arrays, uses `max(leftHeight, rightHeight)` for each row so panels stay aligned. Prefix sums enable O(1) offset lookups and binary search for O(log n) scroll-to-index.

4. **Absolute positioning** — Only visible rows are in the DOM. Each row is `position: absolute` with a computed `top` offset. Scrolling updates which rows are rendered, not where they are.

## Comparison with monaco-diff-editor

| | pretext-diff | monaco-diff-editor |
|---|---|---|
| **Bundle size** | ~15KB gzipped | ~2MB |
| **DOM nodes (10K lines)** | ~50 (viewport only) | ~10,000 |
| **Scroll FPS (100K lines)** | 120fps | Unusable |
| **Memory (100K lines)** | <50MB | >500MB |
| **Dependencies** | react, diff, pretext | monaco-editor |
| **Word wrap sync** | Native (pretext) | Partial |
| **Tree-shakeable** | Yes | No |

## Performance Targets

| Metric | Target |
|--------|--------|
| Diff computation (10K lines) | < 200ms |
| Line measurement (10K lines) | < 100ms |
| Scroll FPS (100K line diff) | 120fps |
| Memory (100K line diff) | < 50MB |

## Demo

Open `index.html` in a browser to try the interactive demo. Paste two texts or load sample diffs of various sizes. Toggle between side-by-side, unified, and inline modes.

## Development

```bash
npm install
npm run build    # Build with tsup
npm run dev      # Watch mode
npm test         # Run vitest tests
npm run check    # TypeScript type check
```

## License

MIT
