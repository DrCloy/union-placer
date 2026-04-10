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

## Docs

| 문서                                               | 내용                      |
| -------------------------------------------------- | ------------------------- |
| [docs/00-plan.md](docs/00-plan.md)                 | 개발 계획 (마스터 인덱스) |
| [docs/02-requirements.md](docs/02-requirements.md) | 요구사항                  |
| [docs/05-data-model.md](docs/05-data-model.md)     | 타입·데이터 모델          |
| [docs/06-algorithm.md](docs/06-algorithm.md)       | 배치 알고리즘 설계        |
| [docs/07-architecture.md](docs/07-architecture.md) | 시스템 아키텍처           |
