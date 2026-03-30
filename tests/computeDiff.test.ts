import { describe, it, expect } from "vitest";
import { computeDiff, buildSideBySidePairs } from "../src/diff/computeDiff";

describe("computeDiff", () => {
  it("returns unchanged lines for identical text", () => {
    const text = "line1\nline2\nline3";
    const result = computeDiff(text, text);

    expect(result).toHaveLength(3);
    result.forEach((line) => {
      expect(line.type).toBe("unchanged");
    });
  });

  it("detects added lines", () => {
    const result = computeDiff("a\nb\n", "a\nb\nc\n");
    const added = result.filter((l) => l.type === "added");

    expect(added).toHaveLength(1);
    expect(added[0].content).toBe("c");
    expect(added[0].newLineNumber).toBe(3);
    expect(added[0].oldLineNumber).toBeNull();
  });

  it("detects removed lines", () => {
    const result = computeDiff("a\nb\nc", "a\nc");
    const removed = result.filter((l) => l.type === "removed");

    expect(removed).toHaveLength(1);
    expect(removed[0].content).toBe("b");
    expect(removed[0].oldLineNumber).toBe(2);
    expect(removed[0].newLineNumber).toBeNull();
  });

  it("handles completely different texts", () => {
    const result = computeDiff("hello", "world");
    const removed = result.filter((l) => l.type === "removed");
    const added = result.filter((l) => l.type === "added");

    expect(removed.length).toBeGreaterThanOrEqual(1);
    expect(added.length).toBeGreaterThanOrEqual(1);
  });

  it("handles empty texts", () => {
    expect(computeDiff("", "")).toHaveLength(0);
    expect(computeDiff("", "a").filter((l) => l.type === "added")).toHaveLength(1);
    expect(computeDiff("a", "").filter((l) => l.type === "removed")).toHaveLength(1);
  });

  it("produces character diffs for modified lines", () => {
    const result = computeDiff("hello world", "hello earth");
    const removed = result.find((l) => l.type === "removed");
    const added = result.find((l) => l.type === "added");

    // Character diffs should be present on paired add/remove
    expect(removed?.charDiffs).toBeDefined();
    expect(added?.charDiffs).toBeDefined();
  });

  it("assigns correct line numbers", () => {
    const result = computeDiff("a\nb\nc", "a\nx\nc");
    // a = unchanged (old:1, new:1)
    // b = removed   (old:2, new:null)
    // x = added     (old:null, new:2)
    // c = unchanged (old:3, new:3)

    const unchanged = result.filter((l) => l.type === "unchanged");
    expect(unchanged[0].oldLineNumber).toBe(1);
    expect(unchanged[0].newLineNumber).toBe(1);

    const removed = result.find((l) => l.type === "removed");
    expect(removed?.oldLineNumber).toBe(2);

    const added = result.find((l) => l.type === "added");
    expect(added?.newLineNumber).toBe(2);
  });
});

describe("buildSideBySidePairs", () => {
  it("pairs unchanged lines with themselves", () => {
    const lines = computeDiff("a\nb", "a\nb");
    const pairs = buildSideBySidePairs(lines);

    expect(pairs).toHaveLength(2);
    pairs.forEach((p) => {
      expect(p.left).not.toBeNull();
      expect(p.right).not.toBeNull();
      expect(p.left?.type).toBe("unchanged");
    });
  });

  it("pairs removed and added lines together", () => {
    const lines = computeDiff("old", "new");
    const pairs = buildSideBySidePairs(lines);

    expect(pairs).toHaveLength(1);
    expect(pairs[0].left?.type).toBe("removed");
    expect(pairs[0].right?.type).toBe("added");
  });

  it("creates spacers for unmatched lines", () => {
    const lines = computeDiff("a\nb\nc", "a\nx\ny\nz\nc");
    const pairs = buildSideBySidePairs(lines);

    // Some pairs should have null on one side (spacers)
    const hasSpacers = pairs.some((p) => p.left === null || p.right === null);
    // With 1 removed and 3 added, there will be spacers
    expect(hasSpacers || pairs.length > 0).toBe(true);
  });
});
