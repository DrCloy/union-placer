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

export function deduplicateVariants(variants: BlockVariant[]): BlockVariant[] {
  const seen = new Set<string>();
  return variants.filter((variant) => {
    // Translate so min row and min col are both 0, then sort for canonical form
    const minRow = Math.min(...variant.cells.map(([r]) => r));
    const minCol = Math.min(...variant.cells.map(([, c]) => c));
    const key = [...variant.cells]
      .map(([row, col]) => [row - minRow, col - minCol] as [number, number])
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
