# Stitch 프롬프트 — Stage 1: 디자인 토큰 화면

## 목적

타이포그래피·간격 토큰을 확정하기 위한 시각 레퍼런스 생성.
결과물 확인 후 `design/tokens.md` 타이포그래피·간격 섹션을 업데이트한다.

---

## Stitch 입력 프롬프트

```
Reference images are provided for visual context only (in-game MapleStory UI).
Do not replicate them — use them as aesthetic reference for the color palette and dark gaming UI feel.

Create a design token reference sheet for a dark-themed MapleStory Union Block Placer web app.

The app is a Korean MMORPG utility tool that closely follows the in-game MapleStory Union UI aesthetic: dark blue-grey backgrounds, semi-transparent layered panels, gold frame accents, and vivid job-class colors for block identification.

---

## CONFIRMED COLOR TOKENS — display all as labeled swatches

### Background & Panels
- color-bg: #3a4652 (page background, solid)
- color-panel: rgba(42, 52, 62, 0.85) (semi-transparent panel surface)
- color-card: rgba(50, 62, 74, 0.90) (card surface, nested inside panel)
- color-border: rgba(255, 255, 255, 0.12) (default subtle border)
- color-border-gold: #c9a227 (board outer frame & accent panel border)

### Text
- color-text-primary: #e8e8e8
- color-text-secondary: #b0c1c9
- color-text-disabled: #6e8496

### Action Buttons
- color-action-primary: #A8C62A (green — "Start Placement" main CTA)
- color-action-secondary: #35B5CC (blue — "Select Region" step-advance button)
- color-action-danger: #CF2C69 (red — reset / stop search)
- color-action-text: #FFFCFF (label text on all buttons)
- Note: buttons have a subtle top-to-bottom gradient, slightly darker at the bottom

### Job Class Colors (also used as block fill colors on the Union board)
- color-job-warrior: #cc3333
- color-job-mage: #3388cc
- color-job-archer: #44aa44
- color-job-thief: #8844cc
- color-job-pirate: #8899aa
- Xenon (hybrid): diagonal split — top-left #8844cc (thief) / bottom-right #8899aa (pirate)

### Grade Badge
- color-grade-text: #E0C0A0 (all grade labels: B / A / S / SS / SSS share this color)

---

## TYPOGRAPHY — suggest and show samples (to be decided)

Requirements:
- Korean + English mixed content
- Clean sans-serif, not decorative
- Readable at small sizes (12–14px body)
- Suggest font family, weights, and sizes for:
  1. App title / page heading
  2. Section heading / card title
  3. Body / label (default text)
  4. Caption / helper text
  5. Badge label (B / A / S / SS / SSS — small, bold)
  6. Number values (cell counts, levels — tabular figures preferred)

Show all levels with sample Korean text (e.g. "유니온 배치", "캐릭터 선택", "직업군", "레벨 280") and English labels side by side.

---

## SPACING SCALE — suggest and show (to be decided)

Base unit: 4px (Tailwind default)
Show scale: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48px

Show applied examples:
- Card inner padding
- Gap between character cards in a grid
- Input field height
- Button height and horizontal padding
- Section gap between major UI blocks

---

## INTERACTIVE STATES

Show all states for each component against the panel background (color-panel):

### Button (primary / secondary / danger)
- Default: solid fill with top-to-bottom gradient (slightly darker at bottom)
- Hover: slightly brighter
- Pressed: slightly darker
- Disabled: use color-text-disabled tint, no gradient

### Input field
- Default: color-card background, color-border border
- Focus: color-border-gold border glow
- Error: color-action-danger border

### Tab (active / inactive)
- Used for switching between "Nickname Search" and "Manual Input" in Step 1

---

## LAYER TRANSPARENCY DEMO

Show three nested rectangles demonstrating the layering system:
- Layer 0 — color-bg #3a4652 (solid background)
- Layer 1 — color-panel rgba(42,52,62,0.85) with backdrop-blur, color-border border
- Layer 2 — color-card rgba(50,62,74,0.90) inside the panel

Add sample text at each layer to show readability.

---

## LAYOUT

Single Figma frame, 1440 × 900px, background color-bg (#3a4652).

Organize in 3 columns:
- Left: all color swatches with hex values and token names
- Center: typography scale + spacing scale
- Right: interactive component states + layer demo

All text labels in the sheet itself should use color-text-primary (#e8e8e8).
```

---

## 완료 후 할 일 (UI-2)

Stitch 결과 확인 후 에이전트에게 전달:

> "Stage 1 결과 반영해줘. 폰트는 [폰트명], 사이즈는 [목록], 간격은 [스케일]."

에이전트는 `design/tokens.md` 타이포그래피·간격 섹션을 확정값으로 업데이트한다.
