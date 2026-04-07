# 시스템 아키텍처

## 1. 개요

### 1.1 시스템 구성

```text
┌─────────────────────────────────────────────────────────────┐
│ Frontend                                                    │
│ (Vite + React + TS)                                         │
├─────────────────────────────────────────────────────────────┤
│ Components     │ Store (Zustand)   │ Worker (Algorithm)     │
└────────┬───────┴───────────────────┴──────────┬─────────────┘
         │                                      │
         ▼                                      ▼
┌─────────────┐                     ┌─────────────────────┐
│ Serverless  │                     │ Web Worker          │
│ (API Proxy) │                     │ (배치 알고리즘)        │
└──────┬──────┘                     └─────────────────────┘
       │
       ▼
┌─────────────────┐
│ Nexon Open API  │
└─────────────────┘
```

### 1.2 기술 스택

| 분류              | 기술             |
| ----------------- | ---------------- |
| **프레임워크**    | Vite + React 19 (React Compiler)  |
| **언어**          | TypeScript       |
| **스타일링**      | Tailwind CSS     |
| **상태 관리**     | Zustand          |
| **배포**          | Vercel           |
| **Serverless**    | Vercel Functions |
| **알고리즘 실행** | Web Worker       |

---

## 2. 폴더 구조

```text
union-placer/
├── .github/
│   └── copilot-instructions.md
├── api/                             # Vercel Serverless Functions
│   └── nexon/
│       └── union.ts                 # 유니온 정보 조회 프록시
├── docs/                            # 기획 문서
│   ├── 01-project-overview.md
│   ├── 02-requirements.md
│   ├── 03-feature-spec.md
│   ├── 04-user-flow.md
│   ├── 05-data-model.md
│   ├── 06-algorithm.md
│   └── 07-architecture.md
├── public/
├── src/
│   ├── components/                  # UI 컴포넌트
│   │   ├── common/                  # 공통 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── block-input/             # 블록 입력 관련
│   │   │   ├── NicknameSearch.tsx
│   │   │   ├── ManualInput.tsx
│   │   │   ├── CharacterCard.tsx
│   │   │   └── BlockSummary.tsx
│   │   ├── settings/                # 설정 관련
│   │   │   ├── RegionCellInput.tsx
│   │   │   ├── PrioritySettings.tsx
│   │   │   └── PresetSelector.tsx
│   │   ├── result/                  # 결과 관련
│   │   │   ├── UnionBoard.tsx
│   │   │   ├── PlacementResult.tsx
│   │   │   └── RegionStats.tsx
│   │   └── layout/                  # 레이아웃
│   │       ├── Header.tsx
│   │       ├── StepIndicator.tsx
│   │       └── Container.tsx
│   ├── hooks/                       # 커스텀 훅
│   │   ├── useUnionApi.ts
│   │   └── usePlacementWorker.ts
│   ├── store/                       # Zustand 스토어
│   │   ├── index.ts
│   │   ├── blockStore.ts
│   │   ├── settingsStore.ts
│   │   └── resultStore.ts
│   ├── workers/                     # Web Worker
│   │   └── placementWorker.ts
│   ├── lib/                         # 유틸리티
│   │   ├── api/                     # API 호출
│   │   │   ├── nexon.ts             # fetchUnionInfo
│   │   │   └── types.ts             # Nexon API 응답 타입
│   │   ├── blocks.ts                # 블록 데이터 및 변환
│   │   ├── board.ts                 # 유니온 판 데이터
│   │   └── algorithm/               # 배치 알고리즘
│   │       ├── index.ts
│   │       ├── variants.ts          # 블록 변형 생성
│   │       ├── placement.ts         # 배치 로직
│   │       └── search.ts            # 탐색 로직
│   ├── types/                       # 타입 정의
│   │   ├── block.ts
│   │   ├── board.ts
│   │   ├── character.ts
│   │   └── placement.ts
│   ├── constants/                   # 상수
│   │   ├── blocks.ts                # 블록 모양 데이터
│   │   ├── board.ts                 # 유니온 판 영역 데이터
│   │   └── presets.ts               # 프리셋 데이터
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── AGENTS.md
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── vercel.json
```

---

## 3. 컴포넌트 구조

### 3.1 페이지 구조 (싱글 페이지)

```text
App
├── Header
├── StepIndicator (현재 단계 표시)
├── Container
│   ├── Step 1: BlockInputStep
│   │   ├── InputMethodSelector (닉네임 검색 / 수동 입력)
│   │   ├── NicknameSearch (닉네임 + API Key 입력)
│   │   │   └── CharacterList
│   │   │       └── CharacterCard (다중 선택)
│   │   ├── ManualInput (블록 개수 직접 입력)
│   │   └── BlockSummary (선택된 블록 요약)
│   ├── Step 2: SettingsStep
│   │   ├── RegionCellInput (영역별 칸 수 입력)
│   │   │   ├── OuterRegionList
│   │   │   └── InnerRegionList
│   │   └── PrioritySettings (우선순위 설정)
│   │       ├── PresetSelector (사냥 / 보스)
│   │       └── CustomPriority (드래그 앤 드롭)
│   └── Step 3: ResultStep
│       ├── SearchControls (시작 / 중단 버튼)
│       ├── SearchProgress (진행률 표시)
│       ├── UnionBoard (유니온 판 시각화)
│       └── RegionStats (영역별 결과 통계)
└── Footer
```

### 3.2 컴포넌트 상세

#### BlockInputStep

```typescript
// 블록 입력 단계
interface BlockInputStepProps {
  onComplete: () => void;
}
```

하위 컴포넌트:

- InputMethodSelector: 입력 방식 선택 (닉네임 / 수동)
- NicknameSearch: API 조회
- ManualInput: 수동 입력
- BlockSummary: 블록 카운팅 요약

#### SettingsStep

```typescript
// 설정 단계
interface SettingsStepProps {
  onComplete: () => void;
  onBack: () => void;
}
```

하위 컴포넌트:

- RegionCellInput: 영역별 칸 수 입력
- PrioritySettings: 우선순위 설정
- ValidationMessage: 검증 결과 표시

#### ResultStep

```typescript
// 결과 단계
interface ResultStepProps {
  onReset: () => void;
  onBack: () => void;
}
```

하위 컴포넌트:

- SearchControls: 탐색 제어
- SearchProgress: 진행률
- UnionBoard: 판 시각화
- RegionStats: 통계

---

## 4. 상태 관리 (Zustand)

### 4.1 스토어 구조

```typescript
// store/index.ts
interface UnionPlacerStore {
  // Block Store
  inputMethod: "nickname" | "manual";
  apiKey: string | null; // 사용자 입력 API Key (선택)
  characters: Character[];
  selectedCharacters: Character[];
  manualBlocks: BlockCount[];
  blockSummary: BlockSummary;

  // Settings Store
  regionSettings: RegionCellSetting[];
  priority: Priority;
  validationResult: ValidationResult | null;

  // Result Store
  isSearching: boolean;
  searchProgress: number;
  result: PlacementResult | null;
  error: string | null;

  // Actions
  setInputMethod: (method: "nickname" | "manual") => void;
  setApiKey: (key: string | null) => void;
  setCharacters: (characters: Character[]) => void;
  toggleCharacter: (characterId: string) => void;
  setManualBlocks: (blocks: BlockCount[]) => void;
  setRegionCells: (region: RegionStat, cells: number) => void;
  setPriority: (priority: Priority) => void;
  startSearch: () => void;
  stopSearch: () => void;
  setResult: (result: PlacementResult) => void;
  reset: () => void;
}
```

### 4.2 스토어 분리

```typescript
// store/blockStore.ts - 블록 입력 관련
// store/settingsStore.ts - 설정 관련
// store/resultStore.ts - 결과 관련
// store/index.ts - 통합 스토어
```

---

## 5. API 통신

### 5.1 Serverless Function (API Proxy)

```typescript
// api/nexon/union.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { nickname, apiKey } = req.query;

  // 사용자 API Key가 있으면 사용, 없으면 서비스 Key 사용
  const key = apiKey || process.env.NEXON_API_KEY;

  try {
    // 1. 캐릭터 OCID 조회
    const ocidRes = await fetch(`https://open.api.nexon.com/maplestory/v1/id?character_name=${nickname}`, {
      headers: { "x-nxopen-api-key": key },
    });
    const { ocid } = await ocidRes.json();

    // 2. 유니온 정보 조회
    const unionRes = await fetch(`https://open.api.nexon.com/maplestory/v1/user/union?ocid=${ocid}`, {
      headers: { "x-nxopen-api-key": key },
    });
    const unionData = await unionRes.json();

    // 3. 유니온 레이더 정보 조회 (캐릭터 목록)
    const raiderRes = await fetch(`https://open.api.nexon.com/maplestory/v1/user/union-raider?ocid=${ocid}`, {
      headers: { "x-nxopen-api-key": key },
    });
    const raiderData = await raiderRes.json();

    res.status(200).json({
      union: unionData,
      raider: raiderData,
    });
  } catch (error) {
    res.status(500).json({ error: "API 조회 실패" });
  }
}
```

### 5.2 프론트엔드 API 호출

```typescript
// src/lib/api.ts
export async function fetchUnionInfo(nickname: string, apiKey?: string) {
  const params = new URLSearchParams({ nickname });
  if (apiKey) params.append("apiKey", apiKey);

  const res = await fetch(`/api/nexon/union?${params}`);
  if (!res.ok) throw new Error("API 조회 실패");

  return res.json();
}
```

---

## 6. Web Worker (배치 알고리즘)

### 6.1 Worker 구조

```typescript
// src/workers/placementWorker.ts
import { findOptimalPlacement } from "../lib/algorithm";

self.onmessage = (e: MessageEvent) => {
  const { blocks, regionSettings, priority } = e.data;

  const searcher = new PlacementSearcher({
    onProgress: (progress) => {
      self.postMessage({ type: "progress", progress });
    },
    onBestFound: (result) => {
      self.postMessage({ type: "best", result });
    },
  });

  const result = searcher.search(blocks, regionSettings, priority);

  self.postMessage({ type: "complete", result });
};
```

### 6.2 Worker 사용 Hook

```typescript
// src/hooks/usePlacementWorker.ts
export function usePlacementWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<PlacementResult | null>(null);

  const startSearch = useCallback((params: SearchParams) => {
    workerRef.current = new Worker(new URL("../workers/placementWorker.ts", import.meta.url), {
      type: "module",
    });

    workerRef.current.onmessage = (e) => {
      switch (e.data.type) {
        case "progress":
          setProgress(e.data.progress);
          break;
        case "best":
          setResult(e.data.result);
          break;
        case "complete":
          setResult(e.data.result);
          setIsSearching(false);
          break;
      }
    };

    workerRef.current.postMessage(params);
    setIsSearching(true);
  }, []);

  const stopSearch = useCallback(() => {
    workerRef.current?.terminate();
    setIsSearching(false);
  }, []);

  return { isSearching, progress, result, startSearch, stopSearch };
}
```

---

## 7. 데이터 흐름

### 7.1 블록 입력 흐름

#### 닉네임 검색

```text
User Input (닉네임, API Key?)
  │
  ▼
Serverless Function
  │
  ▼
Nexon Open API
  │
  ▼
Character List
  │
  ▼
User Selection
  │
  ▼
Block Summary (Zustand Store)
```

#### 수동 입력

```text
User Input (블록 개수)
  │
  ▼
Block Summary (Zustand Store)
```

### 7.2 배치 탐색 흐름

```text
Settings (영역별 칸 수 + 우선순위)
  │
  ▼
Validation Check
  │
  ▼
Web Worker 시작
  │
  ├──▶ Progress Update ──▶ UI 업데이트
  │
  ├──▶ Best Result Found ──▶ UI 업데이트
  │
  ▼
Complete
  │
  ▼
Result (Zustand Store)
  │
  ▼
UnionBoard 시각화
```

---

## 8. 배포 설정

### 8.1 Vercel 설정

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "functions": {
    "api/**/*.ts": {
      "memory": 256,
      "maxDuration": 10
    }
  },
  "env": {
    "NEXON_API_KEY": "@nexon-api-key"
  }
}
```

### 8.2 환경 변수

| 변수          | 설명           | 위치             |
| ------------- | -------------- | ---------------- |
| NEXON_API_KEY | 서비스 API Key | Vercel 환경 변수 |

---

## 9. 개발 단계별 구현 순서

→ [docs/08-task-breakdown.md](../docs/08-task-breakdown.md) 참조 (Phase 1~8 상세 태스크 분해)

---

## 10. 에러 처리

### 10.1 API 에러

| 에러 | 원인                 | 처리                                            |
| ---- | -------------------- | ----------------------------------------------- |
| 404  | 존재하지 않는 닉네임 | "캐릭터를 찾을 수 없습니다" 메시지              |
| 429  | API 호출 제한 초과   | "잠시 후 다시 시도해주세요" + API Key 입력 안내 |
| 500  | 서버 오류            | "일시적인 오류입니다" + 재시도 버튼             |

### 10.2 배치 탐색 에러

| 상황            | 처리                                     |
| --------------- | ---------------------------------------- |
| 0순위 100% 불가 | 부족한 영역 표시 + 차선책 제안           |
| 설정 검증 실패  | 어떤 조건이 안 맞는지 표시               |
| 탐색 시간 초과  | 현재까지 최선 결과 표시 + 계속/중단 선택 |

### 10.3 에러 상태 관리

```typescript
// store/resultStore.ts
interface ResultStore {
  // ...
  error: {
    type: "api" | "validation" | "search";
    message: string;
    details?: string;
  } | null;
  setError: (error: ResultStore["error"]) => void;
  clearError: () => void;
}
```

---
