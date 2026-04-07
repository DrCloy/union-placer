import type { JobGroup, Grade, BlockShape } from "@/types/block";

export interface Character {
  id: string;
  nickname: string;
  job: string;
  jobGroup: JobGroup;
  level: number;
  grade: Grade;
  blockShape: BlockShape;
  isMapleM?: boolean;
}

export interface BlockCount {
  shapeId: string;
  count: number;
}

export interface BlockSummary {
  blocks: BlockCount[];
  totalBlocks: number;
  totalCells: number;
}
