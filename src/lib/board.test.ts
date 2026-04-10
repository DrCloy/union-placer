import { describe, expect, it } from "vitest";
import { INNER_REGIONS, OUTER_REGIONS, UNION_BOARD } from "@/constants/board";
import { fetchIsCenterCoordinate, fetchRegionFromCoordinate, fetchRegionMeta } from "@/lib/board";

describe("fetchIsCenterCoordinate", () => {
  it("returns true for the exact center 4 cells", () => {
    expect(fetchIsCenterCoordinate([9, 10])).toBe(true);
    expect(fetchIsCenterCoordinate([9, 11])).toBe(true);
    expect(fetchIsCenterCoordinate([10, 10])).toBe(true);
    expect(fetchIsCenterCoordinate([10, 11])).toBe(true);
  });

  it("returns false for cells adjacent to center", () => {
    expect(fetchIsCenterCoordinate([9, 9])).toBe(false);
    expect(fetchIsCenterCoordinate([10, 12])).toBe(false);
  });
});

describe("fetchRegionFromCoordinate", () => {
  it("returns null for out-of-bounds coordinates", () => {
    expect(fetchRegionFromCoordinate([-1, 0])).toBeNull();
    expect(fetchRegionFromCoordinate([0, -1])).toBeNull();
    expect(fetchRegionFromCoordinate([20, 0])).toBeNull();
    expect(fetchRegionFromCoordinate([0, 22])).toBeNull();
  });

  it("returns a region stat for center cells", () => {
    expect(fetchRegionFromCoordinate([9, 10])).not.toBeNull();
    expect(fetchRegionFromCoordinate([9, 11])).not.toBeNull();
    expect(fetchRegionFromCoordinate([10, 10])).not.toBeNull();
    expect(fetchRegionFromCoordinate([10, 11])).not.toBeNull();
  });
});

describe("fetchRegionMeta", () => {
  it("returns inner-region meta for center cell stat", () => {
    const centerStat = fetchRegionFromCoordinate([9, 10]);
    expect(centerStat).not.toBeNull();

    const centerMeta = fetchRegionMeta(centerStat!);
    expect(centerMeta).not.toBeNull();
    expect(centerMeta?.region).toBe(centerStat);
    expect(centerMeta?.isOuter).toBe(false);
    expect(centerMeta?.maxCells).toBe(15);
  });

  it("returns outer-region meta consistent with outer coordinate", () => {
    const outerCoordinate = OUTER_REGIONS[0].cells[0];
    const outerStat = fetchRegionFromCoordinate(outerCoordinate);
    expect(outerStat).toBe(OUTER_REGIONS[0].stat);

    const outerMeta = fetchRegionMeta(outerStat!);
    expect(outerMeta).not.toBeNull();
    expect(outerMeta?.region).toBe(OUTER_REGIONS[0].stat);
    expect(outerMeta?.isOuter).toBe(true);
    expect(outerMeta?.maxCells).toBe(40);
  });
});

describe("board mapping smoke", () => {
  it("covers the full board with no duplicate or missing region mappings", () => {
    const allRegionCells = [...INNER_REGIONS, ...OUTER_REGIONS].flatMap((region) => region.cells);
    const keys = allRegionCells.map(([row, col]) => `${row},${col}`);

    expect(allRegionCells).toHaveLength(UNION_BOARD.totalCells);
    expect(new Set(keys).size).toBe(UNION_BOARD.totalCells);

    for (let row = 0; row < UNION_BOARD.height; row += 1) {
      for (let col = 0; col < UNION_BOARD.width; col += 1) {
        expect(fetchRegionFromCoordinate([row, col])).not.toBeNull();
      }
    }
  });
});
