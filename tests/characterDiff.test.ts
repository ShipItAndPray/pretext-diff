import { describe, it, expect } from "vitest";
import { computeCharDiffs } from "../src/diff/characterDiff";

describe("computeCharDiffs", () => {
  it("returns empty arrays for identical strings", () => {
    const result = computeCharDiffs("hello", "hello");
    expect(result.removed).toHaveLength(0);
    expect(result.added).toHaveLength(0);
  });

  it("highlights added characters", () => {
    const result = computeCharDiffs("abc", "abXc");
    expect(result.added.length).toBeGreaterThanOrEqual(1);
    // The added char 'X' should be highlighted
    const addedRange = result.added[0];
    expect("abXc".slice(addedRange.start, addedRange.end)).toContain("X");
  });

  it("highlights removed characters", () => {
    const result = computeCharDiffs("abXc", "abc");
    expect(result.removed.length).toBeGreaterThanOrEqual(1);
    const removedRange = result.removed[0];
    expect("abXc".slice(removedRange.start, removedRange.end)).toContain("X");
  });

  it("handles complete replacement", () => {
    const result = computeCharDiffs("hello", "world");
    expect(result.removed.length).toBeGreaterThanOrEqual(1);
    expect(result.added.length).toBeGreaterThanOrEqual(1);
  });

  it("handles empty strings", () => {
    const result = computeCharDiffs("", "abc");
    expect(result.added).toHaveLength(1);
    expect(result.added[0]).toEqual({ start: 0, end: 3, type: "added" });
    expect(result.removed).toHaveLength(0);
  });

  it("character ranges are non-overlapping and ordered", () => {
    const result = computeCharDiffs(
      "the quick brown fox",
      "the slow red fox"
    );

    for (const diffs of [result.removed, result.added]) {
      for (let i = 1; i < diffs.length; i++) {
        expect(diffs[i].start).toBeGreaterThanOrEqual(diffs[i - 1].end);
      }
    }
  });
});
