import { describe, it, expect } from "vitest";
import { SyncedVirtualizer } from "../src/layout/syncedVirtualizer";

describe("SyncedVirtualizer", () => {
  it("uses max height of left and right for each row", () => {
    const left = new Float64Array([20, 40, 20]);
    const right = new Float64Array([20, 20, 60]);
    const v = new SyncedVirtualizer(left, right);

    expect(v.getRowHeight(0)).toBe(20);
    expect(v.getRowHeight(1)).toBe(40);
    expect(v.getRowHeight(2)).toBe(60);
  });

  it("computes correct total height", () => {
    const left = new Float64Array([20, 20, 20]);
    const right = new Float64Array([20, 20, 20]);
    const v = new SyncedVirtualizer(left, right);

    expect(v.getTotalHeight()).toBe(60);
  });

  it("computes correct offset for index", () => {
    const left = new Float64Array([10, 20, 30]);
    const right = new Float64Array([10, 20, 30]);
    const v = new SyncedVirtualizer(left, right);

    expect(v.getOffsetForIndex(0)).toBe(0);
    expect(v.getOffsetForIndex(1)).toBe(10);
    expect(v.getOffsetForIndex(2)).toBe(30);
  });

  it("returns visible range for a given scroll position", () => {
    const heights = new Float64Array(100);
    heights.fill(20);
    const v = new SyncedVirtualizer(heights, heights);

    const items = v.getVisibleRange(0, 100, 0);
    // Viewport = 100px, row height = 20px => 5 rows visible
    expect(items.length).toBe(6); // index 0-5 (inclusive where offset < scrollTop + height)

    // Check first item
    expect(items[0].index).toBe(0);
    expect(items[0].offsetTop).toBe(0);
    expect(items[0].height).toBe(20);
  });

  it("handles scroll to middle", () => {
    const heights = new Float64Array(100);
    heights.fill(20);
    const v = new SyncedVirtualizer(heights, heights);

    const items = v.getVisibleRange(500, 100, 0);
    // scrollTop=500 => first visible row = 500/20 = 25
    expect(items[0].index).toBe(25);
    expect(items[0].offsetTop).toBe(500);
  });

  it("handles different length arrays", () => {
    const left = new Float64Array([20, 20]);
    const right = new Float64Array([20, 20, 20, 20]);
    const v = new SyncedVirtualizer(left, right);

    expect(v.getRowCount()).toBe(4);
    // Rows beyond left's length should use right's height (max(0, right))
    expect(v.getRowHeight(3)).toBe(20);
  });

  it("handles overscan", () => {
    const heights = new Float64Array(100);
    heights.fill(20);
    const v = new SyncedVirtualizer(heights, heights);

    const items = v.getVisibleRange(200, 100, 3);
    // First visible = row 10 (200/20), with overscan 3 => start at 7
    expect(items[0].index).toBe(7);
  });

  it("handles empty arrays", () => {
    const v = new SyncedVirtualizer(new Float64Array(0), new Float64Array(0));
    expect(v.getTotalHeight()).toBe(0);
    expect(v.getRowCount()).toBe(0);
    expect(v.getVisibleRange(0, 100)).toHaveLength(0);
  });
});
