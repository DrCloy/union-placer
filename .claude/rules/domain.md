---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# Domain Knowledge

## 블록 (Block)

- 직업군: `warrior` `mage` `archer` `thief` `pirate` `xenon`
- 등급: B(1칸) A(2칸) S(3칸) SS(4칸) SSS(5칸) — 총 16종
- 최대 45개 블록, 최대 225칸

## 유니온 판 (Board)

- 전체: 22×20 (440칸)
- 외부 8영역: 각 40칸, 스탯 고정
- 내부 8영역: 각 15칸, 스탯 교환 가능
- 중앙 4칸: (9,10) (9,11) (10,10) (10,11)

## 외부 영역 스탯

| 방향 | 스탯 | 코드 |
|------|------|------|
| 1시 | 획득 경험치 | `exp` |
| 2시 | 크리티컬 확률 | `critRate` |
| 4시 | 보스 데미지 | `bossDamage` |
| 5시 | 일반 데미지 | `normalDamage` |
| 7시 | 버프 지속시간 | `buffDuration` |
| 8시 | 방어율 무시 | `ignoreDefense` |
| 10시 | 크리티컬 데미지 | `critDamage` |
| 11시 | 상태이상 내성 | `statusResist` |

## 내부 영역 스탯

`str` `dex` `int` `luk` `hp` `mp` `atk` `matk`

## 직업별 유효 스탯

| 직업군 | 유효 스탯 |
|--------|----------|
| 전사 | atk, str, dex |
| 마법사 | matk, int, luk |
| 궁수 | atk, dex, str |
| 도적 | atk, luk, dex |
| 해적 | atk, str, dex |

특수: 데몬어벤져(atk,hp,str), 제논(atk,str,dex,luk)

## 배치 규칙

1. 모든 블록: 상하좌우 연결 (하나의 덩어리)
2. 최소 1개 블록 기준점이 중앙 4칸에 위치
3. 회전(0°/90°/180°/270°) 및 반전 가능
4. 미지정 외부 영역: 배치 금지
5. 미지정 내부 영역: 연결용으로만 허용

## Nexon Open API

- Base URL: `https://open.api.nexon.com`
- 인증 헤더: `x-nxopen-api-key`
- 구현 위치: `src/lib/api/nexon.ts`
