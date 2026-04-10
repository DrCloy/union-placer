# 구현 태스크 분해

## 의존성 다이어그램

```text
Phase 1 (types/)
    │
    ▼
Phase 2 (constants/)
    │
    ├──▶ Phase 3 (lib/algorithm/)
    │
    └──▶ Phase 4 (lib/utils, lib/api)
              │
              ▼
          Phase 5 (store/)
              │
              ├──▶ Phase 6 (workers/, hooks/)
              │
              └──▶ Phase 7 (components/)  ← Phase UI 완료 후
                        │
                        ▼
                    Phase 8 (api/, 배포)
```

---

## Phase 1 — `types/` 타입 정의

**입력 조건:** Phase D 완료

| #   | 태스크           | 파일                     | 설명                                                                                                                                           |
| --- | ---------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1-1 | 블록 타입 정의   | `src/types/block.ts`     | `BlockShape`, `BlockVariant`, `JobGroup`, `Grade`                                                                                              |
| 1-2 | 보드 타입 정의   | `src/types/board.ts`     | `UnionBoard`, `OuterRegion`, `InnerRegion`, `OuterStat`, `InnerStat`, `Direction`                                                              |
| 1-3 | 캐릭터 타입 정의 | `src/types/character.ts` | `Character`, `BlockCount`, `BlockSummary`                                                                                                      |
| 1-4 | 배치 타입 정의   | `src/types/placement.ts` | `RegionCellSetting`, `Priority`, `CustomPriority`, `PlacementResult`, `BlockPlacement`, `PlacementStats`, `RegionPlacementStat`, `SearchState` |

**완료 조건:** `npm run typecheck` 통과, `any` 타입 없음

---

## Phase 2 — `constants/` 상수 데이터

**입력 조건:** Phase 1 완료

| #   | 태스크                | 파일                       | 설명                                               |
| --- | --------------------- | -------------------------- | -------------------------------------------------- |
| 2-1 | 블록 모양 데이터      | `src/constants/blocks.ts`  | 16종 블록 shapes (docs/05-data-model.md §1.2 기준) |
| 2-2 | 직업 매핑 데이터      | `src/constants/jobs.ts`    | 세부 직업명 → `JobGroup` 매핑, 유효 스탯 매핑      |
| 2-3 | 유니온 판 영역 데이터 | `src/constants/board.ts`   | 8개 외부 영역 좌표, 8개 내부 영역 좌표, 중앙 4칸   |
| 2-4 | 프리셋 데이터         | `src/constants/presets.ts` | 사냥 프리셋, 보스 프리셋 (`Priority` 타입)         |

**완료 조건:** `npm run check` 통과

---

## Phase 3 — `lib/algorithm/` 배치 알고리즘

**입력 조건:** Phase 1·2 완료

| #    | 태스크          | 파일                             | 설명                                                                                |
| ---- | --------------- | -------------------------------- | ----------------------------------------------------------------------------------- |
| 3-1  | 블록 변형 생성  | `src/lib/algorithm/variants.ts`  | `generateVariants`, `transformCells`, `deduplicateVariants`                         |
| 3-2  | 보드 유틸리티   | `src/lib/algorithm/placement.ts` | `isInBounds`, `isOccupied`, `getRegionAt`, `getOccupiedCells`, `countCellsInRegion` |
| 3-3  | 배치 검사 로직  | `src/lib/algorithm/placement.ts` | `canPlace`, `isForbiddenRegion`, `placeBlock`                                       |
| 3-4  | 연결성 검사     | `src/lib/algorithm/placement.ts` | `isConnected` (BFS)                                                                 |
| 3-5  | 영역 통계 계산  | `src/lib/algorithm/placement.ts` | `calculateRegionStats`, `createResult`                                              |
| 3-6  | 그리디 초기 해  | `src/lib/algorithm/search.ts`    | `buildGreedySolution`, `findBestPlacement`, `scorePlacement`                        |
| 3-7  | 백트래킹 탐색   | `src/lib/algorithm/search.ts`    | `searchRecursive`, 가지치기 조건 전부                                               |
| 3-8  | 메인 진입점     | `src/lib/algorithm/search.ts`    | `findOptimalPlacement` (그리디 + 백트래킹 통합)                                     |
| 3-9  | 결과 평가       | `src/lib/algorithm/search.ts`    | `isOptimal`, `isBetterResult`                                                       |
| 3-10 | 알고리즘 인덱스 | `src/lib/algorithm/index.ts`     | public API export                                                                   |

**완료 조건:** `npm run check` 통과, 테스트 환경/실행 체계 점검 기준 문서화

---

## Phase 4 — `lib/` 유틸·API

**입력 조건:** Phase 1·2 완료

| #   | 태스크         | 파일                   | 설명                                                                                                  |
| --- | -------------- | ---------------------- | ----------------------------------------------------------------------------------------------------- |
| 4-1 | 블록 유틸      | `src/lib/blocks.ts`    | 직업군·레벨 → `BlockShape` 변환, `BlockCount` 집계                                                    |
| 4-2 | 보드 유틸      | `src/lib/board.ts`     | 좌표 → 영역 매핑, 영역 메타데이터 조회                                                                |
| 4-3 | API 클라이언트 | `src/lib/api/nexon.ts` | `fetchUnionInfo`, `/api/nexon/union` 호출, query 구성, 응답/에러 정규화                               |
| 4-4 | API 경계 타입  | `src/types/nexon.ts`   | `NexonUnionInfoResponse`, `NexonUnionResponse`, `NexonUnionRaiderResponse`, `NexonUnionApiError` 정의 |

참고 문서: `docs/09-api-contract.md`

비고: 실제 Nexon Open API endpoint별 프록시 구현과 응답 조합은 Phase 8-1에서 담당

**완료 조건:** `npm run check` 통과, import 레이어 위반 없음

---

## Phase 5 — `store/` Zustand 스토어

**입력 조건:** Phase 1·2·3 완료

| #   | 태스크      | 파일                         | 설명                                                                                                  |
| --- | ----------- | ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| 5-1 | 블록 스토어 | `src/store/blockStore.ts`    | `inputMethod`, `apiKey`, `characters`, `selectedCharacters`, `manualBlocks`, `blockSummary` + actions |
| 5-2 | 설정 스토어 | `src/store/settingsStore.ts` | `regionSettings`, `priority`, `validationResult` + actions                                            |
| 5-3 | 결과 스토어 | `src/store/resultStore.ts`   | `isSearching`, `searchProgress`, `result`, `error` + actions                                          |
| 5-4 | 통합 스토어 | `src/store/index.ts`         | 세 스토어 합성 export                                                                                 |

**완료 조건:** `npm run check` 통과, store → components 역방향 import 없음

---

## Phase 6 — `workers/` + `hooks/`

**입력 조건:** Phase 3·5 완료

| #   | 태스크     | 파일                              | 설명                                                         |
| --- | ---------- | --------------------------------- | ------------------------------------------------------------ |
| 6-1 | Web Worker | `src/workers/placementWorker.ts`  | `onmessage` 핸들러, `progress`/`best`/`complete` 메시지 발행 |
| 6-2 | Worker 훅  | `src/hooks/usePlacementWorker.ts` | Worker 생성·종료·메시지 수신, `startSearch`, `stopSearch`    |
| 6-3 | API 훅     | `src/hooks/useUnionApi.ts`        | `fetchUnionInfo` 래핑, 로딩·에러 상태 관리                   |

**완료 조건:** `npm run check` 통과, workers/ → store/ import 없음

---

## Phase 7 — `components/` UI 컴포넌트

**입력 조건:** Phase UI 완료, Phase 5 완료

| #    | 태스크                         | 파일                                                 | 설명                             |
| ---- | ------------------------------ | ---------------------------------------------------- | -------------------------------- |
| 7-1  | 공통: Button                   | `src/components/common/Button.tsx`                   | variant, size, disabled          |
| 7-2  | 공통: Input                    | `src/components/common/Input.tsx`                    | text, number, label, error       |
| 7-3  | 공통: Modal                    | `src/components/common/Modal.tsx`                    | open/close, children             |
| 7-4  | 레이아웃: Header               | `src/components/layout/Header.tsx`                   | 앱 제목                          |
| 7-5  | 레이아웃: StepIndicator        | `src/components/layout/StepIndicator.tsx`            | 1→2→3 단계 표시                  |
| 7-6  | 레이아웃: Container            | `src/components/layout/Container.tsx`                | 중앙 정렬 래퍼                   |
| 7-7  | 블록 입력: InputMethodSelector | `src/components/block-input/InputMethodSelector.tsx` | 닉네임/수동 탭 전환              |
| 7-8  | 블록 입력: NicknameSearch      | `src/components/block-input/NicknameSearch.tsx`      | 닉네임 + API Key 입력, 조회 버튼 |
| 7-9  | 블록 입력: CharacterCard       | `src/components/block-input/CharacterCard.tsx`       | 직업·레벨·등급 표시, 선택 토글   |
| 7-10 | 블록 입력: ManualInput         | `src/components/block-input/ManualInput.tsx`         | 등급 × 직업 그리드 입력          |
| 7-11 | 블록 입력: BlockSummary        | `src/components/block-input/BlockSummary.tsx`        | 블록 카운팅 요약, 총 칸 수       |
| 7-12 | 설정: RegionCellInput          | `src/components/settings/RegionCellInput.tsx`        | 외부·내부 영역별 칸 수 입력      |
| 7-13 | 설정: PresetSelector           | `src/components/settings/PresetSelector.tsx`         | 사냥/보스 프리셋 버튼            |
| 7-14 | 설정: PrioritySettings         | `src/components/settings/PrioritySettings.tsx`       | 칸반 드래그 앤 드롭 우선순위     |
| 7-15 | 결과: UnionBoard               | `src/components/result/UnionBoard.tsx`               | 22×20 그리드 시각화, 블록 색상   |
| 7-16 | 결과: RegionStats              | `src/components/result/RegionStats.tsx`              | 목표 vs 실제 칸 수, 충족률       |
| 7-17 | 결과: PlacementResult          | `src/components/result/PlacementResult.tsx`          | 전체 결과 요약 패널              |
| 7-18 | 스텝 조립: App                 | `src/App.tsx`                                        | Step 1→2→3 전환 로직             |

**완료 조건:** `npm run check` 통과, 컴포넌트당 하나의 파일

---

## Phase 8 — `api/` + 배포 설정

**입력 조건:** Phase 4 완료

| #   | 태스크                     | 파일             | 설명                                                                 |
| --- | -------------------------- | ---------------- | -------------------------------------------------------------------- |
| 8-1 | Vercel Serverless Function | `api/nexon/*.ts` | `/id`, `/character/list`, `/user/union`, `/user/union-raider` 프록시 |
| 8-2 | Vercel 설정                | `vercel.json`    | 빌드, 함수 메모리/타임아웃, 환경변수                                 |
| 8-3 | 환경 변수 설정             | Vercel 대시보드  | `NEXON_API_KEY` 등록                                                 |
| 8-4 | 프로덕션 빌드 검증         | —                | `npm run build` 통과 확인                                            |

**완료 조건:** `npm run build` 통과, Vercel 배포 성공

---

## Phase 5~8 실행 고정 규칙 (Preflight 반영)

- Phase 5: `src/store/index.ts`는 `blockStore`, `settingsStore`, `resultStore` 합성 export 규칙을 유지한다.
- Phase 6: Worker 메시지 계약은 `progress`, `best`, `complete`, `error`, `cancelled`를 기준으로 고정한다.
- Phase 6: `usePlacementWorker`는 start/stop/cleanup 수명주기와 취소 흐름을 명시적으로 유지한다.
- Phase 7: Stitch 산출물은 참고 문서로만 사용하고, 실제 구현 기준은 Storybook을 우선한다.
- Phase 7: 스토어/훅 연결 포인트는 App step 전환 기준으로 고정한다.
- Phase 5~7 공통 게이트: `npm run check` 통과, import 레이어 위반 없음, 컴포넌트당 하나의 파일 유지.
- Phase 8 게이트: `npm run build` 통과, Vercel 배포 검증 완료.

---

## 운영 태스크 — 스타일 정비 (반복 수행)

기능 PR의 리뷰/수정이 완료되고 충돌이 없을 때 수행한다.

| #   | 태스크              | 파일           | 설명                                                   |
| --- | ------------------- | -------------- | ------------------------------------------------------ |
| M-1 | main 최신화         | —              | `git checkout main` → `git pull --ff-only origin main` |
| M-2 | 정비 브랜치 생성    | —              | `git checkout -b phase/style-lint-prettier`            |
| M-3 | 스타일 설정 변경    | 설정 파일 일체 | ESLint/Prettier 설정 추가 또는 조정                    |
| M-4 | 전체 코드 일괄 적용 | `src/**` 외    | `eslint --fix`, `prettier --write` 실행                |
| M-5 | 검증 및 분리 커밋   | —              | `npm run check` 통과, 설정 커밋/적용 커밋 분리 권장    |
| M-6 | 스타일 정비 전용 PR | —              | 기능 변경 없이 스타일 변경만 포함한 PR 생성            |

**완료 조건:** `npm run check` 통과, 기능 동작 변경 없음

---

## 검토 체크리스트 (Phase 1~8 공통)

```
□ npm run check 통과 (typecheck + lint + format check)
□ import 레이어 위반 없음
□ any 타입 없음
□ 명명 규칙 준수 (.claude/rules/naming.md)
□ 도메인 용어 준수 (.claude/rules/domain.md)
□ 컴포넌트당 하나의 파일
```
