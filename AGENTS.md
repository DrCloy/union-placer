# AGENTS.md

이 프로젝트는 메이플스토리 유니온 블록을 자동으로 최적 배치하는 웹 서비스입니다.

## Setup commands

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 타입 체크
npm run typecheck

# 린트
npm run lint
```

## Tech stack

- Vite + React 18
- TypeScript (strict mode)
- Tailwind CSS
- Zustand (상태 관리)
- Vercel Functions (Serverless)
- Web Worker (배치 알고리즘)

## Project structure

```text
src/
├── components/          # UI 컴포넌트
│   ├── common/          # 공통 (Button, Input, Modal)
│   ├── block-input/     # 블록 입력
│   ├── settings/        # 설정
│   ├── result/          # 결과
│   └── layout/          # 레이아웃
├── hooks/               # 커스텀 훅
├── store/               # Zustand 스토어
├── workers/             # Web Worker
├── lib/                 # 유틸리티
│   └── algorithm/       # 배치 알고리즘
├── types/               # 타입 정의
└── constants/           # 상수 데이터
```

## Documentation

- 상세 기획/설계 문서는 docs/ 참고:

| 문서               | 설명            |
| ------------------ | --------------- |
| 02-requirements.md | 요구사항 정의   |
| 03-feature-spec.md | 기능 명세       |
| 05-data-model.md   | 데이터 모델     |
| 06-algorithm.md    | 배치 알고리즘   |
| 07-architecture.md | 시스템 아키텍처 |

## Instructions

- 코딩 규칙: .github/instructions/coding-style.instructions.md
- 네이밍 규칙: .github/instructions/naming.instructions.md
- 커밋 규칙: .github/instructions/commit.instructions.md
- 도메인 지식: .github/instructions/domain.instructions.md
