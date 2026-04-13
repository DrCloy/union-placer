import type { AppError } from "@/types/error";
import { NEXON_ERROR_MESSAGES } from "@/constants/errorMessages";

// string index 접근을 위한 타입 캐스트 (unknown code 처리)
const MESSAGES_MAP = NEXON_ERROR_MESSAGES as Record<string, string | undefined>;

export function resolveErrorMessage(error: AppError): string {
  switch (error.kind) {
    case "api": {
      const known = MESSAGES_MAP[error.code];
      return known ?? `API 오류가 발생했습니다. (${error.code})`;
    }
    case "search":
      return `배치 탐색 중 오류가 발생했습니다. (${error.message})`;
    case "network":
      return "네트워크 오류가 발생했습니다. 연결을 확인해주세요.";
  }
}
