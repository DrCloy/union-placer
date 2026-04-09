import { CENTER_CELLS, INNER_REGIONS, OUTER_REGIONS } from "@/constants/board";
import type { Direction, InnerRegionId, OuterRegionId } from "@/types/board";
import type { RegionStat } from "@/types/placement";

type Coordinate = readonly [number, number];

export interface RegionMeta {
  region: RegionStat;
  maxCells: number;
  isOuter: boolean;
  direction: Direction;
  regionId: InnerRegionId | OuterRegionId;
}

const regionByCellKey = new Map<string, RegionStat>();
const regionMetaByStat = new Map<RegionStat, RegionMeta>();

function fetchCellKey([row, col]: Coordinate): string {
  return `${row},${col}`;
}

for (const region of INNER_REGIONS) {
  const meta: RegionMeta = {
    region: region.stat,
    maxCells: region.maxCells,
    isOuter: false,
    direction: region.direction,
    regionId: region.id,
  };

  regionMetaByStat.set(region.stat, meta);

  for (const cell of region.cells) {
    regionByCellKey.set(fetchCellKey(cell), region.stat);
  }
}

for (const region of OUTER_REGIONS) {
  const meta: RegionMeta = {
    region: region.stat,
    maxCells: region.maxCells,
    isOuter: true,
    direction: region.direction,
    regionId: region.id,
  };

  regionMetaByStat.set(region.stat, meta);

  for (const cell of region.cells) {
    regionByCellKey.set(fetchCellKey(cell), region.stat);
  }
}

const centerCellKeySet = new Set<string>(CENTER_CELLS.map((cell) => fetchCellKey(cell)));

export function fetchRegionFromCoordinate(coordinate: Coordinate): RegionStat | null {
  return regionByCellKey.get(fetchCellKey(coordinate)) ?? null;
}

export function fetchRegionMeta(region: RegionStat): RegionMeta | null {
  return regionMetaByStat.get(region) ?? null;
}

export function fetchIsCenterCoordinate(coordinate: Coordinate): boolean {
  return centerCellKeySet.has(fetchCellKey(coordinate));
}
