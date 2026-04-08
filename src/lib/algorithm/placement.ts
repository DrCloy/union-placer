import type { BlockVariant } from "@/types/block";
import type { RegionStat } from "@/types/placement";
import type { BlockPlacement, PlacementResult, RegionCellSetting, RegionPlacementStat } from "@/types/placement";
import { INNER_REGIONS, OUTER_REGIONS } from "@/constants/board";

// ---------------------------------------------------------------------------
// Internal board representation
// ---------------------------------------------------------------------------

/**
 * Lightweight immutable-style placement state used exclusively inside the algorithm.
 * `occupied` is a Set of "row,col" keys representing placed cells.
 * `targetPlacedCells` counts only cells placed in regions with targetCells > 0,
 * excluding connectivity cells in unspecified inner regions.
 */
export interface AlgoState {
  occupied: Set<string>;
  placements: BlockPlacement[];
  remainingBlocks: number[]; // indices into the blocks array passed to search
  placedCells: number;
  targetPlacedCells: number;
}

// ---------------------------------------------------------------------------
// Module-level precomputed cell → region lookup
// ---------------------------------------------------------------------------

interface CellRegionInfo {
  stat: RegionStat;
  isOuter: boolean;
}

const CELL_REGION_INFO: Map<string, CellRegionInfo> = new Map();
/** Maps each RegionStat to the Set of cell keys belonging to it. */
const REGION_CELLS: Map<RegionStat, Set<string>> = new Map();

for (const region of INNER_REGIONS) {
  const cellSet = new Set<string>();
  for (const [row, col] of region.cells) {
    const key = `${row},${col}`;
    CELL_REGION_INFO.set(key, { stat: region.stat, isOuter: false });
    cellSet.add(key);
  }
  REGION_CELLS.set(region.stat, cellSet);
}

for (const region of OUTER_REGIONS) {
  const cellSet = new Set<string>();
  for (const [row, col] of region.cells) {
    const key = `${row},${col}`;
    CELL_REGION_INFO.set(key, { stat: region.stat, isOuter: true });
    cellSet.add(key);
  }
  REGION_CELLS.set(region.stat, cellSet);
}

// ---------------------------------------------------------------------------
// Board constants
// ---------------------------------------------------------------------------

const BOARD_ROWS = 20;
const BOARD_COLS = 22;

// ---------------------------------------------------------------------------
// Board utility functions (3-2)
// ---------------------------------------------------------------------------

export function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS;
}

export function isOccupied(occupied: Set<string>, row: number, col: number): boolean {
  return occupied.has(`${row},${col}`);
}

export function getRegionAt(row: number, col: number): RegionStat | null {
  return CELL_REGION_INFO.get(`${row},${col}`)?.stat ?? null;
}

export function getOccupiedCells(occupied: Set<string>): [number, number][] {
  return Array.from(occupied).map((key) => {
    const parts = key.split(",");
    return [Number(parts[0]), Number(parts[1])] as [number, number];
  });
}

export function countCellsInRegion(occupied: Set<string>, region: RegionStat): number {
  const regionCells = REGION_CELLS.get(region);
  if (regionCells === undefined) return 0;
  let count = 0;
  for (const key of regionCells) {
    if (occupied.has(key)) count += 1;
  }
  return count;
}

export function countEmptyCellsInRegion(occupied: Set<string>, region: RegionStat): number {
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

export function isForbiddenRegion(row: number, col: number, regionSettings: RegionCellSetting[]): boolean {
  const info = CELL_REGION_INFO.get(`${row},${col}`);
  // Inner regions are never forbidden (allowed for connectivity).
  // Unknown cells (shouldn't happen with a complete board) are not forbidden.
  if (info === undefined || !info.isOuter) return false;

  const setting = regionSettings.find((s) => s.region === info.stat);
  // Outer regions with no setting or targetCells = 0 are forbidden.
  return setting === undefined || setting.targetCells === 0;
}

export function canPlace(
  occupied: Set<string>,
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

/**
 * Places a block on the board and returns a new state.
 * Pass `regionSettings` so that `targetPlacedCells` is tracked correctly.
 * Omit `regionSettings` (or pass `[]`) only in tests that don't need accurate tracking.
 */
export function placeBlock(
  state: AlgoState,
  blockIdx: number,
  shapeId: string,
  variant: BlockVariant,
  position: [number, number],
  regionSettings: RegionCellSetting[] = [],
): AlgoState {
  const [pRow, pCol] = position;
  const cells: [number, number][] = variant.cells.map(([dRow, dCol]) => [pRow + dRow, pCol + dCol]);

  const newOccupied = new Set(state.occupied);
  let targetCellsAdded = 0;

  for (const [row, col] of cells) {
    const key = `${row},${col}`;
    newOccupied.add(key);
    const info = CELL_REGION_INFO.get(key);
    if (info !== undefined) {
      const setting = regionSettings.find((s) => s.region === info.stat);
      if (setting !== undefined && setting.targetCells > 0) {
        targetCellsAdded += 1;
      }
    }
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
    targetPlacedCells: state.targetPlacedCells + targetCellsAdded,
  };
}

// ---------------------------------------------------------------------------
// Connectivity check (3-4)
// ---------------------------------------------------------------------------

export function isConnected(occupied: Set<string>): boolean {
  if (occupied.size === 0) return true;

  const start = occupied.values().next().value as string;
  const visited = new Set<string>();
  const queue: string[] = [start];

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
      const neighborKey = `${row + dRow},${col + dCol}`;
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
  occupied: Set<string>,
  regionSettings: RegionCellSetting[],
): RegionPlacementStat[] {
  return regionSettings.map((setting) => {
    const placedCells = countCellsInRegion(occupied, setting.region);
    return {
      region: setting.region,
      targetCells: setting.targetCells,
      placedCells,
      isSatisfied: placedCells >= setting.targetCells,
      isForbidden: setting.targetCells === 0,
    };
  });
}

export function createResult(state: AlgoState, regionSettings: RegionCellSetting[]): PlacementResult {
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
// Adjacent position helper (used by search)
// ---------------------------------------------------------------------------

export function getAdjacentPositions(
  occupied: Set<string>,
  regionSettings: RegionCellSetting[],
): [number, number][] {
  const candidates = new Set<string>();

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
      const neighborKey = `${nRow},${nCol}`;
      if (
        isInBounds(nRow, nCol) &&
        !occupied.has(neighborKey) &&
        !isForbiddenRegion(nRow, nCol, regionSettings)
      ) {
        candidates.add(neighborKey);
      }
    }
  }

  return Array.from(candidates).map((key) => {
    const parts = key.split(",");
    return [Number(parts[0]), Number(parts[1])] as [number, number];
  });
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
    targetPlacedCells: 0,
  };
}
