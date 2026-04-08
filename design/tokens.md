# 디자인 토큰

인게임 유니온 창 레퍼런스 기반으로 확정된 값.
Stitch Stage 1 완료 후 실제 생성 결과로 업데이트 예정.

---

## 컬러

### 배경·패널

| 토큰 | 값 | 용도 |
|------|-----|------|
| `color-bg` | `#3a4652` | 전체 배경 |
| `color-panel` | `rgba(42, 52, 62, 0.85)` | 반투명 패널 |
| `color-card` | `rgba(50, 62, 74, 0.90)` | 카드 배경 |
| `color-border` | `rgba(255, 255, 255, 0.12)` | 기본 테두리 |
| `color-border-gold` | `#c9a227` | 보드 외곽·강조 패널 테두리 (골드) |

### 텍스트

| 토큰 | 값 | 용도 |
|------|-----|------|
| `color-text-primary` | `#e8e8e8` | 기본 텍스트 |
| `color-text-secondary` | `#b0c1c9` | 보조 텍스트 (WCAG AA) |
| `color-text-disabled` | `#6e8496` | 비활성 텍스트 |

### 액션

| 토큰 | 값 | 용도 |
|------|-----|------|
| `color-action-primary` | `#A8C62A` | 배치 시작 버튼 (초록) |
| `color-action-secondary` | `#35B5CC` | 배치 영역 선택 버튼 (파랑) |
| `color-action-danger` | `#CF2C69` | 초기화·탐색 중단 (빨강) |
| `color-action-text` | `#FFFCFF` | 버튼 레이블 |

---

## 직업군 색상

배치된 블록 색상 및 CharacterCard 좌측 강조 바에 사용.

| 직업군 | 토큰 | 값 |
|--------|------|----|
| 전사 | `color-job-warrior` | `#cc3333` |
| 마법사 | `color-job-mage` | `#3388cc` |
| 궁수 / 메이플M | `color-job-archer` | `#44aa44` |
| 도적 | `color-job-thief` | `#8844cc` |
| 해적 | `color-job-pirate` | `#8899aa` |
| 제논 | — | 좌상단 `color-job-thief` / 우하단 `color-job-pirate` 대각 분할 (CSS gradient) |

---

## 등급 배지

| 토큰 | 값 | 용도 |
|------|-----|------|
| `color-grade-text` | `#E0C0A0` | 등급 레이블 텍스트 (B/A/S/SS/SSS 공통) |

---

## 투명도 레이어링

인게임 UI의 반투명 패널을 웹에서 구현하는 방식.

```
Layer 0  배경     #3a4652          고정
Layer 1  패널     color-panel      opacity 0.85  ← Panel 컴포넌트
Layer 2  카드     color-card       opacity 0.90  ← CharacterCard 등
```

Tailwind 클래스 예시:
```
bg-[#2a343e]/85 backdrop-blur-sm   (패널)
bg-[#323e4a]/90                    (카드)
```

---

## 타이포그래피

| 항목 | 값 |
|------|---|
| 헤드라인 폰트 | Manrope |
| 본문 폰트 | Inter |

> ⚠️ 폰트 사이즈·line-height 등 세부 스케일은 Stage 2 컴포넌트 시트 작업 시 확정

---

## 간격

> ⚠️ Stitch Stage 1 완료 후 확정 예정

Tailwind 기본 스케일 사용 (4px 단위).
