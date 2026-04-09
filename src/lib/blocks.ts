import { BLOCK_SHAPE_BY_ID, BLOCK_SHAPE_ID_BY_JOB_GROUP_AND_GRADE } from "@/constants/blocks";
import {
  EFFECTIVE_STATS_BY_JOB_NAME,
  JOB_GROUP_BY_JOB_NAME,
  JOB_GROUP_EFFECTIVE_STATS,
} from "@/constants/jobs";
import type { BlockShape, Grade, JobGroup } from "@/types/block";
import type { BlockCount, BlockSummary, Character } from "@/types/character";
import type { InnerStat } from "@/types/placement";

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

export function fetchBlockSummaryFromManualBlocks(
  manualBlocks: readonly BlockCount[],
): BlockSummary {
  const normalizedBlocks: BlockCount[] = [];
  let totalBlocks = 0;
  let totalCells = 0;

  for (const manualBlock of manualBlocks) {
    const shape = BLOCK_SHAPE_BY_ID[manualBlock.shapeId as keyof typeof BLOCK_SHAPE_BY_ID];
    if (shape === undefined) {
      continue;
    }

    const count = Math.max(0, Math.trunc(manualBlock.count));
    if (count === 0) {
      continue;
    }

    normalizedBlocks.push({
      shapeId: shape.id,
      count,
    });

    totalBlocks += count;
    totalCells += shape.cells.length * count;
  }

  // Sort by shapeId to match fetchBlockSummaryFromCharacters behavior
  normalizedBlocks.sort((a, b) => a.shapeId.localeCompare(b.shapeId));

  return {
    blocks: normalizedBlocks,
    totalBlocks,
    totalCells,
  };
}
