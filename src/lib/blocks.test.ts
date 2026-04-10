import { describe, expect, it } from "vitest";
import {
  fetchBlockShapeFromJobGroupAndLevel,
  fetchBlockSummaryFromManualBlocks,
  fetchGradeFromLevel,
} from "@/lib/blocks";

describe("fetchGradeFromLevel", () => {
  it("returns expected grade at each level boundary", () => {
    expect(fetchGradeFromLevel(59)).toBeNull();
    expect(fetchGradeFromLevel(60)).toBe("B");
    expect(fetchGradeFromLevel(99)).toBe("B");
    expect(fetchGradeFromLevel(100)).toBe("A");
    expect(fetchGradeFromLevel(139)).toBe("A");
    expect(fetchGradeFromLevel(140)).toBe("S");
    expect(fetchGradeFromLevel(199)).toBe("S");
    expect(fetchGradeFromLevel(200)).toBe("SS");
    expect(fetchGradeFromLevel(249)).toBe("SS");
    expect(fetchGradeFromLevel(250)).toBe("SSS");
  });

  it("returns null for invalid negative level", () => {
    expect(fetchGradeFromLevel(-1)).toBeNull();
  });
});

describe("fetchBlockShapeFromJobGroupAndLevel", () => {
  it("returns null when level is below minimum", () => {
    expect(fetchBlockShapeFromJobGroupAndLevel("mage", 59)).toBeNull();
    expect(fetchBlockShapeFromJobGroupAndLevel("mage", -1)).toBeNull();
  });

  it("returns block shape with expected grade at boundaries", () => {
    expect(fetchBlockShapeFromJobGroupAndLevel("mage", 60)?.grade).toBe("B");
    expect(fetchBlockShapeFromJobGroupAndLevel("mage", 100)?.grade).toBe("A");
    expect(fetchBlockShapeFromJobGroupAndLevel("mage", 140)?.grade).toBe("S");
    expect(fetchBlockShapeFromJobGroupAndLevel("mage", 200)?.grade).toBe("SS");
    expect(fetchBlockShapeFromJobGroupAndLevel("mage", 250)?.grade).toBe("SSS");
  });

  it("returns job-group specific shape id for same level", () => {
    expect(fetchBlockShapeFromJobGroupAndLevel("warrior", 250)?.id).toBe("sss-warrior");
    expect(fetchBlockShapeFromJobGroupAndLevel("xenon", 250)?.id).toBe("sss-xenon");
  });
});

describe("fetchBlockSummaryFromManualBlocks", () => {
  it("normalizes invalid count values and skips invalid shape ids", () => {
    const summary = fetchBlockSummaryFromManualBlocks([
      { shapeId: "invalid-shape", count: 3 },
      { shapeId: "common-b", count: Number.NaN },
      { shapeId: "common-b", count: Number.POSITIVE_INFINITY },
      { shapeId: "common-b", count: -2 },
      { shapeId: "common-b", count: 2.9 },
      { shapeId: "common-a", count: 1.2 },
    ]);

    expect(summary.blocks).toEqual([
      { shapeId: "common-a", count: 1 },
      { shapeId: "common-b", count: 2 },
    ]);
    expect(summary.totalBlocks).toBe(3);
    expect(summary.totalCells).toBe(4);
  });

  it("aggregates counts by shapeId", () => {
    const summary = fetchBlockSummaryFromManualBlocks([
      { shapeId: "common-b", count: 1 },
      { shapeId: "common-b", count: 2 },
      { shapeId: "common-a", count: 1 },
    ]);

    expect(summary.blocks).toEqual([
      { shapeId: "common-a", count: 1 },
      { shapeId: "common-b", count: 3 },
    ]);
    expect(summary.totalBlocks).toBe(4);
    expect(summary.totalCells).toBe(5);
  });

  it("keeps deterministic sort and totals with bulk repeated inputs", () => {
    const manualBlocks = [
      ...Array.from({ length: 40 }, () => ({ shapeId: "common-b", count: 1 })),
      ...Array.from({ length: 20 }, () => ({ shapeId: "common-a", count: 2 })),
      ...Array.from({ length: 10 }, () => ({ shapeId: "sss-mage", count: 1 })),
      { shapeId: "invalid-shape", count: 999 },
    ];

    const summary = fetchBlockSummaryFromManualBlocks(manualBlocks);

    expect(summary.blocks).toEqual([
      { shapeId: "common-a", count: 40 },
      { shapeId: "common-b", count: 40 },
      { shapeId: "sss-mage", count: 10 },
    ]);
    expect(summary.totalBlocks).toBe(90);
    expect(summary.totalCells).toBe(170);
  });
});
