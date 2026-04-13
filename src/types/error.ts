export type NexonErrorCode =
  | "OPENAPI00001" // 서버 내부 오류
  | "OPENAPI00002" // 권한 없음
  | "OPENAPI00003" // 유효하지 않은 식별자
  | "OPENAPI00004" // 파라미터 누락 또는 유효하지 않음
  | "OPENAPI00005" // 유효하지 않은 API KEY
  | "OPENAPI00006" // 유효하지 않은 게임 또는 API PATH
  | "OPENAPI00007" // API 호출량 초과
  | "OPENAPI00009" // 데이터 준비 중
  | "OPENAPI00010" // 게임 점검 중
  | "OPENAPI00011"; // API 점검 중

export interface ApiError {
  kind: "api";
  code: NexonErrorCode | string; // 알 수 없는 코드 허용
  status: number;
  message: string; // 로깅용 원본 메시지
}

export interface SearchError {
  kind: "search";
  message: string;
}

export interface NetworkError {
  kind: "network";
  message: string;
}

export type AppError = ApiError | SearchError | NetworkError;
