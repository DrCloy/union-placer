import type { BlockVariant } from "@/types/block";
import type { RegionStat } from "@/types/placement";
import type {
  BlockPlacement,
  PlacementResult,
  RegionCellSetting,
  RegionPlacementStat,
} from "@/types/placement";
import { BOARD_HEIGHT, BOARD_WIDTH, INNER_REGIONS, OUTER_REGIONS } from "@/constants/board";

// ---------------------------------------------------------------------------
// CellKey type
// ---------------------------------------------------------------------------

/** Strongly-typed cell coordinate key in "row,col" format. */
export type CellKey = `${number},${number}`;

export function toCellKey(row: number, col: number): CellKey {
  return `${row},${col}` as CellKey;
}

/**
 * Lightweight immutable-style placement state used exclusively inside the algorithm.
 * `occupied` is a Set of CellKey values representing placed cells.
 */
export interface AlgoState {
  occupied: Set<CellKey>;
  placements: BlockPlacement[];
  remainingBlocks: number[]; // indices into the blocks array passed to search
  placedCells: number;
}

// ---------------------------------------------------------------------------
// Module-level precomputed cell → region lookup
// ---------------------------------------------------------------------------

interface CellRegionInfo {
  stat: RegionStat;
  isOuter: boolean;
}

const CELL_REGION_INFO: Map<CellKey, CellRegionInfo> = new Map();
/** Maps each RegionStat to the Set of cell keys belonging to it. */
const REGION_CELLS: Map<RegionStat, Set<CellKey>> = new Map();

function setCellRegionInfo(key: CellKey, stat: RegionStat, isOuter: boolean): void {
  const existingInfo = CELL_REGION_INFO.get(key);
  if (existingInfo !== undefined) {
    const currentScope = isOuter ? "OUTER" : "INNER";
    const existingScope = existingInfo.isOuter ? "OUTER" : "INNER";
    throw new Error(
      `Duplicate CellKey ${key} in ${currentScope} region ${stat}; already assigned to ${existingScope} region ${existingInfo.stat}`,
    );
  }

  CELL_REGION_INFO.set(key, { stat, isOuter });
}

for (const region of INNER_REGIONS) {
  const cellSet = new Set<CellKey>();
  for (const [row, col] of region.cells) {
    const key = toCellKey(row, col);
    setCellRegionInfo(key, region.stat, false);
    cellSet.add(key);
  }
  if (REGION_CELLS.has(region.stat)) {
    throw new Error(`Duplicate RegionStat mapping in INNER region ${region.stat}`);
  }
  REGION_CELLS.set(region.stat, cellSet);
}

for (const region of OUTER_REGIONS) {
  const cellSet = new Set<CellKey>();
  for (const [row, col] of region.cells) {
    const key = toCellKey(row, col);
    setCellRegionInfo(key, region.stat, true);
    cellSet.add(key);
  }
  if (REGION_CELLS.has(region.stat)) {
    throw new Error(`Duplicate RegionStat mapping in OUTER region ${region.stat}`);
  }
  REGION_CELLS.set(region.stat, cellSet);
}

// ---------------------------------------------------------------------------
// Board utility functions (3-2)
// ---------------------------------------------------------------------------

export function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_HEIGHT && col >= 0 && col < BOARD_WIDTH;
}

export function isOccupied(occupied: Set<CellKey>, row: number, col: number): boolean {
  return occupied.has(toCellKey(row, col));
}

export function getRegionAt(row: number, col: number): RegionStat | null {
  return CELL_REGION_INFO.get(toCellKey(row, col))?.stat ?? null;
}

export function getOccupiedCells(occupied: Set<CellKey>): [number, number][] {
  return Array.from(occupied).map((key) => {
    const parts = key.split(",");
    return [Number(parts[0]), Number(parts[1])] as [number, number];
  });
}

export function countCellsInRegion(occupied: Set<CellKey>, region: RegionStat): number {
  const regionCells = REGION_CELLS.get(region);
  if (regionCells === undefined) return 0;
  let count = 0;
  for (const key of regionCells) {
    if (occupied.has(key)) count += 1;
  }
  return count;
}

export function countEmptyCellsInRegion(occupied: Set<CellKey>, region: RegionStat): number {
  const regionCells = REGION_CELLS.get(region);
  if (regionCells === undefined) return 0;
  let count = 0;
  for (const key of regionCells) {
    if (!occupied.has(key)) count += 1;
  }
  return count;
}

// ---------------------------------------------------------------------------
// Placement check logic (3-3)
// ---------------------------------------------------------------------------

export function isForbiddenRegion(
  row: number,
  col: number,
  regionSettings: RegionCellSetting[],
): boolean {
  const info = CELL_REGION_INFO.get(`${row},${col}`);
  // Inner regions are never forbidden (allowed for connectivity).
  // Unknown cells (shouldn't happen with a complete board) are not forbidden.
  if (info === undefined || !info.isOuter) return false;

  const setting = regionSettings.find((s) => s.region === info.stat);
  // Outer regions with no setting or targetCells = 0 are forbidden.
  return setting === undefined || setting.targetCells === 0;
}

export function canPlace(
  occupied: Set<CellKey>,
  variant: BlockVariant,
  position: [number, number],
  regionSettings: RegionCellSetting[],
): boolean {
  const [pRow, pCol] = position;
  return variant.cells.every(([dRow, dCol]) => {
    const row = pRow + dRow;
    const col = pCol + dCol;
    return (
      isInBounds(row, col) &&
      !isOccupied(occupied, row, col) &&
      !isForbiddenRegion(row, col, regionSettings)
    );
  });
}

export function placeBlock(
  state: AlgoState,
  blockIdx: number,
  shapeId: string,
  variant: BlockVariant,
  position: [number, number],
): AlgoState {
  const [pRow, pCol] = position;
  const cells: [number, number][] = variant.cells.map(([dRow, dCol]) => [pRow + dRow, pCol + dCol]);

  const newOccupied = new Set(state.occupied);
  for (const [row, col] of cells) {
    newOccupied.add(toCellKey(row, col));
  }

  const placement: BlockPlacement = {
    blockIndex: blockIdx,
    shapeId,
    placementOrigin: position,
    rotation: variant.rotation,
    flipped: variant.flipped,
    cells,
  };

  return {
    occupied: newOccupied,
    placements: [...state.placements, placement],
    remainingBlocks: state.remainingBlocks.filter((idx) => idx !== blockIdx),
    placedCells: state.placedCells + cells.length,
  };
}

// ---------------------------------------------------------------------------
// Connectivity check (3-4)
// ---------------------------------------------------------------------------

export function isConnected(occupied: Set<CellKey>): boolean {
  if (occupied.size === 0) return true;

  const start = occupied.values().next().value as CellKey;
  const visited = new Set<CellKey>();
  const queue: CellKey[] = [start];

  while (queue.length > 0) {
    const key = queue.shift()!;
    if (visited.has(key)) continue;
    visited.add(key);

    const parts = key.split(",");
    const row = Number(parts[0]);
    const col = Number(parts[1]);

    for (const [dRow, dCol] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ] as const) {
      const neighborKey = toCellKey(row + dRow, col + dCol);
      if (occupied.has(neighborKey) && !visited.has(neighborKey)) {
        queue.push(neighborKey);
      }
    }
  }

  return visited.size === occupied.size;
}

// ---------------------------------------------------------------------------
// Region stats calculation & result creation (3-5)
// ---------------------------------------------------------------------------

export function calculateRegionStats(
  occupied: Set<CellKey>,
  regionSettings: RegionCellSetting[],
): RegionPlacementStat[] {
  return regionSettings.map((setting) => {
    const placedCells = countCellsInRegion(occupied, setting.region);
    return {
      region: setting.region,
      targetCells: setting.targetCells,
      placedCells,
      isSatisfied: placedCells >= setting.targetCells,
      isForbidden: setting.targetCells === 0 && setting.isOuter,
    };
  });
}

/**
 * Computes the effective target cells filled: for each region, counts
 * min(placedCells, targetCells) to avoid over-counting when a region is over-filled.
 */
export function computeEffectiveTargetCells(
  occupied: Set<CellKey>,
  regionSettings: RegionCellSetting[],
): number {
  let total = 0;
  for (const setting of regionSettings) {
    if (setting.targetCells === 0) continue;
    const placed = countCellsInRegion(occupied, setting.region);
    total += Math.min(placed, setting.targetCells);
  }
  return total;
}

/**
 * Returns all empty, in-bounds, non-forbidden cells adjacent to any occupied cell.
 * Unlike `getAdjacentPositions`, this does not filter by forbidden status so it can
 * be used as raw contact candidates for per-variant origin calculation.
 */
export function getAdjacentEmptyCells(occupied: Set<CellKey>): [number, number][] {
  const candidates = new Set<CellKey>();

  for (const key of occupied) {
    const parts = key.split(",");
    const row = Number(parts[0]);
    const col = Number(parts[1]);

    for (const [dRow, dCol] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ] as const) {
      const nRow = row + dRow;
      const nCol = col + dCol;
      const neighborKey = toCellKey(nRow, nCol);
      if (isInBounds(nRow, nCol) && !occupied.has(neighborKey)) {
        candidates.add(neighborKey);
      }
    }
  }

  return Array.from(candidates).map((key) => {
    const parts = key.split(",");
    return [Number(parts[0]), Number(parts[1])] as [number, number];
  });
}

export function createResult(
  state: AlgoState,
  regionSettings: RegionCellSetting[],
): PlacementResult {
  const regionStats = calculateRegionStats(state.occupied, regionSettings);
  const totalTargetCells = regionSettings.reduce((sum, s) => sum + s.targetCells, 0);
  const hasForbiddenViolations = regionStats.some((s) => s.isForbidden && s.placedCells > 0);

  return {
    success: !hasForbiddenViolations,
    placements: state.placements,
    stats: {
      totalTargetCells,
      totalPlacedCells: state.placedCells,
      regionStats,
    },
  };
}

// ---------------------------------------------------------------------------
// State factory
// ---------------------------------------------------------------------------

export function createEmptyState(blockCount: number): AlgoState {
  return {
    occupied: new Set(),
    placements: [],
    remainingBlocks: Array.from({ length: blockCount }, (_, idx) => idx),
    placedCells: 0,
  };
}
