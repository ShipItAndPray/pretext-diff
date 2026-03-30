import type { VirtualItem } from "../types";

/**
 * Synchronized virtualizer for two-panel side-by-side diff.
 *
 * Both panels share a "virtual row index." For each row, we use
 * max(leftHeight, rightHeight) so rows stay aligned even when
 * word-wrap causes different heights on each side.
 *
 * Uses prefix sums for O(1) offset lookup and binary search for
 * O(log n) scroll-to-index, enabling 100K+ line diffs at 120fps.
 */
export class SyncedVirtualizer {
  private rowHeights: Float64Array;
  private prefixSums: Float64Array;
  private totalHeight: number;

  constructor(
    leftHeights: Float64Array,
    rightHeights: Float64Array,
  ) {
    const len = Math.max(leftHeights.length, rightHeights.length);
    this.rowHeights = new Float64Array(len);

    for (let i = 0; i < len; i++) {
      const lh = i < leftHeights.length ? leftHeights[i] : 0;
      const rh = i < rightHeights.length ? rightHeights[i] : 0;
      this.rowHeights[i] = Math.max(lh, rh);
    }

    // Build prefix sums
    this.prefixSums = new Float64Array(len + 1);
    for (let i = 0; i < len; i++) {
      this.prefixSums[i + 1] = this.prefixSums[i] + this.rowHeights[i];
    }
    this.totalHeight = this.prefixSums[len];
  }

  /** Total scroll height of the virtual list. */
  getTotalHeight(): number {
    return this.totalHeight;
  }

  /** Height of a specific virtual row. */
  getRowHeight(virtualIndex: number): number {
    if (virtualIndex < 0 || virtualIndex >= this.rowHeights.length) return 0;
    return this.rowHeights[virtualIndex];
  }

  /** Number of virtual rows. */
  getRowCount(): number {
    return this.rowHeights.length;
  }

  /** Offset from the top for a given row index. */
  getOffsetForIndex(index: number): number {
    if (index < 0) return 0;
    if (index >= this.prefixSums.length) return this.totalHeight;
    return this.prefixSums[index];
  }

  /**
   * Given a scrollTop and viewport height, return the visible virtual items.
   * Uses binary search for the start index.
   */
  getVisibleRange(scrollTop: number, viewportHeight: number, overscan = 5): VirtualItem[] {
    const count = this.rowHeights.length;
    if (count === 0) return [];

    // Binary search for the first visible row
    let lo = 0;
    let hi = count - 1;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (this.prefixSums[mid + 1] <= scrollTop) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }

    const startIndex = Math.max(0, lo - overscan);
    const endScroll = scrollTop + viewportHeight;
    let endIndex = lo;

    while (endIndex < count && this.prefixSums[endIndex] < endScroll) {
      endIndex++;
    }
    endIndex = Math.min(count - 1, endIndex + overscan);

    const items: VirtualItem[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      items.push({
        index: i,
        offsetTop: this.prefixSums[i],
        height: this.rowHeights[i],
      });
    }

    return items;
  }
}
