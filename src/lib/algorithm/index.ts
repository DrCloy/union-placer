export { findOptimalPlacement, isBetterResult, isOptimal } from "./search";
export type { SearchCallbacks } from "./search";
export { generateVariants, deduplicateVariants, transformCells } from "./variants";
export {
  canPlace,
  calculateRegionStats,
  computeEffectiveTargetCells,
  countCellsInRegion,
  countEmptyCellsInRegion,
  createEmptyState,
  createResult,
  getAdjacentEmptyCells,
  getRegionAt,
  isConnected,
  isInBounds,
  isOccupied,
  isForbiddenRegion,
  placeBlock,
} from "./placement";
export type { AlgoState } from "./placement";
