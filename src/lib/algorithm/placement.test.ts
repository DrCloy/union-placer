import { describe, expect, it } from "vitest";
import type { BlockVariant } from "@/types/block";
import type { InnerStat, OuterStat, RegionCellSetting } from "@/types/placement";
import {
  canPlace,
  calculateRegionStats,
  countCellsInRegion,
  createEmptyState,
  createResult,
  getRegionAt,
  isConnected,
  isForbiddenRegion,
  isInBounds,
  placeBlock,
} from "@/lib/algorithm/placement";

// ---------------------------------------------------------------------------
// isInBounds
// ---------------------------------------------------------------------------
describe("isInBounds", () => {
  it("accepts valid cells", () => {
    expect(isInBounds(0, 0)).toBe(true);
    expect(isInBounds(19, 21)).toBe(true);
    expect(isInBounds(9, 10)).toBe(true);
  });

  it("rejects out-of-bounds cells", () => {
    expect(isInBounds(-1, 0)).toBe(false);
    expect(isInBounds(0, -1)).toBe(false);
    expect(isInBounds(20, 0)).toBe(false);
    expect(isInBounds(0, 22)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getRegionAt — center cells are part of inner regions
// ---------------------------------------------------------------------------
describe("getRegionAt", () => {
  it("returns a stat for center cells", () => {
    expect(getRegionAt(9, 10)).not.toBeNull();
    expect(getRegionAt(9, 11)).not.toBeNull();
    expect(getRegionAt(10, 10)).not.toBeNull();
    expect(getRegionAt(10, 11)).not.toBeNull();
  });

  it("returns null for out-of-bounds coordinates", () => {
    expect(getRegionAt(-1, 0)).toBeNull();
    expect(getRegionAt(0, -1)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// isForbiddenRegion
// ---------------------------------------------------------------------------
describe("isForbiddenRegion", () => {
  it("outer region with target > 0 is not forbidden", () => {
    // (1,12) is in an outer region; a setting with targetCells > 0 must NOT be forbidden
    const stat = getRegionAt(1, 12);
    expect(stat).not.toBeNull();
    const setting: RegionCellSetting = {
      region: stat as OuterStat,
      targetCells: 40,
      maxCells: 40,
      isOuter: true,
    };
    expect(isForbiddenRegion(1, 12, [setting])).toBe(false);
  });

  it("inner region is never forbidden regardless of settings", () => {
    const regionSettings: RegionCellSetting[] = []; // no settings at all
    expect(isForbiddenRegion(9, 10, regionSettings)).toBe(false);
    expect(isForbiddenRegion(10, 11, regionSettings)).toBe(false);
  });

  it("outer region with targetCells=0 is forbidden", () => {
    const stat = getRegionAt(1, 12);
    expect(stat).not.toBeNull();
    const zeroSetting: RegionCellSetting = {
      region: stat as OuterStat,
      targetCells: 0,
      maxCells: 40,
      isOuter: true,
    };
    expect(isForbiddenRegion(1, 12, [zeroSetting])).toBe(true);
  });

  it("outer region not in settings is forbidden", () => {
    const stat = getRegionAt(1, 12);
    expect(stat).not.toBeNull();
    expect(isForbiddenRegion(1, 12, [])).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// placeBlock + isConnected
// ---------------------------------------------------------------------------
describe("placeBlock", () => {
  const variant: BlockVariant = {
    cells: [
      [0, 0],
      [0, 1],
    ],
    rotation: 0,
    flipped: false,
  };

  it("adds cells to occupied and updates placedCells", () => {
    const state = createEmptyState(3);
    const newState = placeBlock(state, 0, "common-a", variant, [9, 10]);
    expect(newState.occupied.has("9,10")).toBe(true);
    expect(newState.occupied.has("9,11")).toBe(true);
    expect(newState.placedCells).toBe(2);
    expect(newState.remainingBlocks).toEqual([1, 2]);
  });

  it("records the placement with correct shapeId and origin", () => {
    const state = createEmptyState(1);
    const newState = placeBlock(state, 0, "common-a", variant, [9, 10]);
    expect(newState.placements).toHaveLength(1);
    expect(newState.placements[0].shapeId).toBe("common-a");
    expect(newState.placements[0].placementOrigin).toEqual([9, 10]);
  });

  it("does not mutate the original state", () => {
    const state = createEmptyState(1);
    placeBlock(state, 0, "common-a", variant, [9, 10]);
    expect(state.occupied.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// canPlace
// ---------------------------------------------------------------------------
describe("canPlace", () => {
  const singleCell: BlockVariant = { cells: [[0, 0]], rotation: 0, flipped: false };
  const allSettings: RegionCellSetting[] = [
    { region: "str", targetCells: 15, maxCells: 15, isOuter: false },
    { region: "dex", targetCells: 15, maxCells: 15, isOuter: false },
    { region: "int", targetCells: 15, maxCells: 15, isOuter: false },
    { region: "luk", targetCells: 15, maxCells: 15, isOuter: false },
    { region: "hp", targetCells: 15, maxCells: 15, isOuter: false },
    { region: "mp", targetCells: 15, maxCells: 15, isOuter: false },
    { region: "atk", targetCells: 15, maxCells: 15, isOuter: false },
    { region: "matk", targetCells: 15, maxCells: 15, isOuter: false },
    { region: "exp", targetCells: 40, maxCells: 40, isOuter: true },
    { region: "critRate", targetCells: 40, maxCells: 40, isOuter: true },
    { region: "bossDamage", targetCells: 40, maxCells: 40, isOuter: true },
    { region: "normalDamage", targetCells: 40, maxCells: 40, isOuter: true },
    { region: "buffDuration", targetCells: 40, maxCells: 40, isOuter: true },
    { region: "ignoreDefense", targetCells: 40, maxCells: 40, isOuter: true },
    { region: "critDamage", targetCells: 40, maxCells: 40, isOuter: true },
    { region: "statusResist", targetCells: 40, maxCells: 40, isOuter: true },
  ];

  it("allows placing on an empty board center cell", () => {
    const state = createEmptyState(1);
    expect(canPlace(state.occupied, singleCell, [9, 10], allSettings)).toBe(true);
  });

  it("rejects placing on an occupied cell", () => {
    const occupied = new Set(["9,10"]);
    expect(canPlace(occupied, singleCell, [9, 10], allSettings)).toBe(false);
  });

  it("rejects placing out of bounds", () => {
    const state = createEmptyState(1);
    expect(canPlace(state.occupied, singleCell, [-1, 0], allSettings)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isConnected
// ---------------------------------------------------------------------------
describe("isConnected", () => {
  it("empty board is connected", () => {
    expect(isConnected(new Set())).toBe(true);
  });

  it("single cell is connected", () => {
    expect(isConnected(new Set(["5,5"]))).toBe(true);
  });

  it("two adjacent cells are connected", () => {
    expect(isConnected(new Set(["5,5", "5,6"]))).toBe(true);
  });

  it("two non-adjacent cells are not connected", () => {
    expect(isConnected(new Set(["5,5", "7,7"]))).toBe(false);
  });

  it("L-shape (3 cells) is connected", () => {
    expect(isConnected(new Set(["0,0", "1,0", "1,1"]))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// calculateRegionStats + createResult
// ---------------------------------------------------------------------------
describe("calculateRegionStats", () => {
  it("correctly counts cells placed in each region", () => {
    // Place a block at a center cell — (9,10) belongs to inner-11 (matk)
    const state = createEmptyState(1);
    const variant: BlockVariant = { cells: [[0, 0]], rotation: 0, flipped: false };
    const newState = placeBlock(state, 0, "common-b", variant, [9, 10]);

    const matkStat = getRegionAt(9, 10);
    expect(matkStat).not.toBeNull();

    const settings: RegionCellSetting[] = [
      { region: matkStat! as InnerStat, targetCells: 15, maxCells: 15, isOuter: false },
    ];
    const stats = calculateRegionStats(newState.occupied, settings);
    expect(stats[0].placedCells).toBe(1);
    expect(stats[0].isSatisfied).toBe(false); // 1 < 15
  });
});

describe("countCellsInRegion", () => {
  it("counts occupied cells in a specific region", () => {
    const stat = getRegionAt(9, 10);
    expect(stat).not.toBeNull();
    const occupied = new Set(["9,10", "9,11"]);
    // Both (9,10) and (9,11) might belong to different regions
    const count = countCellsInRegion(occupied, stat!);
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

describe("createResult", () => {
  it("success=false when forbidden outer region has placed cells", () => {
    // Cell (1,12) is in an outer region; mark it forbidden (targetCells=0, isOuter=true)
    const occupied = new Set(["1,12"]);
    const stat = getRegionAt(1, 12);
    expect(stat).not.toBeNull();
    const settings: RegionCellSetting[] = [
      { region: stat as OuterStat, targetCells: 0, maxCells: 40, isOuter: true },
    ];
    const state = {
      occupied,
      placements: [],
      remainingBlocks: [],
      placedCells: 1,
    };
    const result = createResult(state, settings);
    expect(result.success).toBe(false);
  });

  it("success=true when inner region has targetCells=0 (inner regions are never forbidden)", () => {
    const occupied = new Set(["9,10"]);
    const stat = getRegionAt(9, 10);
    expect(stat).not.toBeNull();
    const settings: RegionCellSetting[] = [
      { region: stat! as InnerStat, targetCells: 0, maxCells: 15, isOuter: false },
    ];
    const state = {
      occupied,
      placements: [],
      remainingBlocks: [],
      placedCells: 1,
    };
    const result = createResult(state, settings);
    expect(result.success).toBe(true);
  });

  it("sets totalTargetCells correctly", () => {
    const settings: RegionCellSetting[] = [
      { region: "str", targetCells: 10, maxCells: 15, isOuter: false },
      { region: "dex", targetCells: 5, maxCells: 15, isOuter: false },
    ];
    const state = createEmptyState(0);
    const result = createResult(state, settings);
    expect(result.stats.totalTargetCells).toBe(15);
  });
});
