import type { NexonErrorCode } from "@/types/error";

export const NEXON_ERROR_MESSAGES: Record<NexonErrorCode, string> = {
  OPENAPI00001: "Nexon 서버에 오류가 발생했습니다.",
  OPENAPI00002: "API 접근 권한이 없습니다.",
  OPENAPI00003: "유효하지 않은 캐릭터 식별자입니다.",
  OPENAPI00004: "잘못된 요청입니다. 입력값을 확인해주세요.",
  OPENAPI00005: "유효하지 않은 API KEY입니다.",
  OPENAPI00006: "유효하지 않은 API 경로입니다.",
  OPENAPI00007: "API 호출량을 초과했습니다. 잠시 후 다시 시도해주세요.",
  OPENAPI00009: "데이터 준비 중입니다. 잠시 후 다시 시도해주세요.",
  OPENAPI00010: "게임 점검 중입니다.",
  OPENAPI00011: "API 점검 중입니다.",
};
