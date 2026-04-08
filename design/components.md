# 컴포넌트 스펙

Stitch Stage 2 결과 및 디자인 토큰 기반으로 작성된 컴포넌트 Props·상태·인터랙션 스펙.
Phase 7 구현 시 기준 문서로 사용.

---

## 공통 규칙

- **border-radius:** `rounded` (4px) — 기본. 예외: FilterPills만 `rounded-full`
- **선 구분 금지:** `<hr>` 또는 1px divider 사용 금지. 배경색 차이 또는 spacing으로 구분
- **순수 흰색 금지:** 텍스트는 `#e8e8e8` (text-primary) 사용
- **패널 blur:** 모든 Panel 컴포넌트에 `backdrop-blur-sm` 적용
- **호버 효과 ("Golden Hover"):** 배치 가능한 블록 아이템에 hover 시 `#c9a227` 0.5px inner border + `brightness-110`

---

## 레이아웃

### Header

앱 상단 고정 헤더. 로고 + StepIndicator 포함.

| Prop          | 타입          | 설명                 |
| ------------- | ------------- | -------------------- |
| `currentStep` | `1 \| 2 \| 3` | StepIndicator에 전달 |

**스타일:**

- height: 56px
- bg: `bg-[#15212c]` (surface-container)
- 좌: 앱 타이틀 "유니온 배치" — Manrope bold, `text-[#e8e8e8]`
- 중앙: `<StepIndicator>`

---

### StepIndicator

현재 단계를 3단계로 표시.

| Prop          | 타입          | 설명           |
| ------------- | ------------- | -------------- |
| `currentStep` | `1 \| 2 \| 3` | 현재 활성 단계 |

**상태별 스타일:**

| 상태     | 텍스트 색                  | 하단 강조               |
| -------- | -------------------------- | ----------------------- |
| active   | `#e8e8e8` (text-primary)   | `#c9a227` 2px underline |
| done     | `#b0c1c9` (text-secondary) | ✓ 아이콘                |
| inactive | `#6e8496` (text-disabled)  | —                       |

**레이블:** "① 캐릭터 선택" · "② 배치 설정" · "③ 배치 실행"

---

### Panel

콘텐츠를 감싸는 반투명 패널.

| Prop       | 타입                    | 기본값      | 설명                 |
| ---------- | ----------------------- | ----------- | -------------------- |
| `variant`  | `'default' \| 'accent'` | `'default'` | accent = 골드 테두리 |
| `children` | `ReactNode`             | —           |                      |

**스타일:**

| variant | bg                                 | border                    |
| ------- | ---------------------------------- | ------------------------- |
| default | `bg-[#2a343e]/85 backdrop-blur-sm` | `border border-white/12`  |
| accent  | 동일                               | `border border-[#c9a227]` |

---

## 공통

### Button

| Prop       | 타입                                              | 기본값      | 설명 |
| ---------- | ------------------------------------------------- | ----------- | ---- |
| `variant`  | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` |      |
| `disabled` | `boolean`                                         | `false`     |      |
| `onClick`  | `() => void`                                      | —           |      |
| `children` | `ReactNode`                                       | —           |      |

**상태별 스타일:**

| variant   | 기본                                                               | hover                           | disabled                  |
| --------- | ------------------------------------------------------------------ | ------------------------------- | ------------------------- |
| primary   | `bg-gradient-to-b from-[#A8C62A] to-[#6e8400]` text `#FFFCFF` bold | `brightness-110`                | bg `#6e8496`, no gradient |
| secondary | ghost + `border border-white/20`                                   | `bg-[#2e3a46]` (surface-bright) | 동일 disabled 규칙        |
| ghost     | 배경 없음, text-primary                                            | text underline                  | text-disabled             |
| danger    | `bg-[#CF2C69]` text `#FFFCFF`                                      | `brightness-110`                | 동일                      |

**공통 스타일:** `h-9 px-4 rounded text-sm font-bold cursor-pointer`

---

### Input

| Prop          | 타입                  | 기본값  | 설명        |
| ------------- | --------------------- | ------- | ----------- |
| `value`       | `string`              | —       |             |
| `onChange`    | `(v: string) => void` | —       |             |
| `placeholder` | `string`              | —       |             |
| `error`       | `string \| undefined` | —       | 에러 메시지 |
| `disabled`    | `boolean`             | `false` |             |

**상태별 스타일:**

| 상태    | border                               | 비고                                    |
| ------- | ------------------------------------ | --------------------------------------- |
| default | `border-white/12`                    | bg `surface-container-lowest` `#040f19` |
| focus   | `border-b border-[#c9a227]` (하단만) | glow 없음, underline 애니메이션         |
| error   | `border border-[#CF2C69]`            | 하단에 에러 텍스트 표시                 |

**공통 스타일:** `h-10 px-3 rounded bg-[#040f19] text-[#e8e8e8] text-sm font-[Inter]`

---

### Badge

등급 표시 배지.

| Prop    | 타입                                 | 설명                                           |
| ------- | ------------------------------------ | ---------------------------------------------- |
| `grade` | `'B' \| 'A' \| 'S' \| 'SS' \| 'SSS'` |                                                |
| `size`  | `'sm' \| 'md'`                       | sm: CharacterCard 내부, md: FilterPill 선택 시 |

**스타일:**

- 텍스트: `#E0C0A0` (color-grade-text), bold
- bg: `bg-[#15212c]` (surface-container) + 등급별 미세 밝기 차이
- `rounded`
- sm: `text-xs px-1.5 py-0.5` · md: `text-sm px-2 py-1`

---

### Tab

입력 방식 전환 탭.

| Prop       | 타입                                | 설명         |
| ---------- | ----------------------------------- | ------------ |
| `value`    | `'search' \| 'manual'`              | 현재 선택 탭 |
| `onChange` | `(v: 'search' \| 'manual') => void` |              |

**상태별 스타일:**

| 상태     | 텍스트        | bg                                      | 하단          |
| -------- | ------------- | --------------------------------------- | ------------- |
| active   | text-primary  | `bg-[#1f2b36]` (surface-container-high) | `#c9a227` 2px |
| inactive | text-disabled | transparent                             | —             |

**레이블:** "닉네임 검색" · "직접 입력"

---

### ProgressBar

탐색 진행률 표시.

| Prop    | 타입                  | 설명                               |
| ------- | --------------------- | ---------------------------------- |
| `value` | `number`              | 0–100                              |
| `label` | `string \| undefined` | 상단 텍스트 (예: "탐색 중... 45%") |

**스타일:**

- track: `h-2 rounded bg-[#111d27]` (surface-container-low)
- fill: `bg-[#A8C62A]` (primary), width `${value}%`, 애니메이션 shimmer
- 완료(100%): fill 유지, label "탐색 완료 ✓"

---

### Collapsible

접을 수 있는 섹션. API 키 입력 등에 사용.

| Prop          | 타입        | 설명             |
| ------------- | ----------- | ---------------- |
| `label`       | `string`    | 헤더 텍스트      |
| `children`    | `ReactNode` | 펼쳐졌을 때 내용 |
| `defaultOpen` | `boolean`   | 초기 상태        |

**상태:**

- closed: `h-10` — 헤더 + chevron-down 아이콘
- open: 헤더 + 콘텐츠 영역, chevron-up, 애니메이션 expand

**스타일:** `bg-[#15212c] rounded`

---

## 도메인 전용

### CharacterCard

캐릭터 선택 카드.

| Prop        | 타입         | 설명          |
| ----------- | ------------ | ------------- |
| `character` | `Character`  | 캐릭터 데이터 |
| `selected`  | `boolean`    | 선택 상태     |
| `onSelect`  | `() => void` |               |

**상태별 스타일:**

| 상태       | bg                | border                                   | 기타                  |
| ---------- | ----------------- | ---------------------------------------- | --------------------- |
| unselected | `bg-[#323e4a]/90` | `border-white/12`                        | 좌측 4px 직업 색상 바 |
| selected   | 동일              | `border border-[#c9a227]`                | 약간 밝은 bg          |
| hover      | `brightness-105`  | `#c9a227` 0.5px inner + `brightness-110` | "Golden Hover"        |

**레이아웃:** 좌측 4px 직업 색상 바 + 직업 아이콘 + 이름 + 레벨 + `<Badge grade={...} />`

**직업 색상 바:**

| 직업군         | 색상                                                    |
| -------------- | ------------------------------------------------------- |
| 전사           | `#cc3333`                                               |
| 마법사         | `#3388cc`                                               |
| 궁수 / 메이플M | `#44aa44`                                               |
| 도적           | `#8844cc`                                               |
| 해적           | `#8899aa`                                               |
| 제논           | CSS `linear-gradient(135deg, #8844cc 50%, #8899aa 50%)` |

---

### FilterPills

등급 필터 버튼 그룹.

| Prop       | 타입                       | 설명                                         |
| ---------- | -------------------------- | -------------------------------------------- |
| `value`    | `GradeFilter`              | 현재 선택 (전체 \| B \| A \| S \| SS \| SSS) |
| `onChange` | `(v: GradeFilter) => void` |                                              |

**상태별 스타일:**

| 상태     | border                    | bg             | 텍스트         |
| -------- | ------------------------- | -------------- | -------------- |
| active   | `border border-[#c9a227]` | `bg-[#1f2b36]` | text-primary   |
| inactive | `border-white/12`         | `bg-[#15212c]` | text-secondary |

**스타일:** `h-7 px-3 rounded-full text-sm` — 예외적으로 `rounded-full` 사용

---

### BlockSummary

선택된 블록 현황 요약 패널.

| Prop         | 타입           | 설명             |
| ------------ | -------------- | ---------------- |
| `blocks`     | `BlockCount[]` | 직업군별 블록 수 |
| `totalCells` | `number`       | 총 칸 수         |

**레이아웃:**

- 제목: "블록 현황" (Manrope bold)
- 직업군별 색상 bullet + 개수 목록
- 하단: "총 N 블록 / M 칸"
- bg: `bg-[#15212c]`, 상단 `border-t border-[#c9a227]` (Panel accent 변형)

---

### RegionRow

영역별 목표 칸 수 입력 행.

| Prop       | 타입                  | 설명        |
| ---------- | --------------------- | ----------- |
| `region`   | `Region`              | 영역 정보   |
| `value`    | `number \| undefined` | 입력값      |
| `onChange` | `(v: number) => void` |             |
| `error`    | `string \| undefined` | 유효성 오류 |

**상태별 스타일:**

| 상태    | 입력 bg                   | 비고                      |
| ------- | ------------------------- | ------------------------- |
| default | `bg-[#040f19]`            | 빈 입력                   |
| filled  | 동일 + 미세 green tint    | 값 입력됨                 |
| error   | `border border-[#CF2C69]` | 오류 텍스트 + 아이콘 표시 |

**레이아웃:** 영역 이름 (좌) + 숫자 입력 `<Input>` (우), `h-11`

---

### PriorityColumn

배치 우선순위 드래그 컬럼.

| Prop        | 타입                              | 설명           |
| ----------- | --------------------------------- | -------------- |
| `items`     | `PriorityItem[]`                  | 영역 항목 목록 |
| `onReorder` | `(items: PriorityItem[]) => void` | 순서 변경      |

**섹션 구분:**

- 0순위 (상단)
- 1순위 이하 (중간)
- 미지정 (하단, text-disabled)

> 예외: 섹션 간 구분에 한해 점선(dashed) 구분선 허용 — 드래그 영역 명확화 목적

---

### DraggableRegionItem

우선순위 컬럼 내 드래그 가능한 항목.

| Prop         | 타입      | 설명           |
| ------------ | --------- | -------------- |
| `region`     | `Region`  | 영역 정보      |
| `isDragging` | `boolean` | 드래그 중 여부 |

**상태별 스타일:**

| 상태     | bg                                         | shadow                                      | 기타                                            |
| -------- | ------------------------------------------ | ------------------------------------------- | ----------------------------------------------- |
| idle     | `bg-[#15212c]`                             | —                                           | drag handle 아이콘 + 영역 이름                  |
| dragging | `bg-[#2a3642]` (surface-container-highest) | `shadow-[0_12px_32px_-4px_rgba(0,0,0,0.5)]` | `rotate-2` + 좌측 `border-l-2 border-[#c9a227]` |

---

### SearchControls

탐색 시작/중단 컨트롤 패널.

| Prop       | 타입                    | 설명                |
| ---------- | ----------------------- | ------------------- |
| `status`   | `'idle' \| 'searching'` | 탐색 상태           |
| `progress` | `number`                | 탐색 진행률 (0–100) |
| `onStart`  | `() => void`            |                     |
| `onStop`   | `() => void`            |                     |
| `onReset`  | `() => void`            |                     |

**상태별 구성:**

| status    | 표시                                                                                       |
| --------- | ------------------------------------------------------------------------------------------ |
| idle      | `<Button variant="primary">배치 시작</Button>` + `<Button variant="ghost">초기화</Button>` |
| searching | `<Button variant="danger">탐색 중단</Button>` + `<ProgressBar value={progress} />`         |

---

### UnionBoard

22×20 유니온 배치 격자판.

| Prop      | 타입                                  | 설명                |
| --------- | ------------------------------------- | ------------------- |
| `cells`   | `BoardCell[][]`                       | 22×20 셀 데이터     |
| `status`  | `'idle' \| 'searching' \| 'complete'` |                     |
| `regions` | `RegionBoundary[]`                    | 영역 경계 및 레이블 |

**상태별 스타일:**

| status    | 비고                                |
| --------- | ----------------------------------- |
| idle      | 기본 빈 격자                        |
| searching | 활성 엣지 pulse 애니메이션          |
| complete  | 완료 시 외곽 `#c9a227` border pulse |

**격자 스타일:**

- 외곽: `border border-[#c9a227]` (color-border-gold)
- 격자선: `outline-variant #44474b` at 5% opacity (거의 안 보임)

---

### BoardCell

격자판 개별 셀.

| Prop       | 타입                                 | 설명                  |
| ---------- | ------------------------------------ | --------------------- |
| `state`    | `'empty' \| 'placed' \| 'forbidden'` |                       |
| `jobClass` | `JobClass \| undefined`              | placed일 때 직업 색상 |

**상태별 스타일:**

| state     | bg                                     | 비고                        |
| --------- | -------------------------------------- | --------------------------- |
| empty     | `bg-[#111d27]` (surface-container-low) | 미세 격자선                 |
| placed    | 직업 색상 (예: `bg-[#cc3333]`)         | border 없음                 |
| forbidden | `bg-[#08141f]` (surface-dim)           | ✕ 아이콘 또는 diagonal 패턴 |

---

### RegionLabel

보드 외곽 영역 이름 레이블.

| Prop       | 타입                                     | 설명                |
| ---------- | ---------------------------------------- | ------------------- |
| `name`     | `string`                                 | 영역 이름           |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | 보드 어느 쪽에 위치 |

**스타일:**

- `bg-[#2a3642]` (surface-container-highest), `text-[#b0c1c9]`, Inter 11px
- 보드 외곽에 절대 위치

---

### RegionStats

배치 완료 후 목표 대비 실제 통계 테이블.

| Prop    | 타입           | 설명                  |
| ------- | -------------- | --------------------- |
| `stats` | `RegionStat[]` | 영역별 목표·실제 수치 |

**행 상태:**

| 상태        | 결과 열       | 색상                      |
| ----------- | ------------- | ------------------------- |
| satisfied   | ✓             | `#A8C62A` (primary green) |
| unsatisfied | ✗ + diff (-N) | `#CF2C69` (danger red)    |

**테이블 헤더:** "영역" · "목표" · "실제" · "결과" (Manrope bold, text-secondary)

**행 구분:** divider 선 없음 — 짝수/홀수 행 배경색 토널 차이로 구분
(`bg-[#15212c]` / `bg-[#1f2b36]` 교차)
