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

| 분류              | 기술                             |
| ----------------- | -------------------------------- |
| **프레임워크**    | Vite + React 19 (React Compiler) |
| **언어**          | TypeScript                       |
| **스타일링**      | Tailwind CSS                     |
| **상태 관리**     | Zustand                          |
| **배포**          | Vercel                           |
| **Serverless**    | Vercel Functions                 |
| **알고리즘 실행** | Web Worker                       |

---

## 2. 폴더 구조

```text
union-placer/
├── .github/
│   ├── instructions/                # Copilot 규칙 (applyTo 자동 로드)
│   │   ├── coding-style.instructions.md
│   │   ├── naming.instructions.md
│   │   ├── domain.instructions.md
│   │   ├── commit.instructions.md
│   │   └── workflow.instructions.md
│   ├── workflows/
│   │   └── check.yml                # CI: typecheck + lint + test
│   ├── copilot-instructions.md
│   └── pull_request_template.md
├── .githooks/
│   └── pre-commit                   # npm run check 자동 실행
├── .storybook/                      # Storybook 설정
│   ├── main.ts
│   └── preview.ts
├── api/                             # Vercel Serverless Functions (Phase 8)
│   └── nexon/
│       └── union.ts                 # 유니온 정보 조회 프록시
├── design/                          # 디자인 문서
│   ├── plan.md
│   ├── tokens.md
│   └── components.md
├── docs/                            # 기획 문서
│   ├── 00-plan.md
│   ├── 01-project-overview.md
│   ├── 02-requirements.md
│   ├── 03-feature-spec.md
│   ├── 04-user-flow.md
│   ├── 05-data-model.md
│   ├── 06-algorithm.md
│   ├── 07-architecture.md
│   ├── 08-task-breakdown.md
│   ├── 09-api-contract.md
│   └── 99-terms-of-service.md
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/                      # 정적 에셋
│   ├── components/                  # UI 컴포넌트 (Phase 7)
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
│   ├── constants/                   # 상수
│   │   ├── blocks.ts                # 블록 모양 데이터
│   │   ├── board.ts                 # 유니온 판 영역 데이터
│   │   ├── errorMessages.ts         # 에러 메시지
│   │   ├── jobs.ts                  # 직업군 데이터
│   │   └── presets.ts               # 우선순위 프리셋
│   ├── hooks/                       # 커스텀 훅
│   │   ├── useUnionApi.ts
│   │   └── usePlacementWorker.ts
│   ├── lib/                         # 유틸리티
│   │   ├── api/
│   │   │   └── nexon.ts             # fetchUnionInfo (Nexon API 호출)
│   │   ├── algorithm/               # 배치 알고리즘
│   │   │   ├── index.ts
│   │   │   ├── variants.ts          # 블록 변형 생성
│   │   │   ├── placement.ts         # 배치 로직
│   │   │   └── search.ts            # 탐색 로직
│   │   ├── blocks.ts                # 블록 데이터 및 변환
│   │   ├── board.ts                 # 유니온 판 데이터
│   │   └── errors.ts                # 에러 생성 헬퍼
│   ├── stories/                     # Storybook 스토리
│   ├── store/                       # Zustand 스토어
│   │   ├── index.ts                 # barrel export
│   │   ├── blockStore.ts
│   │   ├── settingsStore.ts
│   │   └── resultStore.ts
│   ├── types/                       # 타입 정의
│   │   ├── block.ts
│   │   ├── board.ts
│   │   ├── character.ts
│   │   ├── error.ts                 # AppError union 타입
│   │   ├── nexon.ts                 # Nexon API 응답 타입
│   │   └── placement.ts
│   ├── workers/                     # Web Worker
│   │   └── placementWorker.ts
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── AGENTS.md
├── eslint.config.js                 # import 레이어 규칙 강제
├── index.html
├── package.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── vercel.json                      # Vercel 배포 설정 (Phase 8)
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

스토어는 3개로 분리되어 있으며 `store/index.ts`는 barrel export만 담당합니다.

```typescript
// store/blockStore.ts — 블록 입력 관련
interface BlockState {
  inputMethod: "nickname" | "manual";
  apiKey: string | null;
  characters: Character[];
  selectedCharacterIds: Set<string>; // Character[] 아님
  manualBlocks: BlockCount[];
  blockSummary: BlockSummary; // 파생값 (자동 계산)
}
interface BlockActions {
  setInputMethod: (method: "nickname" | "manual") => void;
  setApiKey: (key: string | null) => void;
  setCharacters: (characters: Character[]) => void;
  toggleCharacter: (characterId: string) => void;
  setManualBlocks: (blocks: BlockCount[]) => void;
  reset: () => void;
}

// store/settingsStore.ts — 설정 관련
interface SettingsState {
  regionSettings: RegionCellSetting[];
  priority: Priority;
  validationResult: ValidationResult | null;
}
interface SettingsActions {
  setRegionCells: (region: RegionStat, cells: number) => void;
  setPriority: (priority: Priority) => void;
  setValidationResult: (result: ValidationResult | null) => void;
  reset: () => void;
}

// store/resultStore.ts — 결과 관련
interface ResultState {
  isSearching: boolean;
  searchProgress: number;
  result: PlacementResult | null;
  error: AppError | null; // string | null 아님
}
interface ResultActions {
  startSearch: () => void;
  stopSearch: () => void;
  setSearchProgress: (progress: number) => void;
  setResult: (result: PlacementResult) => void;
  setError: (error: AppError) => void;
  clearError: () => void;
  reset: () => void;
}
```

### 4.2 스토어 접근

```typescript
// store/index.ts — barrel export만
export { useBlockStore } from "./blockStore";
export { useSettingsStore } from "./settingsStore";
export { useResultStore } from "./resultStore";
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
    const ocidRes = await fetch(
      `https://open.api.nexon.com/maplestory/v1/id?character_name=${nickname}`,
      {
        headers: { "x-nxopen-api-key": key },
      },
    );
    const { ocid } = await ocidRes.json();

    // 2. 유니온 정보 조회
    const unionRes = await fetch(
      `https://open.api.nexon.com/maplestory/v1/user/union?ocid=${ocid}`,
      {
        headers: { "x-nxopen-api-key": key },
      },
    );
    const unionData = await unionRes.json();

    // 3. 유니온 레이더 정보 조회 (캐릭터 목록)
    const raiderRes = await fetch(
      `https://open.api.nexon.com/maplestory/v1/user/union-raider?ocid=${ocid}`,
      {
        headers: { "x-nxopen-api-key": key },
      },
    );
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
// src/lib/api/nexon.ts
export async function fetchUnionInfo(
  nickname: string,
  apiKey: string,
): Promise<NexonUnionInfoResponse> {
  const res = await fetch(`/api/nexon/union?nickname=${encodeURIComponent(nickname)}`, {
    headers: { "x-api-key": apiKey }, // query param 아님 — 보안상 헤더로 전달
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new NexonApiError(res.status, body.error?.name ?? "UNKNOWN", body.error?.message ?? "");
  }

  return res.json() as Promise<NexonUnionInfoResponse>;
}
```

---

## 6. Web Worker (배치 알고리즘)

### 6.1 Worker 구조

```typescript
// src/workers/placementWorker.ts

// 메시지 계약
type WorkerInboundMessage =
  | { type: "start"; blocks: BlockShape[]; regionSettings: RegionCellSetting[]; priority: Priority }
  | { type: "cancel" };

type WorkerOutboundMessage =
  | { type: "progress"; progress: number }
  | { type: "best"; result: PlacementResult }
  | { type: "complete"; result: PlacementResult | null }
  | { type: "error"; error: SearchError }
  | { type: "cancelled" };

// 취소 플래그
let isCancelled = false;

self.onmessage = (event: MessageEvent<WorkerInboundMessage>) => {
  if (message.type === "cancel") {
    isCancelled = true;
    return;
  }

  if (message.type === "start") {
    isCancelled = false;
    const { blocks, regionSettings, priority } = message;

    try {
      const result = findOptimalPlacement(blocks, regionSettings, priority, {
        shouldAbort: () => isCancelled,
        onBetterResult: (betterResult) => {
          self.postMessage({ type: "progress", progress });
          self.postMessage({ type: "best", result: betterResult });
        },
      });

      if (isCancelled) {
        self.postMessage({ type: "cancelled" });
      } else {
        self.postMessage({ type: "complete", result });
      }
    } catch (error) {
      self.postMessage({ type: "error", error: { kind: "search", message: String(error) } });
    }
  }
};
```

### 6.2 Worker 사용 Hook

```typescript
// src/hooks/usePlacementWorker.ts
// 반환값: { startSearch, stopSearch } 만 — 상태는 Zustand resultStore가 관리
export function usePlacementWorker(): { startSearch: () => void; stopSearch: () => void } {
  const workerRef = useRef<Worker | null>(null);

  // Worker는 마운트 시 1회 생성, 언마운트 시 terminate
  useEffect(() => {
    const worker = new Worker(new URL("../workers/placementWorker.ts", import.meta.url), {
      type: "module",
    });

    worker.onmessage = (event: MessageEvent<WorkerOutboundMessage>) => {
      const { setSearchProgress, setResult, setError, stopSearch } = useResultStore.getState();
      switch (event.data.type) {
        case "progress":
          setSearchProgress(event.data.progress);
          break;
        case "best":
          setResult(event.data.result);
          break;
        case "complete":
          /* setResult or setError */ break;
        case "error":
          setError(event.data.error);
          break;
        case "cancelled":
          stopSearch();
          break;
      }
    };

    workerRef.current = worker;
    return () => {
      worker.terminate();
    };
  }, []);

  const startSearch = () => {
    const blocks = expandBlockSummary(useBlockStore.getState().blockSummary);
    const { regionSettings, priority } = useSettingsStore.getState();
    useResultStore.getState().startSearch();
    workerRef.current?.postMessage({ type: "start", blocks, regionSettings, priority });
  };

  const stopSearch = () => {
    workerRef.current?.postMessage({ type: "cancel" });
  };

  return { startSearch, stopSearch };
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

→ [08-task-breakdown.md](08-task-breakdown.md) 참조 (Phase 1~8 상세 태스크 분해)

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
// src/types/error.ts
type AppError = ApiError | SearchError | NetworkError;

interface ApiError {
  kind: "api";
  code: NexonErrorCode | string;
  status: number;
  message: string;
}
interface SearchError {
  kind: "search";
  message: string;
}
interface NetworkError {
  kind: "network";
  message: string;
}

// store/resultStore.ts — error 필드
interface ResultState {
  error: AppError | null; // kind 필드로 구분 (type 아님)
}
interface ResultActions {
  setError: (error: AppError) => void;
  clearError: () => void;
}
```

---
