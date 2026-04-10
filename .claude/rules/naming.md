---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# Naming Conventions

## 도메인 용어

| 개념      | 사용        | 금지                          |
| --------- | ----------- | ----------------------------- |
| 블록      | `Block`     | Piece, Tile                   |
| 영역      | `Region`    | Area, Zone, Section           |
| 배치      | `Placement` | Position, Layout, Arrangement |
| 우선순위  | `Priority`  | Order, Rank                   |
| 캐릭터    | `Character` | Char, Player, Unit            |
| 유니온 판 | `Board`     | Grid, Map                     |

## 동작 용어

| 개념            | 사용       | 금지                    |
| --------------- | ---------- | ----------------------- |
| 데이터 가져오기 | `fetch`    | get, load, retrieve     |
| 상태 변경       | `set`      | update, change, modify  |
| 토글            | `toggle`   | switch, flip            |
| 초기화          | `reset`    | clear, init, initialize |
| 검증            | `validate` | check, verify           |

## 파일명

| 종류     | 규칙                    | 예시                |
| -------- | ----------------------- | ------------------- |
| 컴포넌트 | PascalCase              | `CharacterCard.tsx` |
| 훅       | camelCase, `use` 접두사 | `useUnionApi.ts`    |
| 유틸리티 | camelCase               | `api.ts`            |
| 타입     | camelCase               | `block.ts`          |

## 코드

| 종류            | 규칙                   | 예시             |
| --------------- | ---------------------- | ---------------- |
| 컴포넌트        | PascalCase             | `CharacterCard`  |
| 함수            | camelCase              | `fetchUnionInfo` |
| 상수            | UPPER_SNAKE_CASE       | `MAX_BLOCKS`     |
| 타입/인터페이스 | PascalCase             | `BlockShape`     |
| Boolean         | `is/has/should` 접두사 | `isSearching`    |
| 이벤트 핸들러   | `handle` 접두사        | `handleClick`    |

## 금지

- 약어 금지: `btn` ❌ → `Button` ✅
- 너무 일반적인 단독 이름 금지: `Item`, `Data`, `Info`
- 변수명 3자 미만 금지 (반복문 `i`, `j` 제외)
