# Union Placer

메이플스토리 유니온 블록 자동 최적 배치 웹 서비스.

## Stack

- **Vite + React 19** (React Compiler)
- **TypeScript** (strict mode)
- **Tailwind CSS v4**
- **Zustand v5**
- **Vercel Functions** (Serverless)
- **Web Worker** (배치 알고리즘)

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| 명령어              | 설명                            |
| ------------------- | ------------------------------- |
| `npm run dev`       | 개발 서버 실행                  |
| `npm run build`     | 프로덕션 빌드                   |
| `npm run typecheck` | TypeScript 타입 검사            |
| `npm run lint`      | ESLint 검사                     |
| `npm run format`    | Prettier 전체 포맷 적용         |
| `npm run check`     | typecheck + lint + format check |
| `npm run test`      | Vitest 테스트 실행              |
| `npm run preview`   | 빌드 결과 미리보기              |

## Architecture

```
src/
├── types/        ← 도메인 타입 (import 없음)
├── constants/    ← 상수 (← types/)
├── lib/          ← 유틸·API (← types/, constants/)
├── workers/      ← Web Worker (← types/, constants/, lib/)
├── store/        ← Zustand 스토어 (← types/, constants/, lib/)
├── hooks/        ← React 훅 (← types/, store/, lib/)
└── components/   ← React 컴포넌트 (← 전부 가능)
```

**Web Worker** (`workers/placementWorker.ts`) — 배치 알고리즘(`findOptimalPlacement`)을 메인 스레드에서 오프로드. `start` / `cancel` 메시지로 제어, `progress` / `best` / `complete` / `error` / `cancelled` 메시지로 응답.

**Zustand stores** (`store/`)

- `blockStore` — 입력 방식, API key, 캐릭터 목록, 선택된 캐릭터 ID, 수동 블록
- `settingsStore` — 영역 설정, 우선순위, 검증 결과
- `resultStore` — 검색 상태, 진행률, 배치 결과, 에러

## Docs

| 문서                                               | 내용                      |
| -------------------------------------------------- | ------------------------- |
| [docs/00-plan.md](docs/00-plan.md)                 | 개발 계획 (마스터 인덱스) |
| [docs/02-requirements.md](docs/02-requirements.md) | 요구사항                  |
| [docs/05-data-model.md](docs/05-data-model.md)     | 타입·데이터 모델          |
| [docs/06-algorithm.md](docs/06-algorithm.md)       | 배치 알고리즘 설계        |
| [docs/07-architecture.md](docs/07-architecture.md) | 시스템 아키텍처           |
