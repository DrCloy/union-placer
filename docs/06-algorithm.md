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
└─ 백트래킹의 초기 최선해(bestResult)로 사용
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

  for (const rotation of [0, 90, 180, 270] as const) {
    for (const flipped of [false, true]) {
      const cells = transformCells(shape.cells, rotation, flipped);
      variants.push({ ...shape, rotation, flipped, cells });
    }
  }

  // 중복 제거 (대칭인 경우)
  return deduplicateVariants(variants);
}

function transformCells(
  cells: [number, number][],
  rotation: 0 | 90 | 180 | 270,
  flipped: boolean,
): [number, number][] {
  let result = cells;

  // 반전 (y축 기준)
  if (flipped) {
    result = result.map(([x, y]) => [x, -y]);
  }

  // 회전 (90도 단위, 반시계 방향)
  const rotations = rotation / 90;
  for (let i = 0; i < rotations; i++) {
    result = result.map(([x, y]) => [-y, x]);
  }

  return result;
}

function deduplicateVariants(variants: BlockVariant[]): BlockVariant[] {
  const seen = new Set<string>();
  return variants.filter((v) => {
    // 셀 좌표를 정렬된 문자열로 해시화
    const key = [...v.cells]
      .sort(([ax, ay], [bx, by]) => ax - bx || ay - by)
      .map(([x, y]) => `${x},${y}`)
      .join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
```

### 3.2 배치 가능 여부 검사

```typescript
function canPlace(
  board: Board,
  variant: BlockVariant,
  position: [number, number],
  regionSettings: RegionCellSetting[],
): boolean {
  const absoluteCells = variant.cells.map(([dx, dy]) => [position[0] + dx, position[1] + dy]);

  return absoluteCells.every(
    ([x, y]) =>
      isInBounds(x, y) && // 판 범위 내
      !isOccupied(board, x, y) && // 빈 칸
      !isForbiddenRegion(x, y, regionSettings), // 미지정 외부 영역 아님
  );
}

function isForbiddenRegion(x: number, y: number, regionSettings: RegionCellSetting[]): boolean {
  const region = getRegionAt(x, y);
  const setting = regionSettings.find((s) => s.region === region);

  // 미지정 외부 영역 = 배치 금지
  // 미지정 내부 영역 = 연결용 허용 (금지 아님)
  return (setting?.targetCells === 0 && setting?.isOuter) ?? false;
}
```

### 3.3 연결성 검사

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

    for (const [dx, dy] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ] as const) {
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

### 3.4 영역별 배치 현황 계산

```typescript
function calculateRegionStats(
  board: Board,
  regionSettings: RegionCellSetting[],
): RegionPlacementStat[] {
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

### 3.5 그리디 초기 해 생성

백트래킹 전에 빠른 초기 해를 만들어 가지치기 기준값으로 사용한다.

```typescript
function buildGreedySolution(
  blocks: BlockShape[],
  allVariants: BlockVariant[][],
  regionSettings: RegionCellSetting[],
  priority: Priority,
): PlacementResult | null {
  const state: SearchState = {
    board: createEmptyBoard(),
    placements: [],
    remainingBlocks: blocks.map((_, i) => i),
    placedCells: 0,
    regionStats: calculateRegionStats(createEmptyBoard(), regionSettings),
  };

  // 첫 블록: 중앙 4칸 중 가장 점수 높은 위치에 배치
  const centerPositions: [number, number][] = [
    [9, 10],
    [9, 11],
    [10, 10],
    [10, 11],
  ];

  const firstPlacement = findBestPlacement(
    state,
    allVariants,
    regionSettings,
    priority,
    centerPositions,
  );
  if (!firstPlacement) return null;

  let currentState = placeBlock(
    state,
    firstPlacement.blockIdx,
    firstPlacement.variant,
    firstPlacement.pos,
  );

  // 나머지 블록: 매 단계 가장 점수 높은 배치 선택
  while (currentState.remainingBlocks.length > 0) {
    const positions = getAdjacentPositions(currentState.board, regionSettings, priority);
    const placement = findBestPlacement(
      currentState,
      allVariants,
      regionSettings,
      priority,
      positions,
    );
    if (!placement) break; // 더 이상 배치 불가

    currentState = placeBlock(currentState, placement.blockIdx, placement.variant, placement.pos);
  }

  return createResult(currentState, priority);
}

// 주어진 위치 후보 중 가장 높은 점수의 (블록, 변형, 위치) 조합 반환
function findBestPlacement(
  state: SearchState,
  allVariants: BlockVariant[][],
  regionSettings: RegionCellSetting[],
  priority: Priority,
  positions: [number, number][],
): { blockIdx: number; variant: BlockVariant; pos: [number, number] } | null {
  let best: {
    blockIdx: number;
    variant: BlockVariant;
    pos: [number, number];
    score: number;
  } | null = null;

  for (const blockIdx of state.remainingBlocks) {
    for (const variant of allVariants[blockIdx]) {
      for (const pos of positions) {
        if (!canPlace(state.board, variant, pos, regionSettings)) continue;

        const score = scorePlacement(variant, pos, state, regionSettings, priority);
        if (!best || score > best.score) {
          best = { blockIdx, variant, pos, score };
        }
      }
    }
  }

  return best;
}

// 배치 점수 계산: 0순위 충족 > 높은 우선순위 영역 > 총 칸 수
function scorePlacement(
  variant: BlockVariant,
  pos: [number, number],
  state: SearchState,
  regionSettings: RegionCellSetting[],
  priority: Priority,
): number {
  const absoluteCells = variant.cells.map(([dx, dy]) => [pos[0] + dx, pos[1] + dy]);

  let score = 0;
  const required = priority.custom?.required ?? [];
  const priorities = priority.custom?.priorities ?? [];

  for (const [x, y] of absoluteCells) {
    const region = getRegionAt(x, y);
    const setting = regionSettings.find((s) => s.region === region);
    if (!setting || setting.targetCells === 0) continue;

    // 0순위 영역: 최고 가중치
    if (required.some((r) => r.region === region)) {
      score += 1000;
      continue;
    }

    // 우선순위별 가중치 (1순위 > 2순위 > ...)
    const priorityIdx = priorities.findIndex((group) => group.some((s) => s.region === region));
    if (priorityIdx >= 0) {
      score += 100 / (priorityIdx + 1);
      continue;
    }

    score += 1; // 미지정 내부 영역 (연결용)
  }

  return score;
}
```

### 3.6 메인 탐색 알고리즘

그리디로 초기 해를 구한 뒤 백트래킹으로 더 나은 해를 탐색한다.

```typescript
function findOptimalPlacement(
  blocks: BlockShape[],
  regionSettings: RegionCellSetting[],
  priority: Priority,
): PlacementResult | null {
  // 1. 블록별 변형 생성
  const allVariants = blocks.map(generateVariants);

  // 2. 총 목표 칸 수 계산
  const totalTargetCells = regionSettings.reduce((sum, s) => sum + s.targetCells, 0);

  // 3. 그리디 초기 해 생성 (백트래킹의 기준값)
  let bestResult = buildGreedySolution(blocks, allVariants, regionSettings, priority);

  // 그리디 해가 이미 최적이면 조기 종료
  if (bestResult && isOptimal(bestResult, priority, regionSettings)) {
    return bestResult;
  }

  // 4. 초기 상태
  const initialState: SearchState = {
    board: createEmptyBoard(),
    placements: [],
    remainingBlocks: blocks.map((_, i) => i),
    placedCells: 0,
    regionStats: calculateRegionStats(createEmptyBoard(), regionSettings),
  };

  // 5. 중앙 4칸에서 백트래킹 시작
  const centerPositions: [number, number][] = [
    [9, 10],
    [9, 11],
    [10, 10],
    [10, 11],
  ];

  for (const centerPos of centerPositions) {
    for (const blockIdx of initialState.remainingBlocks) {
      for (const variant of allVariants[blockIdx]) {
        if (!canPlace(initialState.board, variant, centerPos, regionSettings)) continue;

        const newState = placeBlock(initialState, blockIdx, variant, centerPos);
        const result = searchRecursive(
          newState,
          blocks,
          allVariants,
          regionSettings,
          priority,
          totalTargetCells,
          bestResult,
        );

        if (result && isBetterResult(result, bestResult, priority)) {
          bestResult = result;

          if (isOptimal(bestResult, priority, regionSettings)) {
            return bestResult;
          }
        }
      }
    }
  }

  return bestResult;
}
```

### 3.7 재귀 탐색 (백트래킹)

```typescript
function searchRecursive(
  state: SearchState,
  blocks: BlockShape[],
  allVariants: BlockVariant[][],
  regionSettings: RegionCellSetting[],
  priority: Priority,
  totalTargetCells: number,
  currentBest: PlacementResult | null,
): PlacementResult | null {
  // 종료 조건: 모든 목표 칸 수 달성
  if (state.placedCells === totalTargetCells) {
    return createResult(state, priority);
  }

  // 가지치기: 남은 블록으로 목표 도달 불가
  const maxPossibleCells =
    state.placedCells +
    state.remainingBlocks.reduce((sum, idx) => sum + blocks[idx].cells.length, 0);
  if (maxPossibleCells < totalTargetCells) return null;

  // 가지치기: 칸 수 초과 (목표보다 많이 배치됨)
  if (state.placedCells > totalTargetCells) return null;

  // 가지치기: 0순위 영역 충족 불가능
  if (!canSatisfyRequired(state, blocks, regionSettings, priority)) return null;

  // 가지치기: 현재 경로가 현재 최선해보다 나을 가능성 없음
  if (currentBest && !canImproveBest(state, blocks, regionSettings, priority, currentBest)) {
    return null;
  }

  let bestResult: PlacementResult | null = currentBest;

  // 다음 블록 선택 (우선순위 기반 정렬)
  const sortedBlocks = sortBlocksByPriority(state.remainingBlocks, blocks, allVariants, priority);

  // 배치 가능한 위치 탐색 (기존 블록과 인접한 위치만)
  const adjacentPositions = getAdjacentPositions(state.board, regionSettings, priority);

  for (const blockIdx of sortedBlocks) {
    for (const pos of adjacentPositions) {
      for (const variant of allVariants[blockIdx]) {
        if (!canPlace(state.board, variant, pos, regionSettings)) continue;

        const newState = placeBlock(state, blockIdx, variant, pos);

        // 연결성 검사
        if (!isConnected(newState.board)) continue;

        const result = searchRecursive(
          newState,
          blocks,
          allVariants,
          regionSettings,
          priority,
          totalTargetCells,
          bestResult,
        );

        if (result && isBetterResult(result, bestResult, priority)) {
          bestResult = result;

          // 최적해 찾으면 조기 종료
          if (isOptimal(bestResult, priority, regionSettings)) {
            return bestResult;
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
| 개선 불가  | 현재 경로가 그리디 초기 해보다 나을 수 없음 |
| 연결 불가  | 배치 후 연결성 유지 불가능                  |
| 금지 영역  | 미지정 외부 영역에 배치 시도                |

### 4.2 0순위 충족 가능 여부 검사

```typescript
function canSatisfyRequired(
  state: SearchState,
  blocks: BlockShape[],
  regionSettings: RegionCellSetting[],
  priority: Priority,
): boolean {
  const required = priority.custom?.required ?? [];

  for (const setting of required) {
    const currentStat = state.regionStats.find((s) => s.region === setting.region);
    const currentCells = currentStat?.placedCells ?? 0;
    const remainingNeeded = setting.targetCells - currentCells;

    if (remainingNeeded <= 0) continue;

    // 남은 블록으로 해당 영역에 채울 수 있는 최대 칸 수 계산
    const maxFillable = calculateMaxFillableInRegion(state, blocks, setting.region, regionSettings);

    if (maxFillable < remainingNeeded) return false;
  }

  return true;
}
```

### 4.3 현재 최선해 개선 가능 여부 검사

그리디 초기 해가 존재할 때, 현재 경로가 그보다 나아질 가능성이 없으면 즉시 가지치기.

```typescript
function canImproveBest(
  state: SearchState,
  blocks: BlockShape[],
  regionSettings: RegionCellSetting[],
  priority: Priority,
  best: PlacementResult,
): boolean {
  // 0순위 충족 개수: 이미 best가 모두 충족했으면 현재도 그래야 함
  const bestRequired = countSatisfiedRequired(best, priority);
  const maxReachableRequired = calculateMaxReachableRequired(
    state,
    blocks,
    regionSettings,
    priority,
  );
  if (maxReachableRequired < bestRequired) return false;

  // 남은 블록으로 채울 수 있는 최대 칸 수 기준으로 upper bound 계산
  // 단순 구현: 남은 블록 전부 최고 우선순위 영역에 배치 가능하다고 가정
  return true; // 정교한 bound 계산은 Phase 3에서 고도화
}
```

### 4.4 탐색 순서 최적화

```typescript
function sortBlocksByPriority(
  blockIndices: number[],
  blocks: BlockShape[],
  allVariants: BlockVariant[][],
  priority: Priority,
): number[] {
  return [...blockIndices].sort((a, b) => {
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
function getAdjacentPositions(
  board: Board,
  regionSettings: RegionCellSetting[],
  priority: Priority,
): [number, number][] {
  const positions = new Set<string>();

  for (const [x, y] of getOccupiedCells(board)) {
    for (const [dx, dy] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ] as const) {
      const nx = x + dx;
      const ny = y + dy;
      if (
        isInBounds(nx, ny) &&
        !isOccupied(board, nx, ny) &&
        !isForbiddenRegion(nx, ny, regionSettings)
      ) {
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
    remaining: [...state.remainingBlocks].sort(),
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
function isOptimal(
  result: PlacementResult,
  priority: Priority,
  regionSettings: RegionCellSetting[],
): boolean {
  // 1. 0순위 영역 100% 충족
  const required = priority.custom?.required ?? [];
  for (const setting of required) {
    const stat = result.stats.regionStats.find((r) => r.region === setting.region);
    if (!stat || stat.placedCells < setting.targetCells) return false;
  }

  // 2. 1순위 이하 영역도 모두 충족
  const priorities = priority.custom?.priorities ?? [];
  for (const group of priorities) {
    for (const setting of group) {
      const stat = result.stats.regionStats.find((r) => r.region === setting.region);
      if (!stat || stat.placedCells < setting.targetCells) return false;
    }
  }

  // 3. 미지정 영역에 배치 없음
  for (const stat of result.stats.regionStats) {
    if (stat.isForbidden && stat.placedCells > 0) return false;
  }

  return true;
}
```

### 5.2 결과 비교

```typescript
function isBetterResult(
  a: PlacementResult,
  b: PlacementResult | null,
  priority: Priority,
): boolean {
  if (!b) return true;

  // 1. 0순위 충족 개수 비교
  const aRequired = countSatisfiedRequired(a, priority);
  const bRequired = countSatisfiedRequired(b, priority);
  if (aRequired !== bRequired) return aRequired > bRequired;

  // 2. 0순위 충족률 비교
  const aRequiredRate = calculateRequiredSatisfactionRate(a, priority);
  const bRequiredRate = calculateRequiredSatisfactionRate(b, priority);
  if (aRequiredRate !== bRequiredRate) return aRequiredRate > bRequiredRate;

  // 3. 우선순위별 충족률 비교 (1순위부터 순서대로)
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
  private onProgress?: (progress: number) => void;
  private onBestFound?: (result: PlacementResult) => void;

  constructor(callbacks: {
    onProgress?: (progress: number) => void;
    onBestFound?: (result: PlacementResult) => void;
  }) {
    this.onProgress = callbacks.onProgress;
    this.onBestFound = callbacks.onBestFound;
  }

  abort() {
    this.aborted = true;
  }

  // checkAbort()와 updateBest()는 searchRecursive에 콜백으로 전달
  search(
    blocks: BlockShape[],
    regionSettings: RegionCellSetting[],
    priority: Priority,
  ): PlacementResult | null {
    this.aborted = false;
    this.currentBestResult = null;

    return findOptimalPlacement(blocks, regionSettings, priority, {
      shouldAbort: () => this.aborted,
      onBetterResult: (result) => {
        this.currentBestResult = result;
        this.onBestFound?.(result);
      },
    });
  }
}

// findOptimalPlacement 및 searchRecursive는 SearchCallbacks를 추가 파라미터로 받음
interface SearchCallbacks {
  shouldAbort: () => boolean;
  onBetterResult: (result: PlacementResult) => void;
}

// searchRecursive 내 abort 체크 위치 (3.7절의 루프 시작 전)
// if (callbacks.shouldAbort()) return currentBest;
```

---

## 7. 시간 복잡도 분석

### 7.1 최악의 경우

- 블록 수: N (최대 45)
- 블록당 변형: 최대 8
- 배치 가능 위치: 최대 440
- 이론적 최악: O(8N × 440N) → 실제로는 가지치기로 대폭 감소

### 7.2 실제 예상

- 그리디 초기 해 → 백트래킹 기준값 확보, 초기부터 유효한 가지치기 가능
- 중앙 4칸 시작 제약 → 초기 탐색 공간 축소
- 연결성 제약 → 인접 위치만 탐색
- 미지정 영역 제약 → 탐색 공간 추가 축소
- 칸 수 제약 → 조기 종료 가능
- 우선순위 정렬 → 좋은 해 빨리 발견
- 예상 탐색 시간: 수 초 ~ 1-2분 (블록 40~45개 기준)

---

## 8. 구현 우선순위

### Phase 1: 기본 동작

- 블록 변형 생성 (`variants.ts`)
- 배치 가능 여부 검사 (`placement.ts`)
- 연결성 검사 (`placement.ts`)
- 영역별 배치 현황 계산 (`placement.ts`)

### Phase 2: 탐색

- 그리디 초기 해 생성 (`search.ts`)
- 기본 백트래킹 탐색 (`search.ts`)
- 결과 평가 로직 (`search.ts`)

### Phase 3: 최적화

- 가지치기 조건 추가
- 0순위 충족 가능 여부 검사
- 탐색 순서 최적화
- 메모이제이션

### Phase 4: 고도화

- 병렬 탐색 (Web Worker)
- 진행률 표시
- 중간 결과 반환
- 사용자 중단 시 최선 결과 반환
