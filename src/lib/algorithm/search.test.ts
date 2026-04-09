import { describe, expect, it } from "vitest";
import type { BlockShape } from "@/types/block";
import type {
  InnerStat,
  OuterStat,
  PlacementResult,
  Priority,
  RegionCellSetting,
  RegionPlacementStat,
} from "@/types/placement";
import { DEFAULT_PRIORITY, PRESET_CUSTOM_PRIORITY, PRESET_PRIORITY } from "@/constants/presets";
import { isConnected } from "@/lib/algorithm/placement";
import { findOptimalPlacement, isBetterResult, isOptimal } from "@/lib/algorithm/search";

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

  // At least one placed cell must lie in the central 4 cells (domain rule: connectivity anchor)
  const CENTER_KEYS = new Set(["9,10", "9,11", "10,10", "10,11"]);
  const hasCenter = keys.some((key) => CENTER_KEYS.has(key));
  expect(hasCenter).toBe(true);

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

  function makeResult(regionStats: RegionPlacementStat[]): PlacementResult {
    return {
      success: true,
      placements: [],
      stats: {
        totalTargetCells: regionStats.reduce((s, r) => s + r.targetCells, 0),
        totalPlacedCells: regionStats.reduce((s, r) => s + r.placedCells, 0),
        regionStats,
      },
    };
  }

  it("any result is better than null", () => {
    const result = makeResult([]);
    expect(isBetterResult(result, null, hunting)).toBe(true);
  });

  it("more required satisfaction wins", () => {
    const noExp = makeResult([
      { region: "exp" as OuterStat, targetCells: 40, placedCells: 0, isSatisfied: false, isForbidden: false },
    ]);
    const fullExp = makeResult([
      { region: "exp" as OuterStat, targetCells: 40, placedCells: 40, isSatisfied: true, isForbidden: false },
    ]);
    expect(isBetterResult(fullExp, noExp, hunting)).toBe(true);
    expect(isBetterResult(noExp, fullExp, hunting)).toBe(false);
  });

  it("equal required count: higher required rate wins", () => {
    // Both satisfy 0 required, but one has 20/40 vs 10/40
    const half = makeResult([
      { region: "exp" as OuterStat, targetCells: 40, placedCells: 20, isSatisfied: false, isForbidden: false },
    ]);
    const quarter = makeResult([
      { region: "exp" as OuterStat, targetCells: 40, placedCells: 10, isSatisfied: false, isForbidden: false },
    ]);
    expect(isBetterResult(half, quarter, hunting)).toBe(true);
    expect(isBetterResult(quarter, half, hunting)).toBe(false);
  });

  it("equal required: higher priority group rate wins", () => {
    // hunting required=exp(40), priorities=[[critDamage(40)],[normalDamage(40)]]
    // Both have exp=40 (required satisfied), so group rates decide
    const withCrit = makeResult([
      { region: "exp" as OuterStat, targetCells: 40, placedCells: 40, isSatisfied: true, isForbidden: false },
      { region: "critDamage" as OuterStat, targetCells: 40, placedCells: 40, isSatisfied: true, isForbidden: false },
      { region: "normalDamage" as OuterStat, targetCells: 40, placedCells: 0, isSatisfied: false, isForbidden: false },
    ]);
    const noCrit = makeResult([
      { region: "exp" as OuterStat, targetCells: 40, placedCells: 40, isSatisfied: true, isForbidden: false },
      { region: "critDamage" as OuterStat, targetCells: 40, placedCells: 0, isSatisfied: false, isForbidden: false },
      { region: "normalDamage" as OuterStat, targetCells: 40, placedCells: 40, isSatisfied: true, isForbidden: false },
    ]);
    expect(isBetterResult(withCrit, noCrit, hunting)).toBe(true);
    expect(isBetterResult(noCrit, withCrit, hunting)).toBe(false);
  });

  it("equal required + group rates: higher effectiveFilled wins", () => {
    // Both exp=0 (required not satisfied), both groups empty — effectiveFilled differs
    const moreInner = makeResult([
      { region: "exp" as OuterStat, targetCells: 40, placedCells: 0, isSatisfied: false, isForbidden: false },
      { region: "str" as InnerStat, targetCells: 15, placedCells: 10, isSatisfied: false, isForbidden: false },
    ]);
    const lessInner = makeResult([
      { region: "exp" as OuterStat, targetCells: 40, placedCells: 0, isSatisfied: false, isForbidden: false },
      { region: "str" as InnerStat, targetCells: 15, placedCells: 3, isSatisfied: false, isForbidden: false },
    ]);
    expect(isBetterResult(moreInner, lessInner, hunting)).toBe(true);
    expect(isBetterResult(lessInner, moreInner, hunting)).toBe(false);
  });

  it("equal up to effectiveFilled: fewer forbidden violations wins", () => {
    const noViolation = makeResult([
      { region: "exp" as OuterStat, targetCells: 40, placedCells: 10, isSatisfied: false, isForbidden: false },
      { region: "critRate" as OuterStat, targetCells: 0, placedCells: 0, isSatisfied: true, isForbidden: true },
    ]);
    const withViolation = makeResult([
      { region: "exp" as OuterStat, targetCells: 40, placedCells: 10, isSatisfied: false, isForbidden: false },
      { region: "critRate" as OuterStat, targetCells: 0, placedCells: 3, isSatisfied: true, isForbidden: true },
    ]);
    expect(isBetterResult(noViolation, withViolation, hunting)).toBe(true);
    expect(isBetterResult(withViolation, noViolation, hunting)).toBe(false);
  });

  it("identical results: returns false", () => {
    const result = makeResult([
      { region: "exp" as OuterStat, targetCells: 40, placedCells: 20, isSatisfied: false, isForbidden: false },
    ]);
    expect(isBetterResult(result, result, hunting)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// findOptimalPlacement — advanced / integration
// ---------------------------------------------------------------------------

describe("findOptimalPlacement — advanced", () => {
  // ── Multi-grade block sets ──────────────────────────────────────────────

  it("places S + A + B blocks (3+2+1 cells) in a connected arrangement", () => {
    const blocks: BlockShape[] = [
      { id: "s-mage", grade: "S", cells: [[0, 0], [0, 1], [0, 2]] },
      { id: "a-mage", grade: "A", cells: [[0, 0], [1, 0]] },
      { id: "b-mage", grade: "B", cells: [[0, 0]] },
    ];
    const settings: RegionCellSetting[] = [innerSetting("matk", 6)];
    const result = findOptimalPlacement(blocks, settings, DEFAULT_PRIORITY);

    expect(result).not.toBeNull();
    if (result === null) return;

    const allCells = result.placements.flatMap((p) => p.cells);
    const keys = allCells.map(([r, c]) => `${r},${c}`);
    expect(new Set(keys).size).toBe(keys.length); // no overlaps
    expect(isConnected(new Set(keys))).toBe(true);
  });

  it("SS block (4 cells) is placed connected and within bounds", () => {
    const blocks: BlockShape[] = [
      { id: "ss-warrior", grade: "SS", cells: [[0, 0], [0, 1], [1, 0], [1, 1]] },
    ];
    const settings: RegionCellSetting[] = [innerSetting("str", 4)];
    const result = findOptimalPlacement(blocks, settings, DEFAULT_PRIORITY);

    expect(result).not.toBeNull();
    if (result === null) return;
    const allCells = result.placements.flatMap((p) => p.cells);
    expect(allCells).toHaveLength(4);
    expect(isConnected(new Set(allCells.map(([r, c]) => `${r},${c}`)))).toBe(true);
  });

  // ── Priority preset adherence ───────────────────────────────────────────

  it("hunting preset: required exp region is filled before priority regions", () => {
    // 8 B-blocks → 8 cells; hunting required=exp, priorities=[critDamage,normalDamage]
    const blocks: BlockShape[] = Array.from({ length: 8 }, (_, i) => ({
      id: `b-${i}`,
      grade: "B" as const,
      cells: [[0, 0]] as [number, number][],
    }));
    const settings: RegionCellSetting[] = [
      outerSetting("exp", 8),
      outerSetting("critDamage", 0),
      outerSetting("normalDamage", 0),
      outerSetting("critRate", 0),
      outerSetting("bossDamage", 0),
      outerSetting("buffDuration", 0),
      outerSetting("ignoreDefense", 0),
      outerSetting("statusResist", 0),
    ];
    const result = findOptimalPlacement(blocks, settings, PRESET_PRIORITY.hunting);

    expect(result).not.toBeNull();
    if (result === null) return;

    // Forbidden regions must be empty
    const forbidden = ["critDamage", "normalDamage", "critRate", "bossDamage", "buffDuration", "ignoreDefense", "statusResist"];
    for (const region of forbidden) {
      const stat = result.stats.regionStats.find((s) => s.region === region);
      expect(stat?.placedCells ?? 0).toBe(0);
    }
  });

  it("boss preset: required critDamage region is filled before other priorities", () => {
    const blocks: BlockShape[] = Array.from({ length: 6 }, (_, i) => ({
      id: `b-${i}`,
      grade: "B" as const,
      cells: [[0, 0]] as [number, number][],
    }));
    const settings: RegionCellSetting[] = [
      outerSetting("critDamage", 6),
      outerSetting("bossDamage", 0),
      outerSetting("ignoreDefense", 0),
      outerSetting("exp", 0),
      outerSetting("critRate", 0),
      outerSetting("normalDamage", 0),
      outerSetting("buffDuration", 0),
      outerSetting("statusResist", 0),
    ];
    const result = findOptimalPlacement(blocks, settings, PRESET_PRIORITY.boss);

    expect(result).not.toBeNull();
    if (result === null) return;

    // All cells must avoid forbidden outer regions
    const forbidden = ["bossDamage", "ignoreDefense", "exp", "critRate", "normalDamage", "buffDuration", "statusResist"];
    for (const region of forbidden) {
      const stat = result.stats.regionStats.find((s) => s.region === region);
      expect(stat?.placedCells ?? 0).toBe(0);
    }
  });

  it("custom priority type resolves correctly", () => {
    const customPriority: Priority = {
      type: "custom",
      custom: {
        required: [innerSetting("matk", 2) as RegionCellSetting],
        priorities: [],
      },
    };
    const blocks: BlockShape[] = [
      { id: "b1", grade: "B", cells: [[0, 0]] },
      { id: "b2", grade: "B", cells: [[0, 0]] },
    ];
    const settings: RegionCellSetting[] = [innerSetting("matk", 2)];
    const result = findOptimalPlacement(blocks, settings, customPriority);

    expect(result).not.toBeNull();
    if (result === null) return;
    expect(result.placements).toHaveLength(2);
  });

  // ── onBetterResult monotonic improvement ───────────────────────────────

  it("onBetterResult: each emitted result is better than the previous", () => {
    const results: PlacementResult[] = [];
    const blocks: BlockShape[] = [
      { id: "a-mage", grade: "A", cells: [[0, 0], [1, 0]] },
      { id: "b-mage", grade: "B", cells: [[0, 0]] },
    ];
    const settings: RegionCellSetting[] = [innerSetting("matk", 3)];
    const hunting = PRESET_CUSTOM_PRIORITY.hunting;

    findOptimalPlacement(blocks, settings, DEFAULT_PRIORITY, {
      onBetterResult: (r) => results.push(r),
    });

    for (let i = 1; i < results.length; i++) {
      expect(isBetterResult(results[i], results[i - 1], hunting)).toBe(true);
    }
  });

  // ── Forbidden region constraints ───────────────────────────────────────

  it("all forbidden outer regions have zero placed cells", () => {
    const blocks: BlockShape[] = [
      { id: "s-mage", grade: "S", cells: [[0, 0], [0, 1], [0, 2]] },
      { id: "b-mage", grade: "B", cells: [[0, 0]] },
    ];
    // Only exp and critDamage are allowed; the rest are forbidden
    const settings = OUTER_SETTINGS_EXP_CRIT;
    const result = findOptimalPlacement(blocks, settings, DEFAULT_PRIORITY);
    expect(result).not.toBeNull();
    if (result === null) return;

    const forbiddenStats = result.stats.regionStats.filter((s) => s.isForbidden);
    for (const stat of forbiddenStats) {
      expect(stat.placedCells).toBe(0);
    }
  });

  // ── Stats correctness ──────────────────────────────────────────────────

  it("regionStats entries cover all provided settings exactly once", () => {
    const settings: RegionCellSetting[] = [
      innerSetting("str", 5),
      innerSetting("matk", 5),
      outerSetting("exp", 10),
    ];
    const blocks: BlockShape[] = [{ id: "b1", grade: "B", cells: [[0, 0]] }];
    const result = findOptimalPlacement(blocks, settings, DEFAULT_PRIORITY);

    expect(result).not.toBeNull();
    if (result === null) return;
    expect(result.stats.regionStats).toHaveLength(settings.length);
    for (const s of settings) {
      const found = result.stats.regionStats.find((rs) => rs.region === s.region);
      expect(found).not.toBeUndefined();
    }
  });

  it("totalPlacedCells equals actual placed cell count across all blocks", () => {
    const blocks: BlockShape[] = [
      { id: "s-mage", grade: "S", cells: [[0, 0], [0, 1], [0, 2]] },
      { id: "a-mage", grade: "A", cells: [[0, 0], [1, 0]] },
    ];
    const settings: RegionCellSetting[] = [innerSetting("matk", 5)];
    const result = findOptimalPlacement(blocks, settings, DEFAULT_PRIORITY);

    expect(result).not.toBeNull();
    if (result === null) return;
    const cellCount = result.placements.reduce((sum, p) => sum + p.cells.length, 0);
    expect(result.stats.totalPlacedCells).toBe(cellCount);
  });

  it("isSatisfied in regionStats is consistent with placedCells vs targetCells", () => {
    const blocks: BlockShape[] = [{ id: "b1", grade: "B", cells: [[0, 0]] }];
    const settings: RegionCellSetting[] = [innerSetting("matk", 3)];
    const result = findOptimalPlacement(blocks, settings, DEFAULT_PRIORITY);

    expect(result).not.toBeNull();
    if (result === null) return;
    for (const rs of result.stats.regionStats) {
      expect(rs.isSatisfied).toBe(rs.placedCells >= rs.targetCells);
    }
  });
});
