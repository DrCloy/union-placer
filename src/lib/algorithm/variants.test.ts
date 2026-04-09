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
});
