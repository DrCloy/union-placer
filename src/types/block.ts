export type JobGroup = "warrior" | "mage" | "archer" | "thief" | "pirate" | "xenon";

export type Grade = "B" | "A" | "S" | "SS" | "SSS";

export interface BlockShape {
  id: string;
  grade: Grade;
  cells: [number, number][];
}

export interface BlockVariant {
  cells: [number, number][];
  rotation: 0 | 90 | 180 | 270;
  flipped: boolean;
}
