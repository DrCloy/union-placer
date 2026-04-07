import type {
  Direction,
  InnerRegion,
  InnerRegionId,
  InnerStat,
  OuterRegion,
  OuterRegionId,
  OuterStat,
  UnionBoard,
} from "@/types/board";

type Coordinate = [number, number];

const BOARD_WIDTH = 22 as const;
const BOARD_HEIGHT = 20 as const;
const INNER_REGION_MAX_CELLS = 15 as const;
const OUTER_REGION_MAX_CELLS = 40 as const;
const DIRECTION_CAPACITY = INNER_REGION_MAX_CELLS + OUTER_REGION_MAX_CELLS;

const CENTER_X = 9.5;
const CENTER_Y = 10.5;

export const CENTER_CELLS: readonly Coordinate[] = [
  [9, 10],
  [9, 11],
  [10, 10],
  [10, 11],
] as const;

const DIRECTION_ORDER: readonly Direction[] = [1, 2, 4, 5, 7, 8, 10, 11] as const;

const DIRECTION_VECTOR: Readonly<Record<Direction, readonly [number, number]>> = {
  1: [-1, 1],
  2: [-1, 2],
  4: [1, 2],
  5: [1, 1],
  7: [1, -1],
  8: [1, -2],
  10: [-1, -2],
  11: [-1, -1],
} as const;

const PINNED_DIRECTION_BY_CELL: Readonly<Record<string, Direction>> = {
  "9,10": 11,
  "9,11": 1,
  "10,10": 7,
  "10,11": 5,
} as const;

const OUTER_STAT_BY_DIRECTION: Readonly<Record<Direction, OuterStat>> = {
  1: "exp",
  2: "critRate",
  4: "bossDamage",
  5: "normalDamage",
  7: "buffDuration",
  8: "ignoreDefense",
  10: "critDamage",
  11: "statusResist",
} as const;

const DEFAULT_INNER_STAT_BY_DIRECTION: Readonly<Record<Direction, InnerStat>> = {
  1: "str",
  2: "dex",
  4: "int",
  5: "luk",
  7: "hp",
  8: "mp",
  10: "atk",
  11: "matk",
} as const;

interface DirectionPreference {
  direction: Direction;
  score: number;
}

interface CellPreference {
  cell: Coordinate;
  preferences: DirectionPreference[];
  confidence: number;
  distance: number;
}

function toCellKey([x, y]: Coordinate): string {
  return `${x},${y}`;
}

function toInnerRegionId(direction: Direction): InnerRegionId {
  return `inner-${direction}` as InnerRegionId;
}

function toOuterRegionId(direction: Direction): OuterRegionId {
  return `outer-${direction}` as OuterRegionId;
}

function getDistanceFromCenter([x, y]: Coordinate): number {
  return Math.hypot(x - CENTER_X, y - CENTER_Y);
}

function createAllBoardCells(): Coordinate[] {
  const cells: Coordinate[] = [];

  for (let x = 0; x < BOARD_WIDTH; x += 1) {
    for (let y = 0; y < BOARD_HEIGHT; y += 1) {
      cells.push([x, y]);
    }
  }

  return cells;
}

function getDirectionPreferences(cell: Coordinate): DirectionPreference[] {
  const pinnedDirection = PINNED_DIRECTION_BY_CELL[toCellKey(cell)];
  if (pinnedDirection !== undefined) {
    return [{ direction: pinnedDirection, score: Number.POSITIVE_INFINITY }];
  }

  const [x, y] = cell;
  const relativeX = x - CENTER_X;
  const relativeY = y - CENTER_Y;
  const relativeMagnitude = Math.hypot(relativeX, relativeY) || 1;

  return DIRECTION_ORDER.map((direction) => {
    const [dirX, dirY] = DIRECTION_VECTOR[direction];
    const directionMagnitude = Math.hypot(dirX, dirY);
    const score = (relativeX * dirX + relativeY * dirY) / (relativeMagnitude * directionMagnitude);

    return {
      direction,
      score,
    };
  }).sort((left, right) => right.score - left.score);
}

function createCellPreferences(): CellPreference[] {
  return createAllBoardCells()
    .map((cell) => {
      const preferences = getDirectionPreferences(cell);
      const bestScore = preferences[0]?.score ?? Number.NEGATIVE_INFINITY;
      const secondScore = preferences[1]?.score ?? Number.NEGATIVE_INFINITY;

      return {
        cell,
        preferences,
        confidence: bestScore - secondScore,
        distance: getDistanceFromCenter(cell),
      };
    })
    .sort((left, right) => {
      if (right.confidence !== left.confidence) {
        return right.confidence - left.confidence;
      }

      if (left.distance !== right.distance) {
        return left.distance - right.distance;
      }

      if (left.cell[0] !== right.cell[0]) {
        return left.cell[0] - right.cell[0];
      }

      return left.cell[1] - right.cell[1];
    });
}

function createDirectionCellBuckets(): Record<Direction, Coordinate[]> {
  const capacities: Record<Direction, number> = {
    1: DIRECTION_CAPACITY,
    2: DIRECTION_CAPACITY,
    4: DIRECTION_CAPACITY,
    5: DIRECTION_CAPACITY,
    7: DIRECTION_CAPACITY,
    8: DIRECTION_CAPACITY,
    10: DIRECTION_CAPACITY,
    11: DIRECTION_CAPACITY,
  };

  const buckets: Record<Direction, Coordinate[]> = {
    1: [],
    2: [],
    4: [],
    5: [],
    7: [],
    8: [],
    10: [],
    11: [],
  };

  for (const cellPreference of createCellPreferences()) {
    const assignedDirection = cellPreference.preferences.find(({ direction }) => capacities[direction] > 0)?.direction;

    if (assignedDirection === undefined) {
      throw new Error("Unable to assign board cell to a direction bucket");
    }

    buckets[assignedDirection].push(cellPreference.cell);
    capacities[assignedDirection] -= 1;
  }

  for (const direction of DIRECTION_ORDER) {
    if (buckets[direction].length !== DIRECTION_CAPACITY) {
      throw new Error(`Direction ${direction} assigned ${buckets[direction].length} cells`);
    }
  }

  return buckets;
}

function sortByDistance(cells: Coordinate[]): Coordinate[] {
  return [...cells].sort((left, right) => {
    const leftDistance = getDistanceFromCenter(left);
    const rightDistance = getDistanceFromCenter(right);

    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance;
    }

    if (left[0] !== right[0]) {
      return left[0] - right[0];
    }

    return left[1] - right[1];
  });
}

const DIRECTION_CELL_BUCKETS = createDirectionCellBuckets();

export const INNER_REGIONS: readonly InnerRegion[] = DIRECTION_ORDER.map((direction) => {
  const sortedCells = sortByDistance(DIRECTION_CELL_BUCKETS[direction]);

  return {
    id: toInnerRegionId(direction),
    direction,
    stat: DEFAULT_INNER_STAT_BY_DIRECTION[direction],
    maxCells: INNER_REGION_MAX_CELLS,
    cells: sortedCells.slice(0, INNER_REGION_MAX_CELLS),
  };
});

export const OUTER_REGIONS: readonly OuterRegion[] = DIRECTION_ORDER.map((direction) => {
  const sortedCells = sortByDistance(DIRECTION_CELL_BUCKETS[direction]);

  return {
    id: toOuterRegionId(direction),
    direction,
    stat: OUTER_STAT_BY_DIRECTION[direction],
    maxCells: OUTER_REGION_MAX_CELLS,
    cells: sortedCells.slice(INNER_REGION_MAX_CELLS),
  };
});

export const UNION_BOARD: UnionBoard = {
  width: BOARD_WIDTH,
  height: BOARD_HEIGHT,
  totalCells: 440,
  innerRegions: [...INNER_REGIONS],
  outerRegions: [...OUTER_REGIONS],
};
