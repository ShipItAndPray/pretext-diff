import { describe, it, expect } from "vitest";
import { foldUnchanged } from "../src/features/FoldUnchanged";
import type { DiffLine } from "../src/types";

function makeLine(type: DiffLine["type"], n: number): DiffLine {
  return {
    type,
    oldLineNumber: type !== "added" ? n : null,
    newLineNumber: type !== "removed" ? n : null,
    content: `line ${n}`,
  };
}

describe("foldUnchanged", () => {
  it("does not fold when unchanged run is below threshold", () => {
    const lines: DiffLine[] = [
      makeLine("unchanged", 1),
      makeLine("unchanged", 2),
      makeLine("unchanged", 3),
    ];

    const result = foldUnchanged(lines, 8);
    expect(result).toHaveLength(3);
    expect(result.every((l) => l.type === "unchanged")).toBe(true);
  });

  it("folds long unchanged runs with context lines preserved", () => {
    // 20 unchanged lines
    const lines: DiffLine[] = [];
    for (let i = 1; i <= 20; i++) {
      lines.push(makeLine("unchanged", i));
    }

    const result = foldUnchanged(lines, 8, 3);

    // Should have: 3 context top + 1 fold placeholder + 3 context bottom = 7
    expect(result.length).toBe(7);

    // First 3 should be unchanged (context)
    expect(result[0].type).toBe("unchanged");
    expect(result[1].type).toBe("unchanged");
    expect(result[2].type).toBe("unchanged");

    // Middle should be fold placeholder
    expect(result[3].type).toBe("fold-placeholder");
    expect(result[3].content).toContain("unchanged lines");

    // Last 3 should be unchanged (context)
    expect(result[4].type).toBe("unchanged");
    expect(result[5].type).toBe("unchanged");
    expect(result[6].type).toBe("unchanged");
  });

  it("preserves changed lines untouched", () => {
    const lines: DiffLine[] = [
      makeLine("removed", 1),
      makeLine("added", 1),
      ...Array.from({ length: 15 }, (_, i) => makeLine("unchanged", i + 2)),
      makeLine("removed", 17),
      makeLine("added", 17),
    ];

    const result = foldUnchanged(lines, 8, 3);

    // Changed lines should still be present
    const removed = result.filter((l) => l.type === "removed");
    const added = result.filter((l) => l.type === "added");
    expect(removed).toHaveLength(2);
    expect(added).toHaveLength(2);

    // Should have a fold placeholder
    const folds = result.filter((l) => l.type === "fold-placeholder");
    expect(folds).toHaveLength(1);
  });

  it("returns original lines when threshold is 0", () => {
    const lines: DiffLine[] = Array.from({ length: 100 }, (_, i) =>
      makeLine("unchanged", i + 1)
    );

    const result = foldUnchanged(lines, 0);
    expect(result).toHaveLength(100);
  });

  it("handles empty input", () => {
    expect(foldUnchanged([], 8)).toHaveLength(0);
  });
});
