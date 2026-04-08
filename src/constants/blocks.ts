import type { BlockShape, Grade, JobGroup } from "@/types/block";

function createBlockShapes<const T extends readonly BlockShape[]>(blockShapes: T): T {
  return blockShapes;
}

export const BLOCK_SHAPES = createBlockShapes([
  {
    id: "common-b",
    grade: "B",
    cells: [[0, 0]],
  },
  {
    id: "common-a",
    grade: "A",
    cells: [
      [0, 0],
      [1, 0],
    ],
  },
  {
    id: "s-corner",
    grade: "S",
    cells: [
      [0, 0],
      [0, 1],
      [1, 1],
    ],
  },
  {
    id: "s-line",
    grade: "S",
    cells: [
      [0, -1],
      [0, 0],
      [0, 1],
    ],
  },
  {
    id: "ss-warrior",
    grade: "SS",
    cells: [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
  },
  {
    id: "ss-mage",
    grade: "SS",
    cells: [
      [0, 0],
      [1, -1],
      [1, 0],
      [1, 1],
    ],
  },
  {
    id: "ss-archer",
    grade: "SS",
    cells: [
      [0, 0],
      [-1, 0],
      [1, 0],
      [2, 0],
    ],
  },
  {
    id: "ss-thief",
    grade: "SS",
    cells: [
      [0, 0],
      [0, -1],
      [0, 1],
      [1, 1],
    ],
  },
  {
    id: "ss-pirate",
    grade: "SS",
    cells: [
      [0, 0],
      [0, -1],
      [1, 0],
      [1, 1],
    ],
  },
  {
    id: "sss-warrior",
    grade: "SSS",
    cells: [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 0],
      [1, 1],
    ],
  },
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
  {
    id: "sss-archer",
    grade: "SSS",
    cells: [
      [0, 0],
      [0, -2],
      [0, -1],
      [0, 1],
      [0, 2],
    ],
  },
  {
    id: "sss-thief",
    grade: "SSS",
    cells: [
      [0, 0],
      [0, -1],
      [-1, 1],
      [0, 1],
      [1, 1],
    ],
  },
  {
    id: "sss-pirate",
    grade: "SSS",
    cells: [
      [0, 0],
      [0, -1],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
  },
  {
    id: "sss-xenon",
    grade: "SSS",
    cells: [
      [0, 0],
      [-1, -1],
      [0, -1],
      [0, 1],
      [1, 1],
    ],
  },
] as const);

export type BlockShapeId = (typeof BLOCK_SHAPES)[number]["id"];

export const BLOCK_SHAPE_ID_BY_JOB_GROUP_AND_GRADE: Readonly<
  Record<JobGroup, Readonly<Record<Grade, BlockShapeId>>>
> = {
  warrior: {
    B: "common-b",
    A: "common-a",
    S: "s-corner",
    SS: "ss-warrior",
    SSS: "sss-warrior",
  },
  mage: {
    B: "common-b",
    A: "common-a",
    S: "s-line",
    SS: "ss-mage",
    SSS: "sss-mage",
  },
  archer: {
    B: "common-b",
    A: "common-a",
    S: "s-line",
    SS: "ss-archer",
    SSS: "sss-archer",
  },
  thief: {
    B: "common-b",
    A: "common-a",
    S: "s-line",
    SS: "ss-thief",
    SSS: "sss-thief",
  },
  pirate: {
    B: "common-b",
    A: "common-a",
    S: "s-corner",
    SS: "ss-pirate",
    SSS: "sss-pirate",
  },
  xenon: {
    B: "common-b",
    A: "common-a",
    S: "s-line",
    SS: "ss-thief",
    SSS: "sss-xenon",
  },
} as const;

const blockShapeById: Record<BlockShapeId, BlockShape> = {} as Record<BlockShapeId, BlockShape>;
for (const blockShape of BLOCK_SHAPES) {
  if (blockShape.id in blockShapeById) {
    throw new Error(`Duplicate block shape id: ${blockShape.id}`);
  }
  blockShapeById[blockShape.id] = blockShape;
}

export const BLOCK_SHAPE_BY_ID: Readonly<Record<BlockShapeId, BlockShape>> =
  Object.freeze(blockShapeById);
