import type { BlockShape, Grade, JobGroup } from "@/types/block";

export const BLOCK_SHAPES: readonly BlockShape[] = [
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
] as const;

export const BLOCK_SHAPE_ID_BY_JOB_GROUP_AND_GRADE: Readonly<
  Record<JobGroup, Readonly<Record<Grade, string>>>
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

const blockShapeById: Record<string, BlockShape | undefined> = {};
for (const blockShape of BLOCK_SHAPES) {
  blockShapeById[blockShape.id] = blockShape;
}

export const BLOCK_SHAPE_BY_ID: Readonly<Record<string, BlockShape | undefined>> = blockShapeById;
