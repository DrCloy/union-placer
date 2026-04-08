# Stitch 프롬프트 — Stage 2: 컴포넌트 시트

## 목적

재사용 컴포넌트를 모든 상태별로 디자인.
결과물은 `design/components.md` 작성(UI-4) 및 Storybook stories의 기반이 된다.

---

## Stitch 입력 프롬프트 (Sheet 1 — 레이아웃 & 공통)

```
Use the established design system: dark MapleStory gaming UI aesthetic.
Colors: bg #3a4652, panel rgba(42,52,62,0.85), card rgba(50,62,74,0.90), border-gold #c9a227.
Fonts: Manrope (headlines), Inter (body/labels). Sharp corners (border-radius 2-4px).
No divider lines — use tonal depth and spacing instead.

Create a component reference sheet (1440×900px, dark bg #3a4652) showing ALL states for each component.

---

## LAYOUT COMPONENTS

### Header
- Full width, height ~56px
- Left: App logo/title "유니온 배치" (Manrope bold, text-primary #e8e8e8)
- Center: StepIndicator (step 1 of 3 active)
- Surface: surface-container #15212c

### StepIndicator
Show 3 variants:
- Step 1 active / steps 2-3 inactive
- Step 2 active / steps 1 done, 3 inactive
- Step 3 active / steps 1-2 done
- Steps labeled: "① 캐릭터 선택" "② 배치 설정" "③ 배치 실행"
- Active: text-primary + gold #c9a227 underline accent
- Done: text-secondary #b0c1c9 + checkmark
- Inactive: text-disabled #6e8496

### Panel
2 variants side by side:
- Default: rgba(42,52,62,0.85) + border rgba(255,255,255,0.12)
- Accent: same bg + 1px gold #c9a227 border (all sides or top edge only)
- Both with backdrop-blur:12px. Size ~280×160px each.

---

## COMMON COMPONENTS

### Button
Show 4 variants × hover/pressed states:
- Primary: gradient #A8C62A → darker at bottom, text #FFFCFF, bold. Label: "배치 시작"
- Secondary: ghost with outline-variant border + surface-bright hover. Label: "영역 선택"
- Ghost/Tertiary: no background, text only with underline on hover. Label: "초기화"
- Disabled: text-disabled #6e8496, no gradient, cursor-not-allowed
All buttons: height 36px, px-16, border-radius 2px (sharp)

### Input
3 states:
- Default: surface-container-lowest bg, rgba(255,255,255,0.12) border, placeholder "닉네임 입력"
- Focus: gold #c9a227 1px bottom-only animated underline (not glow)
- Error: #CF2C69 border + small error text below "닉네임을 찾을 수 없습니다"
Height 40px, Inter font

### Badge (Grade)
5 badges in a row:
- B / A / S / SS / SSS
- All use same text color #E0C0A0 (color-grade-text)
- Background: surface-container + subtle tonal variation per grade
- Small, bold, ~24×20px, border-radius 2px
- Show at 2 sizes: regular (in CharacterCard) and large (FilterPill selected)

### Tab
2 tabs side by side, 2 states:
- Active: text-primary + gold underline accent #c9a227 + surface-container-high bg
- Inactive: text-disabled + transparent bg
- Labels: "닉네임 검색" | "직접 입력"

### ProgressBar
3 states (horizontal, full width):
- 0%: empty track, surface-container-low
- 45%: fill color #A8C62A (primary), animated shimmer suggestion
- 100%: complete, full green fill
- Height 8px, border-radius 4px
- Label above: "탐색 중... 45%" / "탐색 완료 ✓"

### Collapsible
2 states:
- Closed: row with label "API 키 설정" + chevron-down icon, surface-container bg
- Open: same header + revealed content area with Input inside
- Height collapsed ~40px, expanded ~120px

---

## LAYOUT ARRANGEMENT

Single 1440×900px frame, background #3a4652.
Organize in a grid layout:
- Row 1: Header (full width), StepIndicator variants
- Row 2: Panel variants, Tab, Collapsible
- Row 3: Button all variants + states, Input all states
- Row 4: Badge all 5 grades, ProgressBar all states

Label every component name in Manrope bold, text-secondary #b0c1c9, small (12px).
Show state labels (Default / Focus / Error / Active / Disabled etc.) in Inter 11px, text-disabled.
```

---

## Stitch 입력 프롬프트 (Sheet 2 — 도메인 전용)

```
Use the established design system: dark MapleStory gaming UI aesthetic.
Colors: bg #3a4652, panel rgba(42,52,62,0.85), card rgba(50,62,74,0.90), border-gold #c9a227.
Job class colors: warrior #cc3333, mage #3388cc, archer #44aa44, thief #8844cc, pirate #8899aa.
Fonts: Manrope (headlines), Inter (body/labels). Sharp corners 2-4px.

Create a domain-specific component reference sheet (1440×1400px, dark bg #3a4652).

---

## DOMAIN COMPONENTS

### CharacterCard
3 states (card ~160×80px):
- Unselected: surface-card bg, left 4px accent bar colored by job class (show warrior red)
  Content: job icon area, name "아크", level "Lv.280", grade badge "SS"
- Selected: same + gold #c9a227 border outline + slightly brighter bg
- Hover: brightness(1.05) + #c9a227 0.5px inner border (the "golden hover" effect)
Show 3 cards: warrior (unselected), mage (selected), thief (hover)

### FilterPills
A row of 6 pill buttons:
- 전체 / B / A / S / SS / SSS
- Active state: gold #c9a227 border + text-primary, slightly elevated bg
- Inactive: surface-container, text-secondary
- Height 28px, px-12, border-radius 14px (rounded capsule, exception to sharp rule for pills)

### BlockSummary
A compact panel (~320×120px):
- Title: "블록 현황" (Manrope bold)
- Grid of job class counts: warrior 3 / mage 2 / archer 1 / thief 4 / pirate 2 (각 색상 bullet)
- Bottom row: "총 12 블록 / 48 칸"
- Surface-container bg, gold accent top border

### RegionRow
3 states (full-width row ~320×44px each):
- Default: region label "공격력" left, numeric input right (empty), surface-container-low bg
- Filled: same + input has value "12", subtle green tint on input
- Error: input highlighted with #CF2C69 border, error icon, "최대 40" tooltip
- Show 4 rows stacked

### PriorityColumn
A vertical panel (~200×400px) with 3 sections:
- Section 0순위: top area with 1-2 DraggableRegionItem (공격력, 보스 데미지)
- Section 1순위 이하: middle area with 2-3 items
- Section 미지정: bottom area with remaining items (greyed)
- Dotted/dashed dividers between sections (exception: only here for drag-drop clarity)
- Drag handle icon on left of each item

### DraggableRegionItem
2 states (~180×36px):
- Idle: surface-container bg, drag-handle icon, region name text, subtle left border
- Dragging: elevated bg (surface-container-highest), ambient shadow 0 12px 32px rgba(0,0,0,0.5), slightly rotated ~2deg, gold left border accent

### SearchControls
2 states (panel ~320×100px):
- Idle: large "배치 시작" primary button (gradient green) + small ghost "초기화" button
- Searching: "탐색 중단" danger button (#CF2C69) + ProgressBar below showing 45%

### UnionBoard (preview)
Show a small representative view (~440×400px) in 2 states:
- Searching: 22×20 grid, some cells filled with job colors, animated pulsing indicator on active edge
  Grid lines: outline-variant at 5% opacity (very subtle)
  Filled cells: job class colors (warrior red, mage blue, etc.)
  Empty cells: surface-container-low
- Complete: all target regions filled, RegionLabel overlays visible, gold border pulse on completion

### BoardCell (zoom in)
Show 3 individual cells at larger scale (~40×40px each):
- Empty: surface-container-low, subtle grid line border
- Placed (warrior): #cc3333 fill, no border
- Forbidden: surface-dim #08141f + diagonal line pattern or ✕ icon

### RegionLabel
Small floating labels on board edge (~60×20px):
- Show 4 examples: "공격력" "마력" "HP" "보스"
- Surface-container-highest bg, text-secondary, Inter 11px
- Positioned to suggest they float outside/on the board edge

### RegionStats
A results table panel (~360×280px) in 2 states:
- Satisfied row: region name + goal "12" + actual "12" + ✓ green checkmark
- Unsatisfied row: region name + goal "16" + actual "10" + ✗ red indicator + diff "-6"
- Table bg: surface-container, alternating row tonal variation (no divider lines)
- Header: "영역" | "목표" | "실제" | "결과" (Manrope bold, text-secondary)

---

## LAYOUT ARRANGEMENT

1440×1400px frame, background #3a4652.
Organize in sections with generous spacing:
- Row 1: CharacterCard (3 states), FilterPills, BlockSummary
- Row 2: RegionRow (4 stacked), PriorityColumn, DraggableRegionItem (2 states)
- Row 3: SearchControls (2 states), UnionBoard preview (2 states)
- Row 4: BoardCell (3 zoom), RegionLabel examples, RegionStats (2 states)

Label every component in Manrope bold 12px, text-secondary #b0c1c9.
State labels in Inter 11px, text-disabled #6e8496.
```

---

## 완료 후 할 일 (UI-4)

Stitch 결과 확인 후 에이전트에게 전달:

> "Stage 2 결과 반영해줘."

에이전트는 각 컴포넌트의 Props·상태·인터랙션을 `design/components.md`에 문서화한다.
