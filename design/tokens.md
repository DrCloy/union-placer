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
| `color-border-accent` | `#c9a227` | 강조 테두리 (골드) |

### 텍스트

| 토큰 | 값 | 용도 |
|------|-----|------|
| `color-text-primary` | `#e8e8e8` | 기본 텍스트 |
| `color-text-secondary` | `#8899aa` | 보조 텍스트 |
| `color-text-disabled` | `#556677` | 비활성 텍스트 |

### 액션

| 토큰 | 값 | 용도 |
|------|-----|------|
| `color-action-primary` | `#3aaa77` | 주요 버튼 (틸·그린) |
| `color-action-danger` | `#cc4444` | 경고·삭제 |

### 블록

| 토큰 | 값 | 용도 |
|------|-----|------|
| `color-block` | `#c4a882` | 배치된 블록 (모든 직업 공통) |

---

## 직업군 색상

블록 아이콘 색 기준. 블록 자체 색(`color-block`)과 별개로,
CharacterCard 좌측 강조 바·BlockPreview 아이콘에 사용.

| 직업군 | 토큰 | 값 |
|--------|------|----|
| 전사 | `color-job-warrior` | `#cc3333` |
| 마법사 | `color-job-mage` | `#3388cc` |
| 궁수 / 메이플M | `color-job-archer` | `#44aa44` |
| 도적 | `color-job-thief` | `#8844cc` |
| 해적 | `color-job-pirate` | `#8899aa` |
| 제논 | `color-job-xenon` | 도적+해적 혼합 (좌: `#8844cc` / 우: `#8899aa`) |

---

## 등급 배지 색상

> ⚠️ 인게임 기준으로 추후 조정 가능

| 등급 | 토큰 | 값 |
|------|------|----|
| B | `color-grade-b` | `#778899` |
| A | `color-grade-a` | `#44aa44` |
| S | `color-grade-s` | `#3388cc` |
| SS | `color-grade-ss` | `#aa44cc` |
| SSS | `color-grade-sss` | `#cc8822` |

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

> ⚠️ Stitch Stage 1 완료 후 확정 예정

| 항목 | 값 (임시) |
|------|----------|
| 폰트 패밀리 | Inter, system-ui |
| 기본 크기 | 14px |
| 제목 | 18px / 600 |
| 보조 | 12px / 400 |

---

## 간격

> ⚠️ Stitch Stage 1 완료 후 확정 예정

Tailwind 기본 스케일 사용 (4px 단위).
