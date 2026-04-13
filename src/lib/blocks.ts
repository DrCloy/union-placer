import type { BlockShape, Grade, JobGroup } from "@/types/block";
import type { BlockCount, BlockSummary, Character } from "@/types/character";
import type { InnerStat } from "@/types/placement";
import { BLOCK_SHAPE_BY_ID, BLOCK_SHAPE_ID_BY_JOB_GROUP_AND_GRADE } from "@/constants/blocks";
import {
  EFFECTIVE_STATS_BY_JOB_NAME,
  JOB_GROUP_BY_JOB_NAME,
  JOB_GROUP_EFFECTIVE_STATS,
} from "@/constants/jobs";

export function fetchGradeFromLevel(level: number): Grade | null {
  if (level >= 250) {
    return "SSS";
  }
  if (level >= 200) {
    return "SS";
  }
  if (level >= 140) {
    return "S";
  }
  if (level >= 100) {
    return "A";
  }
  if (level >= 60) {
    return "B";
  }

  return null;
}

export function fetchJobGroupFromJobName(jobName: string): JobGroup | null {
  return JOB_GROUP_BY_JOB_NAME[jobName] ?? null;
}

export function fetchEffectiveStatsFromJobName(jobName: string): readonly InnerStat[] {
  const overrideStats = EFFECTIVE_STATS_BY_JOB_NAME[jobName];
  if (overrideStats !== undefined) {
    return overrideStats;
  }

  const jobGroup = fetchJobGroupFromJobName(jobName);
  if (jobGroup === null) {
    return [];
  }

  return JOB_GROUP_EFFECTIVE_STATS[jobGroup];
}

export function fetchBlockShapeFromJobGroupAndGrade(
  jobGroup: JobGroup,
  grade: Grade,
): BlockShape | undefined {
  const blockShapeId = BLOCK_SHAPE_ID_BY_JOB_GROUP_AND_GRADE[jobGroup][grade];
  return BLOCK_SHAPE_BY_ID[blockShapeId];
}

export function fetchBlockShapeFromJobGroupAndLevel(
  jobGroup: JobGroup,
  level: number,
): BlockShape | null {
  const grade = fetchGradeFromLevel(level);
  if (grade === null) {
    return null;
  }

  return fetchBlockShapeFromJobGroupAndGrade(jobGroup, grade) ?? null;
}

export function fetchBlockSummaryFromCharacters(characters: readonly Character[]): BlockSummary {
  const blockCounter = new Map<string, number>();
  let totalCells = 0;

  for (const character of characters) {
    const shapeId = character.blockShape.id;
    const currentCount = blockCounter.get(shapeId) ?? 0;

    blockCounter.set(shapeId, currentCount + 1);
    totalCells += character.blockShape.cells.length;
  }

  const blocks: BlockCount[] = [...blockCounter.entries()]
    .sort(([leftId], [rightId]) => leftId.localeCompare(rightId))
    .map(([shapeId, count]) => ({
      shapeId,
      count,
    }));

  return {
    blocks,
    totalBlocks: characters.length,
    totalCells,
  };
}

export function expandBlockSummary(summary: BlockSummary): BlockShape[] {
  return summary.blocks.flatMap(({ shapeId, count }) => {
    const hasKey = Object.prototype.hasOwnProperty.call(BLOCK_SHAPE_BY_ID, shapeId);
    if (!hasKey) return [];
    const shape = BLOCK_SHAPE_BY_ID[shapeId as keyof typeof BLOCK_SHAPE_BY_ID];
    if (shape === undefined) return [];
    return Array<BlockShape>(count).fill(shape);
  });
}

export function fetchBlockSummaryFromManualBlocks(
  manualBlocks: readonly BlockCount[],
): BlockSummary {
  const countByShapeId = new Map<string, number>();
  const shapeByShapeId = new Map<string, BlockShape>();

  for (const manualBlock of manualBlocks) {
    const hasShapeKey = Object.prototype.hasOwnProperty.call(
      BLOCK_SHAPE_BY_ID,
      manualBlock.shapeId,
    );
    if (!hasShapeKey) {
      continue;
    }

    const shape = BLOCK_SHAPE_BY_ID[manualBlock.shapeId as keyof typeof BLOCK_SHAPE_BY_ID];
    if (shape === undefined || shape.id === undefined) {
      continue;
    }

    const rawCount = Number(manualBlock.count);
    const validatedCount = Number.isFinite(rawCount) ? rawCount : 0;
    const count = Math.max(0, Math.trunc(validatedCount));
    if (count === 0) {
      continue;
    }

    const currentCount = countByShapeId.get(shape.id) ?? 0;
    countByShapeId.set(shape.id, currentCount + count);
    shapeByShapeId.set(shape.id, shape);
  }

  const normalizedBlocks: BlockCount[] = [...countByShapeId.entries()]
    .sort(([leftShapeId], [rightShapeId]) => leftShapeId.localeCompare(rightShapeId))
    .map(([shapeId, count]) => ({
      shapeId,
      count,
    }));

  let totalBlocks = 0;
  let totalCells = 0;

  for (const normalizedBlock of normalizedBlocks) {
    const shape = shapeByShapeId.get(normalizedBlock.shapeId);
    if (shape === undefined) {
      continue;
    }

    totalBlocks += normalizedBlock.count;
    totalCells += shape.cells.length * normalizedBlock.count;
  }

  return {
    blocks: normalizedBlocks,
    totalBlocks,
    totalCells,
  };
}
