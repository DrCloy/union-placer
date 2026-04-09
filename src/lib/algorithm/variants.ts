import type { BlockShape, BlockVariant } from "@/types/block";

export function transformCells(
  cells: readonly [number, number][],
  rotation: 0 | 90 | 180 | 270,
  flipped: boolean,
): [number, number][] {
  let result: [number, number][] = cells.map(([row, col]) => [row, col]);

  // Flip along the column axis (negate col)
  if (flipped) {
    result = result.map(([row, col]) => [row, -col]);
  }

  // Rotate counter-clockwise: [row, col] → [-col, row]
  const steps = rotation / 90;
  for (let step = 0; step < steps; step += 1) {
    result = result.map(([row, col]) => [-col, row]);
  }

  return result;
}

/**
 * Removes variants with identical cell sets (absolute coordinates, no translation).
 * Normalization by origin translation is intentionally avoided: the placementOrigin
 * determines which cells anchor to the center-cell constraint, so two variants that
 * appear as the same translated shape can still produce different absolute placements
 * when the origin is restricted (e.g., first block must anchor at a center cell).
 */
export function deduplicateVariants(variants: BlockVariant[]): BlockVariant[] {
  const seen = new Set<string>();
  return variants.filter((variant) => {
    const key = [...variant.cells]
      .sort(([aRow, aCol], [bRow, bCol]) => aRow - bRow || aCol - bCol)
      .map(([row, col]) => `${row},${col}`)
      .join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function generateVariants(shape: BlockShape): BlockVariant[] {
  const variants: BlockVariant[] = [];

  for (const rotation of [0, 90, 180, 270] as const) {
    for (const flipped of [false, true]) {
      const cells = transformCells(shape.cells, rotation, flipped);
      variants.push({ cells, rotation, flipped });
    }
  }

  return deduplicateVariants(variants);
}
