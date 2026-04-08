import type { BlockShape, BlockVariant } from "@/types/block";
import type {
  CustomPriority,
  PlacementResult,
  Priority,
  RegionCellSetting,
  RegionPlacementStat,
  RegionStat,
} from "@/types/placement";
import { PRESET_CUSTOM_PRIORITY } from "@/constants/presets";
import { generateVariants } from "./variants";
import {
  type AlgoState,
  canPlace,
  countCellsInRegion,
  countEmptyCellsInRegion,
  createEmptyState,
  createResult,
  getAdjacentPositions,
  getRegionAt,
  isConnected,
  placeBlock,
} from "./placement";

// ---------------------------------------------------------------------------
// Public callback interface (for abort / progress reporting)
// ---------------------------------------------------------------------------

export interface SearchCallbacks {
  shouldAbort?: () => boolean;
  onBetterResult?: (result: PlacementResult) => void;
}

// ---------------------------------------------------------------------------
// Priority resolution helper
// ---------------------------------------------------------------------------

function resolveCustomPriority(priority: Priority): CustomPriority {
  if (priority.type === "custom") return priority.custom;
  return PRESET_CUSTOM_PRIORITY[priority.preset];
}

// ---------------------------------------------------------------------------
// Scoring (3-6 support)
// ---------------------------------------------------------------------------

/** Returns a priority rank score for a region stat. Higher = more important. */
function getRegionScore(stat: RegionStat, customPriority: CustomPriority): number {
  const { required, priorities } = customPriority;

  if (required.some((r) => r.region === stat)) return 1000;

  const groupIdx = priorities.findIndex((group) => group.some((s) => s.region === stat));
  if (groupIdx >= 0) return 100 / (groupIdx + 1);

  return 0;
}

/**
 * Scores a potential block placement.
 * Higher score = more useful given the current priority.
 */
function scorePlacement(
  variant: BlockVariant,
  position: [number, number],
  regionSettings: RegionCellSetting[],
  customPriority: CustomPriority,
): number {
  const [pRow, pCol] = position;
  let score = 0;

  for (const [dRow, dCol] of variant.cells) {
    const row = pRow + dRow;
    const col = pCol + dCol;
    const stat = getRegionAt(row, col);
    if (stat === null) continue;

    const setting = regionSettings.find((s) => s.region === stat);

    if (setting === undefined || setting.targetCells === 0) {
      score += 1; // inner region connectivity bonus
      continue;
    }

    score += getRegionScore(stat, customPriority);
  }

  return score;
}

// ---------------------------------------------------------------------------
// Best placement finder (3-6)
// ---------------------------------------------------------------------------

interface PlacementCandidate {
  blockIdx: number;
  variant: BlockVariant;
  position: [number, number];
  score: number;
}

function findBestPlacement(
  state: AlgoState,
  allVariants: BlockVariant[][],
  positions: [number, number][],
  regionSettings: RegionCellSetting[],
  customPriority: CustomPriority,
): PlacementCandidate | null {
  let best: PlacementCandidate | null = null;

  for (const blockIdx of state.remainingBlocks) {
    for (const variant of allVariants[blockIdx]) {
      for (const position of positions) {
        if (!canPlace(state.occupied, variant, position, regionSettings)) continue;

        const score = scorePlacement(variant, position, regionSettings, customPriority);
        if (best === null || score > best.score) {
          best = { blockIdx, variant, position, score };
        }
      }
    }
  }

  return best;
}

// ---------------------------------------------------------------------------
// Greedy initial solution (3-6)
// ---------------------------------------------------------------------------

const CENTER_POSITIONS: [number, number][] = [
  [9, 10],
  [9, 11],
  [10, 10],
  [10, 11],
];

function buildGreedySolution(
  blocks: BlockShape[],
  allVariants: BlockVariant[][],
  regionSettings: RegionCellSetting[],
  customPriority: CustomPriority,
): PlacementResult | null {
  let state = createEmptyState(blocks.length);

  // First block must anchor at a center cell
  const firstCandidate = findBestPlacement(state, allVariants, CENTER_POSITIONS, regionSettings, customPriority);
  if (firstCandidate === null) return null;

  state = placeBlock(
    state,
    firstCandidate.blockIdx,
    blocks[firstCandidate.blockIdx].id,
    firstCandidate.variant,
    firstCandidate.position,
    regionSettings,
  );

  // Remaining blocks: greedy best at each step
  while (state.remainingBlocks.length > 0) {
    const positions = getAdjacentPositions(state.occupied, regionSettings);
    const candidate = findBestPlacement(state, allVariants, positions, regionSettings, customPriority);
    if (candidate === null) break;

    state = placeBlock(
      state,
      candidate.blockIdx,
      blocks[candidate.blockIdx].id,
      candidate.variant,
      candidate.position,
      regionSettings,
    );
  }

  return createResult(state, regionSettings);
}

// ---------------------------------------------------------------------------
// Result evaluation (3-9)
// ---------------------------------------------------------------------------

function countSatisfiedRequired(
  regionStats: RegionPlacementStat[],
  customPriority: CustomPriority,
): number {
  return customPriority.required.filter((req) => {
    const stat = regionStats.find((s) => s.region === req.region);
    return stat !== undefined && stat.placedCells >= req.targetCells;
  }).length;
}

function calculateRequiredSatisfactionRate(
  regionStats: RegionPlacementStat[],
  customPriority: CustomPriority,
): number {
  const { required } = customPriority;
  if (required.length === 0) return 1;

  let totalTarget = 0;
  let totalPlaced = 0;
  for (const req of required) {
    const stat = regionStats.find((s) => s.region === req.region);
    totalTarget += req.targetCells;
    totalPlaced += stat !== undefined ? Math.min(stat.placedCells, req.targetCells) : 0;
  }
  return totalTarget === 0 ? 1 : totalPlaced / totalTarget;
}

function calculateGroupSatisfactionRate(
  regionStats: RegionPlacementStat[],
  group: RegionCellSetting[],
): number {
  if (group.length === 0) return 1;

  let totalTarget = 0;
  let totalPlaced = 0;
  for (const setting of group) {
    const stat = regionStats.find((s) => s.region === setting.region);
    totalTarget += setting.targetCells;
    totalPlaced += stat !== undefined ? Math.min(stat.placedCells, setting.targetCells) : 0;
  }
  return totalTarget === 0 ? 1 : totalPlaced / totalTarget;
}

function countForbiddenViolations(regionStats: RegionPlacementStat[]): number {
  return regionStats
    .filter((s) => s.isForbidden && s.placedCells > 0)
    .reduce((sum, s) => sum + s.placedCells, 0);
}

export function isOptimal(
  result: PlacementResult,
  customPriority: CustomPriority,
  regionSettings: RegionCellSetting[],
): boolean {
  for (const req of customPriority.required) {
    const stat = result.stats.regionStats.find((s) => s.region === req.region);
    if (stat === undefined || stat.placedCells < req.targetCells) return false;
  }

  for (const group of customPriority.priorities) {
    for (const setting of group) {
      const stat = result.stats.regionStats.find((s) => s.region === setting.region);
      if (stat === undefined || stat.placedCells < setting.targetCells) return false;
    }
  }

  if (result.stats.regionStats.some((s) => s.isForbidden && s.placedCells > 0)) return false;

  for (const setting of regionSettings) {
    if (setting.targetCells === 0) continue;
    const stat = result.stats.regionStats.find((s) => s.region === setting.region);
    if (stat === undefined || stat.placedCells < setting.targetCells) return false;
  }

  return true;
}

export function isBetterResult(
  candidate: PlacementResult,
  current: PlacementResult | null,
  customPriority: CustomPriority,
): boolean {
  if (current === null) return true;

  const cStats = candidate.stats.regionStats;
  const bStats = current.stats.regionStats;

  const cRequired = countSatisfiedRequired(cStats, customPriority);
  const bRequired = countSatisfiedRequired(bStats, customPriority);
  if (cRequired !== bRequired) return cRequired > bRequired;

  const cRequiredRate = calculateRequiredSatisfactionRate(cStats, customPriority);
  const bRequiredRate = calculateRequiredSatisfactionRate(bStats, customPriority);
  if (cRequiredRate !== bRequiredRate) return cRequiredRate > bRequiredRate;

  for (const group of customPriority.priorities) {
    const cRate = calculateGroupSatisfactionRate(cStats, group);
    const bRate = calculateGroupSatisfactionRate(bStats, group);
    if (cRate !== bRate) return cRate > bRate;
  }

  const cForbidden = countForbiddenViolations(cStats);
  const bForbidden = countForbiddenViolations(bStats);
  if (cForbidden !== bForbidden) return cForbidden < bForbidden;

  return false;
}

// ---------------------------------------------------------------------------
// Pruning helpers (3-7)
// ---------------------------------------------------------------------------

function maxFillableInRegion(
  state: AlgoState,
  blocks: BlockShape[],
  region: RegionStat,
): number {
  const emptyInRegion = countEmptyCellsInRegion(state.occupied, region);
  const remainingBlockCells = state.remainingBlocks.reduce(
    (sum, idx) => sum + blocks[idx].cells.length,
    0,
  );
  return Math.min(emptyInRegion, remainingBlockCells);
}

function canSatisfyRequired(
  state: AlgoState,
  blocks: BlockShape[],
  regionSettings: RegionCellSetting[],
  customPriority: CustomPriority,
): boolean {
  for (const req of customPriority.required) {
    const setting = regionSettings.find((s) => s.region === req.region);
    if (setting === undefined) continue;

    const alreadyPlaced = countCellsInRegion(state.occupied, req.region);
    const remainingNeeded = setting.targetCells - alreadyPlaced;
    if (remainingNeeded <= 0) continue;

    if (maxFillableInRegion(state, blocks, req.region) < remainingNeeded) return false;
  }
  return true;
}

function sortBlocksByPriority(
  blockIndices: number[],
  blocks: BlockShape[],
  allVariants: BlockVariant[][],
): number[] {
  return [...blockIndices].sort((idxA, idxB) => {
    const sizeDiff = blocks[idxB].cells.length - blocks[idxA].cells.length;
    if (sizeDiff !== 0) return sizeDiff;
    return allVariants[idxA].length - allVariants[idxB].length;
  });
}

function sortPositionsByPriority(
  positions: [number, number][],
  regionSettings: RegionCellSetting[],
  customPriority: CustomPriority,
): [number, number][] {
  return [...positions].sort(([aRow, aCol], [bRow, bCol]) => {
    const aStat = getRegionAt(aRow, aCol);
    const bStat = getRegionAt(bRow, bCol);
    const aHasTarget = aStat !== null && regionSettings.some((s) => s.region === aStat && s.targetCells > 0);
    const bHasTarget = bStat !== null && regionSettings.some((s) => s.region === bStat && s.targetCells > 0);
    const aScore = aStat !== null && aHasTarget ? getRegionScore(aStat, customPriority) : 0;
    const bScore = bStat !== null && bHasTarget ? getRegionScore(bStat, customPriority) : 0;
    return bScore - aScore;
  });
}

// ---------------------------------------------------------------------------
// Recursive backtracking search (3-7)
// ---------------------------------------------------------------------------

function searchRecursive(
  state: AlgoState,
  blocks: BlockShape[],
  allVariants: BlockVariant[][],
  regionSettings: RegionCellSetting[],
  customPriority: CustomPriority,
  totalTargetCells: number,
  currentBest: PlacementResult | null,
  callbacks: SearchCallbacks,
): PlacementResult | null {
  if (callbacks.shouldAbort?.()) return currentBest;

  // Terminal: all target-region cells are filled
  if (state.targetPlacedCells >= totalTargetCells) {
    return createResult(state, regionSettings);
  }

  // Pruning: even placing all remaining blocks can't reach the target
  const remainingBlockCells = state.remainingBlocks.reduce(
    (sum, idx) => sum + blocks[idx].cells.length,
    0,
  );
  if (state.targetPlacedCells + remainingBlockCells < totalTargetCells) return currentBest;

  if (!canSatisfyRequired(state, blocks, regionSettings, customPriority)) return currentBest;

  let best = currentBest;

  const sortedBlocks = sortBlocksByPriority(state.remainingBlocks, blocks, allVariants);
  const rawPositions = getAdjacentPositions(state.occupied, regionSettings);
  const sortedPositions = sortPositionsByPriority(rawPositions, regionSettings, customPriority);

  for (const blockIdx of sortedBlocks) {
    for (const position of sortedPositions) {
      for (const variant of allVariants[blockIdx]) {
        if (!canPlace(state.occupied, variant, position, regionSettings)) continue;

        const newState = placeBlock(state, blockIdx, blocks[blockIdx].id, variant, position, regionSettings);

        if (!isConnected(newState.occupied)) continue;

        const result = searchRecursive(
          newState,
          blocks,
          allVariants,
          regionSettings,
          customPriority,
          totalTargetCells,
          best,
          callbacks,
        );

        if (result !== null && isBetterResult(result, best, customPriority)) {
          best = result;
          callbacks.onBetterResult?.(best);
          if (isOptimal(best, customPriority, regionSettings)) return best;
        }
      }
    }
  }

  return best;
}

// ---------------------------------------------------------------------------
// Main entry point (3-8)
// ---------------------------------------------------------------------------

export function findOptimalPlacement(
  blocks: BlockShape[],
  regionSettings: RegionCellSetting[],
  priority: Priority,
  callbacks: SearchCallbacks = {},
): PlacementResult | null {
  const customPriority = resolveCustomPriority(priority);
  const allVariants = blocks.map(generateVariants);
  const totalTargetCells = regionSettings.reduce((sum, s) => sum + s.targetCells, 0);

  let best = buildGreedySolution(blocks, allVariants, regionSettings, customPriority);

  if (best !== null) {
    callbacks.onBetterResult?.(best);
    if (isOptimal(best, customPriority, regionSettings)) return best;
  }

  if (callbacks.shouldAbort?.()) return best;

  const initialState = createEmptyState(blocks.length);
  const sortedBlocks = sortBlocksByPriority(initialState.remainingBlocks, blocks, allVariants);

  for (const centerPos of CENTER_POSITIONS) {
    for (const blockIdx of sortedBlocks) {
      for (const variant of allVariants[blockIdx]) {
        if (!canPlace(initialState.occupied, variant, centerPos, regionSettings)) continue;

        const newState = placeBlock(
          initialState,
          blockIdx,
          blocks[blockIdx].id,
          variant,
          centerPos,
          regionSettings,
        );

        const result = searchRecursive(
          newState,
          blocks,
          allVariants,
          regionSettings,
          customPriority,
          totalTargetCells,
          best,
          callbacks,
        );

        if (result !== null && isBetterResult(result, best, customPriority)) {
          best = result;
          callbacks.onBetterResult?.(best);
          if (isOptimal(best, customPriority, regionSettings)) return best;
        }

        if (callbacks.shouldAbort?.()) return best;
      }
    }
  }

  return best;
}
