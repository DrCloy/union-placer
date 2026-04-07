# 디자인 계획 (Stitch 파이프라인)

## 개요

Google Stitch를 사용한 3단계 디자인 파이프라인.
UI-1·3·5는 직접 Stitch에서 작업. 나머지는 에이전트 위임.

```
Stage 1: 디자인 토큰 화면  →  design/tokens.md 업데이트
Stage 2: 컴포넌트 시트     →  design/components.md
Stage 3: 페이지 목업 5장   →  design/wireframes.md
                           →  HTML export → TSX 변환 (Phase 7)
```

최종 산출물은 Storybook으로 문서화, Playwright로 시각 회귀 테스트.

---

## Stage 1 — 디자인 토큰 화면

**목표:** 컬러·타이포·간격·상태를 한 화면에서 확인하고 토큰 확정

**Stitch 프롬프트:** → [stitch-prompts/stage1-tokens.md](stitch-prompts/stage1-tokens.md) (작성 예정)

**산출물:**
- Figma export (참고용)
- `design/tokens.md` 업데이트 (타이포·간격 확정)

---

## Stage 2 — 컴포넌트 시트

**목표:** 재사용 컴포넌트를 모든 상태별로 디자인

**Stitch 프롬프트:** → [stitch-prompts/stage2-components.md](stitch-prompts/stage2-components.md) (작성 예정)

**컴포넌트 목록 (페이지 분석 기반):**

### 레이아웃

| 컴포넌트 | 상태 | 비고 |
|---------|------|------|
| `Header` | — | 로고 + StepIndicator |
| `StepIndicator` | step 1/2/3 | 현재 단계 강조 |
| `Panel` | default / accent | accent = 골드 테두리 |

### 공통

| 컴포넌트 | 상태 | 비고 |
|---------|------|------|
| `Button` | primary / secondary / ghost / disabled | primary = 틸 |
| `Input` | default / focus / error | |
| `Badge` | B / A / S / SS / SSS | 등급별 색상 |
| `Tab` | active / inactive | 입력 방식 선택 |
| `ProgressBar` | 0~100% | 탐색 진행률 |
| `Collapsible` | open / closed | API Key 입력 |

### 도메인 전용

| 컴포넌트 | 상태 | 비고 |
|---------|------|------|
| `CharacterCard` | unselected / selected / hover | 좌측 직업 색상 바 |
| `BlockPreview` | 직업군 × 등급 조합 | 블록 모양 미리보기 |
| `FilterPills` | 전체/B/A/S/SS/SSS | 등급 필터 |
| `RegionRow` | default / filled / error | 영역명 + 숫자 입력 |
| `PriorityColumn` | — | 0순위 / 1순위이하 / 미지정 |
| `DraggableRegionItem` | idle / dragging | 우선순위 드래그 항목 |
| `UnionBoard` | searching / complete | 22×20 격자 |
| `BoardCell` | empty / placed / forbidden | 개별 셀 |
| `RegionLabel` | — | 보드 외곽 영역 이름 |
| `RegionStats` | satisfied / unsatisfied | 목표 vs 실제 테이블 |

**산출물:**
- Figma export
- `design/components.md` (각 컴포넌트 Props·상태·인터랙션 스펙)
- Storybook stories 기반 자료

---

## Stage 3 — 페이지 목업

**목표:** 실제 5개 화면의 전체 레이아웃 디자인

**Stitch 프롬프트:** → [stitch-prompts/stage3-pages.md](stitch-prompts/stage3-pages.md) (작성 예정)

**화면 목록:**

| # | 화면 | 주요 상태 |
|---|------|----------|
| 1 | Step 1-A 닉네임 검색 | 검색 결과 표시, 캐릭터 선택 중 |
| 2 | Step 1-B 수동 입력 | 등급×직업 개수 입력 |
| 3 | Step 2 설정 | 영역별 칸 수 + 우선순위 |
| 4 | Step 3-A 탐색 중 | 진행률 표시, 중단 버튼 |
| 5 | Step 3-B 탐색 완료 | 유니온 보드 + 통계 |

**레퍼런스 이미지:** `screen1.png`, `screen2.png`, `screen3.png`

**산출물:**
- Figma export
- `design/wireframes.md`
- HTML export → Phase 7에서 TSX 변환

---

## 이후 작업 (에이전트)

| 작업 | 입력 | 산출물 |
|------|------|--------|
| Storybook 설치 | Stage 2 완료 | `.storybook/`, `src/**/*.stories.tsx` |
| Playwright 설치 | Stage 3 완료 | `playwright.config.ts`, `e2e/` |
| TSX 변환 | Stage 3 HTML | `components/` 초기 코드 |
