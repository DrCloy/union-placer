# Nexon Open API 계약서

## 0. 공용 정보 (전체에 적용)

### Base URL & Auth

- Base URL: https://open.api.nexon.com
- 인증 헤더명: x-nxopen-api-key
- 인증 값 형식: string

### 공통 Response Rules

- 성공 Status: 200
- 에러 포맷: ErrorMessage
- Rate Limit: OPENAPI00007 발생 시 호출량 초과로 간주
- Timeout: 클라이언트 구현 정책으로 관리 (서버 명세 미제공)

### 공통 에러 코드

| Error Code   | HTTP Status | 상태                  | 설명                             |
| ------------ | ----------- | --------------------- | -------------------------------- |
| OPENAPI00001 | 500         | Internal Server Error | 서버 내부 오류                   |
| OPENAPI00002 | 403         | Forbidden             | 권한이 없는 경우                 |
| OPENAPI00003 | 400         | Bad Request           | 유효하지 않은 식별자             |
| OPENAPI00004 | 400         | Bad Request           | 파라미터 누락 또는 유효하지 않음 |
| OPENAPI00005 | 400         | Bad Request           | 유효하지 않은 API KEY            |
| OPENAPI00006 | 400         | Bad Request           | 유효하지 않은 게임 또는 API PATH |
| OPENAPI00007 | 429         | Too Many Requests     | API 호출량 초과                  |
| OPENAPI00009 | 400         | Bad Request           | 데이터 준비 중                   |
| OPENAPI00010 | 400         | Bad Request           | 게임 점검 중                     |
| OPENAPI00011 | 503         | Service Unavailable   | API 점검 중                      |

### Error Schema

| Field | Type  | Description |
| ----- | ----- | ----------- |
| error | Error | 에러 본문   |

| Field   | Type   | Description |
| ------- | ------ | ----------- |
| name    | string | 에러 코드   |
| message | string | 에러 설명   |

---

## 1. 스키마 요약

### CharacterList

| Field        | Type          | Description            |
| ------------ | ------------- | ---------------------- |
| account_list | AccountInfo[] | 메이플스토리 계정 목록 |

### AccountInfo

| Field          | Type            | Description              |
| -------------- | --------------- | ------------------------ |
| account_id     | string          | 메이플스토리 계정 식별자 |
| character_list | CharacterInfo[] | 캐릭터 목록              |

### CharacterInfo

| Field           | Type          | Description   |
| --------------- | ------------- | ------------- |
| ocid            | string        | 캐릭터 식별자 |
| character_name  | string        | 캐릭터 명     |
| world_name      | string        | 월드 명       |
| character_class | string        | 캐릭터 직업   |
| character_level | number(int64) | 캐릭터 레벨   |

### Character

| Field | Type   | Description   |
| ----- | ------ | ------------- |
| ocid  | string | 캐릭터 식별자 |

### Union

| Field                | Type          | Description          |
| -------------------- | ------------- | -------------------- |
| date                 | string        | 조회 기준일 (KST)    |
| union_level          | number(int64) | 유니온 레벨          |
| union_grade          | string        | 유니온 등급          |
| union_artifact_level | number(int64) | 아티팩트 레벨        |
| union_artifact_exp   | number(int64) | 보유 아티팩트 경험치 |
| union_artifact_point | number(int64) | 보유 아티팩트 포인트 |

### UnionRaider

| Field                 | Type              | Description             |
| --------------------- | ----------------- | ----------------------- |
| date                  | string            | 조회 기준일 (KST)       |
| union_raider_stat     | string[]          | 유니온 공격대원 효과    |
| union_occupied_stat   | string[]          | 유니온 공격대 점령 효과 |
| union_inner_stat      | UnionInnerStat[]  | 유니온 공격대 배치      |
| union_block           | UnionBlock[]      | 유니온 블록 정보        |
| use_preset_no         | number(int64)     | 적용 중인 프리셋 번호   |
| union_raider_preset_1 | UnionRaiderPreset | 유니온 프리셋 1번 정보  |
| union_raider_preset_2 | UnionRaiderPreset | 유니온 프리셋 2번 정보  |
| union_raider_preset_3 | UnionRaiderPreset | 유니온 프리셋 3번 정보  |
| union_raider_preset_4 | UnionRaiderPreset | 유니온 프리셋 4번 정보  |
| union_raider_preset_5 | UnionRaiderPreset | 유니온 프리셋 5번 정보  |

### UnionInnerStat

| Field             | Type   | Description            |
| ----------------- | ------ | ---------------------- |
| stat_field_id     | string | 공격대 배치 위치 (0~7) |
| stat_field_effect | string | 해당 지역 점령 효과    |

### UnionBlock

| Field               | Type              | Description                     |
| ------------------- | ----------------- | ------------------------------- |
| block_type          | string            | 블록 모양                       |
| block_class         | string            | 블록 캐릭터 직업                |
| block_level         | string            | 블록 캐릭터 레벨                |
| block_control_point | BlockControlPoint | 블록 기준점 좌표                |
| block_position      | BlockPosition[]   | 블록 좌표 목록 (미배치 시 null) |

### BlockControlPoint

| Field | Type          | Description   |
| ----- | ------------- | ------------- |
| x     | number(int64) | 블록 기준점 X |
| y     | number(int64) | 블록 기준점 Y |

### BlockPosition

| Field | Type          | Description |
| ----- | ------------- | ----------- |
| x     | number(int64) | 블록 X      |
| y     | number(int64) | 블록 Y      |

### UnionRaiderPreset

| Field               | Type             | Description             |
| ------------------- | ---------------- | ----------------------- |
| union_raider_stat   | string[]         | 유니온 공격대원 효과    |
| union_occupied_stat | string[]         | 유니온 공격대 점령 효과 |
| union_inner_stat    | UnionInnerStat[] | 유니온 공격대 배치      |
| union_block         | UnionBlock[]     | 유니온 블록 정보        |

---

## 2. Endpoint 명세

### 2-1. 계정 보유 캐릭터 목록 조회

- Method: GET
- Path: /maplestory/v1/character/list

Query Parameters:

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| 없음 | -    | -        | -           |

Responses:

| Code | Description           | Schema        |
| ---- | --------------------- | ------------- |
| 200  | SUCCESS               | CharacterList |
| 400  | Bad Request           | ErrorMessage  |
| 403  | Forbidden             | ErrorMessage  |
| 429  | Too Many Requests     | ErrorMessage  |
| 500  | Internal Server Error | ErrorMessage  |

### 2-2. 캐릭터 식별자 조회

- Method: GET
- Path: /maplestory/v1/id

Query Parameters:

| Name           | Type   | Required | Description |
| -------------- | ------ | -------- | ----------- |
| character_name | string | O        | 캐릭터 명   |

Responses:

| Code | Description           | Schema       |
| ---- | --------------------- | ------------ |
| 200  | SUCCESS               | Character    |
| 400  | Bad Request           | ErrorMessage |
| 403  | Forbidden             | ErrorMessage |
| 429  | Too Many Requests     | ErrorMessage |
| 500  | Internal Server Error | ErrorMessage |

### 2-3. 유니온 정보 조회

- Method: GET
- Path: /maplestory/v1/user/union

Query Parameters:

| Name | Type   | Required | Description                   |
| ---- | ------ | -------- | ----------------------------- |
| ocid | string | O        | 캐릭터 식별자                 |
| date | string | X        | 조회 기준일 (KST, YYYY-MM-DD) |

Responses:

| Code | Description           | Schema       |
| ---- | --------------------- | ------------ |
| 200  | SUCCESS               | Union        |
| 400  | Bad Request           | ErrorMessage |
| 403  | Forbidden             | ErrorMessage |
| 429  | Too Many Requests     | ErrorMessage |
| 500  | Internal Server Error | ErrorMessage |

### 2-4. 유니온 공격대 정보 조회

- Method: GET
- Path: /maplestory/v1/user/union-raider

Query Parameters:

| Name | Type   | Required | Description                   |
| ---- | ------ | -------- | ----------------------------- |
| ocid | string | O        | 캐릭터 식별자                 |
| date | string | X        | 조회 기준일 (KST, YYYY-MM-DD) |

Responses:

| Code | Description           | Schema       |
| ---- | --------------------- | ------------ |
| 200  | SUCCESS               | UnionRaider  |
| 400  | Bad Request           | ErrorMessage |
| 403  | Forbidden             | ErrorMessage |
| 429  | Too Many Requests     | ErrorMessage |
| 500  | Internal Server Error | ErrorMessage |

---

## 3. 구현 반영 메모

- src/types/nexon.ts: 프론트엔드가 `/api/nexon/union`에서 받는 응답과 에러의 경계 타입 정의
- src/lib/api/nexon.ts: `fetchUnionInfo` 클라이언트 래퍼, nickname query + `x-api-key` header 전달, 응답/에러 정규화
- api/nexon/\*: 실제 Nexon Open API 4개 endpoint 호출, 응답 조합, 프록시 구현은 Phase 8-1에서 담당

---

## 4. 체크리스트

- [x] 공용 정보 반영
- [x] 에러 코드 반영
- [x] 스키마 반영
- [x] endpoint 반영

---

## 5. 변경 이력

| 날짜       | 버전 | 내용                         |
| ---------- | ---- | ---------------------------- |
| 2026-04-08 | 1.0  | 템플릿 양식 작성             |
| 2026-04-09 | 1.1  | docs/api 기준 실제 명세 반영 |
