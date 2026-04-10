# Stitch 프롬프트 — Stage 3: 페이지 목업

## 목적

5개 화면의 전체 레이아웃 목업 생성.
결과물은 `design/wireframes.md` 작성(UI-6) 및 Phase 7 컴포넌트 구현의 기준이 된다.

---

## 공통 디자인 규칙 (모든 화면 공통)

```
Dark MapleStory gaming UI aesthetic.
- bg: #3a4652 (page background)
- panel: rgba(42,52,62,0.85) + backdrop-blur:12px
- card: rgba(50,62,74,0.90)
- border-gold: #c9a227
- text-primary: #e8e8e8 / text-secondary: #b0c1c9 / text-disabled: #6e8496
- font: Manrope (headlines/titles), Inter (body/labels)
- border-radius: rounded (4px) — 기본. FilterPills만 rounded-full
- No divider lines — tonal depth and spacing only
- Job colors: warrior #cc3333, mage #3388cc, archer #44aa44, thief #8844cc, pirate #8899aa

Header (모든 화면 공통):
- height 56px, bg #15212c (surface-container)
- left: "유니온 배치" Manrope bold #e8e8e8
- center: StepIndicator (3단계, 현재 단계 강조)
```

---

## Screen 1 — Step 1-A: 닉네임 검색 결과 + 캐릭터 선택 중

**URL/상태:** Step 1 active, 검색 완료, 일부 캐릭터 선택됨

```
Frame: 1440×900px, desktop

Layout (2-column):
- Left panel (width ~400px):
  - Tab bar: ["닉네임 검색" active | "직접 입력" inactive]
  - Search input (filled: "루시드서버") + 검색 버튼
  - FilterPills row: [전체 active | B | A | S | SS | SSS]
  - "전체 선택" ghost button + "전체 해제" ghost button (우측 정렬)
  - CharacterCard grid (2 columns, ~6 cards visible + scroll):
    - 3 cards selected (gold border): archer "아크" Lv.280 SS, warrior "다크나이트" Lv.260 S, mage "아이언볼트" Lv.250 S
    - 3 cards unselected: thief "카데나" Lv.240 A, pirate "스트라이커" Lv.200 A, mage "비숍" Lv.180 B
  - Collapsible (closed): "API 키 설정"

- Right panel (width ~240px, accent border):
  - Title: "블록 현황" (Manrope bold)
  - BlockSummary: warrior 1 / mage 1 / archer 1 각 색상 bullet
  - "총 3 블록 / 18 칸"
  - Spacer
  - Button (primary, full width, disabled look): "다음 단계 →"
  - Small helper text: "최소 1개 이상 선택하세요" text-disabled

StepIndicator state: ① active, ② inactive, ③ inactive
```

---

## Screen 2 — Step 1-B: 수동 입력

**URL/상태:** Step 1 active, 수동 입력 탭 선택됨

```
Frame: 1440×900px, desktop

Layout (2-column):
- Left panel (width ~400px):
  - Tab bar: ["닉네임 검색" inactive | "직접 입력" active]
  - Section title: "등급 × 직업별 블록 개수 입력" (text-secondary, Inter)
  - Input grid (등급 rows × 직업 columns):
    Columns: 전사 | 마법사 | 궁수 | 도적 | 해적
    Rows: B등급, A등급, S등급, SS등급, SSS등급
    - Each cell: small number Input (value 0~N, default 0)
    - Cell header: grade badge (B/A/S/SS/SSS) and job icon/label
    - Some cells filled: SS 전사: 2, SS 마법사: 1, S 궁수: 3
  - Total row at bottom: "총 칸 수: 36 / 최대 180"

- Right panel (width ~240px, accent border):
  - Title: "블록 현황"
  - BlockSummary: warrior 2 / mage 1 / archer 3 각 색상 bullet
  - "총 6 블록 / 36 칸"
  - Spacer
  - Button (primary, full width): "다음 단계 →"

StepIndicator state: ① active, ② inactive, ③ inactive
```

---

## Screen 3 — Step 2: 배치 설정 (영역별 칸 수 + 우선순위)

**URL/상태:** Step 2 active, 일부 영역 입력됨

```
Frame: 1440×900px, desktop

Layout (3-column):
- Left panel (width ~320px): 영역별 칸 수 입력
  - Panel title: "영역별 목표 칸 수"
  - Sub-section "외부 영역" (8 RegionRows):
    - 획득경험치: 40 (filled)
    - 크리티컬 확률: 20 (filled)
    - 보스 데미지: 40 (filled, slight green tint)
    - 일반 데미지: 0 (empty)
    - 버프 지속시간: 0
    - 방어율 무시: 30 (filled)
    - 크리티컬 데미지: 40 (filled)
    - 상태이상 내성: 0
  - Sub-section "내부 영역" (8 RegionRows, dimmer):
    - 공격력: 10 (filled)
    - 마력: 0
    - STR: 0 ... (나머지 비어있음)
  - Bottom: "총 180 / 180 칸" + "전체 초기화" ghost button

- Center panel (width ~320px): 우선순위 설정
  - Panel title: "우선순위 설정"
  - Tab: ["프리셋" inactive | "커스텀" active]
  - PriorityColumn (3 sections):
    - "0순위" section: DraggableRegionItem 2개 (보스 데미지, 크리티컬 데미지) — idle state
    - "1순위 이하" section: DraggableRegionItem 3개 (방어율 무시, 획득경험치, 크리티컬 확률) — 1개 dragging state
    - "미지정" section: 나머지 영역들 (text-disabled)
  - Helper text: "드래그하여 순서 변경"

- Right panel (width ~240px, accent border):
  - Title: "블록 현황"
  - BlockSummary 표시
  - "총 180 칸 사용"
  - Spacer
  - SearchControls (idle state):
    - Button (primary, full width): "배치 시작"
    - Button (ghost, full width): "초기화"

StepIndicator state: ① done (✓), ② active, ③ inactive
```

---

## Screen 4 — Step 3-A: 탐색 중

**URL/상태:** Step 3 active, 탐색 진행 중 (45%)

```
Frame: 1440×900px, desktop

Layout (2-column):
- Left panel (width ~640px): UnionBoard (searching state)
  - 22×20 grid, gold outer border (#c9a227)
  - ~40% cells filled with job class colors (warrior, mage, archer blocks scattered)
  - Active edge with subtle pulse animation suggestion
  - RegionLabel overlays: "보스" "크리데" "방무" etc. on edges
  - Grid lines very subtle (5% opacity)

- Right panel (width ~320px):
  - SearchControls (searching state):
    - ProgressBar: 45%, label "탐색 중... 45%"
    - Button (danger, full width): "탐색 중단"
  - Spacer
  - Panel: "현재 탐색 정보"
    - "경과 시간: 00:12"
    - "시도 횟수: 1,247"
    - "현재 최적해: 0순위 2/2 충족"
  - Spacer
  - BlockSummary (dimmed, read-only)

StepIndicator state: ① done (✓), ② done (✓), ③ active
```

---

## Screen 5 — Step 3-B: 탐색 완료 + 결과

**URL/상태:** Step 3 active, 탐색 완료

```
Frame: 1440×900px, desktop

Layout (2-column):
- Left panel (width ~640px): UnionBoard (complete state)
  - 22×20 grid, gold outer border, gold subtle pulse on frame
  - All cells filled with job class colors in a connected formation
  - RegionLabel overlays clearly visible on all edges
  - No empty cells (or minimal)

- Right panel (width ~320px):
  - Success banner: "배치 완료 ✓" — Manrope bold, primary green #A8C62A
  - ProgressBar: 100%, label "탐색 완료 ✓"
  - Spacer
  - RegionStats table (~full width):
    - Header: "영역" | "목표" | "실제" | "결과"
    - 보스 데미지: 40 | 40 | ✓ (satisfied, green)
    - 크리티컬 데미지: 40 | 40 | ✓ (satisfied, green)
    - 방어율 무시: 30 | 30 | ✓ (satisfied, green)
    - 획득경험치: 40 | 32 | ✗ -8 (unsatisfied, red)
    - 크리티컬 확률: 20 | 18 | ✗ -2 (unsatisfied, red)
    - 공격력: 10 | 10 | ✓ (satisfied, green)
    - Alternating row tonal bg (no dividers)
  - Spacer
  - Button row:
    - "영역 재설정" secondary button
    - "처음부터" ghost button

StepIndicator state: ① done (✓), ② done (✓), ③ active (complete)
```

---

## 완료 후 할 일 (UI-6)

Stitch 결과 확인 후 에이전트에게 전달:

> "Stage 3 결과 반영해줘."

에이전트는 각 화면의 레이아웃·컴포넌트 배치·상태를 `design/wireframes.md`에 문서화한다.
