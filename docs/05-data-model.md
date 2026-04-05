# 데이터 모델

## 1. 블록 (Block)

### 1.1 블록 모양 정의

```typescript
interface BlockShape {
  id: string; // 예: 'warrior-sss', 'mage-ss'
  jobGroup: JobGroup; // 직업군
  grade: Grade; // 등급
  cells: [number, number][]; // 기준점(0,0) 기준 상대 좌표
}

type JobGroup = "warrior" | "mage" | "archer" | "thief" | "pirate" | "xenon";
type Grade = "B" | "A" | "S" | "SS" | "SSS";
```

### 1.2 블록 모양 데이터

좌표계: 기준점 (0,0), x축 위아래, y축 좌우

| 직업군 | B (1칸) | A (2칸)     | S (3칸)            | SS (4칸)                 | SSS (5칸)                        |
| ------ | ------- | ----------- | ------------------ | ------------------------ | -------------------------------- |
| 전사   | (0,0)   | (0,0),(1,0) | (0,0),(0,1),(1,1)  | (0,0),(0,1),(1,0),(1,1)  | (0,0),(0,1),(0,2),(1,0),(1,1)    |
| 마법사 | (0,0)   | (0,0),(1,0) | (0,-1),(0,0),(0,1) | (0,0),(1,-1),(1,0),(1,1) | (0,0),(−1,0),(0,-1),(1,0),(0,1)  |
| 궁수/M | (0,0)   | (0,0),(1,0) | (0,-1),(0,0),(0,1) | (-1,0),(0,0),(1,0),(2,0) | (0,-2),(0,-1),(0,0),(0,1),(0,2)  |
| 도적   | (0,0)   | (0,0),(1,0) | (0,-1),(0,0),(0,1) | (0,-1),(0,0),(0,1),(1,1) | (0,-1),(0,0),(-1,1),(0,1),(1,1)  |
| 해적   | (0,0)   | (0,0),(0,1) | (0,0),(0,1),(1,1)  | (0,-1),(0,0),(1,0),(1,1) | (0,-1),(0,0),(1,0),(1,1),(1,2)   |
| 제논   | (0,0)   | (0,0),(1,0) | (0,-1),(0,0),(0,1) | (0,-1),(0,0),(0,1),(1,1) | (-1,-1),(0,-1),(0,0),(0,1),(1,1) |

### 1.3 등급별 칸 수

| 등급 | 칸 수 | 레벨 기준 |
| ---- | ----- | --------- |
| B    | 1칸   | 60~99     |
| A    | 2칸   | 100~139   |
| S    | 3칸   | 140~199   |
| SS   | 4칸   | 200~249   |
| SSS  | 5칸   | 250+      |

### 1.4 블록 모양 종류

- B등급: 1종 (전 직업군 동일)
- A등급: 2종 (전사/마법사/궁수/도적/제논 vs 해적)
- S등급: 2종 (전사/해적 vs 마법사/궁수/도적/제논)
- SS등급: 5종 (전사 / 마법사 / 궁수 / 도적&제논 / 해적)
- SSS등급: 6종 (전사 / 마법사 / 궁수 / 도적 / 해적 / 제논)
- 총 16종

## 2. 유니온 판 (Union Board)

### 2.1 전체 구조

```typescript
interface UnionBoard {
  width: 22;
  height: 20;
  totalCells: 440;
  innerRegions: InnerRegion[]; // 내부 8구역
  outerRegions: OuterRegion[]; // 외부 8구역
}
```

### 2.2 판 크기

| 구분         | 크기    | 칸 수 |
| ------------ | ------- | ----- |
| 전체         | 22 × 20 | 440칸 |
| 내부 (8구역) | 15 × 8  | 120칸 |
| 외부 (8구역) | 40 × 8  | 320칸 |

### 2.3 구역 구조

- 각 방향(1시, 2시, 4시, 5시, 7시, 8시, 10시, 11시)마다:
  - 내부 1구역: 15칸 (삼각형, 1-2-3-4-5 구조)
  - 외부 1구역: 40칸 (내부를 감싸는 형태)

### 2.4 내부 구역 모양

| (방향별)방향 | 직각 위치   | 모양 |
| ------------ | ----------- | ---- |
| 1시          | 왼쪽 위     | ◤    |
| 2시          | 오른쪽 아래 | ◢    |
| 4시          | 오른쪽 위   | ◥    |
| 5시          | 왼쪽 아래   | ◣    |
| 7시          | 오른쪽 아래 | ◢    |
| 8시          | 왼쪽 위     | ◤    |
| 10시         | 왼쪽 아래   | ◣    |
| 11시         | 오른쪽 위   | ◥    |

```text
        ◥11시  1시◤
    ◣10시        2시◢
    ◤8시          4시◥
        ◢7시  5시◣
```

## 3. 영역 (Region)

### 3.1 외부 영역 (고정 위치)

```typescript
interface OuterRegion {
  id: OuterRegionId;
  direction: Direction; // 1시, 2시, 4시, 5시, 7시, 8시, 10시, 11시
  cells: [number, number][]; // 해당 영역의 좌표 목록
  cellCount: 40;
  stat: OuterStat;
}

type Direction = 1 | 2 | 4 | 5 | 7 | 8 | 10 | 11;

type OuterStat =
  | "exp" // 획득 경험치
  | "critRate" // 크리티컬 확률
  | "bossDamage" // 보스 데미지
  | "damage" // 일반 데미지
  | "buffDuration" // 버프 지속시간
  | "ignoreDefense" // 방어율 무시
  | "critDamage" // 크리티컬 데미지
  | "statusResist"; // 상태이상 내성
```

### 외부 스탯 목록

| 방향 | 스탯            |
| ---- | --------------- |
| 1시  | 획득 경험치     |
| 2시  | 크리티컬 확률   |
| 4시  | 보스 데미지     |
| 5시  | 일반 데미지     |
| 7시  | 버프 지속시간   |
| 8시  | 방어율 무시     |
| 10시 | 크리티컬 데미지 |
| 11시 | 상태이상 내성   |

### 3.2 내부 영역 (교환 가능)

```typescript
interface InnerRegion {
  id: InnerRegionId;
  direction: Direction;
  cells: [number, number][];
  cellCount: 15;
  stat: InnerStat; // 사용자가 변경 가능
}

type InnerStat =
  | "str"
  | "dex"
  | "int"
  | "luk"
  | "hp"
  | "mp"
  | "atk" // 공격력
  | "matk"; // 마력
```

### 내부 스탯 목록

- STR
- DEX
- INT
- LUK
- HP
- MP
- 공격력
- 마력

## 4. 캐릭터 (Character)

```typescript
interface Character {
  id: string;
  nickname: string;
  job: string; // 세부 직업명
  jobGroup: JobGroup; // 직업군
  level: number;
  grade: Grade; // 레벨 기반 자동 계산
  blockShape: BlockShape; // 직업군 + 등급으로 결정
  isMapleM?: boolean; // 메이플M 캐릭터 여부
}
```

## 5. 블록 카운팅 (Block Count)

```typescript
interface BlockCount {
  shapeId: string; // BlockShape.id
  count: number; // 해당 모양 블록 개수
}

interface BlockSummary {
  blocks: BlockCount[];
  totalBlocks: number; // 총 블록 개수 (최대 45)
  totalCells: number; // 총 칸 수 (최대 225)
}
```

## 6. 우선순위 설정 (Priority)

```typescript
interface Priority {
  type: "preset" | "custom";
  preset?: PresetType;
  custom?: CustomPriority;
}

type PresetType = "hunting" | "boss";

interface CustomPriority {
  required: RegionStat[]; // 0순위 (필수)
  priorities: RegionStat[][]; // 1순위, 2순위, ... (각 배열 내 동일 순위)
  excluded: RegionStat[]; // 미지정 (배치 안 함)
}

type RegionStat = OuterStat | InnerStat;
```

### 6.1 프리셋

| 프리셋 | 우선순위                                    |
| ------ | ------------------------------------------- |
| 사냥   | 획득 경험치 > 크리티컬 데미지 > 일반 데미지 |
| 보스   | 크리티컬 데미지 > 보스 데미지 > 방어율 무시 |

## 7. 배치 결과 (Placement Result)

```typescript
interface PlacementResult {
  success: boolean;
  placements: BlockPlacement[];
  stats: PlacementStats;
  warnings?: string[]; // 0순위 미충족 등
}

interface BlockPlacement {
  blockIndex: number; // 블록 식별자
  shapeId: string; // 블록 모양
  position: [number, number]; // 기준점 좌표
  rotation: 0 | 90 | 180 | 270; // 회전 각도
  flipped: boolean; // 반전 여부
  cells: [number, number][]; // 실제 배치된 좌표들
}

interface PlacementStats {
  targetCells: number; // 목표 칸 수
  placedCells: number; // 배치된 칸 수
  regionStats: RegionCellCount[];
}

interface RegionCellCount {
  region: RegionStat;
  targetCells?: number; // 0순위인 경우 목표
  placedCells: number; // 실제 배치된 칸 수
  isSatisfied: boolean; // 목표 충족 여부
}
```

## 8. 상태 관리 (Store)

```typescript
interface UnionPlacerState {
  // 블록 입력
  inputMethod: "oauth" | "search" | "manual";
  characters: Character[];
  selectedCharacters: Character[];
  blockSummary: BlockSummary;

  // 설정
  targetCells: number;
  priority: Priority;

  // 탐색
  isSearching: boolean;
  searchProgress?: number;

  // 결과
  result: PlacementResult | null;
}
```
