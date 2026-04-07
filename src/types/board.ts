export type Direction = 1 | 2 | 4 | 5 | 7 | 8 | 10 | 11;

export type OuterRegionId =
  | "outer-1"
  | "outer-2"
  | "outer-4"
  | "outer-5"
  | "outer-7"
  | "outer-8"
  | "outer-10"
  | "outer-11";

export type InnerRegionId =
  | "inner-1"
  | "inner-2"
  | "inner-4"
  | "inner-5"
  | "inner-7"
  | "inner-8"
  | "inner-10"
  | "inner-11";

export type OuterStat =
  | "exp"
  | "critRate"
  | "bossDamage"
  | "normalDamage"
  | "buffDuration"
  | "ignoreDefense"
  | "critDamage"
  | "statusResist";

export type InnerStat = "str" | "dex" | "int" | "luk" | "hp" | "mp" | "atk" | "matk";

export interface OuterRegion {
  id: OuterRegionId;
  direction: Direction;
  cells: [number, number][];
  maxCells: 40;
  stat: OuterStat;
}

export interface InnerRegion {
  id: InnerRegionId;
  direction: Direction;
  cells: [number, number][];
  maxCells: 15;
  stat: InnerStat;
}

export interface UnionBoard {
  width: 22;
  height: 20;
  totalCells: 440;
  innerRegions: InnerRegion[];
  outerRegions: OuterRegion[];
}
