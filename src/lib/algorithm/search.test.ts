import { describe, expect, it } from "vitest";
import type { BlockShape } from "@/types/block";
import type { InnerStat, OuterStat, RegionCellSetting } from "@/types/placement";
import { DEFAULT_PRIORITY, PRESET_CUSTOM_PRIORITY } from "@/constants/presets";
import { findOptimalPlacement, isBetterResult, isOptimal } from "./search";
import { isConnected } from "./placement";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function outerSetting(region: OuterStat, targetCells: number): RegionCellSetting {
  return { region, targetCells, maxCells: 40, isOuter: true };
}

function innerSetting(region: InnerStat, targetCells: number): RegionCellSetting {
  return { region, targetCells, maxCells: 15, isOuter: false };
}

/** All outer regions — only exp and critDamage have targets, rest forbidden. */
const OUTER_SETTINGS_EXP_CRIT: RegionCellSetting[] = [
  outerSetting("exp", 40),
  outerSetting("critRate", 0),
  outerSetting("bossDamage", 0),
  outerSetting("normalDamage", 0),
  outerSetting("buffDuration", 0),
  outerSetting("ignoreDefense", 0),
  outerSetting("critDamage", 40),
  outerSetting("statusResist", 0),
];

/** Small inner-only target: fill 2 cells in 'matk' region. */
const INNER_MATK_2: RegionCellSetting[] = [
  innerSetting("str", 0),
  innerSetting("dex", 0),
  innerSetting("int", 0),
  innerSetting("luk", 0),
  innerSetting("hp", 0),
  innerSetting("mp", 0),
  innerSetting("atk", 0),
  innerSetting("matk", 2),
];

/** Two 1-cell B-grade blocks. */
const TWO_B_BLOCKS: BlockShape[] = [
  { id: "common-b", grade: "B", cells: [[0, 0]] },
  { id: "common-b", grade: "B", cells: [[0, 0]] },
];

/** Cross-shaped SSS mage block. */
const SSS_MAGE: BlockShape[] = [
  {
    id: "sss-mage",
    grade: "SSS",
    cells: [
      [0, 0],
      [-1, 0],
      [0, -1],
      [1, 0],
      [0, 1],
    ],
  },
];

// ---------------------------------------------------------------------------
// Validity assertion
// ---------------------------------------------------------------------------

function assertValid(
  result: ReturnType<typeof findOptimalPlacement>,
  settings: RegionCellSetting[],
): void {
  expect(result).not.toBeNull();
  if (result === null) return;

  // Placed cells must not overlap
  const allCells = result.placements.flatMap((p) => p.cells);
  const keys = allCells.map(([r, c]) => `${r},${c}`);
  expect(new Set(keys).size).toBe(keys.length);

  // All cells must be connected
  expect(isConnected(new Set(keys))).toBe(true);

  // No cells in forbidden outer regions
  for (const s of settings) {
    if (s.targetCells === 0 && s.isOuter) {
      const stat = result.stats.regionStats.find((rs) => rs.region === s.region);
      expect(stat?.placedCells ?? 0).toBe(0);
    }
  }

  // regionStats.isSatisfied matches actual placedCells
  for (const rs of result.stats.regionStats) {
    expect(rs.isSatisfied).toBe(rs.placedCells >= rs.targetCells);
  }
}

// ---------------------------------------------------------------------------
// findOptimalPlacement
// ---------------------------------------------------------------------------

describe("findOptimalPlacement", () => {
  it("returns null when no blocks are provided", () => {
    const result = findOptimalPlacement([], [outerSetting("exp", 1)], DEFAULT_PRIORITY);
    expect(result).toBeNull();
  });

  it("places a single B-grade block at a center cell", () => {
    const settings: RegionCellSetting[] = [innerSetting("matk", 1)];
    const blocks: BlockShape[] = [{ id: "common-b", grade: "B", cells: [[0, 0]] }];

    const result = findOptimalPlacement(blocks, settings, DEFAULT_PRIORITY);
    assertValid(result, settings);

    expect(result!.placements).toHaveLength(1);
    const [row, col] = result!.placements[0].placementOrigin;
    const isCenter =
      (row === 9 && col === 10) ||
      (row === 9 && col === 11) ||
      (row === 10 && col === 10) ||
      (row === 10 && col === 11);
    expect(isCenter).toBe(true);
  });

  it("two B blocks are placed adjacently (connectivity enforced)", () => {
    const result = findOptimalPlacement(TWO_B_BLOCKS, INNER_MATK_2, DEFAULT_PRIORITY);
    assertValid(result, INNER_MATK_2);
    // Both blocks placed → 2 cells, must be adjacent
    expect(result!.placements).toHaveLength(2);
  });

  it("SSS cross block: 5 cells, connected, valid placement", () => {
    const settings: RegionCellSetting[] = [innerSetting("matk", 5)];
    const result = findOptimalPlacement(SSS_MAGE, settings, DEFAULT_PRIORITY);
    assertValid(result, settings);
    expect(result!.placements).toHaveLength(1);
    expect(result!.placements[0].cells).toHaveLength(5);
  });

  it("no cells land in forbidden outer regions", () => {
    const blocks: BlockShape[] = [
      { id: "common-b", grade: "B", cells: [[0, 0]] },
      { id: "common-a", grade: "A", cells: [[0, 0], [1, 0]] },
    ];
    const result = findOptimalPlacement(blocks, OUTER_SETTINGS_EXP_CRIT, DEFAULT_PRIORITY);
    if (result !== null) assertValid(result, OUTER_SETTINGS_EXP_CRIT);
  });

  it("abort callback stops search; result is null or valid", () => {
    const result = findOptimalPlacement(SSS_MAGE, [innerSetting("matk", 5)], DEFAULT_PRIORITY, {
      shouldAbort: () => true,
    });
    if (result !== null) assertValid(result, [innerSetting("matk", 5)]);
  });

  it("onBetterResult is called at least once when a solution is found", () => {
    let calls = 0;
    const blocks: BlockShape[] = [{ id: "common-b", grade: "B", cells: [[0, 0]] }];
    findOptimalPlacement(blocks, [innerSetting("matk", 1)], DEFAULT_PRIORITY, {
      onBetterResult: () => { calls += 1; },
    });
    expect(calls).toBeGreaterThan(0);
  });

  it("totalPlacedCells in stats equals sum of all placed block cells", () => {
    const result = findOptimalPlacement(TWO_B_BLOCKS, INNER_MATK_2, DEFAULT_PRIORITY);
    expect(result).not.toBeNull();
    const totalCells = result!.placements.reduce((sum, p) => sum + p.cells.length, 0);
    expect(result!.stats.totalPlacedCells).toBe(totalCells);
  });
});

// ---------------------------------------------------------------------------
// isOptimal
// ---------------------------------------------------------------------------

describe("isOptimal", () => {
  const hunting = PRESET_CUSTOM_PRIORITY.hunting;

  it("returns false when required region target is not reached", () => {
    const settings = [outerSetting("exp", 40)];
    const result = {
      success: true,
      placements: [],
      stats: {
        totalTargetCells: 40,
        totalPlacedCells: 0,
        regionStats: [
          { region: "exp" as OuterStat, targetCells: 40, placedCells: 0, isSatisfied: false, isForbidden: false },
        ],
      },
    };
    expect(isOptimal(result, hunting, settings)).toBe(false);
  });

  it("returns true when all required and priority targets are fully met", () => {
    // hunting preset: required=[exp:40], priorities=[[critDamage:40],[normalDamage:40]]
    const settings = [
      outerSetting("exp", 40),
      outerSetting("critDamage", 40),
      outerSetting("normalDamage", 40),
    ];
    const result = {
      success: true,
      placements: [],
      stats: {
        totalTargetCells: 120,
        totalPlacedCells: 120,
        regionStats: [
          { region: "exp" as OuterStat, targetCells: 40, placedCells: 40, isSatisfied: true, isForbidden: false },
          { region: "critDamage" as OuterStat, targetCells: 40, placedCells: 40, isSatisfied: true, isForbidden: false },
          { region: "normalDamage" as OuterStat, targetCells: 40, placedCells: 40, isSatisfied: true, isForbidden: false },
        ],
      },
    };
    expect(isOptimal(result, hunting, settings)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isBetterResult
// ---------------------------------------------------------------------------

describe("isBetterResult", () => {
  const hunting = PRESET_CUSTOM_PRIORITY.hunting;

  it("any result is better than null", () => {
    const result = { success: true, placements: [], stats: { totalTargetCells: 0, totalPlacedCells: 0, regionStats: [] } };
    expect(isBetterResult(result, null, hunting)).toBe(true);
  });

  it("more required satisfaction wins", () => {
    const noExp = {
      success: true, placements: [], stats: {
        totalTargetCells: 40, totalPlacedCells: 0,
        regionStats: [{ region: "exp" as OuterStat, targetCells: 40, placedCells: 0, isSatisfied: false, isForbidden: false }],
      },
    };
    const fullExp = {
      success: true, placements: [], stats: {
        totalTargetCells: 40, totalPlacedCells: 40,
        regionStats: [{ region: "exp" as OuterStat, targetCells: 40, placedCells: 40, isSatisfied: true, isForbidden: false }],
      },
    };
    expect(isBetterResult(fullExp, noExp, hunting)).toBe(true);
    expect(isBetterResult(noExp, fullExp, hunting)).toBe(false);
  });
});
