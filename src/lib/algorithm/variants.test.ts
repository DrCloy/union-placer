import { describe, expect, it } from "vitest";
import type { BlockShape } from "@/types/block";
import { deduplicateVariants, generateVariants, transformCells } from "./variants";

describe("transformCells", () => {
  it("identity: rotation 0, no flip", () => {
    const cells: [number, number][] = [
      [0, 0],
      [0, 1],
    ];
    expect(transformCells(cells, 0, false)).toEqual([
      [0, 0],
      [0, 1],
    ]);
  });

  it("rotation 90 counter-clockwise: [r,c] → [-c, r]", () => {
    // [0,1] → [-1,0]
    const cells: [number, number][] = [[0, 1]];
    expect(transformCells(cells, 90, false)).toEqual([[-1, 0]]);
  });

  it("rotation 180: [r,c] → [-r,-c]", () => {
    const cells: [number, number][] = [[1, 2]];
    expect(transformCells(cells, 180, false)).toEqual([[-1, -2]]);
  });

  it("flip negates col", () => {
    const cells: [number, number][] = [[1, 2]];
    expect(transformCells(cells, 0, true)).toEqual([[1, -2]]);
  });

  it("rotation 90 applied four times returns original coordinates", () => {
    const cells: [number, number][] = [
      [0, 0],
      [1, 2],
      [-2, 1],
    ];

    const r90 = transformCells(cells, 90, false);
    const r180 = transformCells(r90, 90, false);
    const r270 = transformCells(r180, 90, false);
    const r360 = transformCells(r270, 90, false);

    expect(r360).toEqual(cells);
  });

  it("double flip returns original coordinates", () => {
    const cells: [number, number][] = [
      [0, 0],
      [1, -2],
      [-1, 3],
    ];

    const flipped = transformCells(cells, 0, true);
    const flippedTwice = transformCells(flipped, 0, true);

    expect(flippedTwice).toEqual(cells);
  });

  it("flip-rotate composition can be inverted back to original", () => {
    const cells: [number, number][] = [
      [0, 0],
      [1, 0],
      [1, 2],
      [-1, 1],
    ];

    const transformed = transformCells(cells, 90, true);
    const invertedRotation = transformCells(transformed, 270, false);
    const restored = transformCells(invertedRotation, 0, true);

    expect(restored).toEqual(cells);
  });
});

describe("deduplicateVariants", () => {
  it("removes variants with identical normalized cell sets", () => {
    const base = { cells: [[0, 0]] as [number, number][], rotation: 0 as const, flipped: false };
    const dupe = { cells: [[0, 0]] as [number, number][], rotation: 90 as const, flipped: true };
    const result = deduplicateVariants([base, dupe]);
    expect(result).toHaveLength(1);
  });
});

describe("generateVariants", () => {
  it("common-b (1 cell) has exactly 1 unique variant", () => {
    const shape: BlockShape = { id: "common-b", grade: "B", cells: [[0, 0]] };
    expect(generateVariants(shape)).toHaveLength(1);
  });

  it("common-a (2 cells in line) has exactly 4 unique variants", () => {
    const shape: BlockShape = {
      id: "common-a",
      grade: "A",
      cells: [
        [0, 0],
        [1, 0],
      ],
    };
    // With absolute-coordinate deduplication (no normalization), all 4 rotations
    // produce distinct cell sets: [0,0]+[1,0], [0,0]+[0,1], [0,0]+[-1,0], [0,0]+[0,-1].
    // Each anchors the block differently when the origin is fixed to a center cell.
    expect(generateVariants(shape)).toHaveLength(4);
  });

  it("never returns more than 8 variants", () => {
    const shape: BlockShape = {
      id: "sss-pirate",
      grade: "SSS",
      cells: [
        [0, 0],
        [0, -1],
        [1, 0],
        [1, 1],
        [1, 2],
      ],
    };
    expect(generateVariants(shape).length).toBeLessThanOrEqual(8);
  });

  it("symmetric square shape stays deduplicated and stable", () => {
    const shape: BlockShape = {
      id: "ss-warrior",
      grade: "SS",
      cells: [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ],
    };

    const first = generateVariants(shape);
    const second = generateVariants(shape);

    const toCellSignatureSet = (variants: typeof first): Set<string> => {
      const signatures = variants.map((variant) =>
        [...variant.cells]
          .sort(([leftRow, leftCol], [rightRow, rightCol]) => {
            if (leftRow !== rightRow) return leftRow - rightRow;
            return leftCol - rightCol;
          })
          .map(([row, col]) => `${row},${col}`)
          .join("|"),
      );
      return new Set(signatures);
    };

    expect(first).toHaveLength(4);
    expect(second).toHaveLength(4);
    expect(toCellSignatureSet(second)).toEqual(toCellSignatureSet(first));
  });
});
