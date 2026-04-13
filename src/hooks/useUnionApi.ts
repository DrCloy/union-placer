import { useState } from "react";
import type { Character } from "@/types/character";
import type { ApiError, NetworkError } from "@/types/error";
import type { NexonUnionBlock } from "@/types/nexon";
import { useBlockStore } from "@/store/blockStore";
import {
  fetchBlockShapeFromJobGroupAndGrade,
  fetchGradeFromLevel,
  fetchJobGroupFromJobName,
} from "@/lib/blocks";
import { fetchUnionInfo as fetchUnionInfoApi, NexonApiError } from "@/lib/api/nexon";

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function toCharacters(blocks: NexonUnionBlock[]): Character[] {
  return blocks.flatMap((block, index): Character[] => {
    const level = parseInt(block.block_level, 10);
    if (!Number.isFinite(level)) return [];
    const grade = fetchGradeFromLevel(level);
    if (grade === null) return [];
    const jobGroup = fetchJobGroupFromJobName(block.block_class);
    if (jobGroup === null) return [];
    const blockShape = fetchBlockShapeFromJobGroupAndGrade(jobGroup, grade);
    if (blockShape === undefined) return [];
    return [
      {
        // index는 flatMap 필터링 전 원본 배열 인덱스 — block_type(닉네임)과 조합해 고유성 보장
        id: `${index}-${block.block_type}`,
        nickname: block.block_type,
        job: block.block_class,
        jobGroup,
        level,
        grade,
        blockShape,
      },
    ];
  });
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useUnionApi(): {
  fetchUnionInfo: (nickname: string) => Promise<void>;
  isLoading: boolean;
  error: ApiError | NetworkError | null;
  clearError: () => void;
} {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | NetworkError | null>(null);

  const fetchUnionInfo = async (nickname: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const apiKey = useBlockStore.getState().apiKey;
      const response = await fetchUnionInfoApi(nickname, apiKey ?? undefined);
      const characters = toCharacters(response.raider.union_block);
      useBlockStore.getState().setCharacters(characters);
    } catch (caught) {
      if (caught instanceof NexonApiError) {
        setError({
          kind: "api",
          code: caught.code,
          status: caught.status,
          message: caught.message,
        });
      } else if (caught instanceof Error) {
        setError({ kind: "network", message: caught.message });
      } else {
        setError({ kind: "network", message: String(caught) });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchUnionInfo, isLoading, error, clearError: () => setError(null) };
}
