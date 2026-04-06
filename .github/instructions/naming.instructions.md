---
applyTo: "**/*"
---

# Naming Convention

## 용어 사전

에이전트 간 일관된 결과를 위해 반드시 지정된 용어를 사용한다.

### UI 역할

| 개념           | 사용            | 금지                              |
| -------------- | --------------- | --------------------------------- |
| 요약/집계 표시 | `Summary`       | Overview, Total, Count, Aggregate |
| 목록           | `List`          | Items, Collection, Array          |
| 카드 형태 항목 | `Card`          | Tile, Item, Box                   |
| 선택기         | `Selector`      | Picker, Chooser, Select           |
| 입력 필드      | `Input`         | Field, Entry, TextField           |
| 설정           | `Settings`      | Config, Options, Preferences      |
| 결과           | `Result`        | Output, Response, Answer          |
| 제어 버튼 모음 | `Controls`      | Actions, Buttons, Toolbar         |
| 진행률         | `Progress`      | Loading, Status, Indicator        |
| 단계 표시      | `StepIndicator` | Stepper, Steps, Wizard            |
| 시각화/보드    | `Board`         | Grid, Canvas, View                |
| 통계           | `Stats`         | Statistics, Metrics, Analytics    |
| 검색           | `Search`        | Find, Query, Lookup               |
| 모달/팝업      | `Modal`         | Dialog, Popup, Overlay            |

### 동작

| 개념            | 사용       | 금지                    |
| --------------- | ---------- | ----------------------- |
| 데이터 가져오기 | `fetch`    | get, load, retrieve     |
| 상태 변경       | `set`      | update, change, modify  |
| 토글            | `toggle`   | switch, flip            |
| 초기화          | `reset`    | clear, init, initialize |
| 시작            | `start`    | begin, run, execute     |
| 중단            | `stop`     | cancel, abort, halt     |
| 검증            | `validate` | check, verify           |

### 도메인 (이 프로젝트 전용)

| 개념      | 사용        | 금지                          |
| --------- | ----------- | ----------------------------- |
| 블록      | `Block`     | Piece, Tile                   |
| 영역      | `Region`    | Area, Zone, Section           |
| 배치      | `Placement` | Position, Layout, Arrangement |
| 우선순위  | `Priority`  | Order, Rank                   |
| 캐릭터    | `Character` | Char, Player, Unit            |
| 유니온 판 | `Board`     | Grid, Map                     |

---

## 파일명

| 종류     | 규칙                  | 예시                      |
| -------- | --------------------- | ------------------------- |
| 컴포넌트 | PascalCase            | `CharacterCard.tsx`       |
| 훅       | camelCase, use 접두사 | `useUnionApi.ts`          |
| 유틸리티 | camelCase             | `api.ts`, `blocks.ts`     |
| 타입     | camelCase             | `block.ts`, `board.ts`    |
| 상수     | camelCase             | `blocks.ts`, `presets.ts` |

---

## 코드 내 네이밍

| 종류            | 규칙                         | 예시                            |
| --------------- | ---------------------------- | ------------------------------- |
| 컴포넌트        | PascalCase                   | `CharacterCard`                 |
| 함수            | camelCase                    | `fetchUnionInfo`                |
| 변수            | camelCase                    | `blockSummary`                  |
| 상수            | UPPER_SNAKE_CASE             | `MAX_BLOCKS`                    |
| 타입/인터페이스 | PascalCase                   | `BlockShape`, `PlacementResult` |
| Enum            | PascalCase                   | `Grade.SSS`                     |
| Boolean 변수    | `is`, `has`, `should` 접두사 | `isSearching`, `hasError`       |
| 이벤트 핸들러   | `handle` 접두사              | `handleClick`, `handleSubmit`   |

---

## 컴포넌트 파일 위치

src/components/{도메인}/{ComponentName}.tsx

| 폴더           | 용도                      | 예시                                   |
| -------------- | ------------------------- | -------------------------------------- |
| `common/`      | 도메인 무관 범용 컴포넌트 | `Button`, `Modal`, `Input`             |
| `block-input/` | 블록 입력 관련            | `NicknameSearch`, `CharacterCard`      |
| `settings/`    | 설정 관련                 | `RegionCellInput`, `PrioritySettings`  |
| `result/`      | 결과 관련                 | `UnionBoard`, `PlacementResult`        |
| `layout/`      | 레이아웃                  | `Header`, `StepIndicator`, `Container` |

---

## 금지 사항

- 약어 사용 금지: `btn` ❌ → `Button` ✅
- 너무 일반적인 이름 단독 사용 금지: `Item`, `Data`, `Info`, `Container`
- 중복 표현 금지: `BlockBlock`, `SettingsSettings`
- 변수명 3자 미만 금지 (반복문 `i`, `j` 제외)
