import type { OuterStat, InnerStat } from "@/types/board";

export type RegionStat = OuterStat | InnerStat;

export type PresetType = "hunting" | "boss";

export interface RegionCellSetting {
  region: RegionStat;
  targetCells: number;
  maxCells: number;
  isOuter: boolean;
}

export interface CustomPriority {
  required: RegionCellSetting[];
  priorities: RegionCellSetting[][];
}

export interface Priority {
  type: "preset" | "custom";
  preset?: PresetType;
  custom?: CustomPriority;
}

export interface BlockPlacement {
  blockIndex: number;
  shapeId: string;
  position: [number, number];
  rotation: 0 | 90 | 180 | 270;
  flipped: boolean;
  cells: [number, number][];
}

export interface RegionPlacementStat {
  region: RegionStat;
  targetCells: number;
  placedCells: number;
  isSatisfied: boolean;
  isForbidden: boolean;
}

export interface PlacementStats {
  totalTargetCells: number;
  totalPlacedCells: number;
  regionStats: RegionPlacementStat[];
}

export interface PlacementResult {
  success: boolean;
  placements: BlockPlacement[];
  stats: PlacementStats;
  warnings?: string[];
}

export interface SearchState {
  isSearching: boolean;
  progress?: number;
}
