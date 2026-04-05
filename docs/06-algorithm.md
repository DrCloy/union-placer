# 알고리즘 설계

## 1. 개요

### 1.1 목표

주어진 블록들을 유니온 판에 배치하여 다음 조건을 만족하는 최적해를 찾는다.

1. **0순위 영역: 지정 칸 수 100% 충족 (필수)**
2. **1순위 이하 영역: 지정 칸 수 최대한 충족**
3. **미지정 영역: 배치 금지 (0칸)**

### 1.2 제약 조건

| 제약           | 설명                                               |
| -------------- | -------------------------------------------------- |
| 연결 규칙      | 모든 배치된 칸이 상하좌우로 연결된 하나의 덩어리   |
| 중앙 4칸 규칙  | 최소 1개 블록의 기준점이 중앙 4칸 중 하나에 위치   |
| 블록 무결성    | 블록은 항상 통째로 배치 (부분 배치 불가)           |
| 회전/반전      | 모든 블록은 회전(0°, 90°, 180°, 270°) 및 반전 가능 |
| 영역 제한      | 미지정 영역(targetCells = 0)에는 배치 불가         |
| 외부 영역 제한 | 미지정 외부 영역에는 배치 불가                     |
| 내부 영역 연결 | 미지정 내부 영역은 연결용으로만 배치 허용          |
| 0순위 제한     | 최대 3개까지                                       |

### 1.3 중앙 4칸 좌표

- 좌표:
  - (9,10), (9,11)
  - (10,10), (10,11)
- 의미: 1시, 5시, 7시, 11시 내부 영역의 1칸 부분이 만나는 지점

---

## 2. 알고리즘 접근 방식

### 2.1 하이브리드 전략

```text
1단계: 그리디 초기 해 생성
└─ 우선순위 순서대로 빠르게 배치
2단계: 최적화 탐색
└─ 백트래킹으로 더 나은 해 탐색
└─ 가지치기로 탐색 공간 축소
```

### 2.2 탐색 순서

1. 중앙 4칸에 첫 블록 배치 (필수)
2. 0순위 영역 지정 칸 수 채우기
3. 1순위 이하 영역 순서대로 지정 칸 수 채우기
4. 미지정 영역 회피하며 연결 유지

---

## 3. 상세 알고리즘

### 3.1 블록 변형 생성

각 블록에 대해 가능한 모든 변형(최대 8가지)을 생성한다.

```typescript
function generateVariants(shape: BlockShape): BlockVariant[] {
  const variants: BlockVariant[] = [];

  for (const rotation of [0, 90, 180, 270]) {
    for (const flipped of [false, true]) {
      const cells = transformCells(shape.cells, rotation, flipped);
      variants.push({ ...shape, rotation, flipped, cells });
    }
  }

  // 중복 제거 (대칭인 경우)
  return deduplicateVariants(variants);
}

function transformCells(cells: [number, number][], rotation: number, flipped: boolean): [number, number][] {
  let result = cells;

  // 반전 (y축 기준)
  if (flipped) {
    result = result.map(([x, y]) => [x, -y]);
  }

  // 회전 (90도 단위)
  const rotations = rotation / 90;
  for (let i = 0; i < rotations; i++) {
    result = result.map(([x, y]) => [-y, x]);
  }

  return result;
}
```

### 3.2 좌표 변환 로직

```typescript
function transformCells(cells: [number, number][], rotation: number, flipped: boolean): [number, number][] {
  let result = cells;

  // 반전 (y축 기준)
  if (flipped) {
    result = result.map(([x, y]) => [x, -y]);
  }

  // 회전 (90도 단위)
  const rotations = rotation / 90;
  for (let i = 0; i < rotations; i++) {
    result = result.map(([x, y]) => [-y, x]);
  }

  return result;
}
```

### 3.3 배치 가능 여부 검사

```typescript
function canPlace(board: Board, variant: BlockVariant, position: [number, number], regionSettings: RegionCellSetting[]): boolean {
  const absoluteCells = variant.cells.map(([dx, dy]) => [position[0] + dx, position[1] + dy]);

  return absoluteCells.every(
    ([x, y]) =>
      isInBounds(x, y) && // 판 범위 내
      !isOccupied(board, x, y) && // 빈 칸
      !isForbiddenRegion(x, y, regionSettings), // 미지정 영역 아님
  );
}

function isForbiddenRegion(x: number, y: number, regionSettings: RegionCellSetting[]): boolean {
  const region = getRegionAt(x, y);
  const setting = regionSettings.find((s) => s.region === region);

  // 미지정 외부 영역 = 배치 금지
  // 미지정 내부 영역 = 연결용 허용 (여기서는 금지 아님)
  if (setting?.targetCells === 0 && setting?.isOuter) {
    return true;
  }
  return false;
}
```

### 3.4 연결성 검사

```typescript
function isConnected(board: Board): boolean {
  const occupiedCells = getOccupiedCells(board);
  if (occupiedCells.length === 0) return true;

  // BFS/DFS로 연결성 확인
  const visited = new Set<string>();
  const queue = [occupiedCells[0]];

  while (queue.length > 0) {
    const [x, y] = queue.shift()!;
    const key = `${x},${y}`;

    if (visited.has(key)) continue;
    visited.add(key);

    // 상하좌우 인접 칸 탐색
    for (const [dx, dy] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]) {
      const nx = x + dx;
      const ny = y + dy;
      if (isOccupied(board, nx, ny)) {
        queue.push([nx, ny]);
      }
    }
  }

  return visited.size === occupiedCells.length;
}
```

### 3.4 연결성 검사

```typescript
function isConnected(board: Board): boolean {
  const occupiedCells = getOccupiedCells(board);
  if (occupiedCells.length === 0) return true;

  // BFS로 연결성 확인
  const visited = new Set<string>();
  const queue = [occupiedCells[0]];

  while (queue.length > 0) {
    const [x, y] = queue.shift()!;
    const key = `${x},${y}`;

    if (visited.has(key)) continue;
    visited.add(key);

    // 상하좌우 인접 칸 탐색
    for (const [dx, dy] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]) {
      const nx = x + dx;
      const ny = y + dy;
      if (isOccupied(board, nx, ny)) {
        queue.push([nx, ny]);
      }
    }
  }

  return visited.size === occupiedCells.length;
}
```

### 3.5 영역별 배치 현황 계산

```typescript
function calculateRegionStats(board: Board, regionSettings: RegionCellSetting[]): RegionPlacementStat[] {
  return regionSettings.map((setting) => {
    const placedCells = countCellsInRegion(board, setting.region);
    return {
      region: setting.region,
      targetCells: setting.targetCells,
      placedCells,
      isSatisfied: placedCells >= setting.targetCells,
      isForbidden: setting.targetCells === 0,
    };
  });
}
```

### 3.6 메인 탐색 알고리즘

```typescript
function findOptimalPlacement(blocks: BlockShape[], regionSettings: RegionCellSetting[], priority: Priority): PlacementResult | null {
  // 1. 블록별 변형 생성
  const allVariants = blocks.map(generateVariants);

  // 2. 총 목표 칸 수 계산
  const totalTargetCells = regionSettings.reduce((sum, s) => sum + s.targetCells, 0);

  // 3. 초기 상태
  const initialState: SearchState = {
    board: createEmptyBoard(),
    placements: [],
    remainingBlocks: blocks.map((_, i) => i),
    placedCells: 0,
    regionStats: calculateRegionStats(createEmptyBoard(), regionSettings),
  };

  // 4. 첫 블록은 중앙 4칸에 배치
  const centerPositions: [number, number][] = [
    [9, 10],
    [9, 11],
    [10, 10],
    [10, 11],
  ];

  let bestResult: PlacementResult | null = null;

  for (const centerPos of centerPositions) {
    for (const blockIdx of initialState.remainingBlocks) {
      for (const variant of allVariants[blockIdx]) {
        if (!canPlace(initialState.board, variant, centerPos, regionSettings)) continue;

        const newState = placeBlock(initialState, blockIdx, variant, centerPos);
        const result = searchRecursive(newState, allVariants, regionSettings, priority, totalTargetCells);

        if (result && isBetterResult(result, bestResult, priority)) {
          bestResult = result;
        }
      }
    }
  }

  return bestResult;
}
```

### 3.7 재귀 탐색 (백트래킹)

```typescript
function searchRecursive(state: SearchState, allVariants: BlockVariant[][], regionSettings: RegionCellSetting[], priority: Priority, totalTargetCells: number): PlacementResult | null {
  // 종료 조건: 모든 목표 칸 수 달성
  if (state.placedCells === totalTargetCells) {
    return createResult(state, priority);
  }

  // 가지치기: 남은 블록으로 목표 도달 불가
  const maxPossibleCells = state.placedCells + state.remainingBlocks.reduce((sum, idx) => sum + blocks[idx].cells.length, 0);
  if (maxPossibleCells < totalTargetCells) {
    return null;
  }

  // 가지치기: 이미 목표 초과
  if (state.placedCells > totalTargetCells) {
    return null;
  }

  // 가지치기: 0순위 영역 충족 불가능
  if (!canSatisfyRequired(state, regionSettings, priority)) {
    return null;
  }

  let bestResult: PlacementResult | null = null;

  // 다음 블록 선택 (우선순위 기반 정렬)
  const sortedBlocks = sortBlocksByPriority(state.remainingBlocks, priority);

  for (const blockIdx of sortedBlocks) {
    // 배치 가능한 위치 탐색 (기존 블록과 인접한 위치만)
    const adjacentPositions = getAdjacentPositions(state.board);

    for (const pos of adjacentPositions) {
      for (const variant of allVariants[blockIdx]) {
        if (!canPlace(state.board, variant, pos, regionSettings)) continue;

        const newState = placeBlock(state, blockIdx, variant, pos);

        // 연결성 검사
        if (!isConnected(newState.board)) continue;

        const result = searchRecursive(newState, allVariants, regionSettings, priority, totalTargetCells);

        if (result && isBetterResult(result, bestResult, priority)) {
          bestResult = result;

          // 최적해 찾으면 조기 종료
          if (isOptimal(result, priority, regionSettings)) {
            return result;
          }
        }
      }
    }
  }

  return bestResult;
}
```

---

## 4. 최적화 전략

### 4.1 가지치기 (Pruning)

| 조건       | 설명                                        |
| ---------- | ------------------------------------------- |
| 칸 수 초과 | 현재 배치 칸 수 > 총 목표 칸 수             |
| 도달 불가  | 남은 블록 총합 + 현재 칸 수 < 총 목표 칸 수 |
| 0순위 불가 | 남은 블록으로 0순위 영역 충족 불가능        |
| 연결 불가  | 배치 후 연결성 유지 불가능                  |
| 금지 영역  | 미지정 영역에 배치 시도                     |

### 4.2 0순위 충족 가능 여부 검사

```typescript
function canSatisfyRequired(state: SearchState, regionSettings: RegionCellSetting[], priority: Priority): boolean {
  const required = priority.custom?.required ?? [];

  for (const setting of required) {
    const currentStat = state.regionStats.find((s) => s.region === setting.region);
    const currentCells = currentStat?.placedCells ?? 0;
    const remainingNeeded = setting.targetCells - currentCells;

    if (remainingNeeded <= 0) continue;

    // 남은 블록으로 채울 수 있는 최대 칸 수 계산
    const maxFillable = calculateMaxFillableInRegion(state, setting.region, regionSettings);

    if (maxFillable < remainingNeeded) {
      return false;
    }
  }

  return true;
}
```

### 4.3 탐색 순서 최적화

```typescript
function sortBlocksByPriority(blockIndices: number[], priority: Priority): number[] {
  return blockIndices.sort((a, b) => {
    // 1. 큰 블록 우선 (칸 수 많은 것)
    const sizeDiff = blocks[b].cells.length - blocks[a].cells.length;
    if (sizeDiff !== 0) return sizeDiff;

    // 2. 변형 적은 블록 우선 (탐색 공간 축소)
    return allVariants[a].length - allVariants[b].length;
  });
}
```

### 4.4 위치 탐색 최적화

```typescript
function getAdjacentPositions(board: Board, regionSettings: RegionCellSetting[], priority: Priority): [number, number][] {
  const positions = new Set<string>();

  for (const [x, y] of getOccupiedCells(board)) {
    for (const [dx, dy] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]) {
      const nx = x + dx;
      const ny = y + dy;
      if (isInBounds(nx, ny) && !isOccupied(board, nx, ny) && !isForbiddenRegion(nx, ny, regionSettings)) {
        positions.add(`${nx},${ny}`);
      }
    }
  }

  // 우선순위 높은 영역 위치 먼저 반환
  return Array.from(positions)
    .map((s) => s.split(",").map(Number) as [number, number])
    .sort((a, b) => getRegionPriority(b, priority) - getRegionPriority(a, priority));
}
```

### 4.5 메모이제이션

```typescript
// 동일한 보드 상태에서 중복 탐색 방지
const memo = new Map<string, PlacementResult | null>();

function getBoardHash(state: SearchState): string {
  // 보드 상태 + 남은 블록을 해시로 변환
  return JSON.stringify({
    board: state.board,
    remaining: state.remainingBlocks.sort(),
  });
}
```

### 4.6 연결용 내부 영역 배치

미지정 내부 영역은 연결 목적으로만 사용:

- 지정된 영역들을 연결하는 최소 경로 탐색
- 남는 칸(블록 총합 - 사용자 입력 합계)을 연결 경로에 배치
- 연결 경로는 미지정 내부 영역만 사용

---

## 5. 결과 평가

### 5.1 최적해 판정

```typescript
function isOptimal(result: PlacementResult, priority: Priority, regionSettings: RegionCellSetting[]): boolean {
  // 1. 0순위 영역 100% 충족
  const required = priority.custom?.required ?? [];
  for (const setting of required) {
    const stat = result.stats.regionStats.find((r) => r.region === setting.region);
    if (!stat || stat.placedCells < setting.targetCells) {
      return false;
    }
  }

  // 2. 1순위 이하 영역도 모두 충족
  const priorities = priority.custom?.priorities ?? [];
  for (const group of priorities) {
    for (const setting of group) {
      const stat = result.stats.regionStats.find((r) => r.region === setting.region);
      if (!stat || stat.placedCells < setting.targetCells) {
        return false;
      }
    }
  }

  // 3. 미지정 영역에 배치 없음
  for (const stat of result.stats.regionStats) {
    if (stat.isForbidden && stat.placedCells > 0) {
      return false;
    }
  }

  return true;
}
```

### 5.2 결과 비교

```typescript
function isBetterResult(a: PlacementResult, b: PlacementResult | null, priority: Priority): boolean {
  if (!b) return true;

  // 1. 0순위 충족 개수 비교
  const aRequired = countSatisfiedRequired(a, priority);
  const bRequired = countSatisfiedRequired(b, priority);
  if (aRequired !== bRequired) return aRequired > bRequired;

  // 2. 0순위 충족률 비교
  const aRequiredRate = calculateRequiredSatisfactionRate(a, priority);
  const bRequiredRate = calculateRequiredSatisfactionRate(b, priority);
  if (aRequiredRate !== bRequiredRate) return aRequiredRate > bRequiredRate;

  // 3. 우선순위별 충족률 비교
  const priorities = priority.custom?.priorities ?? [];
  for (let i = 0; i < priorities.length; i++) {
    const aRate = calculateGroupSatisfactionRate(a, priorities[i]);
    const bRate = calculateGroupSatisfactionRate(b, priorities[i]);
    if (aRate !== bRate) return aRate > bRate;
  }

  // 4. 미지정 영역 침범 여부 (적을수록 좋음)
  const aForbidden = countForbiddenViolations(a);
  const bForbidden = countForbiddenViolations(b);
  if (aForbidden !== bForbidden) return aForbidden < bForbidden;

  return false;
}
```

---

## 6. 사용자 중단 처리

```typescript
class PlacementSearcher {
  private aborted = false;
  private currentBestResult: PlacementResult | null = null;

  abort() {
    this.aborted = true;
  }

  private searchRecursive(state: SearchState, ...args: any[]): PlacementResult | null {
    // 중단 체크
    if (this.aborted) {
      return this.currentBestResult;
    }

    // ... 탐색 로직

    // 중간 결과 저장
    if (result && isBetterResult(result, this.currentBestResult, priority)) {
      this.currentBestResult = result;
    }
  }
}
```

---

## 7. 시간 복잡도 분석

### 7.1 최악의 경우

- 블록 수: N (최대 45)
- 블록당 변형: 최대 8
- 배치 가능 위치: 최대 440
- 이론적 최악: O(8N × 440N) -> 실제로는 가지치기로 대폭 감소

### 7.2 실제 예상

- 중앙 4칸 시작 제약 -> 초기 탐색 공간 축소
- 연결성 제약 -> 인접 위치만 탐색
- 미지정 영역 제약 -> 탐색 공간 추가 축소
- 칸 수 제약 -> 조기 종료 가능
- 우선순위 정렬 -> 좋은 해 빨리 발견
- 예상 탐색 시간: 수 초 ~ 1-2분 (블록 40~45개 기준)

---

## 8. 구현 우선순위

### Phase 1: 기본 동작

- 블록 변형 생성
- 좌표 변환 로직
- 배치 가능 여부 검사 (미지정 영역 포함)
- 연결성 검사
- 기본 백트래킹 탐색

### Phase 2: 최적화

- 가지치기 조건 추가
- 0순위 충족 가능 여부 검사
- 탐색 순서 최적화
- 메모이제이션

### Phase 3: 고도화

- 병렬 탐색 (Web Worker)
- 진행률 표시
- 중간 결과 반환
- 사용자 중단 시 최선 결과 반환
